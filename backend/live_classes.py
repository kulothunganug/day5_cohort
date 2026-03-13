from typing import Dict, List, Optional

from fastapi import (APIRouter, Depends, HTTPException, WebSocket,
                     WebSocketDisconnect, status)
from sqlmodel import Session, select

from auth_utils import decode_access_token
from dependencies import RoleChecker, get_current_user, get_session
from models import ChatMessage, Course, Enrollment, LiveClass, User
from schemas import LiveClassCreate, LiveClassPublic

router = APIRouter(prefix="/live-classes", tags=["live-classes"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, live_class_id: int):
        await websocket.accept()
        if live_class_id not in self.active_connections:
            self.active_connections[live_class_id] = []
        self.active_connections[live_class_id].append(websocket)

    def disconnect(self, websocket: WebSocket, live_class_id: int):
        if live_class_id in self.active_connections:
            self.active_connections[live_class_id].remove(websocket)
            if not self.active_connections[live_class_id]:
                del self.active_connections[live_class_id]

    async def broadcast(self, message: dict, live_class_id: int):
        if live_class_id in self.active_connections:
            for connection in self.active_connections[live_class_id]:
                await connection.send_json(message)


manager = ConnectionManager()


@router.post(
    "/",
    response_model=LiveClassPublic,
    dependencies=[Depends(RoleChecker(["instructor"]))],
)
def create_live_class(
    live_class_in: LiveClassCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):

    if not current_user.id:
        raise HTTPException(status_code=404, detail="User not found")

    course = session.get(Course, live_class_in.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.instructor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the course instructor can schedule live classes",
        )

    live_class = LiveClass(**live_class_in.model_dump(), instructor_id=current_user.id)
    session.add(live_class)
    session.commit()
    session.refresh(live_class)
    return live_class


@router.get("/", response_model=List[LiveClassPublic])
def list_live_classes(
    course_id: Optional[int] = None, session: Session = Depends(get_session)
):
    statement = select(LiveClass)
    if course_id:
        statement = statement.where(LiveClass.course_id == course_id)
    return session.exec(statement).all()


@router.get("/{live_class_id}", response_model=LiveClassPublic)
def get_live_class(live_class_id: int, session: Session = Depends(get_session)):
    live_class = session.get(LiveClass, live_class_id)
    if not live_class:
        raise HTTPException(status_code=404, detail="Live class not found")
    return live_class


@router.websocket("/{live_class_id}/chat")
async def websocket_endpoint(websocket: WebSocket, live_class_id: int, token: str):
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    email = payload.get("sub")

    from database import engine

    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        live_class = session.get(LiveClass, live_class_id)
        if not live_class:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        is_instructor = live_class.instructor_id == user.id
        is_enrolled = (
            session.exec(
                select(Enrollment).where(
                    Enrollment.user_id == user.id,
                    Enrollment.course_id == live_class.course_id,
                )
            ).first()
            is not None
        )

        if not (is_instructor or is_enrolled):
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        await manager.connect(websocket, live_class_id)
        try:
            while True:
                data = await websocket.receive_text()

                if user.id:
                    chat_msg = ChatMessage(
                        live_class_id=live_class_id, user_id=user.id, message=data
                    )
                    session.add(chat_msg)
                    session.commit()
                    session.refresh(chat_msg)

                broadcast_data = {
                    "id": chat_msg.id,
                    "live_class_id": chat_msg.live_class_id,
                    "user_id": user.id,
                    "user_name": user.name,
                    "message": chat_msg.message,
                    "sent_at": chat_msg.sent_at.isoformat(),
                }

                await manager.broadcast(broadcast_data, live_class_id)
        except WebSocketDisconnect:
            manager.disconnect(websocket, live_class_id)

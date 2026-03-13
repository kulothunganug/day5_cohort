from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from auth_utils import create_access_token, hash_password, verify_password
from dependencies import get_current_user, get_session
from models import User
from schemas import Token, UserCreate, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic)
def register(user_in: UserCreate, session: Session = Depends(get_session)):
    existing_user = session.exec(
        select(User).where(User.email == user_in.email)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    db_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        role=user_in.role,
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserPublic)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

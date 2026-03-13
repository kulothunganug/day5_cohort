from dotenv import load_dotenv

load_dotenv()

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel, create_engine

from auth import router as auth_router
from courses import router as courses_router
from database import engine
from dependencies import RoleChecker
from live_classes import router as live_classes_router
from models import User
from payment import router as payment_router


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(auth_router)
app.include_router(courses_router)
app.include_router(payment_router)
app.include_router(live_classes_router)

app.mount("/", StaticFiles(directory="static"), name="static")

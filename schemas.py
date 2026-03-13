from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from sqlmodel import SQLModel

from models import CourseBase, LessonBase


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "student"


class UserLogin(BaseModel):
    email: str
    password: str


class UserPublic(BaseModel):
    id: int
    name: str
    email: str
    role: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class CourseCreate(CourseBase):
    pass


class CourseUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None


class CoursePublic(CourseBase):
    id: int
    instructor_id: int


class LessonCreate(LessonBase):
    pass


class LessonUpdate(SQLModel):
    title: Optional[str] = None
    video_url: Optional[str] = None
    order: Optional[int] = None


class LessonPublic(LessonBase):
    id: int
    course_id: int


class PaymentCreate(BaseModel):
    course_id: int


class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    course_id: int


class LiveClassCreate(BaseModel):
    course_id: int
    topic: str
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None


class LiveClassPublic(BaseModel):
    id: int
    course_id: int
    instructor_id: int
    topic: str
    description: Optional[str] = None
    scheduled_at: datetime


class ChatMessagePublic(BaseModel):
    id: int
    live_class_id: int
    user_id: int
    user_name: str
    message: str
    sent_at: datetime

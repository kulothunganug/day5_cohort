from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(index=True, unique=True)
    password_hash: str
    role: str  # "student" or "instructor"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CourseBase(SQLModel):
    title: str
    description: str
    price: int


class Course(CourseBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    instructor_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LessonBase(SQLModel):
    title: str
    video_url: str
    order: int


class Lesson(LessonBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: int = Field(foreign_key="course.id")


class Enrollment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    course_id: int = Field(foreign_key="course.id")
    payment_id: str
    enrolled_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LiveClass(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: int = Field(foreign_key="course.id")
    instructor_id: int = Field(foreign_key="user.id")
    topic: str
    description: Optional[str] = None
    scheduled_at: datetime


class ChatMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    live_class_id: int = Field(foreign_key="liveclass.id")
    user_id: int = Field(foreign_key="user.id")
    message: str
    sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

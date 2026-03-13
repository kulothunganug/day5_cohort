from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from dependencies import RoleChecker, get_current_user, get_session
from models import Course, Enrollment, Lesson, User
from schemas import (CourseCreate, CoursePublic, CourseUpdate, LessonCreate,
                     LessonPublic, LessonUpdate)

router = APIRouter(prefix="/courses", tags=["courses"])


@router.post(
    "/",
    response_model=CoursePublic,
    dependencies=[Depends(RoleChecker(["instructor"]))],
)
def create_course(
    course_in: CourseCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):

    if not current_user.id:
        raise HTTPException(status_code=404, detail="User not found")

    course = Course(**course_in.model_dump(), instructor_id=current_user.id)
    session.add(course)
    session.commit()
    session.refresh(course)
    return course


@router.get("/", response_model=List[CoursePublic])
def list_courses(session: Session = Depends(get_session)):
    return session.exec(select(Course)).all()


@router.get("/{course_id}", response_model=CoursePublic)
def get_course(course_id: int, session: Session = Depends(get_session)):
    course = session.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.put(
    "/{course_id}",
    response_model=CoursePublic,
    dependencies=[Depends(RoleChecker(["instructor"]))],
)
def update_course(
    course_id: int,
    course_in: CourseUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    course = session.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to edit this course"
        )

    course_data = course_in.model_dump(exclude_unset=True)
    for key, value in course_data.items():
        setattr(course, key, value)

    session.add(course)
    session.commit()
    session.refresh(course)
    return course


@router.post(
    "/{course_id}/lessons/",
    response_model=LessonPublic,
    dependencies=[Depends(RoleChecker(["instructor"]))],
)
def create_lesson(
    course_id: int,
    lesson_in: LessonCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    course = session.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to add lessons to this course"
        )

    lesson = Lesson(**lesson_in.model_dump(), course_id=course_id)
    session.add(lesson)
    session.commit()
    session.refresh(lesson)
    return lesson


@router.get("/{course_id}/lessons/", response_model=List[LessonPublic])
def list_lessons(
    course_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    course = session.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    is_instructor = course.instructor_id == current_user.id
    is_enrolled = (
        session.exec(
            select(Enrollment).where(
                Enrollment.user_id == current_user.id,
                Enrollment.course_id == course_id,
            )
        ).first()
        is not None
    )

    if not (is_instructor or is_enrolled):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be enrolled in this course to access lessons",
        )

    return session.exec(
        select(Lesson).where(Lesson.course_id == course_id).order_by(Lesson.order)
    ).all()


@router.put(
    "/lessons/{lesson_id}",
    response_model=LessonPublic,
    dependencies=[Depends(RoleChecker(["instructor"]))],
)
def update_lesson(
    lesson_id: int,
    lesson_in: LessonUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    lesson = session.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    course = session.get(Course, lesson.course_id)
    if course.instructor_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to edit this lesson"
        )

    lesson_data = lesson_in.model_dump(exclude_unset=True)
    for key, value in lesson_data.items():
        setattr(lesson, key, value)

    session.add(lesson)
    session.commit()
    session.refresh(lesson)
    return lesson

import os

import razorpay
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from database import get_session
from dependencies import get_current_user
from models import Course, Enrollment, User
from schemas import PaymentCreate, PaymentVerify

router = APIRouter(prefix="/payments", tags=["payments"])

RAZORPAY_KEY_ID = "rzp_test_SQfCf701bC4IEw"
RAZORPAY_KEY_SECRET = "W6SZLl2DCW5ABp1ZIzBdlz4d"

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
print(client)


@router.post("/create-order")
def create_order(
    payment_in: PaymentCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    course = session.get(Course, payment_in.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check if user is already enrolled
    existing_enrollment = session.exec(
        select(Enrollment).where(
            Enrollment.user_id == current_user.id, Enrollment.course_id == course.id
        )
    ).first()
    if existing_enrollment:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    order_data = {
        "amount": int(course.price * 100),
        "currency": "INR",
        "receipt": f"receipt_course_{course.id}_user_{current_user.id}",
        "notes": {"course_id": course.id, "user_id": current_user.id},
        "payment_capture": 0,
    }
    print(order_data)
    order = razorpay.resources.order.Order(client).create(order_data)
    print(order)
    try:
        order = razorpay.resources.order.Order(client).create(order_data)
        print(order)
        return order
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-payment")
def verify_payment(
    verify_in: PaymentVerify,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        client.utility.verify_payment_signature(
            {
                "razorpay_order_id": verify_in.razorpay_order_id,
                "razorpay_payment_id": verify_in.razorpay_payment_id,
                "razorpay_signature": verify_in.razorpay_signature,
            }
        )

        print(current_user.id)

        if not current_user.id:
            return

        enrollment = Enrollment(
            user_id=current_user.id,
            course_id=verify_in.course_id,
            payment_id=verify_in.razorpay_payment_id,
        )
        session.add(enrollment)
        session.commit()
        session.refresh(enrollment)

        return {"status": "success", "enrollment_id": enrollment.id}

    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

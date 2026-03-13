# API Documentation - Day 5 Cohort Backend

This documentation outlines the available API endpoints for the Day 5 Cohort Backend application.

**Base URL**: `http://localhost:8000` (Default FastAPI development server)

---

## Authentication (`/auth`)

Endpoints for user registration, login, and profile retrieval.

### Register User
`POST /auth/register`

Register a new user (student or instructor).

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | string | Full name of the user |
| `email` | string | Email address (must be unique) |
| `password` | string | Password for the account |
| `role` | string | "student" or "instructor" (default: "student") |

**Response**: `UserPublic`

### Login
`POST /auth/login`

Authenticate a user and receive an access token.

**Request Body**: `OAuth2PasswordRequestForm` (username/password)

**Response**: `Token`
```json
{
  "access_token": "...",
  "token_type": "bearer"
}
```

### Current User Profile
`GET /auth/me`

Retrieve the profile of the currently logged-in user.

**Authorization**: Bearer Token required.

**Response**: `UserPublic`

---

## Courses (`/courses`)

Endpoints for managing courses and lessons.

### Create Course
`POST /courses/`

**Role Required**: `instructor`

| Property | Type | Description |
| :--- | :--- | :--- |
| `title` | string | Title of the course |
| `description` | string | Description of the course |
| `price` | integer | Price of the course (in INR) |

**Response**: `CoursePublic`

### List All Courses
`GET /courses/`

Retrieve a list of all available courses.

**Response**: `List[CoursePublic]`

### Get Course Details
`GET /courses/{course_id}`

Retrieve details of a specific course.

**Response**: `CoursePublic`

### Update Course
`PUT /courses/{course_id}`

**Role Required**: `instructor` (must be the course owner)

**Request Body**: `CourseUpdate` (all fields optional)

**Response**: `CoursePublic`

---

## Lessons (`/courses/{course_id}/lessons/`)

### Create Lesson
`POST /courses/{course_id}/lessons/`

**Role Required**: `instructor` (must be the course owner)

| Property | Type | Description |
| :--- | :--- | :--- |
| `title` | string | Title of the lesson |
| `video_url` | string | URL of the lesson video |
| `order` | integer | Sequence order of the lesson |

**Response**: `LessonPublic`

### List Lessons
`GET /courses/{course_id}/lessons/`

**Access**: Course owner (instructor) or enrolled students.

**Response**: `List[LessonPublic]` (ordered by `order`)

### Update Lesson
`PUT /courses/lessons/{lesson_id}`

**Role Required**: `instructor` (must be the course owner)

**Request Body**: `LessonUpdate` (all fields optional)

**Response**: `LessonPublic`

---

## Payments (`/payments`)

Integration with Razorpay for course enrollment.

### Create Payment Order
`POST /payments/create-order`

Initialize a Razorpay order for course purchase.

| Property | Type | Description |
| :--- | :--- | :--- |
| `course_id` | integer | ID of the course to purchase |

**Response**: Razorpay Order object.

### Verify Payment
`POST /payments/verify-payment`

Verify Razorpay payment signature and enroll user in the course.

| Property | Type | Description |
| :--- | :--- | :--- |
| `razorpay_order_id` | string | Order ID from Razorpay |
| `razorpay_payment_id` | string | Payment ID from Razorpay |
| `razorpay_signature` | string | Verification signature |
| `course_id` | integer | ID of the course |

---

## Live Classes (`/live-classes`)

### Create Live Class
`POST /live-classes/`

**Role Required**: `instructor` (must be the course owner)

| Property | Type | Description |
| :--- | :--- | :--- |
| `course_id` | integer | Associated course ID |
| `topic` | string | Topic of the live class |
| `description` | string | Optional description |
| `scheduled_at` | datetime | Scheduled date and time |

**Response**: `LiveClassPublic`

### List Live Classes
`GET /live-classes/`

**Query Parameters**: `course_id` (optional filter)

**Response**: `List[LiveClassPublic]`

### Get Live Class
`GET /live-classes/{live_class_id}`

**Response**: `LiveClassPublic`

### Live Chat (WebSocket)
`WS /live-classes/{live_class_id}/chat?token={access_token}`

Real-time chat for live classes.

**Access**: Instructor or enrolled students.
**Message Format**: String (plain text)
**Broadcast Format**: `ChatMessagePublic` (JSON)

---

## Data Models

### UserPublic
```json
{
  "id": "int",
  "name": "string",
  "email": "string",
  "role": "string"
}
```

### CoursePublic
```json
{
  "id": "int",
  "title": "string",
  "description": "string",
  "price": "int",
  "instructor_id": "int"
}
```

### LessonPublic
```json
{
  "id": "int",
  "title": "string",
  "video_url": "string",
  "order": "int",
  "course_id": "int"
}
```

### LiveClassPublic
```json
{
  "id": "int",
  "course_id": "int",
  "instructor_id": "int",
  "topic": "string",
  "description": "string",
  "scheduled_at": "datetime"
}
```

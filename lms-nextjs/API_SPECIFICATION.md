# 🎓 LMS Pro — Complete Master API Specification Document

This document provides the complete, production-ready REST API specification for **LMS Pro**. Every endpoint is fully documented with strict request/response payloads, authentication rules, validation constraints, database operations, and business logic.

---

## 📐 Standard API Response Format

### Success Response Structure (HTTP 200 / 201)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error Response Structure (HTTP 400 / 401 / 403 / 404 / 409 / 422 / 500)
```json
{
  "success": false,
  "message": "Detailed error explanation"
}
```

---

## 📑 API Endpoint Index

1. **Authentication API Module**
   - `POST /api/auth/login` — User Authentication
   - `POST /api/auth/register` — Student Registration
   - `GET /api/auth/me` — Current User Profile
   - `POST /api/auth/forgot-password` — Request Reset OTP
   - `POST /api/auth/verify-reset-otp` — Verify Reset OTP
   - `POST /api/auth/reset-password` — Password Reset
   - `POST /api/auth/logout` — User Logout
2. **Courses & Curriculum API Module**
   - `GET /api/courses` — List Courses
   - `POST /api/courses` — Create Course
   - `GET /api/courses/{id}` — Get Course Details
   - `PUT /api/courses/{id}` — Update Course
   - `DELETE /api/courses/{id}` — Delete Course
   - `GET /api/modules` — List Modules
   - `POST /api/modules` — Create Module
   - `GET /api/topics` — List Topics
   - `POST /api/topics` — Create Topic
3. **Enrollments & Dashboard API Module**
   - `GET /api/enrollments` — List Enrollments
   - `POST /api/enrollments` — Enroll Student
   - `GET /api/dashboard` — Student Dashboard Statistics
4. **Quizzes & Attempts API Module**
   - `GET /api/quizzes` — List Quizzes
   - `POST /api/quizzes` — Create Quiz
   - `GET /api/quiz-attempts` — List Quiz Attempts
   - `POST /api/quiz-attempts` — Submit & Auto-grade Quiz
5. **Assignments & Submissions API Module**
   - `GET /api/assignments` — List Assignments
   - `POST /api/assignments` — Create Assignment
   - `GET /api/submissions` — List Submissions
   - `POST /api/submissions` — Submit Assignment Response
6. **Attendance & Certificates API Module**
   - `GET /api/attendance` — Get Attendance Records
   - `POST /api/attendance` — Mark Attendance
   - `GET /api/certificates` — List Certificates
   - `POST /api/certificates` — Issue Certificate
   - `GET /api/certificates/verify/{id}` — Public Certificate Verification
7. **Messaging & Notifications API Module**
   - `GET /api/messages` — Conversation History
   - `POST /api/messages` — Send Message
   - `GET /api/notifications` — List Notifications
   - `POST /api/notifications` — Send Broadcast Notification
8. **Admin Management & Utility API Module**
   - `GET /api/admin/users` — List All Accounts
   - `POST /api/admin/users` — Create User Account
   - `GET /api/search` — Global Search
   - `GET /api/health` — System Health Diagnostics
   - `GET /api/uploads/{subdir}/{filename}` — Serve Uploaded File

---

## 1. Authentication API Module

### 1.1 User Login
- **API Name**: User Login
- **HTTP Method**: `POST`
- **Endpoint URL**: `/api/auth/login`
- **Description**: Authenticates user credentials and returns a signed 7-day JWT bearer token.
- **Authentication Required**: No
- **Authorized Roles**: Public / All (Student, Teacher, Super Admin)
- **Request Headers**: `Content-Type: application/json`
- **Path Parameters**: None
- **Query Parameters**: None
- **Request Body**:
  ```json
  {
    "email": "admin@gmail.com",
    "password": "admin123"
  }
  ```
- **Validation Rules**:
  - `email`: Required, valid email string.
  - `password`: Required, minimum 6 characters.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "u-101",
        "name": "Super Admin",
        "email": "admin@gmail.com",
        "role": "super_admin",
        "status": "active"
      },
      "token": "eyJhbGciOi..."
    }
  }
  ```
- **Error Responses**:
  - **400 Bad Request**: `{ "success": false, "message": "Email and password are required" }`
  - **401 Unauthorized**: `{ "success": false, "message": "Invalid email or password" }`
  - **403 Forbidden**: `{ "success": false, "message": "Account is suspended" }`
- **Business Logic**: Finds user by lowercased email, checks bcrypt password match, updates `lastSeen` timestamp, records security audit log, and issues a 7-day signed JWT.
- **Database Operations**: `prisma.user.findUnique`, `prisma.user.update`, `prisma.securityLog.create`.
- **Notes**: Returns authorization token for subsequent API calls.

---

### 1.2 Student Registration
- **API Name**: Student Self-Registration
- **HTTP Method**: `POST`
- **Endpoint URL**: `/api/auth/register`
- **Description**: Registers a new student account in the platform.
- **Authentication Required**: No
- **Authorized Roles**: Public
- **Request Headers**: `Content-Type: application/json`
- **Path Parameters**: None
- **Query Parameters**: None
- **Request Body**:
  ```json
  {
    "name": "Jane Student",
    "email": "jane@lmspro.edu",
    "password": "password123"
  }
  ```
- **Validation Rules**:
  - `name`: Required, non-empty string.
  - `email`: Required, valid unique email.
  - `password`: Required, minimum 6 characters.
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "user": {
        "id": "u-102",
        "name": "Jane Student",
        "email": "jane@lmspro.edu",
        "role": "student"
      },
      "token": "eyJhbGciOi..."
    }
  }
  ```
- **Error Responses**:
  - **400 Bad Request**: `{ "success": false, "message": "Name, email, and password are required" }`
  - **409 Conflict**: `{ "success": false, "message": "Email address already registered" }`
- **Business Logic**: Verifies uniqueness of email, hashes password with 12 bcrypt rounds, creates user record with `student` role, and issues token.
- **Database Operations**: `prisma.user.findUnique`, `prisma.user.create`.

---

### 1.3 Get Current User Profile
- **API Name**: Get Current User Profile
- **HTTP Method**: `GET`
- **Endpoint URL**: `/api/auth/me`
- **Description**: Returns authenticated user session and achievements.
- **Authentication Required**: Yes
- **Authorized Roles**: All Authenticated Users (`student`, `teacher`, `super_admin`)
- **Request Headers**: `Authorization: Bearer <token>`
- **Path Parameters**: None
- **Query Parameters**: None
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User profile retrieved",
    "data": {
      "user": {
        "id": "u-101",
        "name": "Super Admin",
        "email": "admin@gmail.com",
        "role": "super_admin",
        "xp": 500,
        "streak": 7
      }
    }
  }
  ```
- **Error Responses**:
  - **401 Unauthorized**: `{ "success": false, "message": "Authentication required" }`
  - **404 Not Found**: `{ "success": false, "message": "User profile not found" }`
- **Business Logic**: Decodes token, looks up active user in PostgreSQL, omits password field, returns user profile.
- **Database Operations**: `prisma.user.findUnique`.

---

## 2. Courses API Module

### 2.1 List Courses
- **API Name**: List Courses Catalog
- **HTTP Method**: `GET`
- **Endpoint URL**: `/api/courses`
- **Description**: Retrieves published courses with optional filtering and pagination.
- **Authentication Required**: Optional
- **Authorized Roles**: All / Public
- **Request Headers**: `Authorization: Bearer <token>` (Optional)
- **Query Parameters**:
  - `search` (string): Search in title, description, category.
  - `category` (string): Filter by category.
  - `teacherId` (string): Filter courses authored by teacher.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Courses retrieved successfully",
    "data": {
      "courses": [
        {
          "id": "c-201",
          "title": "Master Next.js 15 & PostgreSQL",
          "description": "Comprehensive course on App Router",
          "category": "Programming",
          "difficulty": "beginner",
          "status": "published",
          "teacher": { "id": "t-1", "name": "Prof. Smith" },
          "_count": { "enrollments": 14, "modules": 4 }
        }
      ]
    }
  }
  ```

---

### 2.2 Create Course
- **API Name**: Create Course
- **HTTP Method**: `POST`
- **Endpoint URL**: `/api/courses`
- **Description**: Authors a new course.
- **Authentication Required**: Yes
- **Authorized Roles**: `teacher`, `super_admin`
- **Request Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "title": "Fullstack Web Development",
    "description": "Learn HTML, CSS, JS, Next.js, and PostgreSQL",
    "category": "Programming",
    "difficulty": "beginner",
    "status": "published"
  }
  ```
- **Validation Rules**:
  - `title`: Required string.
  - `description`: Required string.
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Course created successfully",
    "data": {
      "course": {
        "id": "c-202",
        "title": "Fullstack Web Development",
        "status": "published",
        "teacherId": "t-1"
      }
    }
  }
  ```

---

### 2.3 Get Course Details
- **API Name**: Get Course Details
- **HTTP Method**: `GET`
- **Endpoint URL**: `/api/courses/{id}`
- **Description**: Fetches complete course details including nested modules, topics, and instructor info.
- **Authentication Required**: No
- **Authorized Roles**: Public / All
- **Path Parameters**:
  - `id` (string, required): Course UUID.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Course details retrieved",
    "data": {
      "course": {
        "id": "c-201",
        "title": "Master Next.js 15",
        "modules": [
          {
            "id": "m-1",
            "title": "Module 1: Introduction",
            "topics": [
              { "id": "tp-1", "title": "Lesson 1: App Router Overview", "videoUrl": "https://..." }
            ]
          }
        ]
      }
    }
  }
  ```

---

## 3. Enrollments & Dashboard API Module

### 3.1 Student Dashboard Overview
- **API Name**: Get Student Dashboard
- **HTTP Method**: `GET`
- **Endpoint URL**: `/api/dashboard`
- **Description**: Aggregates enrolled courses, progress, pending tasks, certificates, and XP.
- **Authentication Required**: Yes
- **Authorized Roles**: `student`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Dashboard data retrieved",
    "data": {
      "enrollments": [...],
      "pendingAssignments": [...],
      "certificatesCount": 2,
      "stats": {
        "totalCourses": 3,
        "completedCourses": 1,
        "totalWatchTime": 450,
        "xp": 350,
        "streak": 5
      }
    }
  }
  ```

---

## 4. Quizzes & Attempts API Module

### 4.1 Submit & Auto-grade Quiz
- **API Name**: Submit Quiz Attempt
- **HTTP Method**: `POST`
- **Endpoint URL**: `/api/quiz-attempts`
- **Description**: Submits student quiz responses, calculates instant score, updates accuracy, and awards XP.
- **Authentication Required**: Yes
- **Authorized Roles**: `student`
- **Request Body**:
  ```json
  {
    "quizId": "q-501",
    "answers": [
      { "questionId": "qn-1", "selectedAnswers": ["Option A"] },
      { "questionId": "qn-2", "selectedAnswers": ["Option C"] }
    ],
    "timeSpent": 180
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Quiz submitted and graded",
    "data": {
      "attempt": {
        "id": "qa-901",
        "quizId": "q-501",
        "score": 85,
        "accuracy": 85.0,
        "status": "completed"
      }
    }
  }
  ```

---

## 5. Attendance & Certificates API Module

### 5.1 Verify Certificate Publicly
- **API Name**: Verify Certificate Credential
- **HTTP Method**: `GET`
- **Endpoint URL**: `/api/certificates/verify/{id}`
- **Description**: Public endpoint to verify certificate authenticity by public ID.
- **Authentication Required**: No
- **Authorized Roles**: Public / All
- **Path Parameters**:
  - `id` (string, required): Public Certificate ID (e.g. `CERT-A1B2C3D4`).
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Certificate verified successfully",
    "data": {
      "certificate": {
        "certificateId": "CERT-A1B2C3D4",
        "student": { "name": "Jane Student" },
        "course": { "title": "Next.js 15 & PostgreSQL" },
        "issuedBy": { "name": "Super Admin" },
        "issueDate": "2026-07-28T00:00:00.000Z"
      }
    }
  }
  ```

---

## 6. Messaging & Notifications Module

### 6.1 Send Direct Message
- **API Name**: Send Direct Message
- **HTTP Method**: `POST`
- **Endpoint URL**: `/api/messages`
- **Description**: Sends direct message between users and triggers Socket.io realtime broadcast.
- **Authentication Required**: Yes
- **Authorized Roles**: All Authenticated Users
- **Request Body**:
  ```json
  {
    "recipientId": "u-102",
    "content": "Hello, when is the next assignment due?"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Message sent",
    "data": {
      "message": {
        "id": "msg-801",
        "senderId": "u-101",
        "recipientId": "u-102",
        "content": "Hello, when is the next assignment due?",
        "createdAt": "2026-07-28T00:00:00.000Z"
      }
    }
  }
  ```

---

## 7. Admin & Health API Module

### 7.1 List User Accounts
- **API Name**: List Users
- **HTTP Method**: `GET`
- **Endpoint URL**: `/api/admin/users`
- **Description**: Lists user accounts with filtering by role and pagination. Super Admin only.
- **Authentication Required**: Yes
- **Authorized Roles**: `super_admin`
- **Query Parameters**: `role`, `status`, `search`, `page`, `limit`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Users retrieved successfully",
    "data": {
      "users": [
        {
          "id": "u-101",
          "name": "Jane Doe",
          "email": "jane@lmspro.edu",
          "role": "student",
          "status": "active"
        }
      ],
      "meta": { "total": 25, "page": 1, "totalPages": 2 }
    }
  }
  ```

---

### 7.2 System Health Diagnostics
- **API Name**: Health Check
- **HTTP Method**: `GET`
- **Endpoint URL**: `/api/health`
- **Description**: Liveness diagnostic endpoint reporting API server and database pool status.
- **Authentication Required**: No
- **Authorized Roles**: Public / All
- **Success Response (200 OK)**:
  ```json
  {
    "status": "UP",
    "timestamp": "2026-07-28T00:45:00.000Z",
    "service": "LMS Pro API Server",
    "database": "CONNECTED",
    "uptime": 1234.56
  }
  ```

---

## 8. Contact Support API Module

### 8.1 Submit Support Request
- **API Name**: Submit Contact Support Form
- **HTTP Method**: `POST`
- **Endpoint URL**: `/api/contact`
- **Description**: Public endpoint for submitting support requests, course inquiries, or bug reports. Stores submission in database with default status `NEW`.
- **Authentication Required**: No
- **Authorized Roles**: Public / All
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@lmspro.edu",
    "phone": "+1 (555) 000-0000",
    "subject": "Course Inquiry",
    "message": "I would like more information about the Next.js 15 course curriculum."
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Your message has been submitted successfully.",
    "data": {
      "id": "c-101",
      "name": "Jane Doe",
      "email": "jane@lmspro.edu",
      "phone": "+1 (555) 000-0000",
      "subject": "Course Inquiry",
      "message": "I would like more information about the Next.js 15 course curriculum.",
      "status": "NEW",
      "createdAt": "2026-07-28T01:45:00.000Z"
    }
  }
  ```
- **Error Response (400 Bad Request / 500 Internal Error)**:
  ```json
  {
    "success": false,
    "message": "Full Name is required."
  }
  ```

### 8.2 List Contact Submissions (Admin)
- **API Name**: Retrieve Support Submissions
- **HTTP Method**: `GET`
- **Endpoint URL**: `/api/admin/contact`
- **Description**: Super Admin endpoint to list all user support submissions with optional status filtering.
- **Authentication Required**: Yes (Bearer Token)
- **Authorized Roles**: Super Admin (`super_admin`)
- **Query Parameters**: `status` (optional: `NEW`, `IN_PROGRESS`, `RESOLVED`), `page` (default `1`), `limit` (default `50`)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Contact requests fetched successfully.",
    "data": {
      "requests": [
        {
          "id": "c-101",
          "name": "Jane Doe",
          "email": "jane@lmspro.edu",
          "phone": "+1 (555) 000-0000",
          "subject": "Course Inquiry",
          "message": "I would like more information about the Next.js 15 course curriculum.",
          "status": "NEW",
          "createdAt": "2026-07-28T01:45:00.000Z"
        }
      ],
      "total": 1,
      "page": 1,
      "totalPages": 1
    }
  }
  ```

### 8.3 Update Submission Status (Admin)
- **API Name**: Update Contact Request Status
- **HTTP Method**: `PATCH`
- **Endpoint URL**: `/api/admin/contact/{id}`
- **Description**: Updates the resolution status of a contact support request (`NEW`, `IN_PROGRESS`, `RESOLVED`).
- **Authentication Required**: Yes (Bearer Token)
- **Authorized Roles**: Super Admin (`super_admin`)
- **Request Body**:
  ```json
  {
    "status": "IN_PROGRESS"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Contact request status updated successfully.",
    "data": {
      "id": "c-101",
      "status": "IN_PROGRESS"
    }
  }
  ```

### 8.4 Delete Submission (Admin)
- **API Name**: Delete Contact Request
- **HTTP Method**: `DELETE`
- **Endpoint URL**: `/api/admin/contact/{id}`
- **Description**: Removes a support request from the database.
- **Authentication Required**: Yes (Bearer Token)
- **Authorized Roles**: Super Admin (`super_admin`)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Contact request deleted successfully.",
    "data": null
  }
  ```

---

## 9. Interactive Swagger UI

Visit **`http://localhost:3000/api-docs`** to test all endpoints live!

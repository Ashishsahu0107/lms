# 🎓 LMS Pro — Production-Ready Master Project Documentation

Welcome to the comprehensive technical documentation for **LMS Pro** — an enterprise-grade Learning Management System built as a unified **Next.js 15 (App Router)** application powered by **PostgreSQL (Prisma ORM)**, **Socket.io**, **Redux Toolkit**, and **Swagger (OpenAPI 3.0)**.

---

## 📑 Table of Contents
1. [Executive Summary & Technology Stack](#1-executive-summary--technology-stack)
2. [Project Architecture & System Design](#2-project-architecture--system-design)
3. [Complete Folder & Directory Structure](#3-complete-folder--directory-structure)
4. [Environment Variables & Developer Setup](#4-environment-variables--developer-setup)
5. [Database Schema & Prisma ORM Models](#5-database-schema--prisma-orm-models)
6. [Authentication & Security Architecture](#6-authentication--security-architecture)
7. [Role-Based Access Control (RBAC) Matrix](#7-role-based-access-control-rbac-matrix)
8. [Frontend Routing & API Integration Map](#8-frontend-routing--api-integration-map)
9. [Exhaustive API Specification & Request/Response Payloads](#9-exhaustive-api-specification--requestresponse-payloads)
10. [State Management (Redux Toolkit & Contexts)](#10-state-management-redux-toolkit--contexts)
11. [Real-time WebSockets & File Upload Engine](#11-real-time-websockets--file-upload-engine)
12. [Swagger / OpenAPI 3.0 System](#12-swagger--openapi-30-system)
13. [Coding Standards & Best Practices](#13-coding-standards--best-practices)
14. [Performance Optimization Strategy](#14-performance-optimization-strategy)
15. [Testing & Quality Assurance](#15-testing--quality-assurance)
16. [Deployment & DevOps Guide](#16-deployment--devops-guide)
17. [Troubleshooting & Common Issues](#17-troubleshooting--common-issues)

---

## 1. Executive Summary & Technology Stack

LMS Pro consolidates legacy MERN stack applications (React Vite SPA + Express.js APIs) into a single, unified, production-ready **Next.js 15 App Router** platform.

### Core Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js | 15.0+ | Server-side rendering, Client UI, App Router API routes |
| **Language** | TypeScript / ES Modules | 5.0+ | Strict type safety across client and server |
| **Database** | PostgreSQL | 15+ | Enterprise relational data storage |
| **ORM** | Prisma ORM | 6.19+ | Type-safe database queries, schema migrations, seeding |
| **Realtime** | Socket.io | 4.8+ | WebSocket server for direct chat, presence, AI streaming |
| **State** | Redux Toolkit & React Context | 2.5+ | Global UI state management and authentication sessions |
| **Styling** | Tailwind CSS & FlyonUI | 4.0+ | Responsive utility-first minimalist design system |
| **API Docs** | Swagger (swagger-jsdoc & dist)| 3.0 / 5.18 | Interactive OpenAPI specification (`/api-docs`) |
| **Auth** | JWT & bcryptjs | 9.0 / 2.4 | Stateless token authentication with password hashing |
| **File Engine**| Multer & Custom Route Serving | 1.4+ | Upload validation, static file streaming, path sanitization |

---

## 2. Project Architecture & System Design

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT BROWSER                                    |
|   +-----------------------+   +------------------------+   +------------------+   |
|   | Student Portal UI     |   | Teacher Portal UI      |   | Super Admin UI   |   |
|   +-----------------------+   +------------------------+   +------------------+   |
|               |                            |                        |             |
|               +----------------------------+------------------------+             |
|                                            |                                      |
|                               (HTTP REST / WebSockets)                            |
+--------------------------------------------|--------------------------------------+
                                             v
+-----------------------------------------------------------------------------------+
|                           NEXT.JS 15 + SOCKET.IO SERVER                           |
|  +-----------------------------------------------------------------------------+  |
|  | custom server.js (Node.js HTTP Wrapper)                                     |  |
|  |   ├─ Next.js 15 Request Handler (App Router /api/* & pages)                |  |
|  |   └─ Socket.io Server (JWT Auth, Presence, Streaming Chat)                 |  |
|  +-----------------------------------------------------------------------------+  |
|                                            |                                      |
|                               (Prisma ORM Type-Safe Queries)                      |
+--------------------------------------------|--------------------------------------+
                                             v
+-----------------------------------------------------------------------------------+
|                               POSTGRESQL DATABASE                                 |
|   Users | Courses | Modules | Topics | Enrollments | Quizzes | Submissions        |
+-----------------------------------------------------------------------------------+
```

---

## 3. Complete Folder & Directory Structure

```
lms-nextjs/
├── app/                                # Next.js 15 App Router pages & APIs
│   ├── (auth)/                         # Authentication route group
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── verify-otp/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/                    # Dashboard layout & sub-portals
│   │   ├── layout.tsx                  # Shared responsive sidebar shell
│   │   ├── student/                    # Student role views
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── courses/page.tsx & [id]/page.tsx
│   │   │   ├── my-courses/page.tsx
│   │   │   ├── assignments/page.tsx
│   │   │   ├── quizzes/page.tsx
│   │   │   ├── attendance/page.tsx
│   │   │   ├── certificates/page.tsx
│   │   │   └── messages/page.tsx
│   │   ├── teacher/                    # Teacher role views
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── courses/page.tsx & new/page.tsx
│   │   │   ├── assignments/page.tsx
│   │   │   ├── quizzes/page.tsx
│   │   │   ├── attendance/page.tsx
│   │   │   ├── students/page.tsx
│   │   │   ├── notes/page.tsx
│   │   │   └── schedules/page.tsx
│   │   └── admin/                      # Super Admin role views
│   │       ├── dashboard/page.tsx
│   │       ├── users/page.tsx
│   │       ├── health/page.tsx
│   │       └── settings/page.tsx
│   ├── api/                            # Next.js Serverless Route Handlers
│   │   ├── admin/users/route.ts
│   │   ├── assignments/route.ts
│   │   ├── attendance/route.ts
│   │   ├── auth/ (login, register, me, forgot-password, verify-reset-otp, reset-password, logout)
│   │   ├── certificates/ (route.ts, verify/[id]/route.ts)
│   │   ├── courses/ (route.ts, [id]/route.ts)
│   │   ├── dashboard/route.ts
│   │   ├── docs/route.ts               # Swagger JSON spec handler
│   │   ├── health/route.ts
│   │   ├── messages/route.ts
│   │   ├── modules/ (route.ts, [id]/route.ts)
│   │   ├── notifications/route.ts
│   │   ├── quiz-attempts/route.ts
│   │   ├── quizzes/route.ts
│   │   ├── search/route.ts
│   │   ├── submissions/route.ts
│   │   ├── topics/route.ts
│   │   └── uploads/[...path]/route.ts # Binary file streaming & sanitization
│   ├── api-docs/page.tsx               # Interactive Swagger UI page
│   ├── verify-certificate/[certificateId]/page.tsx
│   ├── globals.css                     # Tailwind CSS style rules
│   ├── layout.tsx                      # Root layout wrapper
│   └── page.tsx                        # Root page redirect
├── components/                         # UI View Components
│   ├── admin/ (AdminDashboard, UserManagementView, SystemHealthView, AdminSettingsView)
│   ├── auth/ (LoginPage, RegisterPage, ForgotPasswordPage, VerifyOtpPage, ResetPasswordPage)
│   ├── chat/ (MessagesView)
│   ├── public/ (VerifyCertificateView)
│   ├── student/ (StudentDashboard, BrowseCourses, CourseDetailView, MyCourses, StudentAssignments, StudentQuizzes, StudentAttendance, StudentCertificates)
│   └── teacher/ (TeacherDashboard, TeacherCourseManager, TeacherAssignmentsView, TeacherQuizBuilderView, TeacherAttendanceSheet, StudentRoster, TeacherNotesView, TeacherSchedulesView)
├── context/                            # React Context Providers
│   ├── AuthContext.tsx                 # JWT session & user state management
│   ├── SocketContext.tsx               # Socket.io connection & presence state
│   └── ThemeContext.tsx                # Light/dark mode preference state
├── lib/                                # Core Utility Libraries
│   ├── auth.ts                         # JWT sign, verify, extract helpers
│   ├── db.ts                           # Prisma singleton client instance
│   ├── errors.ts                       # Custom AppError classes
│   ├── mailer.ts                       # Nodemailer email utility
│   ├── middleware.ts                   # RBAC authorization guards
│   ├── swagger.ts                      # OpenAPI 3.0 JSDoc spec generator
│   └── upload.ts                       # Multer upload configuration
├── prisma/
│   ├── schema.prisma                   # PostgreSQL database schema definition
│   └── seed.js                         # Database seed script for Super Admin
├── providers/
│   └── AppProviders.tsx                # Client-side providers wrapper
├── store/                              # Redux Toolkit State Management
│   ├── slices/ (auth, course, enrollment, message, notification, ui)
│   └── store.ts                        # Redux store setup
├── types/
│   └── global.d.ts                     # Global TypeScript declarations
├── .env & .env.local                   # Environment variables
├── next.config.mjs                     # Next.js build configuration
├── package.json                        # Project dependencies
├── postcss.config.js & .mjs            # PostCSS configuration
├── server.js                           # Custom Node.js server wrapping Socket.io
└── tailwind.config.js                  # Tailwind CSS theme configuration
```

---

## 4. Environment Variables & Developer Setup

### Environment Variable Reference (`.env`)

```env
# PostgreSQL Connection URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/lms_pro"

# JWT Secret Key
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Application Server Setup
NODE_ENV="development"
PORT=3000
HOSTNAME="0.0.0.0"
JSON_LIMIT="1mb"
UPLOADS_DIR="uploads"

# Public Next.js Endpoints
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="LMS Pro"
```

### Complete Onboarding Commands

```bash
# 1. Clone repository & enter Next.js project directory
cd lms/lms-nextjs

# 2. Install all Node.js package dependencies
npm install

# 3. Generate Prisma Client
npx prisma generate

# 4. Sync PostgreSQL database schema
npx prisma db push

# 5. Seed Super Admin account (admin@gmail.com / admin123)
npm run db:seed

# 6. Launch development server with Socket.io wrapper
npm run dev
```

---

## 5. Database Schema & Prisma ORM Models

The database schema is defined in `prisma/schema.prisma` with 20+ relational tables:

```prisma
enum Role {
  student
  teacher
  super_admin
}

model User {
  id              String      @id @default(uuid())
  name            String
  email           String      @unique
  password        String
  role            Role        @default(student)
  status          String      @default("active")
  isActive        Boolean     @default(true)
  isVerified      Boolean     @default(false)
  avatar          String?
  xp              Int         @default(0)
  streak          Int         @default(0)
  createdAt       DateTime    @default(now())

  // Relations
  teachingCourses Course[]    @relation("TeacherCourses")
  enrollments     Enrollment[]
  submissions     Submission[]
  quizAttempts    QuizAttempt[]
  certificates    Certificate[] @relation("StudentCertificates")
  issuedCerts     Certificate[] @relation("IssuerCertificates")
  sentMessages    Message[]     @relation("SentMessages")
  recvMessages    Message[]     @relation("ReceivedMessages")
}

model Course {
  id          String       @id @default(uuid())
  title       String
  description String
  category    String       @default("General")
  difficulty  String       @default("beginner")
  status      String       @default("published")
  teacherId   String
  teacher     User         @relation("TeacherCourses", fields: [teacherId], references: [id])
  modules     Module[]
  enrollments Enrollment[]
  assignments Assignment[]
  quizzes     Quiz[]
}
```

---

## 6. Authentication & Security Architecture

### Authentication Mechanism
1. User submits login credentials to `POST /api/auth/login`.
2. Password is verified using `bcrypt.compare(password, user.password)`.
3. Server returns a signed JWT token containing `{ userId, email, role }` valid for 7 days.
4. Client stores token in `localStorage` and includes it in all requests:
   `Authorization: Bearer <token>`.

---

## 7. Role-Based Access Control (RBAC) Matrix

| Route / Resource | Student | Teacher | Super Admin | Public |
| :--- | :---: | :---: | :---: | :---: |
| `POST /api/auth/login` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/auth/register` | ✅ | ❌ | ❌ | ✅ |
| `GET /api/courses` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/courses` | ❌ | ✅ | ✅ | ❌ |
| `DELETE /api/courses/[id]` | ❌ | ✅ (Owner) | ✅ | ❌ |
| `GET /api/dashboard` | ✅ | ❌ | ❌ | ❌ |
| `GET /api/admin/users` | ❌ | ❌ | ✅ | ❌ |
| `POST /api/submissions` | ✅ | ❌ | ❌ | ❌ |
| `POST /api/attendance` | ❌ | ✅ | ✅ | ❌ |
| `GET /api/certificates/verify/[id]` | ✅ | ✅ | ✅ | ✅ |

---

## 8. Frontend Routing & API Integration Map

| Path | View Component | Key API Route(s) | Functionality |
| :--- | :--- | :--- | :--- |
| `/login` | `LoginPage.tsx` | `POST /api/auth/login` | User login & token storage |
| `/register` | `RegisterPage.tsx` | `POST /api/auth/register` | Student self-registration |
| `/student/dashboard` | `StudentDashboard.tsx` | `GET /api/dashboard` | Metrics, progress chart, pending tasks |
| `/student/courses` | `BrowseCourses.tsx` | `GET /api/courses` | Searchable course catalog |
| `/student/courses/[id]`| `CourseDetailView.tsx` | `GET /api/courses/[id]`, `POST /api/enrollments` | Video lesson player & curriculum accordion |
| `/student/my-courses` | `MyCourses.tsx` | `GET /api/enrollments` | Progress tracking for enrolled courses |
| `/student/assignments`| `StudentAssignments.tsx`| `GET /api/assignments`, `POST /api/submissions` | Coursework submission & grade feedback |
| `/student/quizzes` | `StudentQuizzes.tsx` | `GET /api/quizzes`, `POST /api/quiz-attempts` | Quiz attempt player & accuracy report |
| `/student/attendance` | `StudentAttendance.tsx` | `GET /api/attendance` | Session attendance log |
| `/student/certificates`| `StudentCertificates.tsx`| `GET /api/certificates` | Printable certificate credential modal |
| `/student/messages` | `MessagesView.tsx` | `GET /api/messages`, `POST /api/messages` | Realtime direct messaging |
| `/teacher/dashboard` | `TeacherDashboard.tsx` | `GET /api/courses?teacherId=...` | Teacher metrics & course roster |
| `/teacher/courses` | `TeacherCourseManager.tsx`| `POST /api/courses`, `POST /api/modules` | Course authoring & module builder |
| `/teacher/assignments`| `TeacherAssignmentsView.tsx`| `POST /api/assignments` | Assignment builder & grading |
| `/teacher/quizzes` | `TeacherQuizBuilderView.tsx`| `POST /api/quizzes` | Quiz builder |
| `/teacher/attendance` | `TeacherAttendanceSheet.tsx`| `POST /api/attendance` | Session attendance marking sheet |
| `/teacher/students` | `StudentRoster.tsx` | `GET /api/enrollments` | Student performance roster |
| `/admin/users` | `UserManagementView.tsx`| `GET /api/admin/users`, `POST /api/admin/users` | User management & role promotion |
| `/admin/health` | `SystemHealthView.tsx` | `GET /api/health` | System liveness probe output |

---

## 9. Exhaustive API Specification & Request/Response Payloads

### Standard API Response Wrapper

#### Success Response (HTTP 200 / 201)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

#### Error Response (HTTP 400 / 401 / 403 / 404 / 500)
```json
{
  "success": false,
  "message": "Detailed error explanation"
}
```

### 1. Authentication Endpoints

#### `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "admin@gmail.com",
    "password": "admin123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "uuid-1234",
        "name": "Super Admin",
        "email": "admin@gmail.com",
        "role": "super_admin"
      },
      "token": "eyJhbGciOi..."
    }
  }
  ```

---

## 10. State Management (Redux Toolkit & Contexts)

- **AuthContext**: Manages user session, JWT token persistence, and role-based redirects.
- **SocketContext**: Manages WebSocket lifecycle, auto-reconnects, and presence tracking.
- **Redux Store (`store/store.ts`)**:
  - `auth`: Credentials & profile data.
  - `courses`: Course catalog cache.
  - `enrollments`: Enrolled courses & progress.
  - `notifications`: Unread notifications & badges.
  - `messages`: Active thread messages.
  - `ui`: Sidebar toggle, active modals, page loading indicators.

---

## 11. Real-time WebSockets & File Upload Engine

### WebSockets (`server.js`)
- `send-message`: Transmits live chat messages to recipient sockets.
- `typing` / `stop-typing`: Emits typing indicator events.
- `send-ai-message`: Streams AI tutor responses word-by-word (`ai-word`).

---

## 12. Swagger / OpenAPI 3.0 System

Interactive API documentation is live at **`http://localhost:3000/api-docs`**.

---

## 13. Coding Standards & Best Practices

1. **TypeScript Strictness**: Zero `any` types allowed in core business logic.
2. **Standard API Wrapper**: All Next.js route handlers return `{ success, message, data }`.
3. **Pure Tailwind CSS**: Explicit Tailwind utility classes (`bg-slate-50`, `text-indigo-600`, `rounded-2xl`).

---

## 14. Performance Optimization Strategy

1. **Prisma Singleton (`lib/db.ts`)**: Prevents connection pool exhaustion during Next.js hot-reloading.
2. **Lazy Dynamic Imports**: Dynamic imports for client-only dependencies like Swagger UI.
3. **Database Indexing**: Indexes placed on frequently queried fields (`userId`, `courseId`, `email`).

---

## 15. Testing & Quality Assurance

### Validation Commands
```bash
# Run TypeScript compilation check
npx tsc --noEmit

# Run Prisma schema validation
npx prisma validate
```

---

## 16. Deployment & DevOps Guide

### Self-Hosted Production (Node.js + PostgreSQL)
```bash
# Build production bundle
npm run build

# Start production HTTP server with Socket.io
npm run start
```

---

## 17. Troubleshooting & Common Issues

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| `P1000: Authentication failed` | Invalid PostgreSQL credentials in `.env` | Update `DATABASE_URL` password in `.env` |
| `EADDRINUSE: 3000` | Port 3000 occupied | Kill running Node process or change `PORT` in `.env` |
| `No layout defined for StandaloneLayout` | Missing preset import | Import `swagger-ui-standalone-preset` dynamically |

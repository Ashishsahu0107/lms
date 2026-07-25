# LMS Pro — Product Requirements Document (PRD)
**Version:** 2.0.0 | **Status:** In Development | **Last Updated:** June 2026

---

## 1. Product Overview

**LMS Pro** is a full-stack Learning Management System designed for educational institutions and online academies. It supports three user roles — Student, Teacher, and Super Admin — with real-time WebSocket-powered analytics, AI assistant integration, gamification mechanics, and a comprehensive course lifecycle (creation → enrollment → assessment → certification).

### 1.1 Goals
- Deliver a premium, dark-mode-first UI for all roles
- Enable real-time classroom telemetry via WebSocket sockets
- Provide teachers with full CRUD control over courses, quizzes, assignments, and attendance
- Allow students to learn, track progress, earn certificates, and compete on leaderboards
- Give admins a centralized control plane for users, analytics, and platform settings

---

## 2. Tech Stack

### 2.1 Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 (Vite) |
| Routing | React Router v6 (lazy-loaded, role-guarded) |
| State Management | Redux Toolkit |
| Styling | Vanilla CSS + custom design tokens (`index.css`) |
| Animations | Framer Motion |
| Charts | Recharts (`AreaChart`, `CartesianGrid`, `XAxis`, `Tooltip`, etc.) |
| Icons | Lucide React |
| Real-time | Socket.io-client |
| HTTP | Axios (via `/services` layer) |
| Code Splitting | React `lazy` + `Suspense` on every page |

### 2.2 Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM modules) |
| Framework | Express 4 |
| Database | MongoDB via Mongoose 8 |
| Auth | JWT (access + refresh tokens), bcryptjs |
| Real-time | Socket.io 4 |
| Email | Nodemailer (OTP verification, password reset) |
| Security | Helmet, CORS, express-rate-limit, xss-clean, mongo-sanitize |
| Compression | gzip (compression middleware) |
| Logging | Winston + Morgan |
| File Upload | Multer |
| Testing | Jest + Supertest |

---

## 3. User Roles

| Role | Route Prefix | Description |
|---|---|---|
| `student` | `/student/*` | Learner — enrolls in courses, submits quizzes/assignments, earns certificates |
| `teacher` | `/teacher/*` | Instructor — creates/manages courses, grades, tracks attendance and earnings |
| `super_admin` | `/admin/*` | Platform owner — manages all users, views global analytics, issues certificates |

> **Note:** Role guard (`RoleGuard`) is enforced on every route group. Unauthorized access redirects to `/login`.

---

## 4. Authentication System

### 4.1 Features
- Email + password login with **JWT access/refresh token** pair
- **OTP-based email verification** on registration (via Nodemailer)
- **Forgot password** via OTP (`resetPasswordOTP`, `resetPasswordOTPExpires`)
- Refresh token rotation on silent re-auth
- `isActive`, `isVerified`, `isEmailVerified` flags on the User model
- `passwordChangedAt` tracked for token invalidation
- Optional **Two-Factor Authentication** (UI preference flag, `twoFactorEnabled`)

### 4.2 API Endpoints — `POST /api/auth/*`
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Login with email + password |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/logout` | Invalidate refresh token |
| POST | `/api/auth/refresh` | Issue new access token |
| POST | `/api/auth/verify-email` | Verify email OTP |
| POST | `/api/auth/forgot-password` | Send reset OTP |
| POST | `/api/auth/reset-password` | Reset password with OTP |
| GET | `/api/auth/me` | Return current authenticated user |

---

## 5. Data Models

### 5.1 User
| Field | Type | Notes |
|---|---|---|
| `name` | String | 2–100 chars |
| `email` | String | Unique, indexed |
| `password` | String | bcrypt hashed, never returned |
| `role` | Enum | `student` / `teacher` / `super_admin` |
| `avatar`, `bio`, `phone`, `gender`, `dateOfBirth` | Profile fields | — |
| `isActive`, `status` | Boolean / Enum | `active` / `suspended` / `pending` |
| `isVerified`, `isEmailVerified` | Boolean | OTP verification gates |
| `enrolledCourses`, `teachingCourses`, `assignedCourses` | ObjectId[] | Course refs |
| `isOnline`, `lastSeen`, `socketId` | Real-time presence | — |
| `preferences` | Object | Theme, notification toggles, privacy, 2FA |
| `xp`, `streak`, `lastActiveDate`, `badges`, `achievements` | Gamification | — |
| `refreshToken` | String | Rotation-tracked, never returned |

### 5.2 Course
| Field | Type | Notes |
|---|---|---|
| `title` | String | Max 200 chars, text-indexed |
| `description`, `category`, `tags` | Content metadata | — |
| `price` | Number | Min 0 |
| `thumbnail` | String | URL |
| `teacherId` / `teacher` | ObjectId → User | Synced via pre-validate hook |
| `modules` | ObjectId[] → Module | — |
| `students` | ObjectId[] → User | Enrolled learners |
| `ratings` | Sub-document[] | `studentId`, `score` (1–5), `comment` |
| `averageRating`, `totalRatings` | Computed | Pre-save hook |
| `status` | Enum | `draft` / `published` / `archived` |
| `difficulty` | Enum | `beginner` / `intermediate` / `advanced` |

### 5.3 Module → Topic (Hierarchy)
- **Module**: belongs to a Course, contains ordered Topics
- **Topic**: belongs to a Module, holds lecture content/video references

### 5.4 Quiz
| Field | Notes |
|---|---|
| `courseId`, `moduleId`, `topicId` | Scope context |
| `quizType` | `practice` / `exam` / `homework` |
| `duration` (minutes), `totalMarks`, `passingMarks` | Grading config |
| `attemptLimit` | 0 = unlimited |
| `shuffleQuestions`, `negativeMarking` | Options |
| `status` | `draft` / `published` / `closed` |
| `questions` | ObjectId[] → Question |

### 5.5 Other Models
| Model | Purpose |
|---|---|
| `Assignment` | Teacher-created tasks with deadlines |
| `Submission` | Student assignment submissions |
| `QuizAttempt` | Student quiz attempt + score tracking |
| `Question` | MCQ/subjective questions linked to Quiz |
| `Enrollment` | Student ↔ Course relationship record |
| `Attendance` | Per-session attendance rolls |
| `Certificate` | Issued on course completion |
| `Message` | In-app messaging (threaded) |
| `Notes` | Student/teacher notes per course |
| `Schedule` | Live class / session scheduling |
| `Payment` | Payment records |
| `Invoice` | Invoice documents |
| `Subscription` | Subscription plans |
| `Notification` | In-app notification queue |
| `SecurityLog` | Auth event auditing |
| `Settings` | Platform-level settings |
| `StudentProgress` | Per-student course progress tracking |
| `Performance` | Aggregated performance metrics |
| `Activity` | Activity log events |
| `AIChat` | AI assistant conversation history |

---

## 6. API Surface (Backend)

All routes are mounted under `/api/`. Protected routes require `Authorization: Bearer <token>`.

| Route Prefix | Domain |
|---|---|
| `/api/auth` | Authentication & identity |
| `/api/courses` | Course CRUD (also aliased at `/api/teacher/courses`) |
| `/api/modules` | Module management |
| `/api/topics` | Topic management |
| `/api/enrollments` | Course enrollments |
| `/api/student` | Student-facing dashboard APIs |
| `/api/teacher/students` | Teacher view of student management |
| `/api/assignments` | Assignment CRUD (also `/api/teacher/assignments`) |
| `/api/submissions` | Assignment submissions |
| `/api/quizzes` | Quiz CRUD (also `/api/teacher/quizzes`) |
| `/api/quiz-attempts` | Student quiz attempts |
| `/api/dashboard` | Role-appropriate dashboard data |
| `/api/teacher` | Teacher dashboard aggregates |
| `/api/teacher/analytics` | Teacher analytics |
| `/api/attendance` | Attendance management |
| `/api/certificates` | Certificate issuance & retrieval |
| `/api/settings` | User/platform settings |
| `/api/notes` | Notes management |
| `/api/schedules` | Live class scheduling |
| `/api/search` | Global search |
| `/api/messages` | Messaging |
| `/api/admin` | Admin user/platform management |
| `/api/admin/analytics` | Admin analytics dashboards |
| `/api/ai` | AI assistant endpoints |
| `/api/ping`, `/api/health` | Uptime / health checks |

---

## 7. Real-Time (WebSocket) System

Built on **Socket.io 4**, initialized alongside the HTTP server via `initSocket(server)`.

### 7.1 Events Emitted by Server (subscribed by frontend)
| Event | Payload | Consumer |
|---|---|---|
| `studentJoined` / `userJoined` / `enrollmentCreated` | `{ name, studentName, courseTitle }` | Admin RealTime panel — increments enrollment counter |
| `quizSubmitted` | `{ studentName, score }` | Admin RealTime panel — increments quiz counter |
| `paymentCompleted` | `{ amount }` | Admin RealTime panel — increments revenue |
| `attendanceUpdated` / `attendanceMarked` | `{}` | Admin RealTime panel — logs attendance event |

### 7.2 Connection State
- `useSocket()` context provides `{ socket, isConnected }` to all consumers
- Visual indicator rendered in `RealTimeAnalytics.jsx` (green `Wifi` / red `WifiOff` pill)
- `socketId`, `isOnline`, `lastSeen` stored on User model for server-side presence tracking

---

## 8. Frontend — Page & Feature Inventory

### 8.1 Public / Auth
| Page | Path | Features |
|---|---|---|
| `LoginPage` | `/login` | Email/password form, role-based redirect post-login |

### 8.2 Student Portal (`/student/*`)
| Page | Path | Features |
|---|---|---|
| `StudentDashboard` | `/student/dashboard` | Stats, enrolled courses, recent activity, XP/streaks |
| `MyCourses` | `/student/courses` | Course cards, progress bars, filter/search |
| `CourseDetails` | `/student/course/:id` | Syllabus, ratings, enrollment CTA |
| `CoursePlayer` | `/student/course/:courseId/player/:lectureId` | Video player, topic navigation, notes |
| `Assignments` | `/student/assignments` | Pending/submitted assignments, file upload |
| `Quiz` | `/student/quizzes` | Quiz list, attempt flow, score review |
| `Messages` | `/student/messages` | In-app messaging with teachers |
| `Certificates` | `/student/certificates` | Earned certificates, download/share |
| `Profile` | `/student/profile` | Edit bio, avatar, social links |
| `Settings` | `/student/settings` | Theme, notifications, privacy, 2FA |
| `Achievements` | (gamification) | XP, streaks, badges, leaderboard |
| `Attendance` | (student view) | Personal attendance records |
| `Notes` | (student notes) | Per-course study notes |

### 8.3 Teacher Portal (`/teacher/*`)
| Page | Path | Features |
|---|---|---|
| `TeacherDashboard` | `/teacher/dashboard` | KPIs, recent enrollments, quick actions |
| `CourseManagement` | `/teacher/courses` | Create/edit/publish/archive courses, modules, topics |
| `TeacherQuizManagement` | `/teacher/quizzes` | Create quizzes, manage questions, view attempts |
| `TeacherAssignmentManagement` | `/teacher/assignments` | Create assignments, review submissions, grade |
| `TeacherStudentProgress` | `/teacher/student-progress` | Per-student progress tracking |
| `TeacherAttendance` | `/teacher/attendance` | Mark attendance per session |
| `Messages` | `/teacher/messages` | Messaging with students |
| `Profile` | `/teacher/profile` | Edit profile, qualifications, experience |
| `NotesDashboard` | (teacher notes) | Course-linked notes management |
| `Earnings` | (teacher earnings) | Revenue, payout history |
| `Certificates` | (teacher view) | Certificate issuance |

### 8.4 Admin Portal (`/admin/*`)
| Page | Path | Features |
|---|---|---|
| `AdminDashboard` | `/admin/dashboard` | Platform KPIs, quick stats, recent signups |
| `UserManagement` | `/admin/users` | Search/filter users, change roles/status, suspend accounts |
| `AnalyticsDashboard` | Analytics hub | Tab-based analytics: Course, User, Engagement, Performance, Revenue, Real-Time |
| `CourseAnalytics` | Analytics tab | Enrollment trends, top courses, completion rates |
| `UserAnalytics` | Analytics tab | New users, role breakdown, retention |
| `EngagementAnalytics` | Analytics tab | Active sessions, content interactions |
| `PerformanceAnalytics` | Analytics tab | Quiz scores, assignment grades |
| `RevenueAnalytics` | Analytics tab | Revenue charts, subscription breakdown |
| `RealTimeAnalytics` | Analytics tab | Live WebSocket stream, 3s interval area chart, live activity feed |
| Certificate Management | Admin control | Issue/revoke certificates |

### 8.5 Shared Pages (all roles)
| Component | Description |
|---|---|
| `AIAssistant` | AI chat panel with conversation history |
| `AIAnalytics` | AI-generated learning insights |
| `LiveClasses` | Live class viewer/schedule |
| `ScheduleManager` | Create/manage class schedules |
| `CalendarDashboard` | Calendar view of scheduled events |

---

## 9. Gamification System

Implemented on the `User` model and surfaced in the student portal:

| Feature | Field | Behavior |
|---|---|---|
| Experience Points | `xp` | Awarded on quiz completion, course progress, logins |
| Daily Streaks | `streak` + `lastActiveDate` | Consecutive day login tracking |
| Badges | `badges: String[]` | Milestone badge identifiers |
| Achievements | `achievements[]` | `{ title, description, unlockedAt }` unlockable events |

---

## 10. Notification & Messaging System

- **In-app Notifications**: `Notification` model — type, read state, user-linked
- **Messages**: `Message` model (3.3KB schema) — threaded conversations between students and teachers
- **Email**: Nodemailer — OTP delivery, assignment reminders, certificate issuance

---

## 11. AI Integration

- **Route**: `/api/ai` and `/api/ai/chat`
- **Frontend**: `AIAssistant.jsx` (20KB component) — chat interface with streaming support
- **Model**: `AIChat.js` — stores conversation history per user
- **Use cases**: Course Q&A, quiz hint generation, learning path recommendations, analytics summaries

---

## 12. Security Architecture

| Concern | Implementation |
|---|---|
| Password hashing | bcryptjs |
| Auth tokens | JWT (short-lived access + long-lived refresh) |
| Input sanitization | xss-clean, mongo-sanitize |
| Rate limiting | express-rate-limit on auth routes |
| HTTP headers | Helmet (removes `X-Powered-By`, sets security headers) |
| CORS | Strict allowlist (localhost + configured origin) |
| Audit trail | `SecurityLog` model — auth events per user |

---

## 13. Layouts & Navigation

- **`DashboardLayout`**: Shared sidebar + header shell for all three role portals
- **`PublicLayout`**: Minimal wrapper for `/login`
- **`RoleGuard`**: HOC that validates `user.role` against allowed roles, redirects on mismatch
- **`PageLoader`**: Suspense fallback during lazy chunk loading
- Navigation config driven by `routesConfig.js`

---

## 14. Services Layer (Frontend)

All API calls are abstracted into `/src/services/`:

| Service File | Covers |
|---|---|
| `adminAnalyticsService` | Admin analytics API calls |
| Course, Quiz, Assignment services | CRUD + student-facing APIs |
| Auth service | Login, register, token refresh |
| Message, Notes, Schedule services | Shared feature APIs |

---

## 15. Known Configuration

| Config | Value |
|---|---|
| Backend Port | `.env → PORT` |
| MongoDB | `.env → MONGO_URI` |
| CORS Origin | `.env → CORS_ORIGIN` + `localhost:5173` always allowed |
| JSON body limit | `.env → JSON_LIMIT` |
| Frontend Dev URL | `http://localhost:5173` |
| API Base | `http://localhost:<PORT>/api` |

---

## 16. Open Items / Future Scope

- [ ] Super Admin role not consistently enforced in frontend routes (currently mapped to `ROLES.SUPER_ADMIN` but admin pages are still minimal)
- [ ] Payment gateway integration (Razorpay/Stripe) — `Payment` + `Invoice` + `Subscription` models exist but gateway not wired
- [ ] Video hosting / CDN integration for `CoursePlayer`
- [ ] Mobile-responsive audit across all pages
- [ ] Push notification support (currently email + in-app only)
- [ ] End-to-end test suite (Supertest scaffolded, Jest configured)
- [ ] Deployment pipeline (CI/CD, containerization)
- [ ] `superadmin` page section (`/src/pages/superadmin`) — directory exists but routes not yet registered

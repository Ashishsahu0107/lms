# 🎓 Product Requirements Document (PRD) — LMS Pro Platform
**Version:** 2.0.0 | **Author:** Antigravity AI | **Status:** Approved for Implementation

---

## 1. Executive Summary & Project Goals

**LMS Pro** is an enterprise-grade, full-stack Learning Management System (LMS) designed for educational institutions, corporate academies, and online bootcamps. The system coordinates interaction between **Students**, **Teachers**, and **Super Administrators** across mobile and desktop devices.

### 1.1 Strategic Objectives
* **Optimal Speed**: Deliver load times under 2 seconds (FCP/LCP) using modular frontend code-splitting, esbuild minification, and dynamic backend payload compression (Gzip).
* **Engaged Learning**: Maximize student retention through gamification mechanics, including experience points (XP), daily learning streaks, milestones, badges, and ranking leaderboards.
* **Interactive AI Support**: Provide an integrated, real-time ChatGPT-style concept tutor with conversation threading and instant explanations.
* **Streamlined Course Management**: Enable instructors to build complete courses (modules, topics, video players, resources) and assessments (quizzes, assignments).
* **Unified Telemetry**: Equip administrators with a real-time command cockpit displaying signups, revenue, engagement metrics, and server load.

---

## 2. User Persona & Access Control Matrix

The system enforces strict role-based access control (RBAC) via the frontend route guards (`RoleGuard`) and backend token verify middleware (`auth.js`).

| User Role | Dashboard Route | Authorized Capabilities |
| :--- | :--- | :--- |
| **Student** | `/student/dashboard` | View course list, enroll in courses, play video lectures, submit assignments, take quizzes, view badges/XP, track streaks, message teachers, download certificates. |
| **Teacher** | `/teacher/dashboard` | Build courses, create modules/topics, define assignment details/deadlines, construct quizzes, grade student submissions, track attendance, view instructor earnings. |
| **Super Admin** | `/admin/dashboard` | Manage users (create/suspend/delete), audit security logs, monitor revenue analytics, issue/revoke certificates, trigger system backups. |

---

## 3. Detailed Functional Requirements (Epics)

### Epic 1: Authentication & Identity Management
* **Glassmorphic Modals**: Sign In and Registration open as beautiful modal overlays (`?auth=login`, `?auth=register`) on top of the landing page, preserving deep-linking address bars.
* **Password Strengths**: Real-time strength estimation meters (Weak, Medium, Strong) on form entries.
* **3-Step OTP Password Recovery**:
  1. `POST /api/auth/forgot-password`: Generates 6-digit OTP code, sets a 5-minute expiry, and emails code.
  2. `POST /api/auth/verify-reset-otp`: Confirms OTP matching and validity.
  3. `POST /api/auth/reset-password`: Hashes new password, resets security codes, and signs user out of old sessions.
* **Local Development Fallback**: Logs OTP values to the server terminal console if SMTP credentials are not configured, enabling instant manual testing.

### Epic 2: Course & Video Player Delivery
* **Course Catalog**: Filterable grid displaying cards with category, ratings, difficulty, and enroll status.
* **Video Lecture Player**: Nested sidebar navigation linking modules and topics. Automatically tracks lecture completion milestones.
* **Dynamic Student Notes**: Dedicated study drawer where students can save rich-text study notes linked to specific timestamps of the lecture video.

### Epic 3: Assessments & Grading Engine
* **Quiz Engine**: Practice, Homework, and Exam configurations. Includes customizable time limits, randomized shuffling, and passing markers.
* **Assignment Submissions**: File uploads (`multer` wrapper) for homework submissions, showing deadline countdowns and feedback logs.
* **Instructor Gradebook**: Panel for teachers to download submissions, input grades/marks, and add reviews.

### Epic 4: Real-Time AI Study Tutor (ChatGPT-Style)
* **Real-time Streaming**: Powered by Socket.io, streams concept explanations and code completions word-by-word (`ai-word` event) to simulate responsive typing.
* **Thread History**: Thread sidebar loggers, thread search bars, and delete hooks.
* **Auto-Naming Threads**: Automatically generates conversation titles based on the first few words of the initial prompt.

### Epic 5: Gamification Engine
* **XP System**: Awards points on lesson completion, quiz submissions, and consecutive daily check-ins.
* **Streak Tracker**: Tracks login patterns (`streak` counter & `lastActiveDate`). Rings glowing badges if student logs in daily.
* **Achievements**: Milestone unlocking system granting digital badges (e.g., "30-Day Learner", "Quiz Champion").

---

## 4. Technical Architecture & Stack

### 4.1 Technology Blueprint
* **Client Framework**: React 19 (compiled via Vite 8)
* **API Framework**: Node.js & Express.js (ESM Module import system)
* **Database Layer**: MongoDB (Mongoose 8 ODM)
* **Real-time Pipeline**: Socket.io (HTTP + WebSocket co-binding)
* **Security Shield**: Helmet, Express Rate Limit, XSS Clean, NoSQL Sanitizer
* **Payload Compressors**: Express compression (Gzip) and Vite esbuild minifier

### 4.2 Database Indexing Schema Strategies
To keep data retrieval at O(1) complexity under scale, the following schemas are indexed:
1. **`User.js`**: `email` (Unique Index), `role` (Standard Index), `xp` (Standard Index).
2. **`Enrollment.js`**: Compound Index `{ studentId: 1, courseId: 1 }, { unique: true }` and independent index on `courseId: 1`.
3. **`StudentProgress.js`**: Compound Index `{ studentId: 1, courseId: 1 }, { unique: true }` and independent index on `courseId: 1`.

---

## 5. Main API Routing Matrix

All REST paths are mounted under `/api` and secured via Bearer Token header guards.

| Context | Method | Path | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/auth/register` | Registers user and sends email OTP |
| **Auth** | POST | `/api/auth/login` | Returns user envelope and JWT token |
| **Auth** | POST | `/api/auth/forgot-password` | Initiates OTP recovery email |
| **Courses** | GET | `/api/courses` | Lists all published courses |
| **Courses** | POST | `/api/courses` | Create new course (Teacher only) |
| **Analytics**| GET | `/api/admin/analytics/performance` | Fetches leaderboard ranking stats (Bypasses Admin Guard for Students) |
| **AI Chat** | POST | `/api/ai/chats` | Instantiates new conversation thread |

---

## 6. Real-Time Socket Connection Matrix

The Socket.io pipeline manages connections via authentication handshakes.

### 6.1 Server Listening Handlers
* `send-ai-message`: Accepts prompt, triggers AI streaming completions, and saves threads.
* `typing` / `stop-typing`: Broadcasts typing animations to specific channel listeners.

### 6.2 Client Subscription Handlers
* `ai-word`: Appends streaming words to UI component message grids.
* `ai-message-complete`: Finalizes state blocks and stops loading animation spinners.
* `user-online` / `user-offline`: Updates active user states across class messaging pools.

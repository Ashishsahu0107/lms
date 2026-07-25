# 🎓 LMS Pro — Master Product Requirements Document (PRD)
**Version:** 2.0.0 | **Status:** Production-Ready & Optimized | **Last Updated:** July 2026

---

## 1. Product Overview

**LMS Pro** is an enterprise-grade, full-stack Learning Management System designed to deliver a high-speed learning experience for educational institutions and online academies. The platform features three distinct user portals — Student, Teacher, and Super Admin — coordinated via a real-time WebSocket communication layer.

### 1.1 Core Goals
* **High Performance**: Optimizes initial page loads (LCP/FCP) through modular code-splitting and asset Gzip compression.
* **Real-Time Telemetry**: Real-time classrooms, dashboard notifications, messaging, and activity updates driven by Socket.io.
* **AI Study Companion**: Streaming ChatGPT-style chat workspace providing conceptual tutoring.
* **Role-Based Access**: Specialized dashboards that guard access endpoints based on user credentials.

---

## 2. Tech Stack

### 2.1 Frontend Client
* **Framework**: React 19 (Vite 8)
* **Routing**: React Router v7 (lazy-loaded routes)
* **Animations**: Framer Motion
* **Telemetry Charts**: Recharts
* **Icons**: Lucide React
* **Real-time Sockets**: Socket.io-client
* **API Connector**: Axios (services layer)
* **CSS System**: Tailwind CSS + FlyonUI (theme-aware design tokens)

### 2.2 Backend API Server
* **Runtime**: Node.js (ESM modules)
* **Web Framework**: Express 4
* **Database**: MongoDB (via Mongoose 8)
* **Authentication**: JWT (access & refresh tokens) + Bcryptjs
* **Real-Time Server**: Socket.io 4
* **Emails / Verification**: Nodemailer (OTP distribution)
* **Security Middleware**: Helmet, CORS, Express Rate Limit, XSS Clean, Mongo Sanitize
* **Network Speed**: Dynamic Gzip Response Compression

---

## 3. User Personas & Roles

| Persona | Route Prefix | Description |
| :--- | :--- | :--- |
| **Student** | `/student/*` | Learner: enrolls in courses, plays video lectures, attempts quizzes, submits assignments, earns XP, tracks streaks, and downloads certifications. |
| **Teacher** | `/teacher/*` | Instructor: designs courses, manages assignments/quizzes, marks attendances, grades submissions, and tracks earnings. |
| **Super Admin** | `/admin/*` | Platform Owner: manages all users, views global analytics dashboards, handles billing, issues certificates, and triggers database backups. |

---

## 4. Authentication & Security Architecture

### 4.1 Security Specs
* **Secure Token Handshakes**: JWT-based access/refresh token pairs with secure rotation.
* **Security Headers**: Helmet integration to prune signatures (`X-Powered-By`) and set clickjacking headers.
* **Dynamic CORS Subnets**: Development CORS dynamic filter allowing private IPs (`192.168.x.x`, etc.) on HTTP and WebSockets for local mobile logins.
* **Password Strengths**: Real-time strength estimation meters (Weak, Medium, Strong) on form entries.
* **3-Step OTP Password Recovery**:
  1. `POST /api/auth/forgot-password`: Generates 6-digit OTP code, sets a 5-minute expiry, and emails code.
  2. `POST /api/auth/verify-reset-otp`: Confirms OTP matching and validity.
  3. `POST /api/auth/reset-password`: Hashes new password, resets security codes, and signs user out of old sessions.

---

## 5. Mongoose Data Models & Database Indexes

To prevent collection-wide scans, critical models are optimized with indexing fields:

* **User (`User.js`)**: Includes `xp`, `streak`, `badges`, unique `email` index, and `role` index.
* **Course (`Course.js`)**: Title text-indexed, modules references, ratings arrays with pre-save rating calculations.
* **Enrollment (`Enrollment.js`)**: Indexes on `studentId`, `courseId`, and compound index `{ studentId: 1, courseId: 1 }, { unique: true }`.
* **StudentProgress (`StudentProgress.js`)**: Tracks lecture progress completions. Compound index `{ studentId: 1, courseId: 1 }, { unique: true }` and `{ courseId: 1 }`.
* **AIChat (`AIChat.js`)**: Thread mappings (`user`, messages array with `sender`, `content`, `timestamp`).

---

## 6. Real-Time WebSocket System

Built on **Socket.io 4**, driving real-time notifications, presence tracking, and chatbot streams.

### 6.1 Stream Events
* **`ai-typing` / `ai-stop-typing`**: Triggers loading indicators.
* **`ai-word`**: Emits generated concept explanations word-by-word.
* **`ai-message-complete`**: Saves conversation history to the database.
* **`user-online` / `user-offline`**: Broadcasts online presence changes.

---

## 7. Performance Optimizations

### 7.1 Frontend Build Optimizations
* **Modular Code-Splitting**: Code-splits node modules into separate cacheable chunks: `vendor-react` (React suite), `vendor-icons` (Lucide-react), `vendor-charts` (Recharts), `vendor-motion` (Framer motion), and `vendor-base` (auxiliary dependencies).
* **Esbuild CSS Minifier**: Bypasses LightningCSS parser crashes on FlyonUI selectors. Frontend builds complete in **2.07 seconds**.

### 7.2 Backend Network Speedups
* **Gzip Payload Compression**: Dynamic response compression via `compression` middleware, shrinking network payload sizes by **70% to 80%** over the wire.

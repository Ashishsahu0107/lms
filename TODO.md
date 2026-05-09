# TODO - Admin Dashboard Professional Upgrade

- [x] Inspect current `frontend/src/pages/AdminDashboard.jsx` UI structure and identify styling gaps
- [x] Update `AdminDashboard.jsx`:
  - [x] Add professional header + subtitle
  - [x] Add KPI cards (Users count, Courses count)
  - [x] Upgrade tab UI (pill buttons + active styles)
  - [x] Improve section/card styling consistency (rounded, shadow, ring)
  - [x] Add empty/loading states
  - [x] Unify button styles and form spacing

- [ ] Run frontend dev build/run and manually verify `/admin/dashboard`
- [ ] Ensure responsiveness on md/sm breakpoints

# Product Requirements Document (PRD)

# Smart Learning Management System (LMS)

## 1. Project Overview

### Product Name

Smart Learning Management System (LMS)

### Product Type

Web-based MERN Stack Learning Platform

### Objective

The objective of this project is to create a modern Learning Management System where students can access courses, attend quizzes, submit assignments, track attendance, and view leaderboards, while admins can manage courses, lessons, quizzes, and student activities.

The platform is designed to simplify online learning and academic management through a clean dashboard-based interface.

---

# 2. Problem Statement

Traditional learning systems are often:

* Difficult to manage
* Not centralized
* Lack student progress tracking
* Have poor admin controls
* Do not provide analytics or engagement tools

This project solves these problems by providing:

* Role-based dashboards
* Course management
* Assignment & quiz systems
* Attendance tracking
* Student performance monitoring
* Centralized academic operations

---

# 3. Goals & Objectives

## Primary Goals

* Build a secure LMS platform
* Create separate Student and Admin dashboards
* Provide real-time academic management
* Improve learning accessibility
* Enable performance tracking

## Secondary Goals

* Responsive UI
* Clean UX
* Modular architecture
* Scalable backend
* API-based system

---

# 4. Target Users

## Students

Students can:

* Login/Register
* View enrolled courses
* Access lessons
* Attempt quizzes
* Submit assignments
* Track attendance
* View leaderboard
* Update profile

## Admins

Admins can:

* Manage courses
* Add lessons
* Manage quizzes
* Create assignments
* View analytics
* Monitor students
* Assign courses

---

# 5. Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* React Router DOM
* Axios
* React Hot Toast

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

## Additional Tools

* LocalStorage Authentication
* Axios Interceptors
* Role-Based Routing

---

# 6. System Architecture

## Frontend Structure

### Components

* Sidebar
* Navbar
* Layout
* Loader
* Cards
* Charts
* Protected Routes

### Pages

#### Student Pages

* Dashboard
* Courses
* Course Details
* Assignments
* Quiz
* Attendance
* Leaderboard
* Profile
* Support

#### Admin Pages

* Admin Dashboard
* Manage Courses
* Manage Lessons
* Add Lesson
* Quiz Panel

---

# 7. Backend Structure

## Models

* User
* Course
* Assignment
* Quiz
* Attendance
* Attempt
* Submission
* Doubt

## Routes

* authRoutes
* courseRoutes
* assignmentRoutes
* attendanceRoutes
* quizRoutes
* analyticsRoutes
* dashboardRoutes
* submissionRoutes

## Middleware

* Authentication Middleware
* Role Validation Middleware

---

# 8. Core Features

## Authentication System

### Features

* Login
* Registration
* JWT Authentication
* Role-Based Access
* Protected Routes

### Roles

* Student
* Admin

---

## Student Dashboard

### Features

* View enrolled courses
* Progress overview
* Attendance status
* Quiz access
* Assignment tracking
* Leaderboard ranking

---

## Course Management

### Features

* Course enrollment
* Course details
* Lesson management
* Instructor information

---

## Assignment Module

### Student Features

* View assignments
* Submit assignments
* Track deadlines

### Admin Features

* Create assignments
* Assign to courses
* Monitor submissions

---

## Quiz Module

### Features

* Attempt quizzes
* Track scores
* Quiz panel for admin
* Student performance records

---

## Attendance System

### Features

* Track student attendance
* Attendance analytics
* Attendance reports

---

## Leaderboard

### Features

* Student rankings
* Performance comparison
* Engagement motivation

---

# 9. Routing Architecture

## Public Routes

* /
* /register

## Student Routes

* /dashboard
* /courses
* /courses/:id
* /assignments
* /quiz
* /attendance
* /leaderboard
* /profile

## Admin Routes

* /admin/dashboard
* /admin/courses
* /admin/lessons
* /admin/add-lesson
* /admin/quiz

---

# 10. Security Features

## Authentication

* JWT Token Validation
* Route Protection
* Role Authorization

## API Security

* Axios Token Interceptors
* Unauthorized Access Handling

---

# 11. UI/UX Requirements

## Design Requirements

* Responsive Design
* Sidebar Navigation
* Dashboard Layout
* Dark Mode Support
* Clean User Interface

## Accessibility

* Mobile-friendly layout
* Easy navigation
* Fast loading pages

---

# 12. Future Enhancements

## Planned Features

* AI Chatbot
* Real-time Notifications
* Video Lectures
* Payment Integration
* Certificates
* Live Classes
* Chat System
* Discussion Forum
* Admin Analytics Dashboard
* Cloud File Uploads
* Redux/Auth Context
* Email Notifications

---

# 13. API Flow

## Authentication APIs

* POST /api/auth/login
* POST /api/auth/register
* GET /api/auth/users

## Course APIs

* GET /api/courses
* POST /api/courses/enroll

## Assignment APIs

* POST /api/assignments
* GET /api/assignments

## Quiz APIs

* GET /api/quiz
* POST /api/quiz/submit

---

# 14. Database Overview

## Collections

* users
* courses
* assignments
* quizzes
* attendance
* submissions
* attempts
* doubts

---

# 15. Success Metrics

## Technical Metrics

* Secure authentication
* Fast API response
* Responsive UI
* Modular architecture

## User Metrics

* Student engagement
* Quiz participation
* Assignment completion
* Course activity

---

# 16. Conclusion

The Smart LMS Platform is a full-stack MERN application designed to modernize academic management and online learning. The system provides secure authentication, role-based dashboards, course management, quizzes, assignments, attendance tracking, and performance monitoring.

The platform follows scalable architecture principles and can be expanded with advanced features like AI assistance, analytics, live classes, and cloud integration in future versions.



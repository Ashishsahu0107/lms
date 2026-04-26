# 🎓 Student Learning & Progress Platform

## 📌 Project Overview

A full-stack web application designed for students to track their learning progress, manage courses, assignments, quizzes, attendance, and get learning support.

---

## 👨‍💻 Team Members

* Name 1 – Frontend Developer
* Name 2 – Backend Developer
* Name 3 – Database / API Integration
* Name 4 – UI/UX & Testing

---

## ❗ Problem Statement

Students lack a centralized platform to track learning progress, assignments, quizzes, and performance. This platform solves that by providing a unified dashboard.

---

## 🚀 Features

* 🔐 Authentication (JWT आधारित login)
* 📊 Dashboard (Real-time stats)
* 📚 Courses Module (Progress tracking)
* 📝 Assignment Submission
* 🧠 Quiz System
* 📅 Attendance Tracking
* 💬 Doubt Support System
* 🏆 Leaderboard & Activity Chart

---

## 🛠 Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB

---

## ⚙️ Installation Steps

### 1. Clone Repo

```bash
git clone https://github.com/your-repo-link
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Setup

```bash
cd backend
npm install
node server.js
```

---

## 🔗 API Endpoints

| Method | Endpoint                       | Description       |
| ------ | ------------------------------ | ----------------- |
| POST   | /api/auth/login                | Login             |
| GET    | /api/courses                   | Get Courses       |
| PUT    | /api/courses/:id/complete      | Complete Course   |
| GET    | /api/assignments               | Get Assignments   |
| POST   | /api/assignments/:id/submit    | Submit Assignment |
| POST   | /api/quiz/:id/submit           | Submit Quiz       |
| GET    | /api/dashboard/stats           | Dashboard Data    |
| GET    | /api/attendance/:id/percentage | Attendance        |

---

## 📸 Screenshots

(Add screenshots here)

---

## 🔮 Future Improvements

* AI-based recommendations
* Live classes integration
* Notification system
* Admin panel

---

## 🌐 Deployment

* Frontend: Vercel
* Backend: Render

---

## 📌 Conclusion

This project demonstrates full-stack development with real-time data handling, authentication, and modular architecture.

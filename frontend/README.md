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

---

# Frontend Architecture

## Folder Structure
```
src/
├── assets/               # Static assets (e.g., images, icons, fonts)
├── components/           # Reusable UI components
│   ├── Sidebar/          # Sidebar component for navigation
│   ├── Navbar/           # Navbar component
│   ├── Cards/            # Card components for displaying data
│   ├── Tables/           # Table components for data display
│   └── ...
├── layouts/              # Layout components for different roles
│   ├── SuperAdminLayout.jsx
│   ├── TeacherLayout.jsx
│   ├── StudentLayout.jsx
│   └── AuthLayout.jsx    # Layout for authentication pages
├── pages/                # Pages for each route
│   ├── Dashboard/        # Dashboard pages for each role
│   │   ├── SuperAdminDashboard.jsx
│   │   ├── TeacherDashboard.jsx
│   │   ├── StudentDashboard.jsx
│   │   └── ...
│   ├── Auth/             # Authentication pages
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ForgotPassword.jsx
│   └── ...
├── routes/               # Route definitions
│   ├── ProtectedRoute.jsx
│   ├── RoleProtectedRoute.jsx
│   └── AppRoutes.jsx     # Centralized route configuration
├── context/              # Context API for global state management
│   ├── AuthContext.jsx   # Authentication context
│   └── ...
├── hooks/                # Custom React hooks
│   ├── useAuth.js        # Hook for authentication logic
│   ├── useRole.js        # Hook for role-based logic
│   └── ...
├── services/             # API service layer
│   ├── api.js            # Axios instance and API calls
│   ├── authService.js    # Authentication-related API calls
│   ├── userService.js    # User-related API calls
│   └── ...
├── redux/                # Redux store and slices (if using Redux)
│   ├── store.js          # Redux store configuration
│   ├── authSlice.js      # Authentication slice
│   ├── userSlice.js      # User slice
│   └── ...
├── utils/                # Utility functions
│   ├── formatDate.js     # Date formatting utility
│   ├── validateInput.js  # Input validation utility
│   └── ...
├── constants/            # Application-wide constants
│   ├── roles.js          # Role definitions
│   ├── apiEndpoints.js   # API endpoint constants
│   └── ...
├── styles/               # Global and reusable styles
│   ├── tailwind.css      # Tailwind CSS imports
│   ├── variables.css     # CSS variables
│   └── ...
├── main.jsx              # Entry point for the React application
└── index.css             # Global CSS
```

## Purpose of Each Folder

### `assets/`
- Contains static assets like images, icons, and fonts.

### `components/`
- Houses reusable UI components such as buttons, modals, tables, and cards.
- Promotes reusability and consistency across the application.

### `layouts/`
- Contains layout components for different roles (e.g., Super Admin, Teacher, Student).
- Each layout includes role-specific navigation (e.g., Sidebar, Navbar).

### `pages/`
- Contains page components for each route.
- Organized by feature or role (e.g., Dashboard, Auth).

### `routes/`
- Defines the routing architecture.
- Includes `ProtectedRoute` for authentication and `RoleProtectedRoute` for role-based access control.

### `context/`
- Manages global state using React Context API.
- Includes contexts for authentication, user data, etc.

### `hooks/`
- Contains custom React hooks for reusable logic.
- Examples: `useAuth` for authentication, `useRole` for role-based logic.

### `services/`
- Implements the API service layer using Axios.
- Centralizes API calls for better maintainability.

### `redux/`
- Manages global state using Redux (if required).
- Includes slices for authentication, user data, etc.

### `utils/`
- Contains utility functions for common tasks like date formatting and input validation.

### `constants/`
- Stores application-wide constants such as roles and API endpoints.

### `styles/`
- Contains global and reusable styles.
- Includes Tailwind CSS configuration and custom CSS variables.

### `main.jsx`
- Entry point for the React application.
- Renders the root component and sets up the application.

## Role-Based Routing

### How It Works
1. **Authentication Check**:
   - `ProtectedRoute` ensures the user is authenticated before accessing protected routes.
2. **Role-Based Access**:
   - `RoleProtectedRoute` checks the user's role and grants access to role-specific routes.
   - Example: Only Super Admin can access `/admin` routes.

### Example Code
```javascript
// RoleProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default RoleProtectedRoute;
```

## Best Practices
- **Component Reusability**: Create reusable components to avoid duplication.
- **Lazy Loading**: Use React's `lazy` and `Suspense` for code splitting and improving performance.
- **Centralized API Layer**: Keep all API calls in the `services/` folder for better maintainability.
- **Role-Based Access Control**: Implement role-based routing to ensure secure access.
- **Responsive Design**: Use Tailwind CSS to create a mobile-first, responsive UI.
- **Consistent State Management**: Use Context API or Redux for predictable state management.
- **Error Handling**: Handle errors gracefully in the UI and log them for debugging.

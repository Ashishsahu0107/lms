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
frontend/src/
├── App.jsx                    # Main App component
├── main.jsx                   # Entry point
├── index.css                  # Global styles (Tailwind)
│
├── app/                       # Core app configuration
│   ├── index.jsx              # App root component
│   ├── AppProvider.jsx        # Global providers (Auth, Theme)
│   ├── router.jsx             # React Router configuration
│   ├── store.js               # App state store
│   └── providers/
│       └── AppProviders.jsx
│
├── components/                # Reusable components
│   ├── charts/                # Chart components
│   ├── common/                # Common components
│   ├── dashboard/             # Dashboard-specific components
│   │   ├── DashboardSection.jsx
│   │   ├── RoleTopbar.jsx
│   │   └── SidebarShell.jsx
│   ├── forms/                 # Form components
│   ├── layout/                # Layout components
│   │   ├── DashboardLayout.jsx
│   │   ├── Navbar.jsx
│   │   └── Sidebar.jsx
│   ├── routeGuard/            # Route protection
│   │   └── RoleGuard.jsx      # Role-based access control
│   ├── tables/                # Table components
│   └── ui/                    # UI component library
│       ├── Avatar.jsx, Badge.jsx, Button.jsx
│       ├── Card.jsx, Checkbox.jsx, DropdownMenu.jsx
│       ├── EmptyState.jsx, Input.jsx, Modal.jsx
│       ├── ProgressBar.jsx, SearchBar.jsx, Select.jsx
│       ├── Spinner.jsx, StatCard.jsx, Table.jsx
│       ├── Tabs.jsx, UserCard.jsx
│       └── index.js
│
├── constants/                 # Application constants
│   ├── app.js
│   ├── roles.js              # super_admin, teacher, student
│   └── routes.js
│
├── context/                   # React Context providers
│   ├── AuthContext.jsx        # Authentication state
│   └── ThemeContext.jsx       # Theme state
│
├── hooks/                     # Custom React hooks
│   ├── useApi.js
│   ├── useAuth.js
│   └── useRole.js
│
├── layouts/                   # Page layouts
│   ├── DashboardLayout.jsx
│   ├── PublicLayout.jsx       # Login/register layouts
│   ├── RoleGuardLayout.jsx
│   ├── StudentLayout.jsx
│   ├── SuperAdminLayout.jsx
│   └── TeacherLayout.jsx
│
├── lib/
│   └── env.js                 # Environment variables
│
├── pages/                     # Page components
│   ├── auth/
│   │   └── LoginPage.jsx
│   ├── admin/
│   │   ├── dashboard/AdminDashboard.jsx
│   │   └── users/UserManagement.jsx
│   ├── student/
│   │   ├── assignments/Assignments.jsx
│   │   ├── certificates/Certificates.jsx
│   │   ├── courses/          # CourseDetails, CoursePlayer, MyCourses
│   │   ├── dashboard/Dashboard.jsx
│   │   ├── messages/Messages.jsx
│   │   ├── profile/Profile.jsx
│   │   ├── quiz/Quiz.jsx
│   │   └── settings/Settings.jsx
│   ├── superadmin/            # Full admin panel pages
│   │   ├── analytics/
│   │   ├── courses/
│   │   ├── dashboard/
│   │   ├── notifications/
│   │   ├── payments/
│   │   ├── reports/
│   │   ├── security/
│   │   ├── settings/
│   │   ├── students/
│   │   └── teachers/
│   └── teacher/
│       ├── courses/CourseManagement.jsx
│       └── dashboard/TeacherDashboard.jsx
│
├── redux/
│   └── store.js
│
├── routes/                     # Route configurations
│   ├── index.js                # Router definitions
│   ├── routesConfig.js
│   ├── StudentRoutes.jsx
│   ├── SuperAdminRoutes.jsx
│   └── TeacherRoutes.jsx
│
├── screens/
│   └── RootScreen.jsx
│
├── services/                   # API services
│   ├── adminService.js
│   ├── apiClient.js
│   ├── authService.js
│   ├── lmsApiClient.js
│   ├── studentService.js
│   ├── teacherService.js
│   └── userService.js
│
├── shared/                     # Shared/legacy components
│   ├── LegacyApp.jsx
│   └── LegacyAppImpl.jsx
│
├── styles/
│   └── tokens.css              # Design tokens
│
└── utils/                      # Utility functions
    ├── cn.js
    ├── format.js
    └── slugify.js
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

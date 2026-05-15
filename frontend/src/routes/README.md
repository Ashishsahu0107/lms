# Role-Based Routing Architecture

## Folder Structure
```
src/
├── routes/               # Route definitions
│   ├── AppRoutes.jsx     # Centralized route configuration
│   ├── ProtectedRoute.jsx # Authentication guard for protected routes
│   ├── RoleRoute.jsx     # Role-based route guard
│   └── ...
├── layouts/              # Layout components for different roles
│   ├── SuperAdminLayout.jsx
│   ├── TeacherLayout.jsx
│   ├── StudentLayout.jsx
│   └── AuthLayout.jsx    # Layout for authentication pages
├── pages/                # Pages for each route
│   ├── SuperAdminDashboard/
│   ├── TeacherDashboard/
│   ├── StudentDashboard/
│   └── Auth/
```

## App.jsx Routing
```javascript
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout';
import AuthLayout from './layouts/AuthLayout';

// Lazy-loaded pages
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard/Dashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard/Dashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard/Dashboard'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Authentication Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Super Admin Routes */}
          <Route
            path="/superadmin/*"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["SuperAdmin"]}>
                  <SuperAdminLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<SuperAdminDashboard />} />
          </Route>

          {/* Teacher Routes */}
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["Teacher"]}>
                  <TeacherLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<TeacherDashboard />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["Student"]}>
                  <StudentLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
          </Route>

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
```

## ProtectedRoute.jsx
```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

## RoleRoute.jsx
```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;
```

## Dashboard Route Setup
- **Super Admin**: `/superadmin/dashboard`
- **Teacher**: `/teacher/dashboard`
- **Student**: `/student/dashboard`

## Navigation Flow
1. **Authentication Check**:
   - `ProtectedRoute` ensures the user is authenticated.
2. **Role-Based Access**:
   - `RoleRoute` checks the user's role and grants access to role-specific routes.
3. **Nested Layouts**:
   - Each role has its own layout (e.g., `SuperAdminLayout`, `TeacherLayout`, `StudentLayout`).

## Redirect Logic
- Unauthenticated users are redirected to `/login`.
- Unauthorized users are redirected to `/unauthorized`.
- Unknown routes are redirected to `/login`.

## Authentication Checks
- Use `useAuth` hook to manage authentication state.
- Example:
```javascript
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate authentication check
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setUser(JSON.parse(localStorage.getItem('user')));
    }
  }, []);

  return { isAuthenticated, user };
};
```
backend/
├── config/                # Configuration files (e.g., environment variables, database, rate limiting)
│   ├── db.js
│   ├── rateLimiter.js
│   └── ...
├── controllers/          # Controllers for handling requests
├── middleware/           # Middleware for authentication, error handling, etc.
├── models/               # Mongoose models
├── routes/               # API routes
├── services/             # Business logic and reusable services
├── utils/                # Utility functions
├── validators/           # Request validation logic
├── logs/                 # Logging system
├── tests/                # Unit and integration tests
├── scripts/              # Deployment and database scripts
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose for multi-container setup
├── server.js             # Entry point for the backend
└── package.json          # Dependencies and scriptsfrontend/
├── public/               # Static assets
├── src/                  # Source code
│   ├── assets/           # Static assets (e.g., images, icons)
│   ├── components/       # Reusable components
│   ├── layouts/          # Layout components
│   ├── pages/            # Pages for each route
│   ├── routes/           # Route definitions
│   ├── services/         # API abstraction layer
│   ├── utils/            # Utility functions
│   ├── constants/        # Application-wide constants
│   ├── hooks/            # Custom React hooks
│   ├── context/          # Context API for global state management
│   ├── styles/           # Global and reusable styles
│   ├── App.jsx           # Main App component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global CSS
├── Dockerfile            # Docker configuration
├── vite.config.js        # Vite configuration for production
└── package.json          # Dependencies and scripts# Teacher Dashboard Architecture

## Folder Structure
```
src/
├── pages/
│   ├── TeacherDashboard/  # Teacher Dashboard Pages
│   │   ├── Dashboard.jsx     # Main dashboard page
│   │   ├── MyCourses.jsx     # Course management page
│   │   ├── Students.jsx      # Student progress tracking page
│   │   ├── Assignments.jsx   # Assignment management page
│   │   ├── Quizzes.jsx       # Quiz management page
│   │   ├── Attendance.jsx    # Attendance management page
│   │   ├── Analytics.jsx     # Analytics and reports page
│   │   ├── Messages.jsx      # Messages and notifications page
│   │   ├── Profile.jsx       # Teacher profile page
│   │   └── ...
├── components/
│   ├── Sidebar/              # Sidebar navigation
│   │   ├── Sidebar.jsx       # Sidebar component
│   │   └── SidebarItem.jsx   # Individual sidebar item
│   ├── Topbar/               # Topbar navigation
│   │   ├── Topbar.jsx        # Topbar component
│   │   └── NotificationBell.jsx # Notification icon
│   ├── Cards/                # Analytics cards
│   │   ├── EarningsCard.jsx  # Earnings analytics card
│   │   ├── CourseStatsCard.jsx # Course statistics card
│   │   └── ...
│   ├── Charts/               # Chart components
│   │   ├── BarChart.jsx      # Bar chart for analytics
│   │   ├── LineChart.jsx     # Line chart for trends
│   │   └── PieChart.jsx      # Pie chart for distribution
│   ├── Tables/               # Table components
│   │   ├── StudentTable.jsx  # Student progress table
│   │   ├── AssignmentTable.jsx # Assignment management table
│   │   └── ...
│   └── ...
├── routes/
│   ├── TeacherRoutes.jsx     # Routes for Teacher pages
├── services/
│   ├── api.js                # Axios instance
│   ├── courseService.js      # API calls for course management
│   ├── assignmentService.js  # API calls for assignment management
│   ├── analyticsService.js   # API calls for analytics
│   └── ...
├── utils/
│   ├── formatDate.js         # Utility for formatting dates
│   ├── calculateEarnings.js  # Utility for earnings calculations
│   └── ...
```

## Component Architecture

### Sidebar
- **Purpose**: Provides navigation for all Teacher pages.
- **Structure**:
  - `Sidebar.jsx`: Main sidebar component.
  - `SidebarItem.jsx`: Reusable component for individual menu items.

### Topbar
- **Purpose**: Displays notifications, user profile, and quick actions.
- **Structure**:
  - `Topbar.jsx`: Main topbar component.
  - `NotificationBell.jsx`: Notification icon with dropdown.

### Dashboard Cards
- **Purpose**: Display key metrics like earnings, course stats, and student progress.
- **Components**:
  - `EarningsCard.jsx`: Shows earnings analytics.
  - `CourseStatsCard.jsx`: Displays course statistics.

### Charts
- **Purpose**: Visualize data trends and analytics.
- **Components**:
  - `BarChart.jsx`: Bar chart for earnings.
  - `LineChart.jsx`: Line chart for student progress.
  - `PieChart.jsx`: Pie chart for course distribution.

### Tables
- **Purpose**: Manage and display data in tabular format.
- **Components**:
  - `StudentTable.jsx`: Table for tracking student progress.
  - `AssignmentTable.jsx`: Table for managing assignments.

## Sidebar Menu
```javascript
const sidebarMenu = [
  { name: 'Dashboard', path: '/teacher/dashboard', icon: 'dashboard-icon' },
  { name: 'My Courses', path: '/teacher/my-courses', icon: 'courses-icon' },
  { name: 'Students', path: '/teacher/students', icon: 'students-icon' },
  { name: 'Assignments', path: '/teacher/assignments', icon: 'assignments-icon' },
  { name: 'Quizzes', path: '/teacher/quizzes', icon: 'quizzes-icon' },
  { name: 'Attendance', path: '/teacher/attendance', icon: 'attendance-icon' },
  { name: 'Analytics', path: '/teacher/analytics', icon: 'analytics-icon' },
  { name: 'Messages', path: '/teacher/messages', icon: 'messages-icon' },
  { name: 'Profile', path: '/teacher/profile', icon: 'profile-icon' },
];
```

## Routing System
```javascript
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/TeacherDashboard/Dashboard';
import MyCourses from '../pages/TeacherDashboard/MyCourses';
import Students from '../pages/TeacherDashboard/Students';
import Assignments from '../pages/TeacherDashboard/Assignments';
import Quizzes from '../pages/TeacherDashboard/Quizzes';
import Attendance from '../pages/TeacherDashboard/Attendance';
import Analytics from '../pages/TeacherDashboard/Analytics';
import Messages from '../pages/TeacherDashboard/Messages';
import Profile from '../pages/TeacherDashboard/Profile';

const TeacherRoutes = () => {
  return (
    <Routes>
      <Route path="/teacher/dashboard" element={<Dashboard />} />
      <Route path="/teacher/my-courses" element={<MyCourses />} />
      <Route path="/teacher/students" element={<Students />} />
      <Route path="/teacher/assignments" element={<Assignments />} />
      <Route path="/teacher/quizzes" element={<Quizzes />} />
      <Route path="/teacher/attendance" element={<Attendance />} />
      <Route path="/teacher/analytics" element={<Analytics />} />
      <Route path="/teacher/messages" element={<Messages />} />
      <Route path="/teacher/profile" element={<Profile />} />
    </Routes>
  );
};

export default TeacherRoutes;
```

## Modern UI Design
- **Tailwind CSS**: Use utility classes for responsive design.
- **Framer Motion**: Add animations for smooth transitions.
- **Recharts**: Integrate charts for analytics.

## Dashboard Cards Example
```javascript
import React from 'react';

const EarningsCard = ({ earnings }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold">Earnings</h3>
      <p className="text-2xl font-bold">${earnings}</p>
    </div>
  );
};

export default EarningsCard;
```

## Charts Section Example
```javascript
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StudentProgressChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="progress" stroke="#4F46E5" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StudentProgressChart;
```

## API Integration Structure
- **Axios Instance**: Centralize API calls in `services/api.js`.
- **Service Files**: Create separate files for each feature (e.g., `courseService.js`, `assignmentService.js`).
- **Error Handling**: Use interceptors for consistent error handling.

### Example API Service
```javascript
import axios from './api';

export const getCourses = async () => {
  const response = await axios.get('/courses');
  return response.data;
};
```
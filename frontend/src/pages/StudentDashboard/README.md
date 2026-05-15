# Student Dashboard Architecture

## Folder Structure
```
src/
├── pages/
│   ├── StudentDashboard/  # Student Dashboard Pages
│   │   ├── Dashboard.jsx     # Main dashboard page
│   │   ├── MyCourses.jsx     # Enrolled courses page
│   │   ├── CourseDetails.jsx # Course details and video learning page
│   │   ├── Assignments.jsx   # Assignment submission page
│   │   ├── Quizzes.jsx       # Quiz system page
│   │   ├── Attendance.jsx    # Attendance tracking page
│   │   ├── Leaderboard.jsx   # Leaderboard page
│   │   ├── Certificates.jsx  # Certificates page
│   │   ├── Profile.jsx       # Profile management page
│   │   └── ...
├── components/
│   ├── Sidebar/              # Sidebar navigation
│   │   ├── Sidebar.jsx       # Sidebar component
│   │   └── SidebarItem.jsx   # Individual sidebar item
│   ├── Topbar/               # Topbar navigation
│   │   ├── Topbar.jsx        # Topbar component
│   │   └── NotificationBell.jsx # Notification icon
│   ├── Cards/                # Dashboard cards
│   │   ├── ProgressCard.jsx  # Course progress card
│   │   ├── LeaderboardCard.jsx # Leaderboard card
│   │   └── ...
│   ├── Charts/               # Chart components
│   │   ├── ProgressChart.jsx # Progress tracking chart
│   │   ├── AttendanceChart.jsx # Attendance chart
│   │   └── ...
│   ├── Tables/               # Table components
│   │   ├── AssignmentTable.jsx # Assignment submission table
│   │   ├── QuizTable.jsx     # Quiz results table
│   │   └── ...
│   └── ...
├── routes/
│   ├── StudentRoutes.jsx     # Routes for Student pages
├── services/
│   ├── api.js                # Axios instance
│   ├── courseService.js      # API calls for course management
│   ├── assignmentService.js  # API calls for assignment submission
│   ├── quizService.js        # API calls for quizzes
│   ├── leaderboardService.js # API calls for leaderboard
│   └── ...
├── utils/
│   ├── formatDate.js         # Utility for formatting dates
│   ├── calculateProgress.js  # Utility for progress calculations
│   └── ...
```

## Component Architecture

### Sidebar
- **Purpose**: Provides navigation for all Student pages.
- **Structure**:
  - `Sidebar.jsx`: Main sidebar component.
  - `SidebarItem.jsx`: Reusable component for individual menu items.

### Topbar
- **Purpose**: Displays notifications, user profile, and quick actions.
- **Structure**:
  - `Topbar.jsx`: Main topbar component.
  - `NotificationBell.jsx`: Notification icon with dropdown.

### Dashboard Cards
- **Purpose**: Display key metrics like course progress, leaderboard rank, and attendance.
- **Components**:
  - `ProgressCard.jsx`: Shows course progress.
  - `LeaderboardCard.jsx`: Displays leaderboard rank.

### Charts
- **Purpose**: Visualize data trends and analytics.
- **Components**:
  - `ProgressChart.jsx`: Chart for tracking course progress.
  - `AttendanceChart.jsx`: Chart for attendance tracking.

### Tables
- **Purpose**: Manage and display data in tabular format.
- **Components**:
  - `AssignmentTable.jsx`: Table for tracking assignment submissions.
  - `QuizTable.jsx`: Table for quiz results.

## Sidebar Menu
```javascript
const sidebarMenu = [
  { name: 'Dashboard', path: '/student/dashboard', icon: 'dashboard-icon' },
  { name: 'My Courses', path: '/student/my-courses', icon: 'courses-icon' },
  { name: 'Assignments', path: '/student/assignments', icon: 'assignments-icon' },
  { name: 'Quizzes', path: '/student/quizzes', icon: 'quizzes-icon' },
  { name: 'Attendance', path: '/student/attendance', icon: 'attendance-icon' },
  { name: 'Leaderboard', path: '/student/leaderboard', icon: 'leaderboard-icon' },
  { name: 'Certificates', path: '/student/certificates', icon: 'certificates-icon' },
  { name: 'Profile', path: '/student/profile', icon: 'profile-icon' },
];
```

## Routing System
```javascript
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/StudentDashboard/Dashboard';
import MyCourses from '../pages/StudentDashboard/MyCourses';
import CourseDetails from '../pages/StudentDashboard/CourseDetails';
import Assignments from '../pages/StudentDashboard/Assignments';
import Quizzes from '../pages/StudentDashboard/Quizzes';
import Attendance from '../pages/StudentDashboard/Attendance';
import Leaderboard from '../pages/StudentDashboard/Leaderboard';
import Certificates from '../pages/StudentDashboard/Certificates';
import Profile from '../pages/StudentDashboard/Profile';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/student/dashboard" element={<Dashboard />} />
      <Route path="/student/my-courses" element={<MyCourses />} />
      <Route path="/student/course-details/:id" element={<CourseDetails />} />
      <Route path="/student/assignments" element={<Assignments />} />
      <Route path="/student/quizzes" element={<Quizzes />} />
      <Route path="/student/attendance" element={<Attendance />} />
      <Route path="/student/leaderboard" element={<Leaderboard />} />
      <Route path="/student/certificates" element={<Certificates />} />
      <Route path="/student/profile" element={<Profile />} />
    </Routes>
  );
};

export default StudentRoutes;
```

## Modern UI Design
- **Tailwind CSS**: Use utility classes for responsive design.
- **Framer Motion**: Add animations for smooth transitions.

## Dashboard Cards Example
```javascript
import React from 'react';

const ProgressCard = ({ progress }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold">Course Progress</h3>
      <p className="text-2xl font-bold">{progress}%</p>
    </div>
  );
};

export default ProgressCard;
```

## Charts Section Example
```javascript
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ProgressChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="progress" stroke="#4F46E5" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;
```

## API Integration Structure
- **Axios Instance**: Centralize API calls in `services/api.js`.
- **Service Files**: Create separate files for each feature (e.g., `courseService.js`, `assignmentService.js`).
- **Error Handling**: Use interceptors for consistent error handling.

### Example API Service
```javascript
import axios from './api';

export const getEnrolledCourses = async () => {
  const response = await axios.get('/student/courses');
  return response.data;
};
```
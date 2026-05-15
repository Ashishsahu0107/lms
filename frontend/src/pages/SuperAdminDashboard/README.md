# Super Admin Dashboard Architecture

## Folder Structure
```
src/
├── pages/
│   ├── SuperAdminDashboard/  # Super Admin Dashboard Pages
│   │   ├── Dashboard.jsx     # Main dashboard page
│   │   ├── Users.jsx         # User management page
│   │   ├── Teachers.jsx      # Teacher management page
│   │   ├── Students.jsx      # Student management page
│   │   ├── Courses.jsx       # Course management page
│   │   ├── Analytics.jsx     # Analytics and reports page
│   │   ├── Reports.jsx       # Detailed reports page
│   │   ├── Settings.jsx      # System settings page
│   │   └── ActivityLogs.jsx  # Activity logs page
├── components/
│   ├── Sidebar/              # Sidebar navigation
│   │   ├── Sidebar.jsx       # Sidebar component
│   │   └── SidebarItem.jsx   # Individual sidebar item
│   ├── Topbar/               # Topbar navigation
│   │   ├── Topbar.jsx        # Topbar component
│   │   └── NotificationBell.jsx # Notification icon
│   ├── Cards/                # Analytics cards
│   │   ├── RevenueCard.jsx   # Revenue analytics card
│   │   ├── UserStatsCard.jsx # User statistics card
│   │   └── ...
│   ├── Charts/               # Chart components
│   │   ├── BarChart.jsx      # Bar chart for analytics
│   │   ├── LineChart.jsx     # Line chart for trends
│   │   └── PieChart.jsx      # Pie chart for distribution
│   ├── Tables/               # Table components
│   │   ├── UserTable.jsx     # User management table
│   │   ├── CourseTable.jsx   # Course management table
│   │   └── ...
│   └── ...
├── routes/
│   ├── SuperAdminRoutes.jsx  # Routes for Super Admin pages
├── services/
│   ├── api.js                # Axios instance
│   ├── userService.js        # API calls for user management
│   ├── courseService.js      # API calls for course management
│   ├── analyticsService.js   # API calls for analytics
│   └── ...
├── utils/
│   ├── formatDate.js         # Utility for formatting dates
│   ├── calculateRevenue.js   # Utility for revenue calculations
│   └── ...
```

## Component Architecture

### Sidebar
- **Purpose**: Provides navigation for all Super Admin pages.
- **Structure**:
  - `Sidebar.jsx`: Main sidebar component.
  - `SidebarItem.jsx`: Reusable component for individual menu items.

### Topbar
- **Purpose**: Displays notifications, user profile, and quick actions.
- **Structure**:
  - `Topbar.jsx`: Main topbar component.
  - `NotificationBell.jsx`: Notification icon with dropdown.

### Dashboard Cards
- **Purpose**: Display key metrics like revenue, user stats, and course stats.
- **Components**:
  - `RevenueCard.jsx`: Shows revenue analytics.
  - `UserStatsCard.jsx`: Displays user statistics.

### Charts
- **Purpose**: Visualize data trends and analytics.
- **Components**:
  - `BarChart.jsx`: Bar chart for revenue.
  - `LineChart.jsx`: Line chart for user growth.
  - `PieChart.jsx`: Pie chart for user distribution.

### Tables
- **Purpose**: Manage and display data in tabular format.
- **Components**:
  - `UserTable.jsx`: Table for managing users.
  - `CourseTable.jsx`: Table for managing courses.

## Sidebar Menu
```javascript
const sidebarMenu = [
  { name: 'Dashboard', path: '/superadmin/dashboard', icon: 'dashboard-icon' },
  { name: 'Users', path: '/superadmin/users', icon: 'users-icon' },
  { name: 'Teachers', path: '/superadmin/teachers', icon: 'teachers-icon' },
  { name: 'Students', path: '/superadmin/students', icon: 'students-icon' },
  { name: 'Courses', path: '/superadmin/courses', icon: 'courses-icon' },
  { name: 'Analytics', path: '/superadmin/analytics', icon: 'analytics-icon' },
  { name: 'Reports', path: '/superadmin/reports', icon: 'reports-icon' },
  { name: 'Settings', path: '/superadmin/settings', icon: 'settings-icon' },
];
```

## Routing System
```javascript
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/SuperAdminDashboard/Dashboard';
import Users from '../pages/SuperAdminDashboard/Users';
import Teachers from '../pages/SuperAdminDashboard/Teachers';
import Students from '../pages/SuperAdminDashboard/Students';
import Courses from '../pages/SuperAdminDashboard/Courses';
import Analytics from '../pages/SuperAdminDashboard/Analytics';
import Reports from '../pages/SuperAdminDashboard/Reports';
import Settings from '../pages/SuperAdminDashboard/Settings';

const SuperAdminRoutes = () => {
  return (
    <Routes>
      <Route path="/superadmin/dashboard" element={<Dashboard />} />
      <Route path="/superadmin/users" element={<Users />} />
      <Route path="/superadmin/teachers" element={<Teachers />} />
      <Route path="/superadmin/students" element={<Students />} />
      <Route path="/superadmin/courses" element={<Courses />} />
      <Route path="/superadmin/analytics" element={<Analytics />} />
      <Route path="/superadmin/reports" element={<Reports />} />
      <Route path="/superadmin/settings" element={<Settings />} />
    </Routes>
  );
};

export default SuperAdminRoutes;
```

## Modern UI Design
- **Tailwind CSS**: Use utility classes for responsive design.
- **Framer Motion**: Add animations for smooth transitions.
- **Recharts**: Integrate charts for analytics.

## Dashboard Cards Example
```javascript
import React from 'react';

const RevenueCard = ({ revenue }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold">Revenue</h3>
      <p className="text-2xl font-bold">${revenue}</p>
    </div>
  );
};

export default RevenueCard;
```

## Charts Section Example
```javascript
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueBarChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="revenue" fill="#4F46E5" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RevenueBarChart;
```

## API Integration Structure
- **Axios Instance**: Centralize API calls in `services/api.js`.
- **Service Files**: Create separate files for each feature (e.g., `userService.js`, `courseService.js`).
- **Error Handling**: Use interceptors for consistent error handling.

### Example API Service
```javascript
import axios from './api';

export const getUsers = async () => {
  const response = await axios.get('/users');
  return response.data;
};
```
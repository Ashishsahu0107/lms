# LMS Project Folder Structure

## Root Directory
```
lms/
├── backend/                 # Node.js + Express API
├── frontend/               # React + Vite UI
├── TODO.md                 # Development tasks
└── .git/                   # Git repository
```

## Backend Structure
```
backend/
├── config/                 # Configuration files
│   └── db.js               # Database configuration
├── controllers/            # Route controllers
│   └── authController.js   # Authentication logic
├── middleware/             # Express middleware
│   └── authMiddleware.js   # JWT authentication
├── models/                 # MongoDB models
│   ├── Assignment.js       # Assignment schema
│   ├── Attempt.js         # Quiz attempt schema
│   ├── Attendance.js      # Attendance schema
│   ├── Course.js          # Course schema
│   ├── Doubt.js           # Doubt/Support schema
│   ├── Quiz.js            # Quiz schema
│   ├── Submission.js      # Assignment submission schema
│   └── User.js            # User schema
├── routes/                 # API routes
│   ├── adminRoutes.js     # Admin endpoints
│   ├── analyticsRoutes.js # Analytics endpoints
│   ├── assignmentRoutes.js # Assignment endpoints
│   ├── attendanceRoutes.js # Attendance endpoints
│   ├── authRoutes.js      # Authentication endpoints
│   ├── courseRoutes.js    # Course endpoints
│   ├── dashboardRoutes.js # Dashboard endpoints
│   ├── doubtRoutes.js     # Support endpoints
│   ├── quizRoutes.js      # Quiz endpoints
│   └── submissionRoutes.js # Submission endpoints
├── scripts/               # Utility scripts
│   ├── importQuiz.js      # Quiz import utility
│   └── seedSuperAdmin.js  # Database seeding
├── services/              # Business logic services
├── utils/                 # Helper functions
├── validators/            # Input validation
├── uploads/               # File upload directory
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
└── server.js              # Express server entry point
```

## Frontend Structure
```
frontend/
├── public/                # Static assets
├── src/
│   ├── assets/           # Images, icons, etc.
│   ├── components/       # Reusable components
│   │   ├── ui/          # UI primitives (for TODO items)
│   │   ├── ActivityChart.jsx
│   │   ├── AdminRoute.jsx
│   │   ├── Calendar.jsx
│   │   ├── Layout.jsx
│   │   ├── Leaderboard.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StudentRoute.jsx
│   │   ├── SuperAdminRoute.jsx
│   │   ├── TeacherRoute.jsx
│   │   └── Topbar.jsx
│   ├── constants/        # Application constants
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components organized by role
│   │   ├── admin/       # Admin-specific pages
│   │   │   ├── Admin.jsx
│   │   │   ├── AdminCourses.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLessons.jsx
│   │   │   ├── AdminQuiz.jsx
│   │   │   └── SuperAdminDashboard.jsx
│   │   ├── teacher/     # Teacher-specific pages
│   │   ├── student/     # Student-specific pages
│   │   └── shared/      # Shared pages
│   │       ├── Assignments.jsx
│   │       ├── Attendance.jsx
│   │       ├── CourseDetail.jsx
│   │       ├── Courses.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Leaderboard.jsx
│   │       ├── Login.jsx
│   │       ├── Profile.jsx
│   │       ├── Quiz.jsx
│   │       ├── Register.jsx
│   │       └── Support.jsx
│   ├── services/         # API service functions
│   ├── utils/           # Utility functions
│   ├── App.css          # Global styles
│   ├── App.jsx          # Main App component
│   ├── index.css        # Base styles
│   └── main.jsx         # React entry point
├── dist/                # Build output
├── .gitignore           # Git ignore file
├── README.md            # Project documentation
├── eslint.config.js     # ESLint configuration
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── vite.config.js       # Vite configuration
```

## Key Improvements Made

### Backend
- ✅ Created `utils/`, `validators/`, `services/` directories
- ✅ Organized scripts into `scripts/` directory
- ✅ Maintained MVC pattern with proper separation

### Frontend
- ✅ Created `components/ui/` for UI primitives
- ✅ Added `hooks/`, `constants/`, `services/`, `utils/` directories
- ✅ Organized pages by role: `admin/`, `teacher/`, `student/`, `shared/`
- ✅ Removed empty component files
- ✅ Maintained modern React structure

## Best Practices Followed
- Separation of concerns
- Role-based organization
- Reusable component architecture
- Proper file naming conventions
- Scalable directory structure

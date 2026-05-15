# Backend Architecture

## Folder Structure
```
backend/
├── config/                # Configuration files (e.g., database connection, environment variables)
│   └── db.js             # MongoDB connection setup
├── controllers/          # Controllers for handling requests
│   ├── adminController.js # Super Admin-specific logic
│   ├── teacherController.js # Teacher-specific logic
│   ├── studentController.js # Student-specific logic
│   └── authController.js  # Authentication logic
├── middleware/           # Middleware for authentication, error handling, etc.
│   ├── authMiddleware.js  # JWT authentication middleware
│   ├── roleMiddleware.js  # Role-based access control
│   ├── errorMiddleware.js # Centralized error handling
│   └── uploadMiddleware.js # File upload handling
├── models/               # Mongoose models
│   ├── User.js            # User schema
│   ├── Course.js          # Course schema
│   ├── Assignment.js      # Assignment schema
│   ├── Notification.js    # Notification schema
│   └── ...
├── routes/               # API routes
│   ├── adminRoutes.js     # Routes for Super Admin
│   ├── teacherRoutes.js   # Routes for Teacher
│   ├── studentRoutes.js   # Routes for Student
│   ├── authRoutes.js      # Authentication routes
│   └── ...
├── services/             # Business logic and reusable services
│   ├── emailService.js    # Email notifications
│   ├── notificationService.js # Notification handling
│   └── ...
├── validators/           # Request validation logic
│   ├── authValidator.js   # Validation for authentication requests
│   ├── courseValidator.js # Validation for course-related requests
│   └── ...
├── utils/                # Utility functions
│   ├── asyncHandler.js    # Async error handling wrapper
│   ├── generateToken.js   # JWT token generation
│   ├── bcryptHelper.js    # Password hashing and comparison
│   └── ...
├── uploads/              # Directory for uploaded files
├── scripts/              # Scripts for seeding data, migrations, etc.
│   ├── seedSuperAdmin.js  # Script to seed Super Admin user
│   └── ...
├── socket/               # WebSocket logic for real-time features
│   └── notificationSocket.js # Real-time notifications
├── jobs/                 # Background jobs (e.g., cron jobs, queues)
│   └── notificationJob.js # Job for sending notifications
├── server.js             # Entry point for the backend
└── package.json          # Dependencies and scripts
```

## Purpose of Each Folder

### `config/`
- Contains configuration files for the application, such as database connection and environment variables.

### `controllers/`
- Handles the business logic for each route.
- Separate controllers for Super Admin, Teacher, and Student to maintain modularity.

### `middleware/`
- Contains middleware functions for tasks like authentication, role-based access control, error handling, and file uploads.

### `models/`
- Defines Mongoose schemas and models for MongoDB collections.
- Includes schemas for users, courses, assignments, notifications, etc.

### `routes/`
- Defines API endpoints and maps them to the appropriate controllers.
- Modular structure with separate route files for each role and feature.

### `services/`
- Contains reusable business logic and services, such as email notifications and real-time notifications.

### `validators/`
- Contains validation logic for incoming requests using libraries like `Joi` or `express-validator`.

### `utils/`
- Utility functions that can be reused across the application, such as token generation and password hashing.

### `uploads/`
- Directory for storing uploaded files, such as profile pictures and assignment submissions.

### `scripts/`
- Contains scripts for tasks like seeding the database or running migrations.

### `socket/`
- Contains WebSocket logic for real-time features like notifications and live updates.

### `jobs/`
- Contains background jobs for tasks like sending notifications or processing data asynchronously.

### `server.js`
- Entry point for the backend application.
- Initializes the server, connects to the database, and sets up middleware and routes.

## Key Features
- **JWT Authentication**: Secure authentication using JSON Web Tokens.
- **RBAC**: Role-based access control for Super Admin, Teacher, and Student.
- **Validation Layer**: Ensures data integrity and security for incoming requests.
- **Error Handling**: Centralized error handling for consistent responses.
- **File Upload Support**: Middleware for handling file uploads.
- **Notification Architecture**: Real-time and email notifications for users.
- **Scalable Design**: Modular and production-ready architecture following the MVC pattern.

## API Endpoints
### Authentication
- `POST /api/auth/login`: Login user.
- `POST /api/auth/register`: Register user.
- `GET /api/auth/profile`: Get user profile.

### Courses
- `GET /api/courses`: Get all courses.
- `POST /api/courses`: Create a course (Teacher/Super Admin).
- `GET /api/courses/:id`: Get course details.

### Assignments
- `GET /api/assignments`: Get all assignments.
- `POST /api/assignments`: Create an assignment (Teacher).

### Users
- `GET /api/users`: Get all users (Super Admin).
- `GET /api/users/:id`: Get user details.

## Role Permissions
| Role         | Permissions                                                                 |
|--------------|-----------------------------------------------------------------------------|
| Super Admin  | Manage users, courses, assignments, and analytics.                         |
| Teacher      | Manage courses, assignments, and view analytics for their courses.         |
| Student      | View courses, submit assignments, and participate in quizzes.              |

## Database Schema Overview
### User
```javascript
{
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['SuperAdmin', 'Teacher', 'Student'] },
  createdAt: Date,
  updatedAt: Date
}
```

### Course
```javascript
{
  title: String,
  description: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: Date,
  updatedAt: Date
}
```

### Assignment
```javascript
{
  title: String,
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  dueDate: Date,
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fileUrl: String,
    submittedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```
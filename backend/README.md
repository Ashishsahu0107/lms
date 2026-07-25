# LMS Pro - Backend Structure

## Folder Structure

```
backend/
├── config/
│   ├── db.js           # MongoDB database connection
│   └── env.js         # Environment variables configuration
│
├── controllers/
│   ├── admin.controller.js      # Admin management operations
│   ├── analytics.controller.js  # Analytics & reporting
│   ├── assignment.controller.js # Assignment operations
│   ├── auth.controller.js       # Authentication (login, register)
│   ├── course.controller.js     # Course CRUD operations
│   ├── health.controller.js     # Health check endpoint
│   ├── message.controller.js   # Messaging operations
│   ├── quiz.controller.js       # Quiz operations
│   └── student.controller.js   # Student operations
│
├── docs/
│   └── README-start.md         # Getting started guide
│
├── jobs/
│   └── index.js                # Background jobs (cron tasks)
│
├── middleware/
│   ├── auth.js                 # JWT authentication middleware
│   ├── errorHandler.js         # Global error handler
│   ├── notFoundHandler.js      # 404 Not Found handler
│   ├── requestLogger.js        # Request logging
│   └── upload.js               # File upload handling
│
├── models/
│   ├── Assignment.js          # Assignment schema
│   ├── Course.js             # Course schema
│   ├── Message.js            # Message schema
│   ├── Quiz.js               # Quiz schema
│   ├── StudentProgress.js    # Student progress tracking
│   ├── User.js               # User schema (admin, teacher, student)
│   └── placeholder.model.js  # Placeholder model
│
├── repositories/
│   └── user.repository.js    # User data access layer
│
├── routes/
│   ├── admin.routes.js       # Admin API routes
│   ├── analytics.routes.js   # Analytics API routes
│   ├── assignment.routes.js  # Assignment API routes
│   ├── auth.routes.js        # Auth API routes
│   ├── course.routes.js      # Course API routes
│   ├── health.routes.js      # Health check routes
│   ├── index.js              # Route aggregation
│   ├── message.routes.js     # Message API routes
│   ├── ping.routes.js        # Ping routes
│   ├── quiz.routes.js        # Quiz API routes
│   ├── student-api.routes.js # Student API routes
│   └── student.routes.js     # Student routes
│
├── services/
│   ├── admin.service.js      # Admin business logic
│   ├── analytics.service.js  # Analytics business logic
│   ├── assignment.service.js # Assignment business logic
│   ├── auth.service.js       # Auth business logic
│   ├── course.service.js     # Course business logic
│   ├── message.service.js    # Message business logic
│   ├── quiz.service.js       # Quiz business logic
│   └── student.service.js    # Student business logic
│
├── socket/
│   └── index.js              # Socket.IO for real-time communication
│
├── utils/
│   ├── errors.js             # Custom error classes
│   └── index.js             # Utility functions
│
├── server.js                 # Express app entry point
├── package.json
└── .gitignore
```

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose)
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time:** Socket.IO
- **Background Jobs:** node-cron

## API Endpoints

### Authentication

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | /api/auth/login    | User login        |
| POST   | /api/auth/register | User registration |
| GET    | /api/auth/me       | Get current user  |

### Courses

| Method | Endpoint         | Description      |
| ------ | ---------------- | ---------------- |
| GET    | /api/courses     | Get all courses  |
| POST   | /api/courses     | Create course    |
| GET    | /api/courses/:id | Get course by ID |
| PUT    | /api/courses/:id | Update course    |
| DELETE | /api/courses/:id | Delete course    |

### Assignments

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| GET    | /api/assignments     | Get all assignments  |
| POST   | /api/assignments     | Create assignment    |
| GET    | /api/assignments/:id | Get assignment by ID |
| PUT    | /api/assignments/:id | Update assignment    |
| DELETE | /api/assignments/:id | Delete assignment    |

### Quizzes

| Method | Endpoint         | Description     |
| ------ | ---------------- | --------------- |
| GET    | /api/quizzes     | Get all quizzes |
| POST   | /api/quizzes     | Create quiz     |
| GET    | /api/quizzes/:id | Get quiz by ID  |
| PUT    | /api/quizzes/:id | Update quiz     |
| DELETE | /api/quizzes/:id | Delete quiz     |

### Admin

| Method | Endpoint             | Description   |
| ------ | -------------------- | ------------- |
| GET    | /api/admin/users     | Get all users |
| POST   | /api/admin/users     | Create user   |
| PUT    | /api/admin/users/:id | Update user   |
| DELETE | /api/admin/users/:id | Delete user   |
| GET    | /api/admin/analytics | Get analytics |

### Health

| Method | Endpoint | Description   |
| ------ | -------- | ------------- |
| GET    | /health  | Health check  |
| GET    | /ping    | Ping endpoint |

## User Roles

| Role        | Description              |
| ----------- | ------------------------ |
| super_admin | Full system access       |
| teacher     | Course & assignment mgmt |
| student     | Learning access          |

## Demo Credentials

| Role    | Email              | Password   |
| ------- | ------------------ | ---------- |
| Admin   | admin@lmspro.edu   | admin123   |
| Teacher | teacher@lmspro.edu | teacher123 |
| Student | student@lmspro.edu | student123 |

## Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `.env` file with:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your-secret-key
```

### 3. Start Server

```bash
npm run dev   # Development
npm start     # Production
```

### 4. API Documentation

- Health Check: `GET http://localhost:5000/health`
- API Base: `http://localhost:5000/api`

## Middleware Stack

1. **CORS** - Cross-origin resource sharing
2. **Request Logger** - Log incoming requests
3. **Body Parser** - Parse JSON request bodies
4. **Auth** - JWT token verification
5. **Error Handler** - Global error handling
6. **Not Found** - 404 handling

## Architecture

```
Request → Route → Middleware → Controller → Service → Repository → Model → Database
                                      ↓
                               Response ←
```

## Color Palette (API Responses)

| Status  | Color  | HTTP Code |
| ------- | ------ | --------- |
| Success | Green  | 200/201   |
| Error   | Red    | 400/500   |
| Warning | Yellow | 409       |
| Info    | Blue   | 404       |

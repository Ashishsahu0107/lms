# Complete LMS Project Setup & Documentation

## Project Overview

This is a full-stack Learning Management System (LMS) with React frontend and Node.js/Express backend.

## Quick Start

### 1. Frontend Setup

```bash
cd lms/frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 2. Backend Setup (When Ready)

```bash
cd lms/backend
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

## Frontend Project Structure

```
frontend/
├── src/
│   ├── assets/              # Images, icons, static files
│   ├── components/
│   │   ├── AppSidebar.jsx   # Main sidebar navigation
│   │   ├── Navbar.jsx       # Top navigation bar
│   │   ├── Layout.jsx       # Main layout wrapper
│   │   ├── Footer.jsx       # Footer component
│   │   ├── ProtectedRoute.jsx # Auth protection
│   │   ├── Course/          # Course-related components
│   │   ├── AssignmentsPage.tsx
│   │   ├── AttendancePage.tsx
│   │   ├── QuizzesPage.tsx
│   │   ├── LearningSupportPage.tsx
│   │   └── ui/              # Reusable UI components
│   ├── context/
│   │   └── AuthContext.jsx  # Auth state management
│   ├── hooks/
│   │   ├── useAuth.js       # Auth hook
│   │   ├── useTheme.js      # Theme hook
│   │   └── useCourse.js     # Course hooks
│   ├── pages/
│   │   ├── Home.jsx         # Dashboard home
│   │   ├── Dashboard.jsx    # Analytics dashboard
│   │   ├── Courses.jsx      # Course listing
│   │   ├── CourseDetailPage.jsx # Course details
│   │   ├── CourseDetail.jsx # Alternative detail page
│   │   ├── CoursesNew.jsx   # New courses page
│   │   ├── Profile.jsx      # User profile
│   │   ├── Login.jsx        # Login page
│   │   ├── Signup.jsx       # Registration page
│   │   ├── SupportPage.jsx  # Support/Help page
│   │   └── learning/
│   │       ├── CourseLearn.jsx # Learning interface
│   │       ├── TopicView.jsx
│   │       └── QuizTake.jsx
│   ├── utils/
│   │   ├── apiService.js    # API calls
│   │   ├── helpers.js       # Utility functions
│   │   └── constants.js     # Constants
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── public/                  # Static public files
├── index.html              # HTML template
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── eslint.config.js
```

## Backend Project Structure (To Create)

```
backend/
├── src/
│   ├── server.js           # Express app entry
│   ├── config/
│   │   └── database.js     # DB config
│   ├── database/
│   │   └── init.js         # Schema & initialization
│   ├── middleware/
│   │   ├── auth.js         # JWT auth
│   │   ├── validation.js   # Input validation
│   │   └── errorHandler.js # Error handling
│   ├── routes/
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── enrollment.js
│   │   ├── assignments.js
│   │   ├── quizzes.js
│   │   ├── progress.js
│   │   └── users.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── enrollmentController.js
│   │   ├── assignmentController.js
│   │   ├── quizController.js
│   │   ├── progressController.js
│   │   └── userController.js
│   └── models/
│       └── models.js       # DB helpers
├── data/
│   └── lms.db             # SQLite database
├── package.json
├── .env
└── .env.example
```

## Key Features Implemented

### ✅ Frontend Features
- [x] Responsive React UI with Tailwind CSS
- [x] User Authentication (Login/Signup)
- [x] Course browsing and filtering
- [x] Course detail pages
- [x] Learning interface with lesson player
- [x] User dashboard with statistics
- [x] User profile management
- [x] Support/Help center
- [x] Assignments and quizzes interface
- [x] Progress tracking
- [x] Attendance tracking

### ⏳ Backend Features (To Implement)
- [ ] User authentication with JWT
- [ ] Course management API
- [ ] Enrollment system
- [ ] Lesson content serving
- [ ] Assignment submission
- [ ] Quiz evaluation
- [ ] Progress tracking
- [ ] User profile management
- [ ] Database with SQLite

## Technology Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Lucide Icons
- Axios
- Zustand (state management)

### Backend
- Node.js
- Express.js
- SQLite3 (better-sqlite3)
- JWT (jsonwebtoken)
- bcryptjs (password hashing)
- Joi (validation)

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
DATABASE_PATH=./data/lms.db
CORS_ORIGIN=http://localhost:5173
```

## API Routes (To Be Implemented)

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
```

### Courses
```
GET    /api/courses
GET    /api/courses/:id
POST   /api/courses
PUT    /api/courses/:id
DELETE /api/courses/:id
```

### Enrollment
```
POST   /api/enrollment
GET    /api/enrollment
GET    /api/enrollment/user/:userId
```

### Assignments
```
GET    /api/assignments
GET    /api/assignments/:id
POST   /api/assignments/:id/submit
GET    /api/assignments/:id/submissions
```

### Quizzes
```
GET    /api/quizzes
GET    /api/quizzes/:id
POST   /api/quizzes/:id/submit
GET    /api/quizzes/:id/results
```

### Progress
```
GET    /api/progress/:userId
PUT    /api/progress/:courseId
GET    /api/progress/:userId/stats
```

### Users
```
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/:id
```

## Database Schema

### Users
```sql
id, email, password_hash, name, role, avatar, bio, created_at
```

### Courses
```sql
id, title, description, instructor_id, category, level, duration, price, thumbnail, rating, enrolled_count, created_at
```

### Lessons
```sql
id, course_id, title, description, content, video_url, duration, order_num, created_at
```

### Enrollments
```sql
id, user_id, course_id, progress, enrolled_at, completed_at
```

### Assignments
```sql
id, course_id, title, description, due_date, created_at
```

### Submissions
```sql
id, assignment_id, user_id, content, score, feedback, submitted_at
```

### Quizzes
```sql
id, course_id, title, description, passing_score, time_limit, created_at
```

### Quiz Responses
```sql
id, quiz_id, user_id, answers, score, submitted_at
```

### Progress
```sql
id, user_id, course_id, lessons_completed, assignments_completed, current_lesson_id, updated_at
```

## Getting Help

- Check the Support Center in the app (📚 Learning Tips, FAQ, Contact)
- Review frontend components in `/src/components`
- Review pages in `/src/pages`
- Check API services in `/src/utils/apiService.js`

## Next Steps

1. **Backend Setup**: Create backend directory and follow backend setup guide
2. **Database**: Initialize SQLite database
3. **API Integration**: Connect frontend to backend APIs
4. **Testing**: Implement unit and integration tests
5. **Deployment**: Deploy to production servers

## Common Commands

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend (When created)
```bash
npm run dev      # Start with nodemon
npm start        # Start production
```

## Contributing

1. Create feature branches
2. Follow coding standards
3. Add tests for new features
4. Submit pull requests

## License

MIT License - See LICENSE file for details

---

**Welcome to LMS! Happy Learning! 🎓**

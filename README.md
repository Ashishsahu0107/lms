# Learning Management System (LMS)

A comprehensive Learning Management System built with React and Node.js/Express. This full-stack application enables users to explore courses, enroll, learn, complete assignments, and take quizzes with progress tracking.

## 🌟 Features

### Core Features
- **User Authentication**: Secure login and registration with JWT tokens
- **Course Management**: Browse, search, and filter courses by category and difficulty level
- **Course Enrollment**: Easy enrollment in courses with instant access
- **Learning Paths**: Structured lessons and modules with video content
- **Progress Tracking**: Real-time progress monitoring and statistics
- **Assignments**: Submit assignments with feedback system
- **Quizzes**: Interactive quizzes with instant scoring
- **User Dashboard**: Personalized dashboard with learning statistics
- **User Profiles**: Customizable user profiles and preferences
- **Support Center**: FAQ, live chat, and contact system

### Advanced Features
- Responsive design (mobile, tablet, desktop)
- Real-time notifications
- Learning streaks and gamification
- Course recommendations
- Instructor messaging
- Certificate generation on course completion
- Analytics and reporting

## 📁 Project Structure

```
lms-project/
├── frontend/                    # React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Reusable UI components
│   │   │   ├── layout/         # Layout components (Header, Sidebar)
│   │   │   └── features/       # Feature-specific components
│   │   ├── pages/              # Page components
│   │   ├── context/            # React Context (Auth, Theme)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API service methods
│   │   ├── utils/              # Utility functions and helpers
│   │   ├── assets/             # Images, icons, styles
│   │   ├── App.jsx             # Main App component
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── backend/                     # Express Server (To be created)
    ├── src/
    │   ├── routes/             # API route definitions
    │   ├── controllers/        # Business logic handlers
    │   ├── models/             # Database schemas
    │   ├── middleware/         # Auth, validation, error handlers
    │   ├── database/           # Database initialization
    │   ├── config/             # Configuration files
    │   └── server.js           # Express app setup
    ├── package.json
    └── .env                    # Environment variables
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will run on `http://localhost:5000`

## 📝 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_change_this_in_production
DATABASE_PATH=./data/lms.db
```

## 🛣️ Available Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create new course (instructor)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Enrollment
- `POST /api/enrollment` - Enroll in course
- `GET /api/enrollment` - Get user's enrollments
- `GET /api/enrollment/user/:userId` - Get user's courses

### Assignments
- `GET /api/assignments` - Get assignments
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments/:id/submit` - Submit assignment
- `GET /api/assignments/:id/submissions` - Get submissions

### Quizzes
- `GET /api/quizzes` - Get quizzes
- `GET /api/quizzes/:id` - Get quiz details
- `POST /api/quizzes/:id/submit` - Submit quiz answers
- `GET /api/quizzes/:id/results` - Get quiz results

### Progress
- `GET /api/progress/:userId` - Get user progress
- `PUT /api/progress/:courseId` - Update progress
- `GET /api/progress/:userId/stats` - Get completion stats

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/:id` - Get user details

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes with middleware
- Input validation with Joi
- CORS configuration
- Secure environment variables

## 🎨 UI Technologies

- **React 18**: UI framework
- **Tailwind CSS**: Utility-first CSS
- **Lucide Icons**: Beautiful icon library
- **React Router v6**: Client-side routing
- **Axios**: HTTP client for API calls

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'student',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Courses Table
```sql
CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor_id INTEGER,
  category TEXT,
  level TEXT,
  duration INTEGER,
  thumbnail TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(instructor_id) REFERENCES users(id)
);
```

### Enrollments Table
```sql
CREATE TABLE enrollments (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  course_id INTEGER,
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(course_id) REFERENCES courses(id)
);
```

### And more tables for lessons, assignments, quizzes, etc.

## 🔄 API Request/Response Format

### Success Response
```json
{
  "status": 200,
  "message": "Success",
  "data": { }
}
```

### Error Response
```json
{
  "status": 400,
  "message": "Error message",
  "errors": []
}
```

## 📚 Key Components

### Pages
- **Home** - Dashboard with learning overview
- **Courses** - Course browsing and search
- **CourseDetail** - Detailed course information
- **CourseLearn** - Learning interface with lessons
- **Assignments** - Assignment management
- **Quizzes** - Quiz taking interface
- **Profile** - User profile management
- **Login/Signup** - Authentication pages

### Context Providers
- **AuthContext** - User authentication state
- **ThemeContext** - Theme management

### Custom Hooks
- **useAuth** - Authentication hook
- **useTheme** - Theme management hook

## 🧪 Testing

```bash
npm test
```

## 📦 Build

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
npm run build
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Heroku/Railway)
```bash
npm install
npm start
```

## 📖 API Documentation

Detailed API documentation available at `/api/docs` (when implemented with Swagger)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Support

For support, email support@lms.com or open an issue in the repository.

## 🎯 Roadmap

- [ ] Video streaming integration
- [ ] Live class functionality
- [ ] AI-powered recommendations
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Advanced analytics
- [ ] Peer-to-peer learning
- [ ] Certification program

---

**Happy Learning! 🎓**

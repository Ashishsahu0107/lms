# 🚀 Real-Time LMS Implementation Guide

## Complete Backend + Real-Time Frontend Integration

---

## 📋 Overview

This guide shows how to:
1. ✅ Set up the Node.js/Express backend
2. ✅ Configure WebSocket for real-time updates
3. ✅ Connect React frontend to backend
4. ✅ Implement real-time features
5. ✅ Test everything together

---

## 🔧 Step 1: Backend Setup

### 1.1 Create Backend Structure

```bash
# Open Command Prompt or PowerShell
cd C:\Users\Ashish\Desktop\lms
mkdir backend
mkdir backend\src
mkdir backend\data
cd backend
```

### 1.2 Create package.json

Copy the content from **BACKEND_SERVER.md** → Create `backend/package.json`

```json
{
  "name": "lms-backend",
  "version": "1.0.0",
  "type": "module",
  "description": "Learning Management System Backend API with Real-time Updates",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.1.0",
    "bcryptjs": "^2.4.3",
    "better-sqlite3": "^9.1.1",
    "joi": "^17.11.0",
    "socket.io": "^4.7.2",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 1.3 Create .env File

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=lms_jwt_secret_key_change_this_in_production
DATABASE_PATH=./data/lms.db
CORS_ORIGIN=http://localhost:5173
```

### 1.4 Create server.js

Copy the **complete server code** from **BACKEND_SERVER.md**

Save as: `backend/src/server.js`

### 1.5 Install Dependencies

```bash
cd backend
npm install
```

### 1.6 Start Backend Server

```bash
npm run dev
```

**Expected Output:**
```
🚀 LMS Backend running on port 5000
📊 Health check: http://localhost:5000/api/health
🔌 WebSocket ready for real-time updates
```

---

## ⚛️ Step 2: Frontend Real-Time Setup

### 2.1 Install Dependencies

```bash
cd lms/frontend
npm install socket.io-client axios
```

This adds:
- `socket.io-client` - WebSocket client for real-time updates
- `axios` - HTTP client (if not already installed)

### 2.2 Add Real-Time Service

The file `frontend/src/utils/socketService.js` is **already created**!

It includes:
- Socket initialization
- 10+ custom hooks for real-time updates
- Event listeners and emitters
- Real-time features

### 2.3 Update Frontend .env

Create/Update `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 2.4 Update App.jsx (Optional)

To use the real-time home page, update routing in `frontend/src/App.jsx`:

```javascript
// Change this:
import Home from "./pages/Home";

// To:
import Home from "./pages/HomeRealtime";
```

Or use the original Home page - it works with or without real-time features.

---

## 🔌 Step 3: Run Both Servers

### Terminal 1: Start Backend

```bash
cd lms/backend
npm run dev
```

Wait for message:
```
🚀 LMS Backend running on port 5000
🔌 WebSocket ready for real-time updates
```

### Terminal 2: Start Frontend

```bash
cd lms/frontend
npm run dev
```

Wait for message:
```
  ➜  Local:   http://localhost:5173/
```

### Terminal 3 (Optional): Test with curl

```bash
# Check backend health
curl http://localhost:5000/api/health

# Should return:
# {"status":"OK","message":"LMS Backend is running",...}
```

---

## ✅ Step 4: Test Real-Time Features

### 4.1 Register a New User

1. Go to `http://localhost:5173/signup`
2. Create an account
3. Check backend console - should show registration event

### 4.2 Login

1. Go to `http://localhost:5173/login`
2. Use the account you just created
3. Should redirect to home dashboard

### 4.3 See Real-Time Updates

Open **two browser windows**:

**Window 1:**
- Login as User 1
- Go to Home page
- Watch "Live Activity" section

**Window 2:**
- Login as User 2 or Register new user
- You'll see real-time updates in Window 1!

### 4.4 Real-Time Features Working

✅ **User Registration** - See new users join in real-time
✅ **Course Creation** - See new courses appear instantly
✅ **Enrollment Updates** - See enrollments broadcast
✅ **Progress Updates** - See learning progress change live
✅ **Announcements** - See course announcements instantly

---

## 🔗 API Endpoints

### Authentication

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","name":"John"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

### Courses

```bash
# Get all courses
curl http://localhost:5000/api/courses

# Get course by ID
curl http://localhost:5000/api/courses/{courseId}

# Create course (needs JWT token)
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"title":"New Course","description":"...","category":"Programming"}'
```

### Enrollment

```bash
# Enroll in course (needs JWT token)
curl -X POST http://localhost:5000/api/enrollment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"courseId":"course-id"}'

# Get user's enrollments (needs JWT token)
curl http://localhost:5000/api/enrollment \
  -H "Authorization: Bearer {token}"
```

---

## 🎯 Real-Time Socket Events

### Using Custom Hooks in Components

```javascript
import { 
  useCourseUpdates, 
  useProgressUpdates,
  useAnnouncements,
  useCoursePresence
} from '../utils/socketService';

function MyComponent() {
  // Listen for new courses
  const newCourses = useCourseUpdates();
  
  // Listen for progress updates
  const updates = useProgressUpdates();
  
  // Listen for announcements in a course
  const announcements = useAnnouncements(courseId);
  
  // Get active user count
  const activeUsers = useCoursePresence(courseId);
  
  return (
    <div>
      {newCourses.map(course => <CourseCard course={course} />)}
      {activeUsers} users online
    </div>
  );
}
```

### Emitting Events from Components

```javascript
import { useProgressUpdate } from '../utils/socketService';

function LessonPlayer() {
  const updateProgress = useProgressUpdate();
  
  const handleMarkComplete = () => {
    updateProgress(courseId, 5, 2, lessonId);
  };
  
  return <button onClick={handleMarkComplete}>Mark Complete</button>;
}
```

---

## 📊 Database

SQLite database is **automatically created** at `backend/data/lms.db`

### Existing Tables:
- users
- courses
- lessons
- enrollments
- assignments
- submissions
- quizzes
- quiz_questions
- quiz_responses
- progress
- announcements

All tables are created automatically on first server start!

---

## 🐛 Troubleshooting

### Issue: Backend won't start
```bash
# Check if port 5000 is in use
# Change PORT in .env to a different number

# Or kill the process using port 5000
lsof -i :5000
kill -9 <PID>
```

### Issue: Frontend can't connect to backend
```bash
# Check VITE_API_URL in frontend/.env
VITE_API_URL=http://localhost:5000/api

# Restart frontend server: npm run dev
```

### Issue: WebSocket not connecting
```bash
# Check CORS_ORIGIN in backend/.env
CORS_ORIGIN=http://localhost:5173

# Check browser console for errors (F12)
# Check backend console for WebSocket events
```

### Issue: Database errors
```bash
# Delete database and restart
rm backend/data/lms.db
npm run dev

# The database will be recreated automatically
```

---

## 📦 Project Structure After Setup

```
lms/
├── backend/                    # ✅ Backend API
│   ├── src/
│   │   └── server.js           # Main server
│   ├── data/
│   │   └── lms.db              # SQLite database
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── frontend/                   # ✅ React App
│   ├── src/
│   │   ├── utils/
│   │   │   ├── socketService.js # Real-time ✨ NEW
│   │   │   └── apiService.js
│   │   ├── pages/
│   │   │   ├── HomeRealtime.jsx # Real-time home ✨ NEW
│   │   │   └── ...
│   │   └── ...
│   ├── package.json
│   └── .env
│
└── Documentation files
```

---

## 🚀 Quick Start Commands

### Terminal 1: Backend
```bash
cd lms/backend
npm install
npm run dev
```

### Terminal 2: Frontend
```bash
cd lms/frontend
npm install
npm run dev
```

### Then:
Open `http://localhost:5173` in your browser!

---

## ✨ What Works Now

✅ **User Authentication**
- Register new users
- Login with JWT tokens
- Protected routes

✅ **Real-Time Updates**
- New users broadcast
- New courses broadcast
- Enrollments broadcast
- Progress updates broadcast
- Announcements broadcast

✅ **Course Management**
- Browse courses
- Enroll in courses
- Track progress
- View lessons

✅ **Live Dashboard**
- See active users
- Live activity feed
- Real-time statistics

✅ **Database**
- SQLite with 11 tables
- Automatic initialization
- Persistent storage

---

## 🎓 Next Steps

1. ✅ Backend is running
2. ✅ Frontend is connected
3. ✅ Real-time working
4. 📈 Add more features:
   - Assignment submissions
   - Quiz system
   - Live chat
   - Notifications
5. 🚀 Deploy to production

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| `backend/src/server.js` | Main backend server |
| `backend/.env` | Backend config |
| `frontend/src/utils/socketService.js` | Real-time utilities |
| `frontend/src/pages/HomeRealtime.jsx` | Real-time home page |
| `frontend/.env` | Frontend config |

---

## 🎯 Success Checklist

- [ ] Backend folder created
- [ ] Backend dependencies installed
- [ ] Backend server running on port 5000
- [ ] Frontend dependencies installed
- [ ] Frontend running on port 5173
- [ ] Can register and login
- [ ] Real-time updates visible
- [ ] No console errors

---

**Congratulations!** 🎉

You now have a fully functional, real-time Learning Management System!

**Happy coding!** 🚀

---

## 📞 Support

For issues:
1. Check backend console for errors
2. Check frontend console (F12)
3. Verify .env files
4. Check ports are correct
5. Restart both servers

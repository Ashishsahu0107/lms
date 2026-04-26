# 🚀 Backend Setup Guide - Step by Step

## Backend Creation Instructions

Since we can't directly create the folder structure, follow these steps to create the backend manually:

### Step 1: Create Backend Folder Structure

```bash
# Open terminal/command prompt and run:
cd C:\Users\Ashish\Desktop\lms
mkdir backend
mkdir backend\src
mkdir backend\data
cd backend
```

### Step 2: Create package.json

Create `C:\Users\Ashish\Desktop\lms\backend\package.json`:

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
  "keywords": ["lms", "education", "api", "realtime"],
  "author": "",
  "license": "MIT",
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

### Step 3: Create .env File

Create `C:\Users\Ashish\Desktop\lms\backend\.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=lms_jwt_secret_key_change_this_in_production
DATABASE_PATH=./data/lms.db
CORS_ORIGIN=http://localhost:5173
```

### Step 4: Create server.js

Create `C:\Users\Ashish\Desktop\lms\backend\src\server.js` with the complete backend code (see BACKEND_SERVER.md)

### Step 5: Install Dependencies

```bash
cd backend
npm install
```

### Step 6: Start Backend

```bash
npm run dev
```

Server will start on: `http://localhost:5000`

---

## Complete Backend Server Code

See **BACKEND_SERVER.md** for the full server.js implementation.

---

## API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
```

### Courses
```
GET    /api/courses
GET    /api/courses/:id
POST   /api/courses (protected)
```

### Enrollment
```
POST   /api/enrollment (protected)
GET    /api/enrollment (protected)
```

### Progress
```
GET    /api/progress/:userId (protected)
PUT    /api/progress/:courseId (protected)
```

### Users
```
GET    /api/users/profile (protected)
PUT    /api/users/profile (protected)
```

### Announcements
```
GET    /api/announcements/:courseId
POST   /api/announcements (protected)
```

### Health
```
GET    /api/health
```

---

## Real-time Socket.IO Events

### Client to Server
```javascript
socket.emit('course:join', courseId)
socket.emit('course:leave', courseId)
socket.emit('lesson:update', data)
socket.emit('progress:update', data)
socket.emit('chat:message', data)
```

### Server to Client
```javascript
socket.on('user:registered', data)
socket.on('user:loggedIn', data)
socket.on('course:created', course)
socket.on('enrollment:created', data)
socket.on('progress:updated', data)
socket.on('user:profileUpdated', data)
socket.on('announcement:${courseId}', announcement)
socket.on('lesson:updated', data)
socket.on('progress:changed', data)
socket.on('chat:newMessage', data)
```

---

## Database Schema

The backend automatically creates these tables:

### users
```sql
id, email, password_hash, name, role, avatar, bio, created_at, updated_at
```

### courses
```sql
id, title, description, full_description, instructor_id, category, level, 
duration, price, thumbnail, rating, enrolled_count, created_at, updated_at
```

### lessons
```sql
id, course_id, title, description, content, video_url, duration, order_num, created_at
```

### enrollments
```sql
id, user_id, course_id, progress, enrolled_at, completed_at
```

### assignments
```sql
id, course_id, title, description, due_date, created_at
```

### submissions
```sql
id, assignment_id, user_id, content, score, feedback, submitted_at
```

### quizzes
```sql
id, course_id, title, description, passing_score, time_limit, created_at
```

### quiz_questions
```sql
id, quiz_id, question, options, correct_answer
```

### quiz_responses
```sql
id, quiz_id, user_id, answers, score, submitted_at
```

### progress
```sql
id, user_id, course_id, lessons_completed, assignments_completed, current_lesson_id, updated_at
```

### announcements
```sql
id, course_id, title, message, created_by, created_at
```

---

## Quick Start

### 1. Backend Setup
```bash
cd lms/backend
npm install
npm run dev
```

### 2. Frontend Setup (Keep running in another terminal)
```bash
cd lms/frontend
npm run dev
```

### 3. Test Health
```bash
curl http://localhost:5000/api/health
```

---

## Testing API Endpoints

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Get Courses
```bash
curl http://localhost:5000/api/courses
```

---

## Environment Variables

Update `.env` with your configuration:

```env
PORT=5000                              # Server port
NODE_ENV=development                   # Environment mode
JWT_SECRET=your_secret_key            # Change in production!
DATABASE_PATH=./data/lms.db           # SQLite database location
CORS_ORIGIN=http://localhost:5173     # Frontend URL
```

---

## Features

✅ **Real-time Updates** with Socket.IO
✅ **JWT Authentication** with token validation
✅ **Password Hashing** with bcryptjs
✅ **SQLite Database** with automatic initialization
✅ **CORS Support** for frontend integration
✅ **WebSocket Events** for live course updates
✅ **User Management** with profiles
✅ **Course Management** with enrollment
✅ **Progress Tracking** real-time
✅ **Announcements** with broadcast

---

## Directory Structure

```
backend/
├── src/
│   └── server.js          # Main server file
├── data/
│   └── lms.db            # SQLite database (auto-created)
├── package.json          # Dependencies
├── .env                  # Environment variables
└── .env.example         # Example env file
```

---

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env or kill the process:
lsof -i :5000
kill -9 <PID>
```

### Database Error
```bash
# Delete the database and restart:
rm data/lms.db
npm run dev
```

### Socket.IO Connection Issues
- Check CORS_ORIGIN in .env
- Ensure frontend URL matches
- Check browser console for errors

### JWT Token Errors
- Token might be expired (24 hour expiry)
- Re-login to get new token
- Check JWT_SECRET is consistent

---

## Next Steps

1. ✅ Create backend folder and files
2. ✅ Install dependencies: `npm install`
3. ✅ Start server: `npm run dev`
4. ✅ Connect frontend to backend (update VITE_API_URL)
5. ✅ Test all endpoints
6. ✅ Deploy to production

---

**Backend is now ready to connect with your React frontend!**

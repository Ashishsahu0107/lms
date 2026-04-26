# Backend Server.js - Complete Code

Copy this entire code into `C:\Users\Ashish\Desktop\lms\backend\src\server.js`

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import Database from 'better-sqlite3';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_in_production';

// Create HTTP server for Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new Database(process.env.DATABASE_PATH || './data/lms.db');

// Initialize Database Tables
const initializeDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      avatar TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      full_description TEXT,
      instructor_id TEXT,
      category TEXT,
      level TEXT,
      duration INTEGER,
      price REAL DEFAULT 0,
      thumbnail TEXT,
      rating REAL DEFAULT 4.5,
      enrolled_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(instructor_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      course_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      video_url TEXT,
      duration INTEGER,
      order_num INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      course_id TEXT,
      progress INTEGER DEFAULT 0,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(course_id) REFERENCES courses(id),
      UNIQUE(user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      course_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      due_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT,
      user_id TEXT,
      content TEXT,
      score REAL,
      feedback TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(assignment_id) REFERENCES assignments(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      course_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      passing_score INTEGER DEFAULT 70,
      time_limit INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT,
      question TEXT NOT NULL,
      options TEXT,
      correct_answer TEXT,
      FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
    );

    CREATE TABLE IF NOT EXISTS quiz_responses (
      id TEXT PRIMARY KEY,
      quiz_id TEXT,
      user_id TEXT,
      answers TEXT,
      score REAL,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(quiz_id) REFERENCES quizzes(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS progress (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      course_id TEXT,
      lessons_completed INTEGER DEFAULT 0,
      assignments_completed INTEGER DEFAULT 0,
      current_lesson_id TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      course_id TEXT,
      title TEXT NOT NULL,
      message TEXT,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(course_id) REFERENCES courses(id),
      FOREIGN KEY(created_by) REFERENCES users(id)
    );
  `);
};

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ status: 401, message: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ status: 401, message: 'Invalid token' });
  }
};

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LMS Backend is running', timestamp: new Date().toISOString() });
});

// ============ AUTHENTICATION ROUTES ============
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ status: 400, message: 'Missing required fields' });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const userId = uuidv4();
    
    const stmt = db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)');
    stmt.run(userId, email, hashedPassword, name);
    
    // Broadcast new user registration to all connected clients
    io.emit('user:registered', { id: userId, name, email });
    
    res.status(201).json({
      status: 201,
      message: 'User registered successfully',
      data: { id: userId, email, name }
    });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ status: 400, message: 'Email already exists' });
    }
    res.status(400).json({ status: 400, message: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ status: 400, message: 'Missing required fields' });
    }
    
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);
    
    if (!user || !bcryptjs.compareSync(password, user.password_hash)) {
      return res.status(401).json({ status: 401, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    
    // Broadcast user login
    io.emit('user:loggedIn', { id: user.id, name: user.name });
    
    res.json({
      status: 200,
      message: 'Login successful',
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    });
  } catch (error) {
    res.status(400).json({ status: 400, message: error.message });
  }
});

// ============ COURSE ROUTES ============
app.get('/api/courses', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM courses ORDER BY created_at DESC');
    const courses = stmt.all();
    res.json({ status: 200, message: 'Success', data: courses });
  } catch (error) {
    res.status(400).json({ status: 400, message: error.message });
  }
});

app.get('/api/courses/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM courses WHERE id = ?');
    const course = stmt.get(req.params.id);
    
    if (!course) {
      return res.status(404).json({ status: 404, message: 'Course not found' });
    }
    
    // Get lessons
    const lessonsStmt = db.prepare('SELECT * FROM lessons WHERE course_id = ? ORDER BY order_num');
    const lessons = lessonsStmt.all(course.id);
    
    res.json({
      status: 200,
      message: 'Success',
      data: { ...course, lessons }
    });
  } catch (error) {
    res.status(400).json({ status: 400, message: error.message });
  }
});

app.post('/api/courses', authMiddleware, (req, res) => {
  try {
    const { title, description, category, level, duration, price } = req.body;
    const courseId = uuidv4();
    
    const stmt = db.prepare(`
      INSERT INTO courses (id, title, description, instructor_id, category, level, duration, price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(courseId, title, description, req.user.id, category, level, duration, price || 0);
    
    const course = { id: courseId, title, description, category, level, duration, price };
    
    // Broadcast new course
    io.emit('course:created', course);
    
    res.status(201).json({
      status: 201,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    res.status(400).json({ status: 400, message: error.message });
  }
});

// ============ ENROLLMENT ROUTES ============
app.post('/api/enrollment', authMiddleware, (req, res) => {
  try {
    const { courseId } = req.body;
    const enrollmentId = uuidv4();
    
    const stmt = db.prepare('INSERT INTO enrollments (id, user_id, course_id) VALUES (?, ?, ?)');
    stmt.run(enrollmentId, req.user.id, courseId);
    
    // Update enrolled count
    const updateStmt = db.prepare('UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = ?');
    updateStmt.run(courseId);
    
    // Broadcast enrollment
    io.emit('enrollment:created', {
      id: enrollmentId,
      userId: req.user.id,
      courseId,
      enrolledAt: new Date().toISOString()
    });
    
    res.status(201).json({
      status: 201,
      message: 'Enrolled successfully',
      data: { id: enrollmentId }
    });
  } catch (error) {
    res.status(400).json({ status: 400, message: error.message });
  }
});

app.get('/api/enrollment', authMiddleware, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT c.* FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.user_id = ?
      ORDER BY e.enrolled_at DESC
    `);
    const courses = stmt.all(req.user.id);
    
    res.json({ status: 200, message: 'Success', data: courses });
  } catch (error) {
    res.status(400).json({ status: 400, message: error.message });
  }
});

// ============ PROGRESS ROUTES ============
app.get('/api/progress/:userId', authMiddleware, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM progress WHERE user_id = ?');
    const userProgress = stmt.all(req.params.userId);
    
    res.json({ status: 200, message: 'Success', data: userProgress });
  } catch (error) {
    res.status(400).json({ status: 400, message: error.message });
  }
});

app.put('/api/progress/:courseId', authMiddleware, (req, res) => {
  try {
    const { lessonsCompleted, assignmentsCompleted, currentLessonId } = req.body;
    const progressId = uuidv4();
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO progress (id, user_id, course_id, lessons_completed, assignments_completed, current_lesson_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(progressId, req.user.id, req.params.courseId, lessonsCompleted || 0, assignmentsCompleted || 0, currentLessonId || null);
    
    // Broadcast progress update
    io.emit('progress:updated', {
      userId: req.user.id,
      courseId: req.params.courseId,
      lessonsCompleted,
      assignmentsCompleted
    });
    
    res.json({
      status: 200,
      message: 'Progress updated',
      data: { id: progressId }
    });
  } catch (error) {
    res.status(400).json({ status: 400, message: error.message });
  }
});

// ============ USER ROUTES ============
app.get('/api/users/profile', authMiddleware, (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, email, name, avatar, bio, role FROM users WHERE id = ?');
    const user = stmt.get(req.user.id);
    
    if (!user) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }
    
    res.json({ status: 200, message: 'Success', data: user });
  } catch (error) {
    res.status(400).json({ status: 400, message: error.message });
  }
});

app.put('/api/users/profile', authMiddleware, (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    
    const stmt = db.prepare('UPDATE users SET name = COALESCE(?, name), bio = COALESCE(?, bio), avatar = COALESCE(?, avatar) WHERE id = ?');
    stmt.run(name || null, bio || null, avatar || null, req.user.id);
    
    // Broadcast profile update
    io.emit('user:profileUpdated', { userId: req.user.id, name, bio, avatar });
    
    res.json({
      status: 200,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(400).json({ status: 400, message: error.message });
  }
});

// ============ ANNOUNCEMENTS ROUTES ============
app.get('/api/announcements/:courseId', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM announcements WHERE course_id = ? ORDER BY created_at DESC');
    const announcements = stmt.all(req.params.courseId);
    
    res.json({ status: 200, message: 'Success', data: announcements });
  } catch (error) {
    res.status(400).json({ status: 400, message: error.message });
  }
});

app.post('/api/announcements', authMiddleware, (req, res) => {
  try {
    const { courseId, title, message } = req.body;
    const announcementId = uuidv4();
    
    const stmt = db.prepare(`
      INSERT INTO announcements (id, course_id, title, message, created_by)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(announcementId, courseId, title, message, req.user.id);
    
    const announcement = {
      id: announcementId,
      courseId,
      title,
      message,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };
    
    // Broadcast announcement to all users in course
    io.emit(`announcement:${courseId}`, announcement);
    
    res.status(201).json({
      status: 201,
      message: 'Announcement created',
      data: announcement
    });
  } catch (error) {
    res.status(400).json({ status: 400, message: error.message });
  }
});

// ============ SOCKET.IO REAL-TIME EVENTS ============
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // User joins a course room
  socket.on('course:join', (courseId) => {
    socket.join(`course:${courseId}`);
    console.log(`User ${socket.id} joined course ${courseId}`);
    
    // Notify others
    io.to(`course:${courseId}`).emit('course:userJoined', {
      userId: socket.id,
      courseId,
      timestamp: new Date().toISOString()
    });
  });
  
  // User leaves a course room
  socket.on('course:leave', (courseId) => {
    socket.leave(`course:${courseId}`);
    io.to(`course:${courseId}`).emit('course:userLeft', {
      userId: socket.id,
      courseId,
      timestamp: new Date().toISOString()
    });
  });
  
  // Real-time lesson update
  socket.on('lesson:update', (data) => {
    io.to(`course:${data.courseId}`).emit('lesson:updated', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });
  
  // Real-time progress update
  socket.on('progress:update', (data) => {
    io.to(`course:${data.courseId}`).emit('progress:changed', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });
  
  // Live chat (optional)
  socket.on('chat:message', (data) => {
    io.to(`course:${data.courseId}`).emit('chat:newMessage', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ status: 500, message: 'Internal server error', error: err.message });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ status: 404, message: 'Route not found' });
});

// ============ SERVER STARTUP ============
initializeDatabase();

httpServer.listen(PORT, () => {
  console.log(`🚀 LMS Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 WebSocket ready for real-time updates`);
});

export { app, io };
```

---

## Installation Instructions

1. Create the `backend/src` folder structure
2. Copy this code into `backend/src/server.js`
3. Run `npm install` in backend folder
4. Run `npm run dev` to start the server

The backend will automatically:
- Create SQLite database
- Initialize all tables
- Start WebSocket server
- Accept API requests
- Broadcast real-time events

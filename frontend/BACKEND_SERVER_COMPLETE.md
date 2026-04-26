import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database initialization
let db;

async function initializeDatabase() {
  try {
    db = await open({
      filename: process.env.DB_PATH || './data/lms.db',
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT,
        lastName TEXT,
        profilePicture TEXT,
        role TEXT DEFAULT 'student',
        status TEXT DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        instructor TEXT NOT NULL,
        category TEXT,
        level TEXT,
        thumbnail TEXT,
        status TEXT DEFAULT 'published',
        enrollmentCount INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enrollments (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        courseId TEXT NOT NULL,
        enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        completionPercentage INTEGER DEFAULT 0,
        FOREIGN KEY(userId) REFERENCES users(id),
        FOREIGN KEY(courseId) REFERENCES courses(id)
      );

      CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY,
        courseId TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        videoUrl TEXT,
        duration INTEGER,
        sequence INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(courseId) REFERENCES courses(id)
      );

      CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        courseId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        dueDate DATETIME,
        totalPoints INTEGER DEFAULT 100,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(courseId) REFERENCES courses(id)
      );

      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        assignmentId TEXT NOT NULL,
        userId TEXT NOT NULL,
        content TEXT,
        submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        grade INTEGER,
        feedback TEXT,
        FOREIGN KEY(assignmentId) REFERENCES assignments(id),
        FOREIGN KEY(userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS progress (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        courseId TEXT NOT NULL,
        lessonId TEXT,
        status TEXT,
        completedAt DATETIME,
        FOREIGN KEY(userId) REFERENCES users(id),
        FOREIGN KEY(courseId) REFERENCES courses(id)
      );

      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        courseId TEXT NOT NULL,
        title TEXT NOT NULL,
        totalQuestions INTEGER DEFAULT 0,
        passingScore INTEGER DEFAULT 70,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(courseId) REFERENCES courses(id)
      );

      CREATE TABLE IF NOT EXISTS quizAnswers (
        id TEXT PRIMARY KEY,
        quizId TEXT NOT NULL,
        userId TEXT NOT NULL,
        score INTEGER,
        submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(quizId) REFERENCES quizzes(id),
        FOREIGN KEY(userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY,
        courseId TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        createdBy TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(courseId) REFERENCES courses(id),
        FOREIGN KEY(createdBy) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expiresAt DATETIME NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id)
      );
    `);

    console.log('✅ Database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// JWT helper functions
function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
  } catch (error) {
    return null;
  }
}

// Middleware for authentication
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = decoded;
  next();
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'LMS Backend running',
    timestamp: new Date().toISOString()
  });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const userId = uuidv4();

    await db.run(
      'INSERT INTO users (id, email, username, password, firstName, lastName) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, email, username, hashedPassword, firstName || '', lastName || '']
    );

    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      user: { id: userId, email, username, firstName, lastName },
      token
    });

    io.emit('user:registered', {
      userId,
      username,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcryptjs.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    });

    io.emit('user:login', {
      userId: user.id,
      username: user.username,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// User Routes
app.get('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, profilePicture } = req.body;
    const userId = req.user.userId;

    await db.run(
      'UPDATE users SET firstName = ?, lastName = ?, profilePicture = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [firstName, lastName, profilePicture, userId]
    );

    const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    res.json(updatedUser);

    io.emit('user:updated', updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Course Routes
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await db.all('SELECT * FROM courses ORDER BY createdAt DESC');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/courses', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, level, thumbnail } = req.body;
    const courseId = uuidv4();

    await db.run(
      'INSERT INTO courses (id, title, description, instructor, category, level, thumbnail) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [courseId, title, description, req.user.userId, category, level, thumbnail]
    );

    const course = await db.get('SELECT * FROM courses WHERE id = ?', [courseId]);
    res.status(201).json(course);

    io.emit('course:created', course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/courses/:courseId', async (req, res) => {
  try {
    const course = await db.get('SELECT * FROM courses WHERE id = ?', [req.params.courseId]);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enrollment Routes
app.post('/api/enrollments', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.userId;
    const enrollmentId = uuidv4();

    const existing = await db.get(
      'SELECT * FROM enrollments WHERE userId = ? AND courseId = ?',
      [userId, courseId]
    );

    if (existing) {
      return res.status(400).json({ error: 'Already enrolled' });
    }

    await db.run(
      'INSERT INTO enrollments (id, userId, courseId) VALUES (?, ?, ?)',
      [enrollmentId, userId, courseId]
    );

    await db.run(
      'UPDATE courses SET enrollmentCount = enrollmentCount + 1 WHERE id = ?',
      [courseId]
    );

    const enrollment = await db.get('SELECT * FROM enrollments WHERE id = ?', [enrollmentId]);
    res.status(201).json(enrollment);

    io.emit('enrollment:created', {
      enrollmentId,
      userId,
      courseId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/enrollments', authMiddleware, async (req, res) => {
  try {
    const enrollments = await db.all(
      'SELECT * FROM enrollments WHERE userId = ?',
      [req.user.userId]
    );
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Progress Routes
app.post('/api/progress', authMiddleware, async (req, res) => {
  try {
    const { courseId, lessonId, status } = req.body;
    const userId = req.user.userId;
    const progressId = uuidv4();

    await db.run(
      'INSERT INTO progress (id, userId, courseId, lessonId, status, completedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [progressId, userId, courseId, lessonId, status]
    );

    const progress = await db.get('SELECT * FROM progress WHERE id = ?', [progressId]);
    res.status(201).json(progress);

    io.emit('progress:updated', progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/progress/:courseId', authMiddleware, async (req, res) => {
  try {
    const progress = await db.all(
      'SELECT * FROM progress WHERE userId = ? AND courseId = ?',
      [req.user.userId, req.params.courseId]
    );
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lesson Routes
app.post('/api/courses/:courseId/lessons', authMiddleware, async (req, res) => {
  try {
    const { title, content, videoUrl, duration, sequence } = req.body;
    const lessonId = uuidv4();

    await db.run(
      'INSERT INTO lessons (id, courseId, title, content, videoUrl, duration, sequence) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [lessonId, req.params.courseId, title, content, videoUrl, duration, sequence]
    );

    const lesson = await db.get('SELECT * FROM lessons WHERE id = ?', [lessonId]);
    res.status(201).json(lesson);

    io.emit('lesson:created', lesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/courses/:courseId/lessons', async (req, res) => {
  try {
    const lessons = await db.all(
      'SELECT * FROM lessons WHERE courseId = ? ORDER BY sequence',
      [req.params.courseId]
    );
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Announcement Routes
app.post('/api/announcements', authMiddleware, async (req, res) => {
  try {
    const { courseId, title, content } = req.body;
    const announcementId = uuidv4();

    await db.run(
      'INSERT INTO announcements (id, courseId, title, content, createdBy) VALUES (?, ?, ?, ?, ?)',
      [announcementId, courseId, title, content, req.user.userId]
    );

    const announcement = await db.get('SELECT * FROM announcements WHERE id = ?', [announcementId]);
    res.status(201).json(announcement);

    io.emit('announcement:created', announcement);
    io.to(`course:${courseId}`).emit('course:announcement', announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/courses/:courseId/announcements', async (req, res) => {
  try {
    const announcements = await db.all(
      'SELECT * FROM announcements WHERE courseId = ? ORDER BY createdAt DESC',
      [req.params.courseId]
    );
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket/Socket.IO Events
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  socket.on('user:join', (data) => {
    console.log(`✅ User joined: ${data.userId}`);
    socket.join(`user:${data.userId}`);
    socket.join(`course:${data.courseId}`);
    io.emit('user:online', { userId: data.userId, timestamp: new Date().toISOString() });
  });

  socket.on('course:subscribe', (courseId) => {
    socket.join(`course:${courseId}`);
    console.log(`📚 Subscribed to course: ${courseId}`);
  });

  socket.on('course:unsubscribe', (courseId) => {
    socket.leave(`course:${courseId}`);
    console.log(`📚 Unsubscribed from course: ${courseId}`);
  });

  socket.on('lesson:started', (data) => {
    io.emit('lesson:started', {
      userId: data.userId,
      lessonId: data.lessonId,
      courseId: data.courseId,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('lesson:completed', (data) => {
    io.emit('lesson:completed', {
      userId: data.userId,
      lessonId: data.lessonId,
      courseId: data.courseId,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('message', (data) => {
    io.emit('message', {
      userId: data.userId,
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log(`👋 User disconnected: ${socket.id}`);
    io.emit('user:offline', { socketId: socket.id, timestamp: new Date().toISOString() });
  });

  socket.on('error', (error) => {
    console.error(`❌ Socket error: ${error}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initializeDatabase();
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 LMS Backend running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔌 WebSocket ready for real-time updates\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;

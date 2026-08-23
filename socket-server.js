// socket-server.js — Standalone Persistent Socket.IO Server
// Deployable to Render, Railway, Fly.io, Heroku, AWS ECS, or VPS.
// Does NOT depend on Next.js bundling and can run 24/7 independently.

import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import os from "os";

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

const PORT = parseInt(process.env.PORT || process.env.SOCKET_PORT || "3001", 10);
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Parse configured allowed origins
const configuredOrigins = [
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_APP_URL,
]
  .filter(Boolean)
  .flatMap((url) => url.split(",").map((s) => s.trim().replace(/\/$/, "")));

function isOriginAllowed(origin) {
  if (!origin) return true; // Allow non-browser clients / health checks

  // Check localhost / local IP
  const isLocal =
    origin.startsWith("http://localhost:") ||
    origin.startsWith("https://localhost:") ||
    origin.startsWith("http://127.0.0.1:") ||
    origin.startsWith("https://127.0.0.1:");
  if (isLocal) return true;

  // Check LAN networks
  const isLan =
    origin.startsWith("http://192.168.") ||
    origin.startsWith("http://10.") ||
    origin.startsWith("http://172.");
  if (isLan) return true;

  // Check Vercel deployments (*.vercel.app)
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith(".vercel.app")) {
      return true;
    }
  } catch {
    // ignore URL parsing error
  }

  // Check explicitly configured origins
  if (configuredOrigins.includes(origin)) {
    return true;
  }

  // If wildcards or permissive env set
  if (process.env.ALLOW_ALL_ORIGINS === "true") {
    return true;
  }

  return false;
}

// ── Online user tracking (userId -> connectionCount)
const onlineUsers = new Map();

// ── Event definitions
const EVENTS = {
  COURSE_CREATED: "courseCreated",
  COURSE_UPDATED: "courseUpdated",
  COURSE_DELETED: "courseDeleted",
  STUDENT_JOINED: "studentJoined",
  STUDENT_PROGRESS_UPDATED: "studentProgressUpdated",
  ATTENDANCE_MARKED: "attendanceMarked",
  QUIZ_CREATED: "quizCreated",
  QUIZ_SUBMITTED: "quizSubmitted",
  ASSIGNMENT_CREATED: "assignmentCreated",
  ASSIGNMENT_SUBMITTED: "assignmentSubmitted",
  ASSIGNMENT_GRADED: "assignmentGraded",
  USER_REGISTERED: "userRegistered",
  COURSE_ENROLLED: "courseEnrolled",
  ANALYTICS_UPDATED: "analyticsUpdated",
  USER_ONLINE: "user-online",
  USER_OFFLINE: "user-offline",
  ONLINE_USERS_LIST: "online-users-list",
  NEW_MESSAGE: "new-message",
  MESSAGE_SENT: "message-sent",
  TYPING: "typing",
  STOP_TYPING: "stop-typing",
  AI_TYPING: "ai-typing",
  AI_STOP_TYPING: "ai-stop-typing",
  AI_WORD: "ai-word",
  AI_MESSAGE_COMPLETE: "ai-message-complete",
  AI_CHAT_ERROR: "ai-chat-error",
};

// ── HTTP Server (handles health checks for Render/Railway/Fly.io)
const httpServer = createServer((req, res) => {
  // Add CORS headers for HTTP health/info endpoint
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "LMS Pro Standalone Socket.IO Server",
        onlineUsersCount: onlineUsers.size,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      })
    );
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

// ── Socket.IO Server Initialization
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.warn(`[Socket CORS] Origin blocked: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 20000,
});

// ── JWT Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    console.error("[Socket Auth] Invalid token:", err.message);
    next(new Error("Invalid or expired authentication token"));
  }
});

// ── Connection Handler
io.on("connection", (socket) => {
  const userId = socket.userId;
  const userRole = socket.userRole || "student";
  console.log(`[Socket] User connected: ${userId} (${userRole}) [Socket ID: ${socket.id}]`);

  // Track active connection count per user for multi-tab support
  const currentCount = onlineUsers.get(userId) || 0;
  onlineUsers.set(userId, currentCount + 1);

  // If this is the user's first tab/connection, broadcast user-online
  if (currentCount === 0) {
    io.emit(EVENTS.USER_ONLINE, { userId });
  }

  // Send initial list of all online user IDs to the connected client
  socket.emit(EVENTS.ONLINE_USERS_LIST, Array.from(onlineUsers.keys()));

  // Join role and user-specific rooms
  socket.join(`room:${userRole}`);
  socket.join(`room:user:${userId}`);

  // ── Direct Messaging (Multi-device safe)
  socket.on("send-message", async ({ recipientId, content, messageType }) => {
    try {
      if (!recipientId || !content) return;

      const messagePayload = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderId: userId,
        recipientId,
        content,
        messageType: messageType || "text",
        createdAt: new Date().toISOString(),
      };

      // Broadcast to all active sessions of the recipient via room
      io.to(`room:user:${recipientId}`).emit(EVENTS.NEW_MESSAGE, messagePayload);

      // Confirm delivery back to all sender's devices
      io.to(`room:user:${userId}`).emit(EVENTS.MESSAGE_SENT, messagePayload);
    } catch (err) {
      console.error("[Socket] send-message error:", err);
    }
  });

  // ── Typing Indicators (Multi-device safe)
  socket.on("typing", ({ recipientId }) => {
    if (recipientId) {
      io.to(`room:user:${recipientId}`).emit(EVENTS.TYPING, { senderId: userId });
    }
  });

  socket.on("stop-typing", ({ recipientId }) => {
    if (recipientId) {
      io.to(`room:user:${recipientId}`).emit(EVENTS.STOP_TYPING, { senderId: userId });
    }
  });

  // ── AI Chat Streaming
  socket.on("send-ai-message", async ({ chatId, prompt }) => {
    try {
      socket.emit(EVENTS.AI_TYPING);

      // Simulated stream or OpenAI streaming fallback
      const mockResponse = `I received your inquiry regarding "${prompt}". Here is a structured explanation to assist your learning journey...`;
      const words = mockResponse.split(" ");
      let delay = 0;

      for (const word of words) {
        setTimeout(() => {
          socket.emit(EVENTS.AI_WORD, { word: word + " " });
        }, delay);
        delay += 60;
      }

      setTimeout(() => {
        socket.emit(EVENTS.AI_STOP_TYPING);
        socket.emit(EVENTS.AI_MESSAGE_COMPLETE, {
          chatId,
          message: mockResponse,
        });
      }, delay + 100);
    } catch (err) {
      console.error("[Socket] AI chat error:", err);
      socket.emit(EVENTS.AI_STOP_TYPING);
      socket.emit(EVENTS.AI_CHAT_ERROR, { message: "AI processing failed" });
    }
  });

  // ── Disconnection Handler
  socket.on("disconnect", () => {
    const remaining = (onlineUsers.get(userId) || 1) - 1;
    if (remaining <= 0) {
      onlineUsers.delete(userId);
      io.emit(EVENTS.USER_OFFLINE, { userId });
      console.log(`[Socket] User fully offline: ${userId}`);
    } else {
      onlineUsers.set(userId, remaining);
      console.log(`[Socket] User closed one tab/session: ${userId} (${remaining} remaining)`);
    }
  });
});

// ── Start listening
httpServer.listen(PORT, "0.0.0.0", () => {
  const localIp = getLocalIpAddress();
  console.log(`\n======================================================`);
  console.log(`🔌 LMS Pro Persistent Socket.IO Server is LIVE`);
  console.log(`   - Port:     ${PORT}`);
  console.log(`   - Local:    http://localhost:${PORT}`);
  if (localIp) {
    console.log(`   - Network:  http://${localIp}:${PORT}`);
  }
  console.log(`   - Health:   http://localhost:${PORT}/health`);
  console.log(`======================================================\n`);
});

// ── Graceful Shutdown
function handleShutdown(signal) {
  console.log(`\n[Socket Server] Received ${signal}. Closing server gracefully...`);
  io.close(() => {
    httpServer.close(() => {
      console.log("[Socket Server] All connections closed. Exiting.");
      process.exit(0);
    });
  });
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

export { io, httpServer };


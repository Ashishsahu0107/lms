// server.js — Custom Node.js HTTP server wrapping Next.js with integrated Socket.io
// Used for unified local development, Docker containers, and VPS deployments.
import { createServer } from "http";
import { parse } from "url";
import next from "next";
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

const dev = process.env.NODE_ENV !== "production";
const hostArgIndex = process.argv.findIndex(arg => arg === "--host" || arg === "-H");
const hostname = (hostArgIndex !== -1 && process.argv[hostArgIndex + 1] && !process.argv[hostArgIndex + 1].startsWith("-"))
  ? process.argv[hostArgIndex + 1]
  : (process.env.HOSTNAME || "0.0.0.0");
const port = parseInt(process.env.PORT || "3000", 10);
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// ── Online user tracking (userId -> connectionCount)
const onlineUsers = new Map();

// ── EVENTS
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

// Parse configured allowed origins
const configuredOrigins = [
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NEXT_PUBLIC_SOCKET_URL,
]
  .filter(Boolean)
  .flatMap((url) => url.split(",").map((s) => s.trim().replace(/\/$/, "")));

function isOriginAllowed(origin) {
  if (!origin) return true;

  const isLocal =
    origin.startsWith("http://localhost:") ||
    origin.startsWith("https://localhost:") ||
    origin.startsWith("http://127.0.0.1:") ||
    origin.startsWith("https://127.0.0.1:");
  if (isLocal) return true;

  const isLan =
    origin.startsWith("http://192.168.") ||
    origin.startsWith("http://10.") ||
    origin.startsWith("http://172.");
  if (isLan) return true;

  try {
    const url = new URL(origin);
    if (url.hostname.endsWith(".vercel.app")) {
      return true;
    }
  } catch {
    // ignore URL parsing error
  }

  if (configuredOrigins.includes(origin) || process.env.ALLOW_ALL_ORIGINS === "true") {
    return true;
  }

  return false;
}

let ioInstance = null;

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  });

  // ── Socket.io Server
  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // ── JWT Auth Middleware for Socket
  ioInstance.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  ioInstance.on("connection", (socket) => {
    const userId = socket.userId;
    const userRole = socket.userRole || "student";
    console.log(`[Socket] User connected: ${userId} (${userRole})`);

    // Track online status with multi-tab support
    const count = onlineUsers.get(userId) || 0;
    onlineUsers.set(userId, count + 1);

    if (count === 0) {
      ioInstance.emit(EVENTS.USER_ONLINE, { userId });
    }

    // Send initial list of online user IDs
    socket.emit(EVENTS.ONLINE_USERS_LIST, Array.from(onlineUsers.keys()));

    // Join role-based rooms
    socket.join(`room:${userRole}`);
    socket.join(`room:user:${userId}`);

    // ── Messaging (Multi-device room delivery)
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

        ioInstance
          .to(`room:user:${recipientId}`)
          .emit(EVENTS.NEW_MESSAGE, messagePayload);

        ioInstance
          .to(`room:user:${userId}`)
          .emit(EVENTS.MESSAGE_SENT, messagePayload);
      } catch (err) {
        console.error("[Socket] send-message error:", err);
      }
    });

    // ── Typing indicators
    socket.on("typing", ({ recipientId }) => {
      if (recipientId) {
        ioInstance
          .to(`room:user:${recipientId}`)
          .emit(EVENTS.TYPING, { senderId: userId });
      }
    });

    socket.on("stop-typing", ({ recipientId }) => {
      if (recipientId) {
        ioInstance
          .to(`room:user:${recipientId}`)
          .emit(EVENTS.STOP_TYPING, { senderId: userId });
      }
    });

    // ── AI Chat Streaming
    socket.on("send-ai-message", async ({ chatId, prompt }) => {
      try {
        socket.emit(EVENTS.AI_TYPING);

        const mockWords =
          `I understand your question about "${prompt}". Let me explain this concept step by step...`.split(
            " ",
          );
        let delay = 0;
        for (const word of mockWords) {
          setTimeout(() => {
            socket.emit(EVENTS.AI_WORD, { word: word + " " });
          }, delay);
          delay += 70;
        }

        setTimeout(() => {
          socket.emit(EVENTS.AI_STOP_TYPING);
          socket.emit(EVENTS.AI_MESSAGE_COMPLETE, {
            chatId,
            message: `AI response to: "${prompt}"`,
          });
        }, delay + 50);
      } catch (err) {
        console.error("[Socket] AI chat error:", err);
        socket.emit(EVENTS.AI_STOP_TYPING);
        socket.emit(EVENTS.AI_CHAT_ERROR, { message: "AI processing failed" });
      }
    });

    // ── Disconnect
    socket.on("disconnect", () => {
      const remaining = (onlineUsers.get(userId) || 1) - 1;
      if (remaining <= 0) {
        onlineUsers.delete(userId);
        ioInstance.emit(EVENTS.USER_OFFLINE, { userId });
        console.log(`[Socket] User disconnected: ${userId}`);
      } else {
        onlineUsers.set(userId, remaining);
      }
    });
  });

  // Export io instance for use in API routes
  global.io = ioInstance;

  httpServer.listen(port, hostname, () => {
    const localIp = getLocalIpAddress();
    console.log(`\n🚀 LMS Pro running at:`);
    console.log(`   - Local:   http://localhost:${port}`);
    if (localIp) {
      console.log(`   - Network: http://${localIp}:${port}`);
    }
    console.log(`\n📚 Swagger UI:`);
    console.log(`   - Local:   http://localhost:${port}/api-docs`);
    if (localIp) {
      console.log(`   - Network: http://${localIp}:${port}/api-docs`);
    }
    console.log(`\n🔌 Socket.io: ready`);
    console.log(`🗄️  Database: PostgreSQL (Prisma)`);
    console.log(`Mode: ${dev ? "development" : "production"}\n`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log("\nShutting down unified server...");
    httpServer.close(() => {
      process.exit(0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
});

export { ioInstance };

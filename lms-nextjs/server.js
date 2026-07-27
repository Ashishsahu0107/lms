// server.js — Custom Node.js HTTP server wrapping Next.js
// Required for Socket.io (which needs a persistent HTTP server, not serverless)
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// ── Online user tracking
const onlineUsers = new Map(); // userId -> socketId

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
        if (!origin) return callback(null, true);
        const isLocal =
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:");
        if (isLocal || origin === process.env.NEXT_PUBLIC_SOCKET_URL) {
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  ioInstance.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] User connected: ${userId}`);

    // Track online status
    onlineUsers.set(userId, socket.id);
    ioInstance.emit(EVENTS.USER_ONLINE, { userId });

    // Join role-based rooms
    socket.join(`room:${socket.userRole}`);
    socket.join(`room:user:${userId}`);

    // ── Messaging
    socket.on("send-message", async ({ recipientId, content, messageType }) => {
      try {
        // Emit to recipient if online
        const recipientSocketId = onlineUsers.get(recipientId);
        const messagePayload = {
          senderId: userId,
          recipientId,
          content,
          messageType: messageType || "text",
          createdAt: new Date().toISOString(),
        };

        if (recipientSocketId) {
          ioInstance.to(recipientSocketId).emit(EVENTS.NEW_MESSAGE, messagePayload);
        }
        socket.emit(EVENTS.MESSAGE_SENT, messagePayload);
      } catch (err) {
        console.error("[Socket] send-message error:", err);
      }
    });

    // ── Typing indicators
    socket.on("typing", ({ recipientId }) => {
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        ioInstance.to(recipientSocketId).emit(EVENTS.TYPING, { senderId: userId });
      }
    });

    socket.on("stop-typing", ({ recipientId }) => {
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        ioInstance.to(recipientSocketId).emit(EVENTS.STOP_TYPING, { senderId: userId });
      }
    });

    // ── AI Chat Streaming
    socket.on("send-ai-message", async ({ chatId, prompt }) => {
      try {
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
          socket.emit(EVENTS.AI_CHAT_ERROR, { message: "AI service is not configured" });
          return;
        }

        socket.emit(EVENTS.AI_TYPING);

        // Simulate streaming (replace with real OpenAI streaming)
        const mockWords = `I understand your question about "${prompt}". Let me explain this concept step by step...`.split(" ");
        let delay = 0;
        for (const word of mockWords) {
          setTimeout(() => {
            socket.emit(EVENTS.AI_WORD, { word: word + " " });
          }, delay);
          delay += 80;
        }

        setTimeout(() => {
          socket.emit(EVENTS.AI_STOP_TYPING);
          socket.emit(EVENTS.AI_MESSAGE_COMPLETE, {
            chatId,
            message: `AI response to: "${prompt}"`,
          });
        }, delay);
      } catch (err) {
        console.error("[Socket] AI chat error:", err);
        socket.emit(EVENTS.AI_CHAT_ERROR, { message: "AI processing failed" });
      }
    });

    // ── Disconnect
    socket.on("disconnect", () => {
      console.log(`[Socket] User disconnected: ${userId}`);
      onlineUsers.delete(userId);
      ioInstance.emit(EVENTS.USER_OFFLINE, { userId });
    });
  });

  // Export io instance for use in API routes
  global.io = ioInstance;

  httpServer.listen(port, hostname, () => {
    console.log(`\n🚀 LMS Pro running at http://localhost:${port}`);
    console.log(`📚 Swagger UI: http://localhost:${port}/api-docs`);
    console.log(`🔌 Socket.io: ready`);
    console.log(`🗄️  Database: PostgreSQL (Prisma)`);
    console.log(`Mode: ${dev ? "development" : "production"}\n`);
  });
});

export { ioInstance };

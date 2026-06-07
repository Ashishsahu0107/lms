import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

let ioInstance = null;

// ─────────────────────────────────────────────────────────────
// ROOM CONSTANTS  (single source of truth — import in controllers)
// ─────────────────────────────────────────────────────────────
export const ROOMS = {
  ADMIN_DASHBOARD: "room:admin:dashboard",
  TEACHER_DASHBOARD: "room:teacher:dashboard",
  course: (id) => `room:course:${id}`,
  teacher: (id) => `room:teacher:${id}`,
  student: (id) => `room:student:${id}`,
};

// ─────────────────────────────────────────────────────────────
// EVENT CONSTANTS  (emit + listen with same string)
// ─────────────────────────────────────────────────────────────
export const EVENTS = {
  // Course lifecycle
  COURSE_CREATED: "courseCreated",
  COURSE_UPDATED: "courseUpdated",
  COURSE_DELETED: "courseDeleted",

  // Enrollment / Student
  STUDENT_JOINED: "studentJoined",
  STUDENT_PROGRESS_UPDATED: "studentProgressUpdated",

  // Attendance
  ATTENDANCE_MARKED: "attendanceMarked",

  // Assessments
  QUIZ_SUBMITTED: "quizSubmitted",
  ASSIGNMENT_SUBMITTED: "assignmentSubmitted",

  // Payment / Revenue
  PAYMENT_COMPLETED: "paymentCompleted",

  // Users
  USER_REGISTERED: "userRegistered",

  // Presence
  USER_ONLINE: "user-online",
  USER_OFFLINE: "user-offline",

  // Messaging
  NEW_MESSAGE: "new-message",
  MESSAGE_SENT: "message-sent",

  // AI Chat (streaming)
  AI_TYPING: "ai-typing",
  AI_STOP_TYPING: "ai-stop-typing",
  AI_WORD: "ai-word",
  AI_MESSAGE_SAVED: "ai-message-saved",
  AI_MESSAGE_COMPLETE: "ai-message-complete",
  AI_CHAT_ERROR: "ai-chat-error",
};

// ─────────────────────────────────────────────────────────────
// SOCKET SERVER INITIALISATION
// ─────────────────────────────────────────────────────────────
export function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isLocal =
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:") ||
          /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):/i.test(
            origin,
          );
        if (
          isLocal ||
          [
            env.CORS_ORIGIN,
            "http://localhost:5173",
            "http://127.0.0.1:5173",
          ].includes(origin)
        ) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ── JWT Auth Middleware ──────────────────────────────────────
  ioInstance.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication token missing"));
      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  // ── Connection Handler ───────────────────────────────────────
  ioInstance.on("connection", (socket) => {
    const userId = socket.user?.userId;
    const role = socket.user?.role;

    console.log(`[Socket] Connected — userId=${userId} role=${role}`);

    // ── Join role-based rooms ──────────────────────────────────
    socket.join(ROOMS.student(userId)); // every user gets a personal room
    socket.join(ROOMS.teacher(userId)); // teachers/admins also have personal room

    if (role === "teacher" || role === "super_admin" || role === "admin") {
      socket.join(ROOMS.TEACHER_DASHBOARD);
      console.log(
        `[Socket] Teacher/Admin joined teacher:dashboard — ${userId}`,
      );
    }

    if (role === "super_admin" || role === "admin") {
      socket.join(ROOMS.ADMIN_DASHBOARD);
      console.log(`[Socket] Admin joined admin:dashboard — ${userId}`);
    }

    // Broadcast presence
    socket.broadcast.emit(EVENTS.USER_ONLINE, { userId, role });

    // ── Course Room Subscriptions (client requests to join a course room)
    socket.on("join-course", (courseId) => {
      if (!courseId) return;
      socket.join(ROOMS.course(courseId));
      console.log(`[Socket] ${userId} joined course room: ${courseId}`);
    });

    socket.on("leave-course", (courseId) => {
      if (!courseId) return;
      socket.leave(ROOMS.course(courseId));
    });

    // ── Relay: Teacher real-time analytics relay events ─────────
    // These are emitted BY the backend server itself (via getIO().emit/to().emit)
    // but also may come FROM trusted teacher clients in some edge-cases:
    const teacherRelayEvents = [
      "progressUpdated",
      "topicCompleted",
      EVENTS.QUIZ_SUBMITTED,
      "attendanceUpdated",
      EVENTS.STUDENT_JOINED,
      "studentAbsent",
      EVENTS.PAYMENT_COMPLETED,
      "revenueUpdated",
      "payoutProcessed",
    ];

    teacherRelayEvents.forEach((event) => {
      socket.on(event, (data) => {
        ioInstance.to(ROOMS.TEACHER_DASHBOARD).emit(event, data);
      });
    });

    // ── Direct Messaging ────────────────────────────────────────
    socket.on("newMessage", (data) => {
      if (data.recipientId) {
        ioInstance
          .to(ROOMS.student(data.recipientId))
          .emit(EVENTS.NEW_MESSAGE, data);
        ioInstance.to(ROOMS.student(data.recipientId)).emit("newMessage", data);
      }
    });

    socket.on("newNotification", (data) => {
      if (data.userId) {
        ioInstance.to(ROOMS.student(data.userId)).emit("newNotification", data);
      } else {
        ioInstance.emit("newNotification", data);
      }
    });

    socket.on("send-message", async (data) => {
      try {
        const { recipientId, content, attachments = [] } = data;
        const payload = {
          senderId: userId,
          recipientId,
          content,
          attachments,
          createdAt: new Date(),
        };
        ioInstance
          .to(ROOMS.student(recipientId))
          .emit(EVENTS.NEW_MESSAGE, payload);
        socket.emit(EVENTS.MESSAGE_SENT, payload);
      } catch {
        socket.emit("socket-error", { message: "Failed to send message" });
      }
    });

    // ── AI Chat Streaming ────────────────────────────────────────
    socket.on("send-ai-message", async (data) => {
      try {
        const { chatId, content } = data;
        if (!chatId || !content) {
          socket.emit(EVENTS.AI_CHAT_ERROR, {
            message: "Chat ID and content are required",
          });
          return;
        }

        const { AIChat } = await import("../models/AIChat.js");
        const { User } = await import("../models/User.js");
        const { streamAIResponse } =
          await import("../services/aiChat.service.js");

        const chat = await AIChat.findOne({ _id: chatId, user: userId });
        if (!chat) {
          socket.emit(EVENTS.AI_CHAT_ERROR, {
            message: "AI conversation thread not found",
          });
          return;
        }

        const userRecord = await User.findById(userId);

        const userMessage = {
          sender: "user",
          content: content.trim(),
          role: "user",
          timestamp: new Date(),
        };
        chat.messages.push(userMessage);

        if (chat.messages.length === 1 || chat.title === "New Conversation") {
          const firstWords = content.trim().split(" ").slice(0, 4).join(" ");
          chat.title = firstWords ? `${firstWords}...` : "AI Study Chat";
        }

        await chat.save();

        socket.emit(EVENTS.AI_MESSAGE_SAVED, {
          chatId,
          message: chat.messages[chat.messages.length - 1],
        });

        socket.emit(EVENTS.AI_TYPING, { chatId });

        await streamAIResponse(
          content,
          userRecord,
          (word) => socket.emit(EVENTS.AI_WORD, { word, chatId }),
          async (completeReply) => {
            socket.emit(EVENTS.AI_STOP_TYPING, { chatId });

            const aiMessage = {
              sender: "ai",
              content: completeReply,
              role: "assistant",
              timestamp: new Date(),
            };

            const updatedChat = await AIChat.findOne({
              _id: chatId,
              user: userId,
            });
            if (updatedChat) {
              updatedChat.messages.push(aiMessage);
              await updatedChat.save();
              socket.emit(EVENTS.AI_MESSAGE_COMPLETE, {
                chatId,
                message: updatedChat.messages[updatedChat.messages.length - 1],
              });
            }
          },
        );
      } catch (err) {
        console.error("[Socket] AI chat error:", err);
        socket.emit(EVENTS.AI_CHAT_ERROR, {
          message: "An error occurred in the AI communication stream",
        });
      }
    });

    // ── Disconnect ───────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected — userId=${userId}`);
      socket.broadcast.emit(EVENTS.USER_OFFLINE, { userId });
    });
  });

  return ioInstance;
}

// ── Singleton accessor — use in controllers ──────────────────
export function getIO() {
  if (!ioInstance)
    throw new Error("Socket.io not initialized — call initSocket first");
  return ioInstance;
}

// ─────────────────────────────────────────────────────────────
// TYPED EMIT HELPERS
// Import these in controllers instead of calling getIO() directly.
// They enforce the correct rooms and payloads for each event.
// ─────────────────────────────────────────────────────────────

/** Broadcast a new course to everyone */
export function emitCourseCreated(course) {
  getIO().emit(EVENTS.COURSE_CREATED, { course });
}

/** Broadcast course update to the course room + all connected clients */
export function emitCourseUpdated(course) {
  getIO()
    .to(ROOMS.course(course._id.toString()))
    .emit(EVENTS.COURSE_UPDATED, { course });
  getIO().emit(EVENTS.COURSE_UPDATED, { course });
}

/** Broadcast course deletion */
export function emitCourseDeleted(courseId, deletedBy) {
  getIO().to(ROOMS.course(courseId)).emit(EVENTS.COURSE_DELETED, { courseId });
  getIO().emit(EVENTS.COURSE_DELETED, { courseId, deletedBy });
}

/** Student enrolled — notify teacher + admin rooms */
export function emitStudentJoined(payload) {
  getIO().to(ROOMS.TEACHER_DASHBOARD).emit(EVENTS.STUDENT_JOINED, payload);
  getIO().to(ROOMS.ADMIN_DASHBOARD).emit(EVENTS.STUDENT_JOINED, payload);
}

/** Progress update — notify the student's personal room + teacher dashboard */
export function emitProgressUpdated(studentId, payload) {
  getIO()
    .to(ROOMS.student(studentId))
    .emit(EVENTS.STUDENT_PROGRESS_UPDATED, payload);
  getIO()
    .to(ROOMS.TEACHER_DASHBOARD)
    .emit(EVENTS.STUDENT_PROGRESS_UPDATED, payload);
}

/** Attendance marked — notify teacher dashboard + course room */
export function emitAttendanceMarked(courseId, payload) {
  getIO().to(ROOMS.TEACHER_DASHBOARD).emit(EVENTS.ATTENDANCE_MARKED, payload);
  getIO().to(ROOMS.course(courseId)).emit(EVENTS.ATTENDANCE_MARKED, payload);
}

/** Quiz submitted — notify teacher + the course room */
export function emitQuizSubmitted(courseId, teacherId, payload) {
  getIO().to(ROOMS.teacher(teacherId)).emit(EVENTS.QUIZ_SUBMITTED, payload);
  getIO().to(ROOMS.TEACHER_DASHBOARD).emit(EVENTS.QUIZ_SUBMITTED, payload);
  getIO().to(ROOMS.course(courseId)).emit(EVENTS.QUIZ_SUBMITTED, payload);
}

/** Assignment submitted — notify the submitting teacher directly */
export function emitAssignmentSubmitted(teacherId, payload) {
  getIO()
    .to(ROOMS.teacher(teacherId))
    .emit(EVENTS.ASSIGNMENT_SUBMITTED, payload);
  getIO()
    .to(ROOMS.TEACHER_DASHBOARD)
    .emit(EVENTS.ASSIGNMENT_SUBMITTED, payload);
}

/** Payment completed — notify admin + student */
export function emitPaymentCompleted(studentId, payload) {
  getIO().to(ROOMS.student(studentId)).emit(EVENTS.PAYMENT_COMPLETED, payload);
  getIO().to(ROOMS.ADMIN_DASHBOARD).emit(EVENTS.PAYMENT_COMPLETED, payload);
  getIO().to(ROOMS.TEACHER_DASHBOARD).emit(EVENTS.PAYMENT_COMPLETED, payload);
}

/** New user registration — admin dashboard */
export function emitUserRegistered(payload) {
  getIO().to(ROOMS.ADMIN_DASHBOARD).emit(EVENTS.USER_REGISTERED, payload);
}

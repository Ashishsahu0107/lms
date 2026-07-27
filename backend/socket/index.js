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
  QUIZ_CREATED: "quizCreated",
  QUIZ_UPDATED: "quizUpdated",
  QUIZ_PUBLISHED: "quizPublished",
  QUIZ_STARTED: "quizStarted",
  QUIZ_SUBMITTED: "quizSubmitted",
  ASSIGNMENT_CREATED: "assignmentCreated",
  ASSIGNMENT_SUBMITTED: "assignmentSubmitted",
  ASSIGNMENT_GRADED: "assignmentGraded",

  // Payment / Revenue
  PAYMENT_COMPLETED: "paymentCompleted",
  REVENUE_UPDATED: "revenueUpdated",

  // Users
  USER_REGISTERED: "userRegistered",
  COURSE_ENROLLED: "courseEnrolled",
  ANALYTICS_UPDATED: "analyticsUpdated",

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

// Active AI streaming generations tracker (maps socketId_chatId -> AbortController)
const activeGenerations = new Map();

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

    // Broadcast presence & Update DB
    (async () => {
      try {
        const { User } = await import("../models/User.js");
        await User.findByIdAndUpdate(userId, { isOnline: true });
        socket.broadcast.emit(EVENTS.USER_ONLINE, { userId, role });
        socket.broadcast.emit("userOnline", { userId, role });

        const { ChatGroup } = await import("../models/ChatGroup.js");
        const groups = await ChatGroup.find({ members: userId });
        for (const g of groups) {
          socket.join(`room:group:${g._id.toString()}`);
          console.log(`[Socket] User ${userId} joined group room: ${g._id}`);
        }
      } catch (err) {
        console.error("[Socket] Error in connection hooks:", err);
      }
    })();

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

    // ── Netflix Course Player Sockets ─────────────────────────────
    socket.on("lectureStarted", (data) => {
      if (data.courseId && data.topicId) {
        ioInstance.to(ROOMS.course(data.courseId)).emit("lectureStarted", {
          studentId: userId,
          courseId: data.courseId,
          topicId: data.topicId,
        });
      }
    });

    socket.on("lectureCompleted", (data) => {
      if (data.courseId && data.topicId) {
        ioInstance.to(ROOMS.course(data.courseId)).emit("lectureCompleted", {
          studentId: userId,
          courseId: data.courseId,
          topicId: data.topicId,
        });
      }
    });

    socket.on("progressUpdated", (data) => {
      if (data.courseId) {
        ioInstance.to(ROOMS.student(userId)).emit("progressUpdated", data);
      }
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
      const { recipientId, groupId } = data;
      if (groupId) {
        ioInstance.to(`room:group:${groupId}`).emit("messageReceived", data);
        ioInstance.to(`room:group:${groupId}`).emit("new-message", data);
        ioInstance.to(`room:group:${groupId}`).emit("newMessage", data);
      } else if (recipientId) {
        ioInstance.to(ROOMS.student(recipientId)).emit("messageReceived", data);
        ioInstance
          .to(ROOMS.student(recipientId))
          .emit(EVENTS.NEW_MESSAGE, data);
        ioInstance.to(ROOMS.student(recipientId)).emit("newMessage", data);
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
        const {
          recipientId,
          groupId,
          content,
          attachments = [],
          messageType = "text",
        } = data;
        const payload = {
          senderId: userId,
          recipientId,
          groupId,
          content,
          attachments,
          messageType,
          createdAt: new Date(),
        };
        if (groupId) {
          ioInstance
            .to(`room:group:${groupId}`)
            .emit("messageReceived", payload);
          ioInstance.to(`room:group:${groupId}`).emit("new-message", payload);
          ioInstance.to(`room:group:${groupId}`).emit("newMessage", payload);
        } else if (recipientId) {
          ioInstance
            .to(ROOMS.student(recipientId))
            .emit("messageReceived", payload);
          ioInstance
            .to(ROOMS.student(recipientId))
            .emit(EVENTS.NEW_MESSAGE, payload);
          ioInstance.to(ROOMS.student(recipientId)).emit("newMessage", payload);
        }
        socket.emit("messageSent", payload);
        socket.emit(EVENTS.MESSAGE_SENT, payload);
      } catch {
        socket.emit("socket-error", { message: "Failed to send message" });
      }
    });

    // ── Typing Indicators ────────────────────────────────────────
    socket.on("typing-start", (data) => {
      const { recipientId, groupId } = data;
      const payload = { userId, isTyping: true, groupId };
      if (groupId) {
        socket.to(`room:group:${groupId}`).emit("user-typing", payload);
        socket.to(`room:group:${groupId}`).emit("userTyping", payload);
      } else if (recipientId) {
        ioInstance.to(ROOMS.student(recipientId)).emit("user-typing", payload);
        ioInstance.to(ROOMS.student(recipientId)).emit("userTyping", payload);
      }
    });

    socket.on("typing-stop", (data) => {
      const { recipientId, groupId } = data;
      const payload = { userId, isTyping: false, groupId };
      if (groupId) {
        socket.to(`room:group:${groupId}`).emit("user-stop-typing", payload);
        socket.to(`room:group:${groupId}`).emit("userTyping", payload);
      } else if (recipientId) {
        ioInstance
          .to(ROOMS.student(recipientId))
          .emit("user-stop-typing", payload);
        ioInstance.to(ROOMS.student(recipientId)).emit("userTyping", payload);
      }
    });

    socket.on("userTyping", (data) => {
      const { recipientId, groupId, isTyping } = data;
      const payload = { userId, isTyping, groupId };
      if (groupId) {
        socket.to(`room:group:${groupId}`).emit("userTyping", payload);
        socket
          .to(`room:group:${groupId}`)
          .emit(isTyping ? "user-typing" : "user-stop-typing", payload);
      } else if (recipientId) {
        ioInstance.to(ROOMS.student(recipientId)).emit("userTyping", payload);
        ioInstance
          .to(ROOMS.student(recipientId))
          .emit(isTyping ? "user-typing" : "user-stop-typing", payload);
      }
    });

    // ── AI Chat Streaming ────────────────────────────────────────
    socket.on("send-ai-message", async (data) => {
      const { chatId, content } = data;
      if (!chatId || !content) {
        socket.emit(EVENTS.AI_CHAT_ERROR, {
          message: "Chat ID and content are required",
        });
        return;
      }

      const sessionKey = `${socket.id}_${chatId}`;

      // Abort any existing generation for this thread on this connection
      if (activeGenerations.has(sessionKey)) {
        activeGenerations.get(sessionKey).abort();
        activeGenerations.delete(sessionKey);
      }

      const abortController = new AbortController();
      activeGenerations.set(sessionKey, abortController);

      try {
        const { AIChat } = await import("../models/AIChat.js");
        const { User } = await import("../models/User.js");
        const { streamAIResponse } =
          await import("../services/aiChat.service.js");

        const chat = await AIChat.findOne({ _id: chatId, user: userId });
        if (!chat) {
          socket.emit(EVENTS.AI_CHAT_ERROR, {
            message: "AI conversation thread not found",
          });
          activeGenerations.delete(sessionKey);
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
          chat,
          userRecord,
          (word) => {
            if (!abortController.signal.aborted) {
              socket.emit(EVENTS.AI_WORD, { word, chatId });
            }
          },
          async (completeReply) => {
            activeGenerations.delete(sessionKey);
            socket.emit(EVENTS.AI_STOP_TYPING, { chatId });

            if (abortController.signal.aborted) return;

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
          abortController.signal,
        );
      } catch (err) {
        console.error("[Socket] AI chat error:", err);
        socket.emit(EVENTS.AI_CHAT_ERROR, {
          message: "An error occurred in the AI communication stream",
        });
        activeGenerations.delete(sessionKey);
      }
    });

    socket.on("stop-ai-generation", (data) => {
      const { chatId } = data;
      const sessionKey = `${socket.id}_${chatId}`;
      if (activeGenerations.has(sessionKey)) {
        activeGenerations.get(sessionKey).abort();
        activeGenerations.delete(sessionKey);
        socket.emit(EVENTS.AI_STOP_TYPING, { chatId });
        console.log(
          `[Socket] AI generation aborted via client request for chat: ${chatId}`,
        );
      }
    });

    // ── Disconnect ───────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected — userId=${userId}`);

      // Abort any active generations for this disconnecting client
      for (const [key, controller] of activeGenerations.entries()) {
        if (key.startsWith(`${socket.id}_`)) {
          controller.abort();
          activeGenerations.delete(key);
        }
      }

      (async () => {
        try {
          const { User } = await import("../models/User.js");
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });
          socket.broadcast.emit(EVENTS.USER_OFFLINE, { userId });
          socket.broadcast.emit("userOffline", { userId });
        } catch (err) {
          console.error("[Socket] Error in disconnect hooks:", err);
        }
      })();
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

/** Quiz created — notify all */
export function emitQuizCreated(quiz) {
  getIO().emit(EVENTS.QUIZ_CREATED, { quiz });
}

/** Quiz updated — notify course room and teacher dashboard */
export function emitQuizUpdated(quiz) {
  getIO()
    .to(ROOMS.course(quiz.courseId.toString()))
    .emit(EVENTS.QUIZ_UPDATED, { quiz });
  getIO().emit(EVENTS.QUIZ_UPDATED, { quiz });
}

/** Quiz published — notify all */
export function emitQuizPublished(quiz) {
  getIO().emit(EVENTS.QUIZ_PUBLISHED, { quiz });
}

/** Quiz started — notify course room + teacher dashboard */
export function emitQuizStarted(courseId, payload) {
  getIO().to(ROOMS.course(courseId)).emit(EVENTS.QUIZ_STARTED, payload);
  getIO().to(ROOMS.TEACHER_DASHBOARD).emit(EVENTS.QUIZ_STARTED, payload);
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

/** Assignment created — broadcast to course room and student dashboard */
export function emitAssignmentCreated(courseId, assignment) {
  getIO()
    .to(ROOMS.course(courseId))
    .emit(EVENTS.ASSIGNMENT_CREATED, { assignment });
  getIO().emit(EVENTS.ASSIGNMENT_CREATED, { assignment });
}

/** Assignment graded — notify the student */
export function emitAssignmentGraded(studentId, payload) {
  getIO().to(ROOMS.student(studentId)).emit(EVENTS.ASSIGNMENT_GRADED, payload);
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

/** Broadcast live revenue updates to admin + teacher dashboard */
export function emitRevenueUpdated(payload) {
  getIO().to(ROOMS.ADMIN_DASHBOARD).emit(EVENTS.REVENUE_UPDATED, payload);
  getIO().to(ROOMS.TEACHER_DASHBOARD).emit(EVENTS.REVENUE_UPDATED, payload);
}

/** Broadcast live analytics summary updates to admin dashboard */
export function emitAnalyticsUpdated(payload) {
  getIO().to(ROOMS.ADMIN_DASHBOARD).emit(EVENTS.ANALYTICS_UPDATED, payload);
}

/** Broadcast live course enrollment updates to admin + teacher dashboard */
export function emitCourseEnrolled(payload) {
  getIO().to(ROOMS.ADMIN_DASHBOARD).emit(EVENTS.COURSE_ENROLLED, payload);
  getIO().to(ROOMS.TEACHER_DASHBOARD).emit(EVENTS.COURSE_ENROLLED, payload);
}

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

let ioInstance = null;

export function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // JWT Verification Middleware for Sockets
  ioInstance.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.user = decoded; // Bind decoded user details
      next();
    } catch (error) {
      return next(new Error("Invalid or expired token"));
    }
  });

  ioInstance.on("connection", (socket) => {
    const userId = socket.user?.userId;
    console.log(`User Connected: ${userId}`);

    // Join a private individual room
    socket.join(`user:${userId}`);

    // Join teacher dashboard room if role matches
    const userRole = socket.user?.role;
    if (userRole === "teacher" || userRole === "super_admin" || userRole === "admin") {
      socket.join("teacher:dashboard");
      console.log(`Teacher Connected to Analytics Channels: ${userId}`);
    }

    // Broadcast online signal
    socket.broadcast.emit("user-online", { userId });

    // Analytics Real-Time Broadcast Triggers
    socket.on("progressUpdated", (data) => {
      ioInstance.to("teacher:dashboard").emit("progressUpdated", data);
    });
    socket.on("topicCompleted", (data) => {
      ioInstance.to("teacher:dashboard").emit("topicCompleted", data);
    });
    socket.on("quizSubmitted", (data) => {
      ioInstance.to("teacher:dashboard").emit("quizSubmitted", data);
    });
    socket.on("attendanceUpdated", (data) => {
      ioInstance.to("teacher:dashboard").emit("attendanceUpdated", data);
    });
    socket.on("studentJoined", (data) => {
      ioInstance.to("teacher:dashboard").emit("studentJoined", data);
    });
    socket.on("studentAbsent", (data) => {
      ioInstance.to("teacher:dashboard").emit("studentAbsent", data);
    });
    socket.on("paymentCompleted", (data) => {
      ioInstance.to("teacher:dashboard").emit("paymentCompleted", data);
    });
    socket.on("revenueUpdated", (data) => {
      ioInstance.to("teacher:dashboard").emit("revenueUpdated", data);
    });
    socket.on("payoutProcessed", (data) => {
      ioInstance.to("teacher:dashboard").emit("payoutProcessed", data);
    });

    // Custom alerts & alerts mapping
    socket.on("newMessage", (data) => {
      if (data.recipientId) {
        ioInstance.to(`user:${data.recipientId}`).emit("newMessage", data);
        ioInstance.to(`user:${data.recipientId}`).emit("new-message", data);
      }
    });

    socket.on("newNotification", (data) => {
      if (data.courseId) {
        socket.broadcast.emit("newNotification", data);
      } else {
        ioInstance.emit("newNotification", data);
      }
    });

    // Handle incoming direct messages
    socket.on("send-message", async (data) => {
      try {
        const { recipientId, content, attachments = [] } = data;
        const messagePayload = {
          senderId: userId,
          recipientId,
          content,
          attachments,
          createdAt: new Date(),
        };

        // Dispatch specifically to the recipient's room
        ioInstance.to(`user:${recipientId}`).emit("new-message", messagePayload);
        socket.emit("message-sent", messagePayload);
      } catch (error) {
        socket.emit("socket-error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User Disconnected: ${userId}`);
      socket.broadcast.emit("user-offline", { userId });
    });
  });

  return ioInstance;
}

// Get Socket Instance Anywhere
export function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized");
  }

  return ioInstance;
}
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

  // Authentication Middleware
  ioInstance.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);

      socket.user = decoded;

      next();
    } catch (error) {
      return next(new Error("Invalid or expired token"));
    }
  });

  // Connection
  ioInstance.on("connection", (socket) => {
    try {
      const userId = socket.user?.userId;

      console.log(`User Connected: ${userId}`);

      // User Personal Room
      socket.join(`user:${userId}`);

      // Broadcast Online Status
      socket.broadcast.emit("user-online", {
        userId,
      });

      // =========================
      // SEND MESSAGE
      // =========================
      socket.on("send-message", async (data) => {
        try {
          const {
            recipientId,
            content,
            attachments = [],
          } = data;

          const messagePayload = {
            senderId: userId,
            recipientId,
            content,
            attachments,
            createdAt: new Date(),
          };

          // Send To Recipient
          ioInstance
            .to(`user:${recipientId}`)
            .emit("new-message", messagePayload);

          // Send Back To Sender
          socket.emit("message-sent", messagePayload);

        } catch (error) {
          socket.emit("socket-error", {
            message: "Failed to send message",
          });
        }
      });

      // =========================
      // MARK READ
      // =========================
      socket.on("mark-read", ({ senderId }) => {
        ioInstance
          .to(`user:${senderId}`)
          .emit("messages-read", {
            readerId: userId,
          });
      });

      // =========================
      // TYPING START
      // =========================
      socket.on("typing-start", ({ recipientId }) => {
        ioInstance
          .to(`user:${recipientId}`)
          .emit("user-typing", {
            userId,
          });
      });

      // =========================
      // TYPING STOP
      // =========================
      socket.on("typing-stop", ({ recipientId }) => {
        ioInstance
          .to(`user:${recipientId}`)
          .emit("user-stop-typing", {
            userId,
          });
      });

      // =========================
      // LIVE COURSE UPDATE
      // =========================
      socket.on("course-updated", (courseData) => {
        socket.broadcast.emit("course-live-update", courseData);
      });

      // =========================
      // DISCONNECT
      // =========================
      socket.on("disconnect", () => {
        console.log(`User Disconnected: ${userId}`);

        socket.broadcast.emit("user-offline", {
          userId,
        });
      });

    } catch (error) {
      console.error("Socket Connection Error:", error.message);
    }
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
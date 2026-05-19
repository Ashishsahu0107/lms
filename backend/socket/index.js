import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));
    try {
      const payload = jwt.verify(token, env.JWT_SECRET);
      socket.user = payload;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.userId;
    socket.join(`user:${userId}`);

    socket.on("send-message", ({ recipientId, content, attachments }) => {
      io.to(`user:${recipientId}`).emit("new-message", {
        senderId: userId,
        content,
        attachments,
        createdAt: new Date(),
      });
    });

    socket.on("mark-read", ({ senderId }) => {
      io.to(`user:${senderId}`).emit("messages-read", { readerId: userId });
    });

    socket.on("disconnect", () => {});
  });
}
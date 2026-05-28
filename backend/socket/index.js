import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

let ioInstance = null;

export function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isLocal = origin.startsWith("http://localhost:") || 
                        origin.startsWith("http://127.0.0.1:") || 
                        /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):/i.test(origin);
        if (isLocal || [env.CORS_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"].indexOf(origin) !== -1) {
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

    // =====================================
    // REAL-TIME AI CHATBOT STREAM PIPELINE
    // =====================================
    socket.on("send-ai-message", async (data) => {
      try {
        const { chatId, content } = data;
        if (!chatId || !content) {
          socket.emit("ai-chat-error", { message: "Chat ID and content are required" });
          return;
        }

        const { AIChat } = await import("../models/AIChat.js");
        const { User } = await import("../models/User.js");
        const { streamAIResponse } = await import("../services/aiChat.service.js");

        // 1. Fetch chat thread
        const chat = await AIChat.findOne({ _id: chatId, user: userId });
        if (!chat) {
          socket.emit("ai-chat-error", { message: "AI conversation thread not found" });
          return;
        }

        // 2. Fetch active user bio/name
        const userRecord = await User.findById(userId);

        // 3. Save User message to thread
        const userMessage = {
          sender: "user",
          content: content.trim(),
          role: "user",
          timestamp: new Date()
        };
        chat.messages.push(userMessage);
        
        // Auto-generate title on first message
        if (chat.messages.length === 1 || chat.title === "New Conversation") {
          const firstWords = content.trim().split(" ").slice(0, 4).join(" ");
          chat.title = firstWords ? `${firstWords}...` : "AI Study Chat";
        }
        
        await chat.save();

        // Echo the user message to keep client in sync
        socket.emit("ai-message-saved", {
          chatId,
          message: chat.messages[chat.messages.length - 1]
        });

        // 4. Emit typing indicator
        socket.emit("ai-typing", { chatId });

        // 5. Start streaming response
        await streamAIResponse(
          content,
          userRecord,
          (word) => {
            socket.emit("ai-word", { word, chatId });
          },
          async (completeReply) => {
            // Stop typing indicator
            socket.emit("ai-stop-typing", { chatId });

            // Save AI response to DB
            const aiMessage = {
              sender: "ai",
              content: completeReply,
              role: "assistant",
              timestamp: new Date()
            };
            
            const updatedChat = await AIChat.findOne({ _id: chatId, user: userId });
            if (updatedChat) {
              updatedChat.messages.push(aiMessage);
              await updatedChat.save();
              
              // Emit completed message back
              socket.emit("ai-message-complete", {
                chatId,
                message: updatedChat.messages[updatedChat.messages.length - 1]
              });
            }
          }
        );
      } catch (err) {
        console.error("AI Chat socket error:", err);
        socket.emit("ai-chat-error", { message: "An error occurred in the AI communication stream" });
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
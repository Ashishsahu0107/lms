// context/SocketContext.tsx — Socket.io client context
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketRef.current?.disconnect();
      setIsConnected(false);
      return;
    }

    const SOCKET_URL =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("[Socket] Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("[Socket] Disconnected");
    });

    socket.on("user-online", ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId],
      );
    });

    socket.on("user-offline", ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, isConnected, onlineUsers }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextType {
  return useContext(SocketContext);
}

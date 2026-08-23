// context/SocketContext.tsx — Socket.io client context with production resilience
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
import { SOCKET_URL } from "@/lib/api-config";

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
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    // In production without a configured Socket URL, skip connection gracefully
    if (!SOCKET_URL) {
      console.info(
        "[Socket] NEXT_PUBLIC_SOCKET_URL not configured. Realtime socket features disabled (HTTP fallback active)."
      );
      setIsConnected(false);
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("[Socket] Connected to server:", socket.id);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("[Socket] Disconnected from server");
    });

    socket.on("online-users-list", (users: string[]) => {
      if (Array.isArray(users)) {
        setOnlineUsers(users);
      }
    });

    socket.on("user-online", ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      );
    });

    socket.on("user-offline", ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
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

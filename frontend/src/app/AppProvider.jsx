import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { SocketProvider } from "../context/SocketContext";

// Central place to add global providers (Auth, Theme, QueryClient, etc.)
export default function AppProvider({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
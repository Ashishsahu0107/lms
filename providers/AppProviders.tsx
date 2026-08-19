"use client";

// providers/AppProviders.tsx — All client-side providers in one place
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store/store";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <SocketProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: "10px",
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontSize: "14px",
                },
              }}
            />
          </SocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </ReduxProvider>
  );
}

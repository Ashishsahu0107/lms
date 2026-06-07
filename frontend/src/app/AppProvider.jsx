import React from "react";
import { Provider } from "react-redux";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { SocketProvider } from "../context/SocketContext";
import { store } from "../redux/store";

// Central place to add global providers (Auth, Theme, Redux, Socket, etc.)
export default function AppProvider({ children }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>{children}</SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

import React from "react";
import { AuthProvider } from "../../context/AuthContext.jsx";
import { store } from "../../redux/store.js";

// Minimal provider scaffold.
// In production you may wrap with <Provider store={store}> from react-redux.
export default function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}


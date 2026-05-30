import React from "react";
import { AuthProvider } from "../../context/AuthContext.jsx";
import { store } from "../../redux/store.js";


export default function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}


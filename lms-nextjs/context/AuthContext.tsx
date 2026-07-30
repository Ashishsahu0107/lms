// context/AuthContext.tsx — Auth state management
"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

// ── Types
interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "super_admin";
  avatar?: string;
  bio?: string;
  xp?: number;
  streak?: number;
  level?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: "SET_AUTH"; payload: { user: User; token: string } }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "SET_LOADING"; payload: boolean };

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_AUTH":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { data } = await res.json();
        dispatch({ type: "SET_AUTH", payload: { user: data.user, token } });
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } catch {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [API_URL]);

  // ── Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({ type: "SET_AUTH", payload: { user, token } });
        // Refresh user data from API
        refreshUser();
      } catch {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [refreshUser]);

  const login = useCallback((token: string, user: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    dispatch({ type: "SET_AUTH", payload: { user, token } });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
    router.push("/login");
  }, [router]);

  const updateUser = useCallback((data: Partial<User>) => {
    dispatch({ type: "UPDATE_USER", payload: data });
    // Update cached user in localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        localStorage.setItem("user", JSON.stringify({ ...user, ...data }));
      } catch {}
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, updateUser, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// src/pages/auth/LoginPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  GraduationCap,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";

import { Button } from "../../components/ui/Button";

import { Input } from "../../components/ui/Input";

import { useAuth } from "../../context/AuthContext";

// =====================================
// DEMO USERS
// =====================================
const demoUsers = [
  {
    email: "admin@lmspro.edu",
    password: "admin123",
    role: "super_admin",
    name: "Admin User",
  },

  {
    email: "teacher@lmspro.edu",
    password: "teacher123",
    role: "teacher",
    name: "John Teacher",
  },

  {
    email: "student@lmspro.edu",
    password: "student123",
    role: "student",
    name: "Jane Student",
  },
];

export default function LoginPage() {

  const navigate = useNavigate();

  const { login } = useAuth();

  // =====================================
  // STATES
  // =====================================
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================
  // HANDLE LOGIN
  // =====================================
  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    setLoading(true);

    // Fake API Delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000)
    );

    // Find User
    const user = demoUsers.find(
      (u) =>
        u.email === email &&
        u.password === password
    );

    // Invalid User
    if (!user) {

      setError("Invalid email or password");

      setLoading(false);

      return;
    }

    // =====================================
    // SAVE USER IN AUTH CONTEXT
    // =====================================
    login(user);

    // Save Token
    localStorage.setItem(
      "token",
      "demo-token"
    );

    // =====================================
    // REDIRECT BASED ON ROLE
    // =====================================
    if (user.role === "super_admin") {

      navigate("/admin/dashboard");

    }

    else if (user.role === "teacher") {

      navigate("/teacher/dashboard");

    }

    else if (user.role === "student") {

      navigate("/student/dashboard");

    }

    setLoading(false);
  };

  return (

    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4">

      <div className="w-full max-w-md">

        {/* ================================= */}
        {/* LOGO */}
        {/* ================================= */}
        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">

            <GraduationCap className="h-8 w-8 text-white" />

          </div>

          <h1 className="text-4xl font-bold text-white">
            LMS Pro
          </h1>

          <p className="mt-2 text-blue-200">
            Learning Management System
          </p>

        </div>

        {/* ================================= */}
        {/* LOGIN CARD */}
        {/* ================================= */}
        <Card>

          <CardHeader>

            <CardTitle className="text-center text-2xl">

              Welcome Back

            </CardTitle>

            <p className="mt-2 text-center text-gray-500">

              Login to continue

            </p>

          </CardHeader>

          <CardContent>

            {/* ================================= */}
            {/* LOGIN FORM */}
            {/* ================================= */}
            <form
              onSubmit={handleLogin}
              className="space-y-4"
            >

              {/* ERROR */}
              {error && (

                <div className="rounded-lg bg-red-100 p-3 text-sm text-red-600">

                  {error}

                </div>

              )}

              {/* EMAIL */}
              <div>

                <label className="mb-2 block text-sm font-medium">

                  Email

                </label>

                <Input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

              </div>

              {/* PASSWORD */}
              <div>

                <label className="mb-2 block text-sm font-medium">

                  Password

                </label>

                <div className="relative">

                  <Input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-3"
                  >

                    {showPassword ? (

                      <EyeOff className="h-5 w-5 text-gray-500" />

                    ) : (

                      <Eye className="h-5 w-5 text-gray-500" />

                    )}

                  </button>

                </div>

              </div>

              {/* LOGIN BUTTON */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >

                {loading ? (

                  <div className="flex items-center justify-center gap-2">

                    <Loader2 className="h-4 w-4 animate-spin" />

                    Signing In...

                  </div>

                ) : (

                  "Sign In"

                )}

              </Button>

            </form>

            {/* ================================= */}
            {/* DEMO ACCOUNTS */}
            {/* ================================= */}
            <div className="mt-6 border-t pt-6">

              <p className="mb-4 text-center text-sm text-gray-500">

                Demo Accounts

              </p>

              <div className="space-y-2 text-sm">

                <div className="rounded-lg bg-gray-800 p-2">

                  Admin → admin@lmspro.edu / admin123

                </div>

                <div className="rounded-lg bg-gray-800 p-2">

                  Teacher → teacher@lmspro.edu / teacher123

                </div>

                <div className="rounded-lg bg-gray-800 p-2">

                  Student → student@lmspro.edu / student123

                </div>

              </div>

            </div>

          </CardContent>

        </Card>

      </div>

    </div>
  );
}
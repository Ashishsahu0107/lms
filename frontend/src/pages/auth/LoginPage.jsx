// src/pages/auth/LoginPage.jsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost } from "../../services/apiClient";

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

    try {
      const res = await apiPost("/auth/login", { email, password });
      if (res.data?.success) {
        if (res.data.needsVerification) {
          localStorage.setItem("verify_email", res.data.email);
          navigate(`/verify-email?email=${res.data.email}`);
          return;
        }

        if (!res.data || !res.data.data) {
          setError("Failed to retrieve user details from server response.");
          return;
        }

        const { token, user } = res.data.data;

        if (!token || !user) {
          setError("Incomplete user credentials received from the server.");
          return;
        }

        // Save Token & User details
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Save in global Auth Context
        login(user);

        // Redirect based on exact role
        if (user.role === "super_admin") {
          navigate("/admin/dashboard");
        } else if (user.role === "teacher") {
          navigate("/teacher/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      } else {
        setError(res.data?.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login failure:", err);
      setError(err.response?.data?.message || err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
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

                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-blue-400 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

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

            <div className="mt-4 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-400 hover:underline"
              >
                Sign Up
              </Link>
            </div>

          </CardContent>

        </Card>

      </div>

    </div>
  );
}
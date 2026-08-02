"use client";

// components/auth/LoginPage.tsx — Ultra-Sleek Modern Auth Card with One-Click Demo Fill
import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const fillDemoAccount = (role: "student" | "teacher" | "admin") => {
    if (role === "student") {
      setForm({ email: "student@lmspro.edu", password: "admin123" });
      toast.success("Student demo account filled");
    } else if (role === "teacher") {
      setForm({ email: "teacher@lmspro.edu", password: "admin123" });
      toast.success("Teacher demo account filled");
    } else {
      setForm({ email: "admin@gmail.com", password: "admin123" });
      toast.success("Super Admin demo account filled");
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.email || !form.password) {
        toast.error("Please enter your email and password");
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        login(data.data.token, data.data.user);
        toast.success(`Welcome back, ${data.data.user.name}!`);

        const role = data.data.user.role;
        if (role === "super_admin") router.push("/admin/dashboard");
        else if (role === "teacher") router.push("/teacher/dashboard");
        else router.push("/student/dashboard");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Login failed");
      } finally {
        setIsLoading(false);
      }
    },
    [form, API_URL, login, router],
  );

  return (
    <div className="w-full space-y-6 animate-fade-in text-base-content">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-base-content font-display tracking-tight">
          Welcome Back 👋
        </h2>
        <p className="text-xs text-base-content/60">
          Sign in to access your course materials and dashboard.
        </p>
      </div>

      {/* Quick Demo Login Selector */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-base-content/50 text-center">
          Quick Demo Login
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillDemoAccount("student")}
            className="py-1.5 px-2 rounded-xl bg-base-200 hover:bg-primary/10 hover:text-primary text-[11px] font-bold border border-base-300 transition-all text-center"
          >
            🎓 Student
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount("teacher")}
            className="py-1.5 px-2 rounded-xl bg-base-200 hover:bg-primary/10 hover:text-primary text-[11px] font-bold border border-base-300 transition-all text-center"
          >
            👨‍🏫 Teacher
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount("admin")}
            className="py-1.5 px-2 rounded-xl bg-base-200 hover:bg-primary/10 hover:text-primary text-[11px] font-bold border border-base-300 transition-all text-center"
          >
            ⚡ Admin
          </button>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address *"
          type="email"
          required
          placeholder="e.g. user@lmspro.edu"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider">
              Password *
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-base-content placeholder-base-content/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-10 transition-all"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content text-sm p-1"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full shadow-lg shadow-primary/25 py-3 text-sm font-bold"
        >
          Sign In to Account
        </Button>
      </form>

      {/* Divider & Register Link */}
      <div className="pt-2 border-t border-base-200 text-center space-y-3">
        <p className="text-xs text-base-content/60">
          Don&apos;t have an LMS Pro account yet?
        </p>
        <Link href="/register" className="block">
          <Button variant="outline" className="w-full">
            Create Free Student Account
          </Button>
        </Link>
      </div>
    </div>
  );
}

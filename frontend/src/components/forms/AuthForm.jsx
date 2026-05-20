import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

export default function AuthForm() {
  const [showPassword, setShowPassword] =
    useState(false);

  return (
    <div className="card w-full bg-base-100 shadow-2xl border border-base-300">

      {/* TOP */}
      <div className="card-body p-8">

        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">

          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lg">
            <GraduationCap className="h-8 w-8" />
          </div>

          <h1 className="text-3xl font-bold text-base-content">
            LMS Pro
          </h1>

          <p className="mt-2 text-sm text-base-content/60">
            Welcome back! Please login to continue
          </p>

        </div>

        {/* FORM */}
        <form className="space-y-5">

          {/* EMAIL */}
          <div>

            <label className="mb-2 block text-sm font-semibold text-base-content">
              Email Address
            </label>

            <div className="relative">

              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/40" />

              <input
                type="email"
                placeholder="admin@example.com"
                className="input input-bordered w-full pl-12 focus:input-primary"
              />

            </div>

          </div>

          {/* PASSWORD */}
          <div>

            <label className="mb-2 block text-sm font-semibold text-base-content">
              Password
            </label>

            <div className="relative">

              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-base-content/40" />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                className="input input-bordered w-full pl-12 pr-12 focus:input-primary"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-primary"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>

            </div>

          </div>

          {/* OPTIONS */}
          <div className="flex items-center justify-between">

            <label className="flex items-center gap-2 text-sm text-base-content/70">

              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
              />

              Remember me

            </label>

            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot Password?
            </button>

          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="btn btn-primary w-full gap-2 rounded-xl text-white"
          >
            Login Now

            <ArrowRight className="h-4 w-4" />

          </button>

        </form>

        {/* DIVIDER */}
        <div className="divider text-xs text-base-content/40">
          DEMO ACCOUNTS
        </div>

        {/* DEMO CARDS */}
        <div className="space-y-3">

          <div className="rounded-2xl border border-base-300 bg-base-200 p-4 transition hover:shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="font-semibold text-base-content">
                  Super Admin
                </p>

                <p className="text-sm text-base-content/60">
                  admin@lmspro.edu
                </p>
              </div>

              <span className="badge badge-primary">
                Admin
              </span>

            </div>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-200 p-4 transition hover:shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="font-semibold text-base-content">
                  Teacher
                </p>

                <p className="text-sm text-base-content/60">
                  teacher@lmspro.edu
                </p>
              </div>

              <span className="badge badge-secondary">
                Teacher
              </span>

            </div>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-200 p-4 transition hover:shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="font-semibold text-base-content">
                  Student
                </p>

                <p className="text-sm text-base-content/60">
                  student@lmspro.edu
                </p>
              </div>

              <span className="badge badge-accent">
                Student
              </span>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
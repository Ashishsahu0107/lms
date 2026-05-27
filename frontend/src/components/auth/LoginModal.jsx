// src/components/auth/LoginModal.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Eye, EyeOff, Loader2, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { apiPost } from "../../services/apiClient";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function LoginModal({ onClose, onSwitchToRegister }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkMode } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiPost("/auth/login", { email, password });
      if (res.data?.success) {
        if (res.data.needsVerification) {
          localStorage.setItem("verify_email", res.data.email);
          onClose();
          navigate(`/verify-email?email=${res.data.email}`);
          return;
        }

        if (!res.data.data) {
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
        if (rememberMe) {
          localStorage.setItem("remember_email", email);
        } else {
          localStorage.removeItem("remember_email");
        }

        // Save in global Auth Context
        login(user);
        toast.success(`Welcome back, ${user.name}!`);
        onClose();

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
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      transition={{ duration: 0.25, type: "spring", damping: 25 }}
      className={`w-full border shadow-2xl rounded-3xl overflow-hidden p-6 relative backdrop-blur-xl ${
        isDarkMode 
          ? "border-white/10 bg-slate-900/90 text-white" 
          : "border-slate-200 bg-white/95 text-slate-800"
      }`}
    >
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 transition"
      >
        <X className="h-4.5 w-4.5" />
      </button>

      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/15">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Welcome Back to LMS Pro
        </h2>
        <p className="text-[11px] text-slate-400 mt-1">Sign in to your learning workspace</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs font-semibold text-rose-500 text-center">
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="mb-1 block text-[10px] uppercase font-bold tracking-wider text-slate-400">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className={`w-full rounded-xl border py-2 px-3.5 text-xs focus:outline-none transition-all ${
              isDarkMode 
                ? "border-white/10 bg-black/40 text-white placeholder-white/20 focus:border-blue-500/50" 
                : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-blue-500"
            }`}
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Password</label>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate("/forgot-password");
              }}
              className="text-[10px] font-bold text-blue-400 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={`w-full rounded-xl border py-2 pl-3.5 pr-10 text-xs focus:outline-none transition-all ${
                isDarkMode 
                  ? "border-white/10 bg-black/40 text-white placeholder-white/20 focus:border-blue-500/50" 
                  : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-blue-500"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2 pt-1 select-none">
          <input
            type="checkbox"
            id="remember-me-modal"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-slate-300 dark:border-white/10 accent-blue-500 text-blue-500"
          />
          <label htmlFor="remember-me-modal" className="text-[10px] font-bold text-slate-400 cursor-pointer">
            Remember Email
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
        >
          {loading ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              Signing In...
            </>
          ) : (
            "Sign In Workspace"
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/5 text-center text-xs">
        <span className="text-slate-400 font-medium">Don't have an account yet?</span>{" "}
        <button 
          onClick={onSwitchToRegister}
          className="font-bold text-blue-400 hover:underline"
        >
          Register Now
        </button>
      </div>
    </motion.div>
  );
}

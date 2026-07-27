// src/components/auth/RegisterModal.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Eye, EyeOff, Loader2, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { apiPost } from "../../services/apiClient";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkMode } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Password strength computation state
  const [strength, setStrength] = useState({
    label: "None",
    score: 0,
    color: "bg-slate-700",
  });

  useEffect(() => {
    if (!password) {
      setStrength({ label: "None", score: 0, color: "bg-slate-700" });
      return;
    }

    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let label = "Weak";
    let color = "bg-rose-500 shadow-rose-500/20";
    if (score >= 4) {
      label = "Strong";
      color = "bg-emerald-500 shadow-emerald-500/20";
    } else if (score >= 2) {
      label = "Medium";
      color = "bg-amber-500 shadow-amber-500/20";
    }

    setStrength({ label, score, color });
  }, [password]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiPost("/auth/register", {
        name,
        email,
        password,
        role: "student", // Self-registration is strictly for students
      });

      if (res.data?.success) {
        const { token, user } = res.data.data;

        // Save in LocalStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Set Auth Context
        login(user);
        toast.success("Account created successfully!");
        onClose();

        // Self-registered accounts route directly to student dashboard
        navigate("/student/dashboard");
      } else {
        setError(res.data?.message || "Registration failed. Try again.");
      }
    } catch (err) {
      console.error("Register failure:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to register account.",
      );
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
      <div className="mb-5 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/15">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Start Learning Today
        </h2>
        <p className="text-[11px] text-slate-400 mt-1">
          Create your global student account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleRegister} className="space-y-3.5">
        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs font-semibold text-rose-500 text-center">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="mb-1 block text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            className={`w-full rounded-xl border py-2 px-3.5 text-xs focus:outline-none transition-all ${
              isDarkMode
                ? "border-white/10 bg-black/40 text-white placeholder-white/20 focus:border-blue-500/50"
                : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-blue-500"
            }`}
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1 block text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Email Address
          </label>
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
          <label className="mb-1 block text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
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
              {showPassword ? (
                <EyeOff className="h-4.5 w-4.5" />
              ) : (
                <Eye className="h-4.5 w-4.5" />
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-2 space-y-1 select-none">
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
                <span>
                  Strength:{" "}
                  <span
                    className={
                      strength.label === "Weak"
                        ? "text-rose-400"
                        : strength.label === "Medium"
                          ? "text-amber-400"
                          : "text-emerald-400"
                    }
                  >
                    {strength.label}
                  </span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                <div
                  className={`h-full flex-1 transition-all duration-300 ${strength.score >= 1 ? strength.color : "bg-transparent"}`}
                />
                <div
                  className={`h-full flex-1 transition-all duration-300 ${strength.score >= 3 ? strength.color : "bg-transparent"}`}
                />
                <div
                  className={`h-full flex-1 transition-all duration-300 ${strength.score >= 4 ? strength.color : "bg-transparent"}`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="mb-1 block text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Confirm Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            required
            className={`w-full rounded-xl border py-2 px-3.5 text-xs focus:outline-none transition-all ${
              isDarkMode
                ? "border-white/10 bg-black/40 text-white placeholder-white/20 focus:border-blue-500/50"
                : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-blue-500"
            }`}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 mt-5"
        >
          {loading ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              Creating Scholar Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/5 text-center text-xs">
        <span className="text-slate-400 font-medium">
          Already have an account?
        </span>{" "}
        <button
          onClick={onSwitchToLogin}
          className="font-bold text-blue-400 hover:underline"
        >
          Sign In
        </button>
      </div>
    </motion.div>
  );
}

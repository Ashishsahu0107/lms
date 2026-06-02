// src/pages/auth/LoginPage.jsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost } from "../../services/apiClient";
import { motion, AnimatePresence } from "framer-motion";

import {
  GraduationCap,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

// =====================================
// DEMO USERS
// =====================================
const demoUsers = [
  {
    label: "Admin",
    email: "admin@lmspro.edu",
    password: "admin123",
    role: "super_admin",
    color: "from-purple-500 to-indigo-500",
  },
  {
    label: "Teacher",
    email: "teacher@lmspro.edu",
    password: "teacher123",
    role: "teacher",
    color: "from-blue-500 to-cyan-500",
  },
  {
    label: "Student",
    email: "student@lmspro.edu",
    password: "student123",
    role: "student",
    color: "from-emerald-500 to-teal-500",
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        login(user);

        if (user.role === "super_admin") navigate("/admin/dashboard");
        else if (user.role === "teacher") navigate("/teacher/dashboard");
        else navigate("/student/dashboard");
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

  const handleDemoLogin = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12"
      style={{ background: "linear-gradient(135deg, #0F172A 0%, #0B1120 50%, #1E293B 100%)" }}
    >
      {/* ── Floating Gold Orbs ── */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 pointer-events-none animate-gold-orb"
        style={{ background: "radial-gradient(circle, rgba(201,162,39,0.4) 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)", filter: "blur(50px)", animation: "float 8s ease-in-out infinite" }} />
      <div className="absolute top-10 right-10 w-48 h-48 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(201,162,39,0.5) 0%, transparent 70%)", filter: "blur(40px)", animation: "float 5s ease-in-out 1s infinite" }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* ── Logo / Header ── */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 relative"
            style={{ background: "linear-gradient(135deg, #C9A227, #F59E0B)", boxShadow: "0 0 30px rgba(201,162,39,0.5), 0 0 80px rgba(201,162,39,0.2)" }}
          >
            <GraduationCap className="h-10 w-10 text-slate-950" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #C9A227, #F59E0B)" }}>
              <Sparkles className="h-3 w-3 text-slate-950" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black text-white mb-1 tracking-tight"
          >
            LMS <span className="text-gold">PRO</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 text-sm font-medium"
          >
            Enterprise Learning Management Suite
          </motion.p>
        </div>

        {/* ── Glass Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="relative"
          style={{
            background: "rgba(30,41,59,0.7)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(201,162,39,0.2)",
            borderRadius: "1.5rem",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,162,39,0.1)",
          }}
        >
          {/* Gold top border accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-0.5 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, #C9A227, transparent)" }} />

          <div className="p-8">
            {/* ── Title ── */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-slate-400 text-sm">Sign in to access your workspace</p>
            </div>

            {/* ── Error ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 rounded-xl p-3.5 flex items-center gap-2 text-sm"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
                >
                  <Shield className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Form ── */}
            <form onSubmit={handleLogin} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none"
                    style={{
                      background: "rgba(15,23,42,0.8)",
                      border: "1px solid rgba(201,162,39,0.2)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#C9A227";
                      e.target.style.boxShadow = "0 0 0 3px rgba(201,162,39,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(201,162,39,0.2)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-300">Password</label>
                  <Link to="/forgot-password"
                    className="text-xs font-semibold transition-colors"
                    style={{ color: "#C9A227" }}
                    onMouseEnter={(e) => e.target.style.color = "#F59E0B"}
                    onMouseLeave={(e) => e.target.style.color = "#C9A227"}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-12 py-3 rounded-xl text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none"
                    style={{
                      background: "rgba(15,23,42,0.8)",
                      border: "1px solid rgba(201,162,39,0.2)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#C9A227";
                      e.target.style.boxShadow = "0 0 0 3px rgba(201,162,39,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(201,162,39,0.2)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-gold transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 mt-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading ? "rgba(201,162,39,0.5)" : "linear-gradient(135deg, #C9A227, #F59E0B)",
                  color: "#0F172A",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(201,162,39,0.4)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Workspace
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* ── Demo Quick Login ── */}
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px" style={{ background: "rgba(201,162,39,0.15)" }} />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="h-3 w-3" style={{ color: "#C9A227" }} />
                  Quick Demo Login
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(201,162,39,0.15)" }} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {demoUsers.map((demo) => (
                  <motion.button
                    key={demo.role}
                    type="button"
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleDemoLogin(demo)}
                    className="py-2 px-3 rounded-xl text-xs font-bold text-white transition-all duration-200"
                    style={{
                      background: "rgba(30,41,59,0.8)",
                      border: "1px solid rgba(201,162,39,0.15)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(201,162,39,0.4)";
                      e.currentTarget.style.background = "rgba(201,162,39,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(201,162,39,0.15)";
                      e.currentTarget.style.background = "rgba(30,41,59,0.8)";
                    }}
                  >
                    <span style={{ color: "#C9A227" }}>{demo.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── Register Link ── */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link to="/register"
                className="font-bold transition-colors"
                style={{ color: "#C9A227" }}
                onMouseEnter={(e) => e.target.style.color = "#F59E0B"}
                onMouseLeave={(e) => e.target.style.color = "#C9A227"}
              >
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>

        {/* ── Bottom Trust Badge ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center flex items-center justify-center gap-2"
        >
          <Shield className="h-3.5 w-3.5 text-slate-600" />
          <span className="text-xs text-slate-600">256-bit SSL Encrypted · JWT Secured · Role-Based Access</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
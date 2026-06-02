// src/pages/auth/RegisterPage.jsx

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
  User,
  ArrowRight,
  Shield,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const roles = [
  { value: "student", label: "Student", desc: "Access courses & learn", icon: "🎓" },
  { value: "teacher", label: "Teacher", desc: "Create & manage courses", icon: "👩‍🏫" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiPost("/auth/register", { name, email, password, role });
      if (res.data?.success) {
        if (res.data.needsVerification || res.data.data?.needsVerification) {
          const verifyEmail = res.data.email || email;
          localStorage.setItem("verify_email", verifyEmail);
          navigate(`/verify-email?email=${verifyEmail}`);
          return;
        }

        const { token, user } = res.data.data || {};
        if (token && user) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          login(user);
          if (user.role === "teacher") navigate("/teacher/dashboard");
          else navigate("/student/dashboard");
        } else {
          navigate("/login");
        }
      } else {
        setError(res.data?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(201,162,39,0.2)",
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = "#C9A227";
    e.target.style.boxShadow = "0 0 0 3px rgba(201,162,39,0.15)";
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = "rgba(201,162,39,0.2)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12"
      style={{ background: "linear-gradient(135deg, #0F172A 0%, #0B1120 50%, #1E293B 100%)" }}
    >
      {/* ── Floating Gold Orbs ── */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(201,162,39,0.4) 0%, transparent 70%)", filter: "blur(60px)", animation: "float 6s ease-in-out infinite" }} />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)", filter: "blur(50px)", animation: "float 8s ease-in-out 2s infinite" }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* ── Logo ── */}
        <div className="text-center mb-7">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="inline-flex items-center justify-center w-18 h-18 rounded-3xl mb-4"
            style={{
              width: 72, height: 72,
              background: "linear-gradient(135deg, #C9A227, #F59E0B)",
              boxShadow: "0 0 30px rgba(201,162,39,0.5)",
            }}
          >
            <GraduationCap className="h-9 w-9 text-slate-950" />
          </motion.div>
          <h1 className="text-3xl font-black text-white mb-0.5">
            Join <span className="text-gold">LMS PRO</span>
          </h1>
          <p className="text-slate-400 text-sm">Create your enterprise learning account</p>
        </div>

        {/* ── Glass Card ── */}
        <div
          className="relative"
          style={{
            background: "rgba(30,41,59,0.7)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(201,162,39,0.2)",
            borderRadius: "1.5rem",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,162,39,0.1)",
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-0.5 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, #C9A227, transparent)" }} />

          <div className="p-8">
            <h2 className="text-xl font-bold text-white mb-1">Create Account</h2>
            <p className="text-slate-400 text-sm mb-6">Fill in your details to get started</p>

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

            <form onSubmit={handleRegister} className="space-y-4">

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className="relative p-3 rounded-xl text-left transition-all duration-200 group"
                      style={{
                        background: role === r.value
                          ? "rgba(201,162,39,0.15)"
                          : "rgba(15,23,42,0.6)",
                        border: role === r.value
                          ? "1px solid rgba(201,162,39,0.5)"
                          : "1px solid rgba(201,162,39,0.1)",
                      }}
                    >
                      {role === r.value && (
                        <CheckCircle2 className="absolute top-2 right-2 h-4 w-4" style={{ color: "#C9A227" }} />
                      )}
                      <span className="text-lg">{r.icon}</span>
                      <p className="text-sm font-bold text-white mt-1">{r.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-200"
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-200"
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-11 pr-12 py-3 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-200"
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
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
                className="w-full py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 mt-2 transition-all duration-300 disabled:opacity-60"
                style={{
                  background: loading ? "rgba(201,162,39,0.5)" : "linear-gradient(135deg, #C9A227, #F59E0B)",
                  color: "#0F172A",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(201,162,39,0.4)",
                }}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creating Account...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Create My Account <ArrowRight className="h-4 w-4" /></>
                )}
              </motion.button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-bold" style={{ color: "#C9A227" }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

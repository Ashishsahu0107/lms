import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Lock, Shield, RefreshCw } from "lucide-react";
import { resetPassword } from "../../services/authService";
import { toast } from "react-hot-toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [strength, setStrength] = useState("Weak");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email") || "";
    const otpParam = params.get("otp") || "";
    setEmail(emailParam);
    setOtp(otpParam);

    if (!emailParam || !otpParam) {
      toast.error("Security handshake session missing. Please verify your OTP code first.");
      navigate("/forgot-password");
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!newPassword) {
      setStrength("");
      return;
    }
    if (newPassword.length < 6) {
      setStrength("Weak");
    } else {
      const hasNumbers = /\d/.test(newPassword);
      const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
      if (newPassword.length >= 8 && hasNumbers && hasSpecial) {
        setStrength("Strong");
      } else {
        setStrength("Medium");
      }
    }
  }, [newPassword]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword(email, otp, newPassword);
      if (res && res.success) {
        toast.success(res.message || "Password changed successfully!");
        localStorage.removeItem("verify_email");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl space-y-6"
      >
        <button
          onClick={() => navigate("/forgot-password")}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Forgot Password
        </button>

        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl border border-blue-500/20 bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Choose New Password</h1>
          <p className="text-xs text-white/50 px-4">
            Resetting password for <span className="font-bold text-white">{email}</span>. Handshake verified.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none"
              />
            </div>

            {/* Strength Meter */}
            {newPassword && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-white/40 uppercase tracking-widest">Password Strength:</span>
                  <span className={`${
                    strength === "Weak" ? "text-rose-400" : strength === "Medium" ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {strength}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${
                    strength === "Weak" ? "w-1/3 bg-rose-500" : strength === "Medium" ? "w-2/3 bg-amber-500" : "w-full bg-emerald-500"
                  }`} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-sm font-bold text-white hover:opacity-90 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Reset Password
          </button>
        </form>
      </motion.div>
    </div>
  );
}

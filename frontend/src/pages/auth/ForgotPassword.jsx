import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Key, Mail, RefreshCw } from "lucide-react";
import { forgotPassword } from "../../services/authService";
import { toast } from "react-hot-toast";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your account email address");
      return;
    }

    try {
      setLoading(true);
      const res = await forgotPassword(email);
      if (res && res.success) {
        toast.success(res.message || "OTP code has been sent successfully!");
        localStorage.setItem("verify_email", email);
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
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
          onClick={() => navigate("/login")}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
        </button>

        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl border border-blue-500/20 bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Key className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Forgot Password?
          </h1>
          <p className="text-xs text-white/50 px-4">
            No worries! Enter your registered email address and we'll dispatch a
            6-digit OTP code to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-sm font-bold text-white hover:opacity-90 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
            Request Reset Code
          </button>
        </form>
      </motion.div>
    </div>
  );
}

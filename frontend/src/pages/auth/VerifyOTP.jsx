import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, ArrowLeft, RefreshCw, Shield } from "lucide-react";
import { verifyResetOtp, resendResetOtp } from "../../services/authService";
import { toast } from "react-hot-toast";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email") || localStorage.getItem("verify_email") || "";
    setEmail(emailParam);

    if (!emailParam) {
      toast.error("Recovery session missing. Please request a new recovery link.");
      navigate("/forgot-password");
    }
  }, [location, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp.map((d, idx) => (idx === index ? element.value : d))];
    setOtp(newOtp);

    // Focus next cell
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Backspace handles focusing previous
    if (e.key === "Backspace" && otp[index] === "" && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      toast.error("Please enter the complete 6-digit OTP code");
      return;
    }

    try {
      setLoading(true);
      const res = await verifyResetOtp(email, otpCode);
      if (res && res.success) {
        toast.success(res.message || "OTP code verified successfully!");
        navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otpCode)}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      setLoading(true);
      const res = await resendResetOtp(email);
      if (res && res.success) {
        toast.success("Verification OTP code resent successfully.");
        setTimer(60);
        setCanResend(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      {/* Glow orb */}
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
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Enter Recovery Code</h1>
          <p className="text-xs text-white/50 px-4">
            We dispatched a 6-digit recovery code to <span className="font-bold text-white">{email}</span>. It will expire in 5 minutes.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-between gap-2.5">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-14 text-center text-xl font-bold text-white rounded-xl border border-white/10 bg-black/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-sm font-bold text-white hover:opacity-90 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Confirm Code
          </button>
        </form>

        <div className="text-center space-y-1">
          <p className="text-xs text-white/40">Didn't receive the OTP code?</p>
          <button
            onClick={handleResend}
            disabled={!canResend || loading}
            className={`text-xs font-bold transition-all ${
              canResend ? "text-blue-400 hover:underline" : "text-white/30 cursor-not-allowed"
            }`}
          >
            {canResend ? "Resend Recovery Code" : `Resend Code in ${timer}s`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

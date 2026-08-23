"use client";

// components/auth/ForgotPasswordPage.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { API_URL } from "@/lib/api-config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("OTP sent to your email!");
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-display">
            Forgot Password 🔐
          </h1>
          <p className="text-xs text-base-content/60 mt-1">
            Enter your registered email to receive an OTP
          </p>
        </div>

        <div className="card glass shadow-xl p-6 border border-base-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-xs">
                  Email Address
                </span>
              </label>
              <input
                type="email"
                required
                className="input input-bordered focus:input-primary text-sm"
                placeholder="admin@lmspro.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "Send OTP Code"
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link href="/login" className="link link-primary text-xs">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

// components/auth/ResetPasswordPage.tsx
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { API_URL } from "@/lib/api-config";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const otpParam = searchParams.get("otp") || "";

  const [email] = useState(emailParam);
  const [otp] = useState(otpParam);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Password reset successfully! Please sign in.");
      router.push("/login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-display">Reset Password 🔑</h1>
          <p className="text-xs text-base-content/60 mt-1">
            Set a new secure password for your account
          </p>
        </div>

        <div className="card glass shadow-xl p-6 border border-base-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-xs">
                  New Password
                </span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="input input-bordered focus:input-primary text-sm"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                "Save New Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

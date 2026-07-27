// app/(auth)/layout.tsx — Modern Auth Page Layout with Frosted Glass Card & Three.js Background
import React from "react";
import Link from "next/link";
import GlobalThreeBackground from "@/components/ui/GlobalThreeBackground";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-base-200 text-base-content">
      {/* Background WebGL Animation */}
      <GlobalThreeBackground />

      {/* Auth Card Container */}
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-primary text-primary-content font-bold text-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              🎓
            </div>
            <div className="text-left">
              <span className="font-bold text-2xl text-base-content tracking-tight font-display block">
                LMS Pro
              </span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                E-Learning Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Card Surface */}
        <div className="bg-base-100/90 backdrop-blur-xl border border-base-300/80 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6">
          {children}
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs font-medium text-base-content/60 hover:text-primary transition-colors">
            ← Back to Public Home
          </Link>
        </div>
      </div>
    </div>
  );
}

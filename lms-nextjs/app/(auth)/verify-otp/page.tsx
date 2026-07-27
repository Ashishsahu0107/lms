// app/(auth)/verify-otp/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyOtpPage from "@/components/auth/VerifyOtpPage";

export const metadata: Metadata = { title: "Verify OTP" };

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner text-primary" /></div>}>
      <VerifyOtpPage />
    </Suspense>
  );
}

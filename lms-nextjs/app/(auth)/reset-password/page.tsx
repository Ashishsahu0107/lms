// app/(auth)/reset-password/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordPage from "@/components/auth/ResetPasswordPage";

export const metadata: Metadata = { title: "Reset Password" };

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner text-primary" /></div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}

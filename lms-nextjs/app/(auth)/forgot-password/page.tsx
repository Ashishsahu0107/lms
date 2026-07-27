// app/(auth)/forgot-password/page.tsx
import type { Metadata } from "next";
import ForgotPasswordPage from "@/components/auth/ForgotPasswordPage";

export const metadata: Metadata = { title: "Forgot Password" };

export default function Page() {
  return <ForgotPasswordPage />;
}

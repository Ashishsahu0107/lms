// app/(auth)/login/page.tsx — Login page
import type { Metadata } from "next";
import LoginPage from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your LMS Pro account",
};

export default function Page() {
  return <LoginPage />;
}

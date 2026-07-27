// app/(auth)/register/page.tsx
import type { Metadata } from "next";
import RegisterPage from "@/components/auth/RegisterPage";

export const metadata: Metadata = { title: "Register Account" };

export default function Page() {
  return <RegisterPage />;
}

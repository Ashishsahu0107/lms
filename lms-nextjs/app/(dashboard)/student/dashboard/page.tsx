// app/(dashboard)/student/dashboard/page.tsx — Student Dashboard
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Student Dashboard" };

// Client-side — mirrors the existing React SPA dashboard
export { default } from "@/components/student/StudentDashboard";

// app/(dashboard)/student/courses/[id]/page.tsx
import type { Metadata } from "next";
import CourseDetailView from "@/components/student/CourseDetailView";

export const metadata: Metadata = { title: "Course Details & Player" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CourseDetailView courseId={id} />;
}

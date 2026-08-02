"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CourseEditorView from "@/components/teacher/CourseEditorView";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function EditCoursePage() {
  const { token, user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) return;

    if (user.role !== "teacher") {
      router.replace("/auth/login");
      return;
    }

    const fetchCourse = async () => {
      try {
        const res = await fetch(`${API_URL}/courses/${courseId}?includeModules=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        if (data.success && data.data) {
          const fetchedCourse = data.data.course;
          // If teacher doesn't own this course
          if (fetchedCourse.teacherId !== user.id) {
            router.replace("/teacher/courses");
            return;
          }
          setCourse(fetchedCourse);
        } else {
          router.replace("/teacher/courses");
        }
      } catch (e) {
        console.error("Failed to fetch course:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [token, user, courseId, router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-white"><span className="loading loading-spinner text-indigo-600"></span></div>;
  }

  if (!course) return null;

  return (
    <div className="absolute inset-0 z-50 bg-white">
      <CourseEditorView course={course} />
    </div>
  );
}

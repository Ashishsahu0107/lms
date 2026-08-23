"use client";

// components/student/MyCourses.tsx — Student's enrolled courses page
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api-config";

export default function MyCourses() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<
    Array<Record<string, unknown>>
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/enrollments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEnrollments(data.data.enrollments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (isAuthenticated && token) fetchEnrollments();
  }, [isAuthenticated, isLoading, token, router, fetchEnrollments]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content font-display">
            My Enrolled Courses 📚
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Track your progress and continue learning where you left off.
          </p>
        </div>
        <Link href="/student/courses" className="btn btn-primary btn-sm gap-2">
          🔍 Browse More Courses
        </Link>
      </div>

      {enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((item) => {
            const course = (item.course || {}) as Record<string, unknown>;
            const teacher = (course.teacher || {}) as Record<string, unknown>;
            const progress = Number(item.progress || 0);

            return (
              <div
                key={item.id as string}
                className="card bg-base-100 shadow-md border border-base-200 hover:shadow-xl transition-all duration-200"
              >
                <div className="card-body p-5">
                  <div className="w-full h-36 bg-gradient-to-br from-primary/15 via-secondary/15 to-accent/15 rounded-xl mb-4 flex items-center justify-center text-5xl relative overflow-hidden">
                    📚
                    <div className="absolute top-2 right-2">
                      <span
                        className={`badge badge-sm ${progress === 100 ? "badge-success" : "badge-primary"}`}
                      >
                        {progress === 100 ? "Completed" : "In Progress"}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base line-clamp-1">
                    {(course.title as string) || "Untitled Course"}
                  </h3>
                  <p className="text-xs text-base-content/60 line-clamp-2 mt-1">
                    {(course.description as string) ||
                      "No course description available."}
                  </p>

                  <div className="mt-4 pt-3 border-t border-base-200">
                    <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                      <span className="text-base-content/70">
                        Course Completion
                      </span>
                      <span className="text-primary font-bold">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <progress
                      className="progress progress-primary h-2 w-full"
                      value={progress}
                      max="100"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <div className="avatar placeholder">
                        <div className="bg-primary/10 text-primary w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center">
                          {(teacher.name as string)?.[0] || "I"}
                        </div>
                      </div>
                      <span className="text-xs text-base-content/70 font-medium truncate max-w-[100px]">
                        {(teacher.name as string) || "Instructor"}
                      </span>
                    </div>

                    <Link
                      href={`/student/courses/${course.id as string}`}
                      className="btn btn-primary btn-sm gap-1"
                    >
                      {progress > 0 ? "▶️ Resume" : "🚀 Start"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-base-content/40 bg-base-100 rounded-2xl border border-base-200 p-8">
          <p className="text-5xl mb-3">🎓</p>
          <h3 className="font-bold text-lg text-base-content">
            No Enrolled Courses Yet
          </h3>
          <p className="text-sm mt-1 mb-6">
            Browse our course catalog to get enrolled and start learning today.
          </p>
          <Link href="/student/courses" className="btn btn-primary btn-md">
            Explore Courses Catalog
          </Link>
        </div>
      )}
    </div>
  );
}

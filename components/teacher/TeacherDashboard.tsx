"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/api-config";

export default function TeacherDashboard() {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/courses?teacherId=${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.data.courses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (
      !isLoading &&
      isAuthenticated &&
      user?.role !== "teacher" &&
      user?.role !== "super_admin"
    ) {
      router.push("/student/dashboard");
    }
    if (isAuthenticated && token) loadData();
  }, [isAuthenticated, isLoading, token, user, router, loadData]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content font-display">
            Teacher Portal — Overview 👨‍🏫
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            Manage your courses, assignments, quizzes, and student roster.
          </p>
        </div>
        <Link
          href="/teacher/courses/new"
          className="btn btn-primary btn-sm gap-2"
        >
          ➕ Create Course
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow border border-base-200 p-4">
          <p className="text-xs font-medium text-base-content/50 uppercase">
            My Courses
          </p>
          <p className="text-2xl font-bold text-primary mt-1">
            {courses.length}
          </p>
        </div>
        <div className="card bg-base-100 shadow border border-base-200 p-4">
          <p className="text-xs font-medium text-base-content/50 uppercase">
            Total Students
          </p>
          <p className="text-2xl font-bold text-secondary mt-1">
            {courses.reduce(
              (sum, c) =>
                sum +
                Number((c._count as Record<string, number>)?.enrollments || 0),
              0,
            )}
          </p>
        </div>
        <div className="card bg-base-100 shadow border border-base-200 p-4">
          <p className="text-xs font-medium text-base-content/50 uppercase">
            Published
          </p>
          <p className="text-2xl font-bold text-success mt-1">
            {courses.filter((c) => c.status === "published").length}
          </p>
        </div>
        <div className="card bg-base-100 shadow border border-base-200 p-4">
          <p className="text-xs font-medium text-base-content/50 uppercase">
            Drafts
          </p>
          <p className="text-2xl font-bold text-warning mt-1">
            {courses.filter((c) => c.status === "draft").length}
          </p>
        </div>
      </div>

      {/* Course List */}
      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">Course Roster & Controls</h2>
          {courses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-sm">
                <thead>
                  <tr>
                    <th>Course Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Enrolled</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.id as string}>
                      <td className="font-semibold">{c.title as string}</td>
                      <td>{(c.category as string) || "General"}</td>
                      <td>
                        <span
                          className={`badge badge-sm ${
                            c.status === "published"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {c.status as string}
                        </span>
                      </td>
                      <td>
                        {(c._count as Record<string, number>)?.enrollments || 0}
                      </td>
                      <td>
                        <Link
                          href={`/teacher/courses/${c.id as string}`}
                          className="btn btn-ghost btn-xs text-primary"
                        >
                          Edit / Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-base-content/40">
              <p className="text-4xl mb-2">📖</p>
              <p>
                No courses authored yet. Click &quot;Create Course&quot; to
                begin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

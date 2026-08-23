"use client";

// components/teacher/StudentRoster.tsx — Teacher student roster & performance viewer
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/api-config";

export default function StudentRoster() {
  const { token } = useAuth();
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
      if (data.success) setEnrollments(data.data.enrollments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-base-content font-display">
          Student Roster 👥
        </h1>
        <p className="text-sm text-base-content/60 mt-1">
          Monitor student performance, progress meters, and course enrollments.
        </p>
      </div>

      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">Enrolled Students</h2>
          {loading ? (
            <div className="py-12 text-center">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : enrollments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-sm">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Course Title</th>
                    <th>Progress</th>
                    <th>Enrolled Date</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((item) => {
                    const student = (item.student || {}) as Record<
                      string,
                      unknown
                    >;
                    const course = (item.course || {}) as Record<
                      string,
                      unknown
                    >;
                    const progress = Number(item.progress || 0);

                    return (
                      <tr key={item.id as string}>
                        <td className="font-semibold">
                          {(student.name as string) || "Student"}
                        </td>
                        <td className="text-base-content/70">
                          {(student.email as string) || "—"}
                        </td>
                        <td>{(course.title as string) || "Course"}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <progress
                              className="progress progress-primary w-24 h-1.5"
                              value={progress}
                              max="100"
                            />
                            <span className="text-xs font-bold">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </td>
                        <td className="text-xs text-base-content/50">
                          {new Date(
                            (item.createdAt as string) || Date.now(),
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-base-content/40">
              <p className="text-4xl mb-2">👥</p>
              <p>No students enrolled yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

// components/teacher/TeacherAttendanceSheet.tsx — Teacher Attendance Marking Sheet
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { API_URL } from "@/lib/api-config";

export default function TeacherAttendanceSheet() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Array<Record<string, unknown>>>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [enrollments, setEnrollments] = useState<
    Array<Record<string, unknown>>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.data.courses || []);
        if (data.data.courses?.[0]?.id)
          setSelectedCourse(data.data.courses[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchStudents = useCallback(
    async (courseId: string) => {
      if (!token || !courseId) return;
      try {
        const res = await fetch(`${API_URL}/enrollments?courseId=${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setEnrollments(data.data.enrollments || []);
      } catch (e) {
        console.error(e);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (selectedCourse) fetchStudents(selectedCourse);
  }, [selectedCourse, fetchStudents]);

  const handleMarkAttendance = async (studentId: string, status: string) => {
    if (!token || !selectedCourse) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId,
          courseId: selectedCourse,
          date,
          status,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Attendance marked!");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to mark attendance",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-base-content font-display">
          Mark Attendance 📋
        </h1>
        <p className="text-sm text-base-content/60 mt-1">
          Select course and date to record daily student attendance.
        </p>
      </div>

      <div className="card bg-base-100 shadow border border-base-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-xs">
                Select Course
              </span>
            </label>
            <select
              className="select select-bordered focus:select-primary text-sm"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.id as string} value={c.id as string}>
                  {c.title as string}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-xs">
                Attendance Date
              </span>
            </label>
            <input
              type="date"
              className="input input-bordered focus:input-primary text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">Student Attendance Sheet</h2>
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
                    <th>Action (Mark Attendance)</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((item) => {
                    const student = (item.student || {}) as Record<
                      string,
                      unknown
                    >;
                    const sId = student.id as string;

                    return (
                      <tr key={item.id as string}>
                        <td className="font-semibold">
                          {(student.name as string) || "Student"}
                        </td>
                        <td className="text-base-content/70">
                          {(student.email as string) || "—"}
                        </td>
                        <td>
                          <div className="join">
                            <button
                              onClick={() =>
                                handleMarkAttendance(sId, "present")
                              }
                              disabled={submitting}
                              className="btn btn-xs btn-success join-item"
                            >
                              Present
                            </button>
                            <button
                              onClick={() =>
                                handleMarkAttendance(sId, "absent")
                              }
                              disabled={submitting}
                              className="btn btn-xs btn-error join-item"
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => handleMarkAttendance(sId, "late")}
                              disabled={submitting}
                              className="btn btn-xs btn-warning join-item"
                            >
                              Late
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-base-content/40">
              <p className="text-4xl mb-2">📋</p>
              <p>No students enrolled in the selected course.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

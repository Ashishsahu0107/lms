"use client";

// components/teacher/TeacherAssignmentsView.tsx — Teacher Assignment & Submission Grading Portal
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function TeacherAssignmentsView() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Array<Record<string, unknown>>>([]);
  const [assignments, setAssignments] = useState<
    Array<Record<string, unknown>>
  >([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [cRes, aRes] = await Promise.all([
        fetch(`${API_URL}/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/assignments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const cData = await cRes.json();
      const aData = await aRes.json();

      if (cData.success) setCourses(cData.data.courses || []);
      if (aData.success) setAssignments(aData.data.assignments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !courseId || !dueDate || !token) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          courseId,
          dueDate,
          totalMarks: Number(totalMarks),
          description,
          status: "published",
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Assignment created!");
      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content font-display">
            Assignments & Submissions ✍️
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Create course assignments, set due dates, and grade student
            submissions.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary btn-sm gap-2"
        >
          ➕ Create Assignment
        </button>
      </div>

      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">Coursework Registry</h2>
          {loading ? (
            <div className="py-12 text-center">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : assignments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-sm">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Due Date</th>
                    <th>Total Marks</th>
                    <th>Submissions</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id as string}>
                      <td className="font-semibold">{a.title as string}</td>
                      <td>
                        {new Date(a.dueDate as string).toLocaleDateString()}
                      </td>
                      <td className="font-bold text-primary">
                        {a.totalMarks as number} pts
                      </td>
                      <td>
                        {(a._count as Record<string, number>)?.submissions || 0}{" "}
                        submitted
                      </td>
                      <td>
                        <span className="badge badge-success badge-sm">
                          {a.status as string}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-base-content/40">
              <p className="text-4xl mb-2">✍️</p>
              <p>No assignments created yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card bg-base-100 max-w-md w-full shadow-2xl animate-fade-in border border-base-200">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">Create Assignment</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-xs">
                      Title
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    className="input input-bordered focus:input-primary text-sm"
                    placeholder="Assignment 1: Next.js API Routes"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-xs">
                      Course
                    </span>
                  </label>
                  <select
                    required
                    className="select select-bordered focus:select-primary text-sm"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                  >
                    <option value="">Select Target Course</option>
                    {courses.map((c) => (
                      <option key={c.id as string} value={c.id as string}>
                        {c.title as string}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-xs">
                        Due Date
                      </span>
                    </label>
                    <input
                      type="date"
                      required
                      className="input input-bordered focus:input-primary text-sm"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-xs">
                        Total Marks
                      </span>
                    </label>
                    <input
                      type="number"
                      required
                      className="input input-bordered focus:input-primary text-sm"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-xs">
                      Instructions
                    </span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24 text-sm"
                    placeholder="Describe task instructions and requirements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="card-actions justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary btn-sm"
                  >
                    {submitting ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : null}
                    Publish Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

// components/teacher/TeacherQuizBuilderView.tsx — Teacher Quiz Builder UI
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function TeacherQuizBuilderView() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Array<Record<string, unknown>>>([]);
  const [quizzes, setQuizzes] = useState<Array<Record<string, unknown>>>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [duration, setDuration] = useState("30");
  const [totalMarks, setTotalMarks] = useState("100");
  const [passingMarks, setPassingMarks] = useState("40");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [cRes, qRes] = await Promise.all([
        fetch(`${API_URL}/courses`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/quizzes`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const cData = await cRes.json();
      const qData = await qRes.json();

      if (cData.success) setCourses(cData.data.courses || []);
      if (qData.success) setQuizzes(qData.data.quizzes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !courseId || !token) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/quizzes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          courseId,
          duration: Number(duration),
          totalMarks: Number(totalMarks),
          passingMarks: Number(passingMarks),
          status: "published",
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Quiz created!");
      setShowModal(false);
      setTitle("");
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Quiz creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content font-display">
            Quiz Builder ❓
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Build interactive quizzes, set duration, passing score, and manage question pools.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm gap-2">
          ➕ Build New Quiz
        </button>
      </div>

      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4 font-display">Active Quizzes</h2>
          {loading ? (
            <div className="py-12 text-center">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : quizzes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-sm">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Duration</th>
                    <th>Total Marks</th>
                    <th>Passing Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((q) => (
                    <tr key={q.id as string}>
                      <td className="font-semibold">{q.title as string}</td>
                      <td>{q.duration as number} mins</td>
                      <td className="font-bold text-primary">{q.totalMarks as number} pts</td>
                      <td>{q.passingMarks as number}%</td>
                      <td><span className="badge badge-success badge-sm">{q.status as string}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-base-content/40">
              <p className="text-4xl mb-2">❓</p>
              <p>No quizzes built yet.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card bg-base-100 max-w-md w-full shadow-2xl animate-fade-in border border-base-200">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">Build Quiz</h3>
                <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-xs btn-circle">✕</button>
              </div>

              <form onSubmit={handleCreateQuiz} className="space-y-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium text-xs">Quiz Title</span></label>
                  <input
                    type="text"
                    required
                    className="input input-bordered focus:input-primary text-sm"
                    placeholder="Midterm Exam 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text font-medium text-xs">Course</span></label>
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

                <div className="grid grid-cols-3 gap-2">
                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium text-xs">Duration (m)</span></label>
                    <input
                      type="number"
                      required
                      className="input input-bordered text-sm"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium text-xs">Total Marks</span></label>
                    <input
                      type="number"
                      required
                      className="input input-bordered text-sm"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(e.target.value)}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium text-xs">Pass (%)</span></label>
                    <input
                      type="number"
                      required
                      className="input input-bordered text-sm"
                      value={passingMarks}
                      onChange={(e) => setPassingMarks(e.target.value)}
                    />
                  </div>
                </div>

                <div className="card-actions justify-end gap-2 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
                    {submitting ? <span className="loading loading-spinner loading-xs" /> : null}
                    Save Quiz
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

"use client";

// components/student/StudentAssignments.tsx — Student assignments portal
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function StudentAssignments() {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState<Array<Record<string, unknown>>>([]);
  const [submissions, setSubmissions] = useState<Array<Record<string, unknown>>>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Record<string, unknown> | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "submitted">("all");

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [assRes, subRes] = await Promise.all([
        fetch(`${API_URL}/assignments`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/submissions`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const assData = await assRes.json();
      const subData = await subRes.json();

      if (assData.success) setAssignments(assData.data.assignments || []);
      if (subData.success) setSubmissions(subData.data.submissions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !token) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          textAnswer,
          files: fileUrl ? [fileUrl] : [],
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Assignment submitted successfully!");
      setSelectedAssignment(null);
      setTextAnswer("");
      setFileUrl("");
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitted = (assignmentId: string) => {
    return submissions.some((s) => s.assignmentId === assignmentId);
  };

  const getSubmission = (assignmentId: string) => {
    return submissions.find((s) => s.assignmentId === assignmentId);
  };

  const filteredAssignments = assignments.filter((a) => {
    const submitted = isSubmitted(a.id as string);
    if (filterTab === "pending") return !submitted;
    if (filterTab === "submitted") return submitted;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content font-display">
            Course Assignments 📝
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Submit your coursework, view rubrics, and inspect teacher feedback.
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-100 p-1 border border-base-200">
          <button
            onClick={() => setFilterTab("all")}
            className={`tab tab-sm ${filterTab === "all" ? "tab-active bg-primary text-primary-content" : ""}`}
          >
            All ({assignments.length})
          </button>
          <button
            onClick={() => setFilterTab("pending")}
            className={`tab tab-sm ${filterTab === "pending" ? "tab-active bg-primary text-primary-content" : ""}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterTab("submitted")}
            className={`tab tab-sm ${filterTab === "submitted" ? "tab-active bg-primary text-primary-content" : ""}`}
          >
            Submitted
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAssignments.map((a) => {
            const submitted = isSubmitted(a.id as string);
            const sub = getSubmission(a.id as string);
            const isOverdue = new Date(a.dueDate as string) < new Date() && !submitted;

            return (
              <div
                key={a.id as string}
                className="card bg-base-100 shadow border border-base-200 hover:shadow-lg transition-all"
              >
                <div className="card-body p-6">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-base line-clamp-1">{a.title as string}</h3>
                    <span
                      className={`badge badge-sm ${
                        submitted
                          ? "badge-success"
                          : isOverdue
                          ? "badge-error"
                          : "badge-warning"
                      }`}
                    >
                      {submitted ? "Submitted" : isOverdue ? "Overdue" : "Pending"}
                    </span>
                  </div>

                  <p className="text-xs text-base-content/60 line-clamp-2">
                    {a.description as string || "No instructions provided."}
                  </p>

                  <div className="flex items-center justify-between text-xs mt-4 pt-3 border-t border-base-200">
                    <span className="text-base-content/50">
                      Due: {new Date(a.dueDate as string).toLocaleDateString()}
                    </span>
                    <span className="font-bold text-primary">
                      Marks: {sub?.marks !== undefined && sub?.marks !== null ? `${sub.marks}/${a.totalMarks}` : `${a.totalMarks} pts`}
                    </span>
                  </div>

                  {Boolean(sub?.feedback) && (
                    <div className="mt-3 p-2.5 bg-base-200/60 rounded-lg text-xs border border-base-300">
                      <span className="font-semibold text-primary">Teacher Feedback:</span> {sub?.feedback as string}
                    </div>
                  )}

                  <div className="card-actions justify-end mt-4">
                    {!submitted ? (
                      <button
                        onClick={() => setSelectedAssignment(a)}
                        className="btn btn-primary btn-sm w-full"
                      >
                        ✍️ Submit Assignment
                      </button>
                    ) : (
                      <button disabled className="btn btn-outline btn-xs w-full">
                        ✓ Submitted on {new Date(sub?.submittedAt as string || Date.now()).toLocaleDateString()}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-base-content/40 bg-base-100 rounded-2xl border border-base-200">
          <p className="text-5xl mb-3">🎉</p>
          <p className="font-bold text-lg text-base-content">No assignments found</p>
          <p className="text-xs mt-1">You are all caught up for now!</p>
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card bg-base-100 max-w-lg w-full shadow-2xl animate-fade-in border border-base-200">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="card-title text-lg">Submit: {selectedAssignment.title as string}</h3>
                <button onClick={() => setSelectedAssignment(null)} className="btn btn-ghost btn-xs btn-circle">✕</button>
              </div>
              <p className="text-xs text-base-content/60 mb-4">{selectedAssignment.description as string}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-xs">Text Answer / Notes</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-28 focus:textarea-primary text-sm"
                    placeholder="Write your submission response here..."
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-xs">Attachment / File URL</span>
                  </label>
                  <input
                    type="url"
                    className="input input-bordered focus:input-primary text-sm"
                    placeholder="https://drive.google.com/... or file link"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                  />
                </div>

                <div className="card-actions justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedAssignment(null)}
                    className="btn btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                    {submitting ? <span className="loading loading-spinner loading-xs" /> : null}
                    Submit Response
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

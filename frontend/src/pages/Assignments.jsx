import { useEffect, useState } from "react";
import api from "../utils/api"; // your axios instance

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/assignments"); // backend route
      setAssignments(res.data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (assignmentId) => {
    try {
      setSubmittingId(assignmentId);

      await api.post(`/submissions/${assignmentId}`, {
        textAnswer: "Submitted via UI", // later replace with form input
      });

      // update UI instantly
      setAssignments((prev) =>
        prev.map((a) =>
          a._id === assignmentId ? { ...a, status: "Submitted" } : a
        )
      );
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading assignments...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        Assignments
      </h2>

      {assignments.length === 0 ? (
        <p className="text-gray-500">No assignments found</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {assignments.map((a) => (
            <div
              key={a._id}
              className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow"
            >
              <h3 className="font-bold text-lg dark:text-white">
                {a.title}
              </h3>

              <p className="text-sm mt-2 text-gray-500">
                Status:{" "}
                <span
                  className={
                    a.status === "Submitted"
                      ? "text-green-500"
                      : "text-yellow-500"
                  }
                >
                  {a.status || "Pending"}
                </span>
              </p>

              <button
                onClick={() => handleSubmit(a._id)}
                disabled={a.status === "Submitted" || submittingId === a._id}
                className={`mt-4 px-4 py-2 rounded-lg text-white ${
                  a.status === "Submitted"
                    ? "bg-green-500 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {submittingId === a._id
                  ? "Submitting..."
                  : a.status === "Submitted"
                  ? "Submitted"
                  : "Submit"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
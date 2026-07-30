"use client";

// components/student/StudentAttendance.tsx — Student attendance log and percentage gauge
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function StudentAttendance() {
  const { token } = useAuth();
  const [records, setRecords] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.attendance || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const presentCount = records.filter((r) => r.status === "present").length;
  const totalCount = records.length;
  const percentage =
    totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-base-content font-display">
          Attendance Log 📅
        </h1>
        <p className="text-sm text-base-content/60 mt-1">
          Monitor your class attendance rate and session history.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow border border-base-200 p-4">
          <p className="text-xs font-medium text-base-content/50 uppercase">
            Overall Rate
          </p>
          <p className="text-2xl font-bold text-primary mt-1">{percentage}%</p>
        </div>
        <div className="card bg-base-100 shadow border border-base-200 p-4">
          <p className="text-xs font-medium text-base-content/50 uppercase">
            Present
          </p>
          <p className="text-2xl font-bold text-success mt-1">{presentCount}</p>
        </div>
        <div className="card bg-base-100 shadow border border-base-200 p-4">
          <p className="text-xs font-medium text-base-content/50 uppercase">
            Absent
          </p>
          <p className="text-2xl font-bold text-error mt-1">
            {records.filter((r) => r.status === "absent").length}
          </p>
        </div>
        <div className="card bg-base-100 shadow border border-base-200 p-4">
          <p className="text-xs font-medium text-base-content/50 uppercase">
            Late / Leave
          </p>
          <p className="text-2xl font-bold text-warning mt-1">
            {
              records.filter((r) => r.status === "late" || r.status === "leave")
                .length
            }
          </p>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">Session Records</h2>
          {loading ? (
            <div className="py-12 text-center">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id as string}>
                      <td>{new Date(r.date as string).toLocaleDateString()}</td>
                      <td className="font-semibold">
                        {((r.course as Record<string, unknown>)
                          ?.title as string) || "Course"}
                      </td>
                      <td>
                        <span
                          className={`badge badge-sm ${
                            r.status === "present"
                              ? "badge-success"
                              : r.status === "absent"
                                ? "badge-error"
                                : "badge-warning"
                          }`}
                        >
                          {r.status as string}
                        </span>
                      </td>
                      <td className="text-xs text-base-content/60">
                        {(r.remarks as string) || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-base-content/40">
              <p className="text-4xl mb-2">📅</p>
              <p>No attendance records logged yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

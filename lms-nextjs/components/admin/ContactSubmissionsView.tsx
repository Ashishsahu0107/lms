"use client";

// components/admin/ContactSubmissionsView.tsx — Admin Support Submissions Dashboard
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
}

export default function ContactSubmissionsView() {
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    if (!token) return;
    try {
      let url = "/api/admin/contact?limit=50";
      if (statusFilter) url += `&status=${statusFilter}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.data.requests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Submission status updated!");
      fetchSubmissions();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status",
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Submission deleted!");
      fetchSubmissions();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete submission",
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-base-content">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight font-display">
            Support Submissions 📬
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            View, track, and resolve user contact form inquiries.
          </p>
        </div>

        {/* Filter Dropdown */}
        <select
          className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-base-content text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center text-xs text-base-content/60">
            No contact submissions found.
          </div>
        ) : (
          <Table
            headers={[
              "User Contact",
              "Subject & Message",
              "Status",
              "Date",
              "Actions",
            ]}
          >
            {submissions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div className="font-semibold text-base-content">
                    {sub.name}
                  </div>
                  <div className="text-base-content/60 text-[11px]">
                    {sub.email}
                  </div>
                  {sub.phone && (
                    <div className="text-base-content/50 text-[10px]">
                      {sub.phone}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-base-content">
                    {sub.subject}
                  </div>
                  <div className="text-base-content/60 text-[11px] line-clamp-2 max-w-xs">
                    {sub.message}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      sub.status === "NEW"
                        ? "warning"
                        : sub.status === "IN_PROGRESS"
                          ? "info"
                          : "success"
                    }
                  >
                    {sub.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-base-content/60 text-xs">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <select
                      className="px-2 py-1 rounded-lg border border-base-300 bg-base-100 text-base-content text-[11px]"
                      value={sub.status}
                      onChange={(e) =>
                        handleStatusChange(sub.id, e.target.value)
                      }
                    >
                      <option value="NEW">New</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(sub.id)}
                    >
                      🗑️
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

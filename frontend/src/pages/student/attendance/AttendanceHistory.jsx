import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Plane,
  Filter,
  RefreshCw,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { getMyAttendance } from "../../../services/attendanceService";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  present: {
    label: "Present",
    color: "#10b981",
    cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckCircle,
  },
  absent: {
    label: "Absent",
    color: "#f43f5e",
    cls: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: XCircle,
  },
  late: {
    label: "Late",
    color: "#f59e0b",
    cls: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Clock,
  },
  leave: {
    label: "Leave",
    color: "#3b82f6",
    cls: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: Plane,
  },
};

export default function AttendanceHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyAttendance({ from, to, courseId: filterCourse });
      if (res.data?.success) {
        setRecords(res.data.data || []);
      }
    } catch {
      toast.error("Failed to load attendance history");
    } finally {
      setLoading(false);
    }
  }, [from, to, filterCourse]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = () => {
    if (records.length === 0) {
      toast.error("No records to export");
      return;
    }
    const headers = "Date,Course,Status,Remarks\n";
    const rows = records
      .map(
        (r) =>
          `"${new Date(r.date).toLocaleDateString()}",` +
          `"${r.courseId?.title || "Unknown"}",` +
          `"${r.status.toUpperCase()}",` +
          `"${r.remarks || ""}"`,
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "Attendance_History.csv");
    a.click();
    toast.success("Exported successfully");
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-6 max-w-6xl mx-auto" id="attendance-history-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Attendance Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Detailed history of all marked class attendances
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading}
            className="gap-2 text-sm"
          >
            <FileText className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-2 text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                From
              </label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                To
              </label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <Button
              onClick={loadData}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-10"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter Records
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Records Grid/Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Date", "Course", "Status", "Remarks"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[1, 2, 3, 4].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-muted/30 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-14 text-muted-foreground text-sm"
                  >
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No attendance records found for the selected range.
                  </td>
                </tr>
              ) : (
                records.map((record, idx) => {
                  const cfg =
                    STATUS_CONFIG[record.status] || STATUS_CONFIG.present;
                  return (
                    <motion.tr
                      key={record._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                          <span className="text-sm font-semibold text-foreground">
                            {formatDate(record.date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {record.courseId?.title || "Unknown Course"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${cfg.cls}`}
                        >
                          <cfg.icon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {record.remarks || (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

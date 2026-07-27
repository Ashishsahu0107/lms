// src/pages/superadmin/assignments/AdminAssignments.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trash2,
  Search,
  ClipboardList,
  FileText,
  Calendar,
  Eye,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import {
  getAssignments,
  deleteAssignment,
} from "../../../services/assignmentService";
import toast from "react-hot-toast";

export default function AdminAssignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getAssignments();
        if (res.data?.success) {
          setAssignments(res.data.data || []);
        } else {
          toast.error("Failed to load platform assignments");
        }
      } catch (err) {
        console.error("Error loading admin assignments:", err);
        toast.error("Failed to query platform records");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "WARNING: You are logged in as SUPER ADMIN. Deleting this assignment will cascade delete ALL student submissions and associated marks. This action is permanent and cannot be undone. Do you wish to continue?",
      )
    ) {
      return;
    }

    try {
      const res = await deleteAssignment(id);
      if (res.data?.success) {
        setAssignments(assignments.filter((a) => a._id !== id));
        toast.success(
          "Platform assignment and all associated submissions permanently purged",
        );
      } else {
        toast.error("Failed to purge asset");
      }
    } catch (err) {
      console.error("Error deleting platform assignment:", err);
      toast.error("Encountered database deletion error");
    }
  };

  const filteredAssignments = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.courseId?.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (a.createdBy?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
      id="admin-assignments-moderation-container"
    >
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-6 rounded-3xl border border-primary/20 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-error gap-1 py-3 px-3 rounded-full text-xs font-semibold text-white">
              <ShieldAlert className="h-3.5 w-3.5" /> Platform Moderation Panel
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">
            Global Assignments Moderator
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor, audit and delete corrupt homework sheets across all
            platform courses.
          </p>
        </div>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-base-300 shadow-xl hover:shadow-2xl transition-all rounded-3xl bg-base-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-primary/10 text-primary rounded-2xl">
              <ClipboardList className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total platform briefs
              </p>
              <h3 className="text-2xl font-extrabold text-foreground">
                {assignments.length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-base-300 shadow-xl hover:shadow-2xl transition-all rounded-3xl bg-base-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-warning/10 text-warning rounded-2xl">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                AI Questions draft
              </p>
              <h3 className="text-2xl font-extrabold text-foreground">
                {assignments.filter((a) => a.generatedFromDocument).length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-base-300 shadow-xl hover:shadow-2xl transition-all rounded-3xl bg-base-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-success/10 text-success rounded-2xl">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Active Teachers
              </p>
              <h3 className="text-2xl font-extrabold text-foreground">
                {new Set(assignments.map((a) => a.createdBy?._id)).size} Authors
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Toolbar */}
      <div className="flex justify-between items-center gap-4 bg-base-100 border border-base-300 p-4 rounded-2xl shadow-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-11 h-11 bg-base-200 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary w-full text-sm"
            placeholder="Search assignments by title, course, or instructor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="admin-assignments-search"
          />
        </div>
      </div>

      {/* Moderation Grid */}
      <Card className="border-base-300 shadow-2xl rounded-3xl overflow-hidden bg-base-100">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className="text-sm text-muted-foreground animate-pulse font-medium">
                Auditing database records...
              </p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm flex flex-col items-center">
              <ShieldAlert className="h-10 w-10 text-muted-foreground/60 mb-3" />
              <h3 className="text-lg font-bold mb-1">
                No platform assignments found
              </h3>
              <p className="text-xs text-muted-foreground">
                Audit query returned 0 active briefs in the system database.
              </p>
            </div>
          ) : (
            <table className="table w-full text-sm">
              <thead>
                <tr className="border-b border-base-300 bg-base-200/20 text-muted-foreground">
                  <th>Brief Title</th>
                  <th>Target Course</th>
                  <th>Created By (Teacher)</th>
                  <th>Points Allowed</th>
                  <th>Deadline</th>
                  <th>Category</th>
                  <th className="text-right">Administration</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((ass) => {
                  const formattedDate = new Date(
                    ass.dueDate,
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={ass._id}
                      className="border-b border-base-200 hover:bg-base-200/40 transition-colors"
                    >
                      <td className="font-bold flex items-center gap-3">
                        <div className="p-2 bg-error/10 text-error rounded-xl">
                          <FileText className="h-5 w-5" />
                        </div>
                        <span className="text-foreground line-clamp-1">
                          {ass.title}
                        </span>
                      </td>
                      <td>
                        <span className="font-semibold text-muted-foreground text-xs">
                          {ass.courseId?.title || "Enrolled Course"}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-neutral text-xs font-semibold py-1 px-2 rounded-lg">
                          {ass.createdBy?.name || "LMS Pro Teacher"}
                        </span>
                      </td>
                      <td className="font-bold text-foreground">
                        {ass.totalMarks} Marks
                      </td>
                      <td>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-warning/80" />{" "}
                          {formattedDate}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-outline text-[10px] font-bold py-2.5 px-2 rounded-xl capitalize">
                          {ass.assignmentType}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() =>
                              navigate(`/admin/assignments/${ass._id}`)
                            }
                            size="icon"
                            variant="ghost"
                            className="hover:text-primary rounded-full bg-base-200 p-2"
                            title="Audit submissions sheet"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(ass._id)}
                            size="icon"
                            variant="ghost"
                            className="hover:text-error rounded-full bg-base-200 p-2"
                            title="Purge assignment & all marks cascade"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

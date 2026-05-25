// src/pages/superadmin/quizzes/AdminQuizzes.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trash2,
  Search,
  HelpCircle,
  FileText,
  Calendar,
  Eye,
  ShieldAlert,
  Sparkles,
  Users,
  Award,
  Clock,
  BarChart2,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { getQuizzes, deleteQuiz } from "../../../services/quizService";
import toast from "react-hot-toast";

export default function AdminQuizzes() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getQuizzes();
        if (res.data?.success) {
          setQuizzes(res.data.data || []);
        } else {
          toast.error("Failed to load platform assessments");
        }
      } catch (err) {
        console.error("Error loading admin quizzes:", err);
        toast.error("Failed to query platform records");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("WARNING: You are logged in as SUPER ADMIN. Deleting this quiz will cascade delete ALL associated questions, attempts history, and student scorecards. This action is permanent. Continue?")) {
      return;
    }

    try {
      const res = await deleteQuiz(id);
      if (res.data?.success) {
        setQuizzes(quizzes.filter(q => q._id !== id));
        toast.success("Platform quiz and all attempts logs permanently purged!");
      } else {
        toast.error("Failed to purge assessment card");
      }
    } catch (err) {
      console.error("Error deleting platform quiz:", err);
      toast.error("Encountered database deletion error");
    }
  };

  const filteredQuizzes = quizzes.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.courseId?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.createdBy?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
      id="admin-quizzes-moderation-container"
    >
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-6 rounded-3xl border border-primary/20 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-error gap-1 py-3 px-3 rounded-full text-xs font-semibold text-white">
              <ShieldAlert className="h-3.5 w-3.5" /> Platform Audits Panel
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Global Quizzes Moderator</h1>
          <p className="text-sm text-muted-foreground">Monitor, audit and delete corrupt exam materials across all platform courses.</p>
        </div>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-base-300 shadow-xl hover:shadow-2xl transition-all rounded-3xl bg-base-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-primary/10 text-primary rounded-2xl">
              <HelpCircle className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total platform quizzes</p>
              <h3 className="text-2xl font-extrabold text-foreground">{quizzes.length} Quizzes</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-base-300 shadow-xl hover:shadow-2xl transition-all rounded-3xl bg-base-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-success/10 text-success rounded-2xl">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Published Exams</p>
              <h3 className="text-2xl font-extrabold text-foreground">
                {quizzes.filter(q => q.status === "published").length} Published
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-base-300 shadow-xl hover:shadow-2xl transition-all rounded-3xl bg-base-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-warning/10 text-warning rounded-2xl">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Unique Quiz Creators</p>
              <h3 className="text-2xl font-extrabold text-foreground">
                {new Set(quizzes.map(q => q.createdBy?._id)).size} Instructors
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
            placeholder="Search quizzes by title, course, or teacher name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="admin-quizzes-search"
          />
        </div>
      </div>

      {/* Audits table */}
      <Card className="border-base-300 shadow-2xl rounded-3xl overflow-hidden bg-base-100">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className="text-sm text-muted-foreground animate-pulse font-medium">Auditing assessment database...</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm flex flex-col items-center">
              <ShieldAlert className="h-10 w-10 text-muted-foreground/60 mb-3" />
              <h3 className="text-lg font-bold mb-1">No platform quizzes found</h3>
              <p className="text-xs text-muted-foreground">Audit search returned 0 active exams in database.</p>
            </div>
          ) : (
            <table className="table w-full text-sm">
              <thead>
                <tr className="border-b border-base-300 bg-base-200/20 text-muted-foreground">
                  <th>Quiz Title</th>
                  <th>Target Course</th>
                  <th>Created By (Teacher)</th>
                  <th>Questions Count</th>
                  <th>Duration Limit</th>
                  <th>Total Marks</th>
                  <th>Status</th>
                  <th className="text-right">Administration</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.map((quiz) => {
                  return (
                    <tr key={quiz._id} className="border-b border-base-200 hover:bg-base-200/40 transition-colors">
                      <td className="font-bold flex items-center gap-3">
                        <div className="p-2 bg-error/10 text-error rounded-xl">
                          <HelpCircle className="h-5 w-5" />
                        </div>
                        <span className="text-foreground line-clamp-1">{quiz.title}</span>
                      </td>
                      <td>
                        <span className="font-semibold text-muted-foreground text-xs">{quiz.courseId?.title || "Enrolled Course"}</span>
                      </td>
                      <td>
                        <span className="badge badge-neutral text-xs font-semibold py-1 px-2 rounded-lg">
                          {quiz.createdBy?.name || "LMS Pro Teacher"}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-outline border-base-300 text-xs font-semibold px-2 py-1 rounded-lg">
                          {quiz.questions?.length || 0} Questions
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                          <Clock className="h-3.5 w-3.5 text-warning/80" /> {quiz.duration} Mins
                        </span>
                      </td>
                      <td className="font-bold text-foreground">{quiz.totalMarks} Marks</td>
                      <td>
                        <span className={`badge rounded-xl px-2.5 py-1 text-[10px] font-bold text-white capitalize ${
                          quiz.status === "published" ? "bg-success" : quiz.status === "closed" ? "bg-error" : "bg-warning"
                        }`}>
                          {quiz.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => navigate(`/teacher/quizzes/analytics/${quiz._id}`)}
                            size="icon"
                            variant="ghost"
                            className="hover:text-primary rounded-full bg-base-200 p-2"
                            title="Audit student scores reports"
                          >
                            <BarChart2 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(quiz._id)}
                            size="icon"
                            variant="ghost"
                            className="hover:text-error rounded-full bg-base-200 p-2"
                            title="Purge assessment cascade"
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

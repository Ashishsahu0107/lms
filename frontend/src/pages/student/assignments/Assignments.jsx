// src/pages/student/assignments/Assignments.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  BookOpen,
  Search,
  ChevronRight,
  Sparkles,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/Tabs";
import { getAssignments } from "../../../services/assignmentService";
import toast from "react-hot-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export default function Assignments() {
  const navigate = useNavigate();
  const [assignmentsList, setAssignmentsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssignments() {
      try {
        setLoading(true);
        const res = await getAssignments();
        if (res.data?.success) {
          setAssignmentsList(res.data.data || []);
        } else {
          toast.error("Failed to load assignments");
        }
      } catch (err) {
        console.error("Error fetching assignments:", err);
        toast.error("Failed to load assignments from API server");
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, []);

  // Filter based on Search & Tabs
  const filteredAssignments = assignmentsList.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (assignment.courseId?.title || "").toLowerCase().includes(searchQuery.toLowerCase());

    const isClosed = new Date() > new Date(assignment.dueDate);

    if (!matchesSearch) return false;
    if (activeTab === "all") return true;
    if (activeTab === "active") return !isClosed;
    if (activeTab === "past") return isClosed;
    return true;
  });

  // Calculate quick stats
  const activeCount = assignmentsList.filter(a => new Date() <= new Date(a.dueDate)).length;
  const closedCount = assignmentsList.filter(a => new Date() > new Date(a.dueDate)).length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
      id="student-assignments-container"
    >
      {/* HEADER SECTION */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-6 rounded-3xl border border-primary/20 shadow-xl backdrop-blur-md"
        id="student-assignments-header-panel"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge badge-primary gap-1 py-3 px-3 rounded-full text-xs font-semibold">
              <Sparkles className="h-3 w-3" /> Assignment Board
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground" id="student-assignments-title">
            Your Assignments
          </h1>
          <p className="text-muted-foreground text-sm">
            Access course homework sheets, draft submissions, and view graded feedback reports.
          </p>
        </div>
      </motion.div>

      {/* STATISTICS PANELS */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-5 sm:grid-cols-3"
        id="student-assignments-stats-grid"
      >
        <Card className="relative overflow-hidden bg-base-100 shadow-xl border border-base-300 hover:border-primary/30 transition-all duration-300 rounded-3xl" id="student-assignments-total-card">
          <CardContent className="flex items-center gap-5 p-6">
            <div className="rounded-2xl bg-primary/10 p-4 text-primary">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Assigned</p>
              <h2 className="text-3xl font-extrabold text-foreground">{assignmentsList.length}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-base-100 shadow-xl border border-base-300 hover:border-warning/30 transition-all duration-300 rounded-3xl" id="student-assignments-active-card">
          <CardContent className="flex items-center gap-5 p-6">
            <div className="rounded-2xl bg-warning/10 p-4 text-warning">
              <Clock className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active (Ongoing)</p>
              <h2 className="text-3xl font-extrabold text-foreground">{activeCount}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-base-100 shadow-xl border border-base-300 hover:border-success/30 transition-all duration-300 rounded-3xl" id="student-assignments-closed-card">
          <CardContent className="flex items-center gap-5 p-6">
            <div className="rounded-2xl bg-success/10 p-4 text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Closed/Passed</p>
              <h2 className="text-3xl font-extrabold text-foreground">{closedCount}</h2>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* FILTER & SEARCH TOOLBAR */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-base-100 border border-base-300 p-5 rounded-3xl shadow-lg"
        id="student-assignments-toolbar"
      >
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by assignment title or course..."
            className="pl-11 h-12 bg-base-200 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary w-full text-sm"
            id="student-assignments-search-field"
          />
        </div>

        {/* Tab Selection */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto" id="student-assignments-tabs">
          <TabsList className="bg-base-200 p-1.5 rounded-2xl border border-base-300 flex w-full md:w-auto gap-1">
            <TabsTrigger value="all" className="rounded-xl px-4 py-2 text-xs font-semibold" id="student-tab-all">All</TabsTrigger>
            <TabsTrigger value="active" className="rounded-xl px-4 py-2 text-xs font-semibold" id="student-tab-active">Active</TabsTrigger>
            <TabsTrigger value="past" className="rounded-xl px-4 py-2 text-xs font-semibold" id="student-tab-past">Passed</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* ASSIGNMENTS GRID/LIST */}
      <motion.div variants={itemVariants} id="student-assignments-list-panel">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4" id="student-assignments-loading-spinner">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="text-sm text-muted-foreground animate-pulse font-medium">Fetching assignments from the secure database...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <Card className="bg-base-100 shadow-xl border border-base-300 rounded-3xl" id="student-assignments-empty-card">
            <CardContent className="py-20 text-center flex flex-col items-center max-w-md mx-auto">
              <div className="rounded-full bg-base-200 p-5 mb-5 text-muted-foreground">
                <AlertCircle className="h-10 w-10 text-muted-foreground/60" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Assignments Available</h3>
              <p className="text-muted-foreground text-sm mb-6">
                There are currently no assignments matching your selection. Check back soon for homework sheets uploaded by your instructors.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4" id="student-assignments-list">
            {filteredAssignments.map((assignment) => {
              const isClosed = new Date() > new Date(assignment.dueDate);
              const formattedDate = new Date(assignment.dueDate).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <motion.div
                  key={assignment._id}
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="cursor-pointer"
                  onClick={() => navigate(`/student/assignments/${assignment._id}`)}
                  id={`student-assignment-item-${assignment._id}`}
                >
                  <Card className="border border-base-300 bg-base-100 shadow-lg hover:shadow-xl hover:border-primary/20 transition-all duration-300 rounded-3xl overflow-hidden">
                    <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Left Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3.5 rounded-2xl ${isClosed ? "bg-base-300 text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center flex-wrap gap-2">
                            <h3 className="text-lg font-bold text-foreground line-clamp-1">{assignment.title}</h3>
                            <span className={`badge ${isClosed ? "badge-secondary" : "badge-primary"} text-xs font-semibold px-2.5 py-2.5 rounded-xl capitalize`}>
                              {assignment.assignmentType}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-medium text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5 text-primary/80" />
                              {assignment.courseId?.title || "Assigned Course"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-warning/80" />
                              Due: {formattedDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Actions / Details */}
                      <div className="flex items-center justify-between w-full sm:w-auto border-t sm:border-none pt-4 sm:pt-0 gap-4">
                        <div className="text-left sm:text-right space-y-1">
                          <span className="text-xs text-muted-foreground block font-medium">Points Value</span>
                          <span className="text-lg font-extrabold text-foreground">{assignment.totalMarks} Marks</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full bg-base-200 hover:bg-primary hover:text-white transition-all p-2 h-10 w-10 flex items-center justify-center"
                          id={`assignment-action-btn-${assignment._id}`}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
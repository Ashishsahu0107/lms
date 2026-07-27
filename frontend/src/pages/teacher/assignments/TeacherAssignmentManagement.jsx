// src/pages/teacher/assignments/TeacherAssignmentManagement.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  ClipboardList,
  FileText,
  Trash2,
  Calendar,
  FileCheck,
  Sparkles,
  BrainCircuit,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { getCourses } from "../../../services/courseService";
import {
  getAssignments,
  createAssignment,
  deleteAssignment,
  generateAssignmentDraft,
} from "../../../services/assignmentService";
import toast from "react-hot-toast";

export default function TeacherAssignmentManagement() {
  const navigate = useNavigate();

  // Data States
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals & Panels Active state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState("manual"); // "manual" or "ai"

  // Manual Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [courseId, setCourseId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);
  const [assignmentType, setAssignmentType] = useState("written");

  // AI Generator States
  const [notesText, setNotesText] = useState("");
  const [topicTitle, setTopicTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Load Assignments & Courses
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [assRes, coursesRes] = await Promise.all([
          getAssignments(),
          getCourses(),
        ]);

        if (assRes.data?.success) {
          setAssignments(assRes.data.data || []);
        }
        if (coursesRes.data?.success) {
          const coursesList = coursesRes.data.data || [];
          setCourses(coursesList);
          if (coursesList.length > 0) {
            setCourseId(coursesList[0]._id);
          }
        }
      } catch (err) {
        console.error("Error loading teacher assignments workspace:", err);
        toast.error("Failed to load assignments and courses");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // AI Generation Trigger
  const handleAIGenerate = async (e) => {
    e.preventDefault();
    if (!topicTitle.trim() && !notesText.trim()) {
      toast.error(
        "Please provide either a Topic Title or paste Lecture Notes/Keywords.",
      );
      return;
    }

    try {
      setIsGenerating(true);
      const res = await generateAssignmentDraft({ notesText, topicTitle });

      if (res.data?.success) {
        const draft = res.data.data;
        // Populate standard form states automatically
        setTitle(draft.title || "");
        setDescription(draft.description || "");
        setInstructions(draft.instructions || "");
        setAssignmentType("mcq"); // Set a draft type
        setActiveFormTab("manual"); // Shift view to standard form so instructor can review
        toast.success("AI draft brief compiled! Review and save below.");
      } else {
        toast.error("Failed to generate questions");
      }
    } catch (err) {
      console.error("Error generating draft:", err);
      toast.error("AI question parsing failed");
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit manual assignment
  const handlePublishAssignment = async (e) => {
    e.preventDefault();
    if (!title.trim() || !courseId || !dueDate) {
      toast.error("Title, Target Course, and Due Date are required fields.");
      return;
    }

    try {
      const res = await createAssignment({
        title,
        description,
        instructions,
        courseId,
        dueDate,
        totalMarks: Number(totalMarks),
        assignmentType,
        generatedFromDocument:
          activeFormTab === "ai" || instructions.includes("MCQ"),
      });

      if (res.data?.success) {
        setAssignments([res.data.data, ...assignments]);
        // Reset states
        setTitle("");
        setDescription("");
        setInstructions("");
        setDueDate("");
        setNotesText("");
        setTopicTitle("");
        setShowCreateModal(false);
        toast.success(
          "Assignment published successfully to course enrolled students!",
        );
      } else {
        toast.error("Failed to create assignment");
      }
    } catch (err) {
      console.error("Error creating assignment:", err);
      toast.error("Encountered error publishing assignment sheet");
    }
  };

  // Delete Assignment Handler
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you absolutely sure you want to permanently delete this assignment? All student submission records will be lost.",
      )
    ) {
      return;
    }

    try {
      const res = await deleteAssignment(id);
      if (res.data?.success) {
        setAssignments(assignments.filter((a) => a._id !== id));
        toast.success("Assignment permanently deleted");
      } else {
        toast.error("Failed to delete assignment");
      }
    } catch (err) {
      console.error("Error deleting assignment:", err);
      toast.error("Encountered database delete error");
    }
  };

  // Search Filter
  const filteredAssignments = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.courseId?.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
      id="teacher-assignment-module-container"
    >
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-6 rounded-3xl border border-primary/20 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-primary gap-1 py-3 px-3 rounded-full text-xs font-semibold">
              <Sparkles className="h-3 w-3" /> Teacher Portal
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">
            Assignment Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Deliver briefs, compile AI quizzes, and evaluate student workspaces.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-2xl h-12 px-5 text-white"
          id="create-assignment-trigger"
        >
          <Plus className="h-5 w-5" /> Publish New Brief
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-base-300 shadow-xl hover:shadow-2xl transition-all rounded-3xl bg-base-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-primary/10 text-primary rounded-2xl">
              <ClipboardList className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total Assignments
              </p>
              <h3 className="text-2xl font-extrabold text-foreground">
                {assignments.length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-base-300 shadow-xl hover:shadow-2xl transition-all rounded-3xl bg-base-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-success/10 text-success rounded-2xl">
              <FileCheck className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                AI Generated
              </p>
              <h3 className="text-2xl font-extrabold text-foreground">
                {assignments.filter((a) => a.generatedFromDocument).length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-base-300 shadow-xl hover:shadow-2xl transition-all rounded-3xl bg-base-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-secondary/10 text-secondary rounded-2xl">
              <BrainCircuit className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Average Points
              </p>
              <h3 className="text-2xl font-extrabold text-foreground">
                100 Marks
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center gap-4 bg-base-100 border border-base-300 p-4 rounded-2xl shadow-md">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-11 h-11 bg-base-200 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary w-full text-sm"
            placeholder="Search assignments by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="teacher-assignments-search"
          />
        </div>
      </div>

      {/* Assignments Table Card */}
      <Card className="border-base-300 shadow-2xl rounded-3xl overflow-hidden bg-base-100">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className="text-sm text-muted-foreground animate-pulse font-medium">
                Retrieving assignments dashboard data...
              </p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm flex flex-col items-center max-w-md mx-auto">
              <AlertTriangle className="h-10 w-10 text-muted-foreground/60 mb-3" />
              <h3 className="text-lg font-bold mb-1">
                No Assignments Published
              </h3>
              <p className="text-xs text-muted-foreground mb-6">
                Create homework briefs manually or try our AI generation tool to
                get started instantly.
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="btn-sm rounded-xl"
              >
                Create assignment
              </Button>
            </div>
          ) : (
            <table className="table w-full text-sm">
              <thead>
                <tr className="border-b border-base-300 bg-base-200/20 text-muted-foreground">
                  <th>Topic Title</th>
                  <th>Target Course</th>
                  <th>Marks Value</th>
                  <th>Due Date</th>
                  <th>Assignment Type</th>
                  <th>AI Generated</th>
                  <th className="text-right">Actions</th>
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
                        <div className="p-2 bg-primary/10 text-primary rounded-xl">
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
                      <td className="font-bold">{ass.totalMarks} Marks</td>
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
                      <td>
                        {ass.generatedFromDocument ? (
                          <span className="badge badge-success text-[10px] font-bold text-white py-2.5 px-2.5 rounded-xl gap-1">
                            <BrainCircuit className="h-3.5 w-3.5" /> YES
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 italic font-semibold">
                            No
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() =>
                              navigate(`/teacher/assignments/${ass._id}`)
                            }
                            size="icon"
                            variant="ghost"
                            className="hover:text-primary rounded-full bg-base-200 p-2"
                            title="Evaluate student submissions"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(ass._id)}
                            size="icon"
                            variant="ghost"
                            className="hover:text-error rounded-full bg-base-200 p-2"
                            title="Delete assignment brief"
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

      {/* CREATE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-base-100 w-full max-w-2xl rounded-3xl border border-base-300 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Modal Tabs Header */}
              <div className="p-6 bg-base-200 border-b border-base-300 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-xl text-foreground">
                    Publish Brief
                  </h3>
                </div>
                <div className="flex bg-base-300 p-1 rounded-2xl border border-base-300 gap-1">
                  <button
                    onClick={() => setActiveFormTab("manual")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeFormTab === "manual"
                        ? "bg-base-100 text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Manual Sheet
                  </button>
                  <button
                    onClick={() => setActiveFormTab("ai")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      activeFormTab === "ai"
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <BrainCircuit className="h-3.5 w-3.5" /> AI Draft Creator
                  </button>
                </div>
              </div>

              {/* Modal Content Scroll Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeFormTab === "ai" ? (
                  /* AI DRAFT CREATOR VIEW */
                  <form onSubmit={handleAIGenerate} className="space-y-4">
                    <div className="bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-5 rounded-2xl border border-primary/20 space-y-2">
                      <h4 className="font-extrabold text-sm text-primary flex items-center gap-2">
                        <Sparkles className="h-4.5 w-4.5 text-primary animate-spin" />{" "}
                        Automated Question Generator
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Input a topic title or paste lecture transcripts and
                        note concepts. The simulated generator will read
                        keywords to draft full MCQ matrices, short questions,
                        and code challenges instantly.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground">
                        Concept Topic / Title
                      </label>
                      <Input
                        value={topicTitle}
                        onChange={(e) => setTopicTitle(e.target.value)}
                        placeholder="e.g. React hooks, Advanced Python loops, UX principles"
                        className="h-11 bg-base-200 border-none rounded-xl pl-4"
                        required={!notesText}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground">
                        Notes / Lecture Materials
                      </label>
                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        placeholder="Paste lecture outlines, keywords, slide descriptions, or notes text content to feed to generator..."
                        className="textarea textarea-bordered border-base-300 w-full h-[180px] rounded-2xl bg-base-200 focus:bg-base-100 text-sm p-4"
                        required={!topicTitle}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t mt-4 border-base-300">
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isGenerating}
                        className="btn-primary text-white gap-2"
                      >
                        {isGenerating ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <>
                            <BrainCircuit className="h-4 w-4" /> Draft Brief
                            Questions
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* MANUAL SHEET PUBLISH FORM */
                  <form
                    onSubmit={handlePublishAssignment}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">
                          Assignment Title
                        </label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Redux Toolkit Integrations"
                          className="h-11 bg-base-200 border-none rounded-xl pl-4 text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">
                          Target Course
                        </label>
                        <select
                          className="select select-bordered border-base-300 w-full h-11 rounded-xl px-3 bg-base-200 text-sm"
                          value={courseId}
                          onChange={(e) => setCourseId(e.target.value)}
                          required
                        >
                          {courses.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">
                          Marks Value
                        </label>
                        <Input
                          type="number"
                          value={totalMarks}
                          onChange={(e) => setTotalMarks(e.target.value)}
                          className="h-11 bg-base-200 border-none rounded-xl pl-4 text-sm font-bold"
                          min={10}
                          max={100}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">
                          Due Date
                        </label>
                        <Input
                          type="datetime-local"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="h-11 bg-base-200 border-none rounded-xl pl-4 text-sm font-semibold"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">
                          Brief Category
                        </label>
                        <select
                          className="select select-bordered border-base-300 w-full h-11 rounded-xl px-3 bg-base-200 text-sm"
                          value={assignmentType}
                          onChange={(e) => setAssignmentType(e.target.value)}
                        >
                          <option value="written">Written / Essay</option>
                          <option value="mcq">MCQ Choice Grid</option>
                          <option value="code">Coding Project</option>
                          <option value="document">PDF / Doc File</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">
                        Overview Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief summary introducing the goal of this assignment..."
                        className="textarea textarea-bordered border-base-300 w-full h-[80px] rounded-xl bg-base-200 text-sm p-4"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground flex items-center justify-between">
                        <span>Instructions & Questions Matrix</span>
                        {instructions && (
                          <span className="text-[10px] badge badge-outline text-primary font-bold">
                            Imported Questions Sheet
                          </span>
                        )}
                      </label>
                      <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Detail questions list, rules, specifications and instructions..."
                        className="textarea textarea-bordered border-base-300 w-full h-[150px] rounded-2xl bg-base-200 text-sm p-4 font-mono"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t mt-4 border-base-300">
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="btn-primary text-white">
                        Publish to Course
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

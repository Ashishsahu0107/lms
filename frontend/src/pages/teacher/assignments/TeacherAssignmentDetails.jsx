import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Clock,
  AlertTriangle,
  X,
  ChevronLeft,
  BookOpen,
  User,
  GraduationCap,
  ClipboardList,
  Edit,
  Trash,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { fetchAssignmentById, editAssignment } from "../../../redux/slices/assignmentSlice";
import { fetchAssignmentSubmissions, evaluateSubmission, clearSubmissionState } from "../../../redux/slices/submissionSlice";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import toast from "react-hot-toast";

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function TeacherAssignmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux Selectors
  const { currentAssignment, loading: assignmentLoading } = useSelector((state) => state.assignments);
  const { submissions, loading: submissionsLoading, success: gradingSuccess, error: gradingError } = useSelector(
    (state) => state.submissions
  );

  // Local state for grading
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rubricScores, setRubricScores] = useState({}); // { [criterionTitle]: score }
  const [rubricFeedbacks, setRubricFeedbacks] = useState({}); // { [criterionTitle]: comment }
  const [overallFeedback, setOverallFeedback] = useState("");
  const [submittingGrade, setSubmittingGrade] = useState(false);

  // Local state for editing assignment
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editTotalMarks, setEditTotalMarks] = useState(100);
  const [editAssignmentType, setEditAssignmentType] = useState("written");
  const [editRubric, setEditRubric] = useState([]);

  useEffect(() => {
    dispatch(fetchAssignmentById(id));
    dispatch(fetchAssignmentSubmissions(id));
  }, [id, dispatch]);

  // Handle grading success/error alerts
  useEffect(() => {
    if (gradingSuccess) {
      toast.success("Submissions evaluation graded and student notified!");
      dispatch(fetchAssignmentSubmissions(id));
      dispatch(clearSubmissionState());
      setTimeout(() => {
        setSubmittingGrade(false);
        // Refresh the selected submission with new data
        if (selectedSubmission) {
          const updated = submissions.find(s => s._id === selectedSubmission._id);
          if (updated) setSelectedSubmission(updated);
        }
      }, 0);
    }
    if (gradingError) {
      toast.error(gradingError);
      dispatch(clearSubmissionState());
      setTimeout(() => {
        setSubmittingGrade(false);
      }, 0);
    }
  }, [gradingSuccess, gradingError, id, dispatch, submissions, selectedSubmission]);

  // Load grading states upon selecting a submission
  useEffect(() => {
    if (selectedSubmission) {
      const scores = {};
      const feedbacks = {};
      if (selectedSubmission.rubricEvaluation && selectedSubmission.rubricEvaluation.length > 0) {
        selectedSubmission.rubricEvaluation.forEach((re) => {
          scores[re.criterionTitle] = re.score;
          feedbacks[re.criterionTitle] = re.feedback || "";
        });
      } else {
        // Pre-populate with 0 scores
        if (currentAssignment?.rubric) {
          currentAssignment.rubric.forEach((r) => {
            scores[r.criterion] = 0;
            feedbacks[r.criterion] = "";
          });
        }
      }
      setTimeout(() => {
        setOverallFeedback(selectedSubmission.feedback || "");
        setRubricScores(scores);
        setRubricFeedbacks(feedbacks);
      }, 0);
    }
  }, [selectedSubmission, currentAssignment]);

  // Set edit details when opening edit modal
  const openEditModal = () => {
    if (currentAssignment) {
      setEditTitle(currentAssignment.title || "");
      setEditDescription(currentAssignment.description || "");
      setEditInstructions(currentAssignment.instructions || "");
      // Formats due date for input type datetime-local
      const date = currentAssignment.dueDate ? new Date(currentAssignment.dueDate) : new Date();
      const offset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
      setEditDueDate(localISOTime);
      setEditTotalMarks(currentAssignment.totalMarks || 100);
      setEditAssignmentType(currentAssignment.assignmentType || "written");
      setEditRubric(currentAssignment.rubric || []);
      setShowEditModal(true);
    }
  };

  // Rubric builder handlers
  const addRubricCriterion = () => {
    setEditRubric([
      ...editRubric,
      { criterion: "New Criterion", maxPoints: 10, description: "" }
    ]);
  };

  const removeRubricCriterion = (idx) => {
    setEditRubric(editRubric.filter((_, i) => i !== idx));
  };

  const updateRubricCriterion = (idx, field, value) => {
    const updated = editRubric.map((r, i) => {
      if (i === idx) {
        return { ...r, [field]: field === "maxPoints" ? Number(value) : value };
      }
      return r;
    });
    setEditRubric(updated);
  };

  // Submit edit assignment details
  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDueDate) {
      toast.error("Title and Due Date are required.");
      return;
    }

    // Dynamic total marks sum calculations from rubric if rubric exists
    let calculatedTotal = editTotalMarks;
    if (editRubric.length > 0) {
      calculatedTotal = editRubric.reduce((sum, item) => sum + (item.maxPoints || 0), 0);
    }

    try {
      const res = await dispatch(editAssignment({
        id: currentAssignment._id,
        data: {
          title: editTitle,
          description: editDescription,
          instructions: editInstructions,
          dueDate: new Date(editDueDate),
          totalMarks: calculatedTotal,
          assignmentType: editAssignmentType,
          rubric: editRubric,
        }
      }));

      if (res.payload) {
        toast.success("Assignment brief updated successfully!");
        setShowEditModal(false);
        dispatch(fetchAssignmentById(id));
      }
    } catch {
      toast.error("Failed to update assignment details.");
    }
  };

  // Grade sum score calculations live
  const calculateTotalScore = () => {
    if (currentAssignment?.rubric && currentAssignment.rubric.length > 0) {
      return currentAssignment.rubric.reduce((sum, r) => sum + (Number(rubricScores[r.criterion]) || 0), 0);
    }
    return Number(rubricScores["Overall"]) || 0;
  };

  // Submit grading feedback
  const handleGradeSubmit = (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setSubmittingGrade(true);

    const rubricEvaluationPayload = [];
    if (currentAssignment?.rubric && currentAssignment.rubric.length > 0) {
      currentAssignment.rubric.forEach((r) => {
        rubricEvaluationPayload.push({
          criterionTitle: r.criterion,
          score: Number(rubricScores[r.criterion]) || 0,
          feedback: rubricFeedbacks[r.criterion] || "",
        });
      });
    }

    dispatch(
      evaluateSubmission({
        submissionId: selectedSubmission._id,
        data: {
          rubricEvaluation: rubricEvaluationPayload,
          feedback: overallFeedback,
          marks: calculateTotalScore(),
        },
      })
    );
  };

  if (assignmentLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" id="teacher-details-loading">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="text-sm text-muted-foreground animate-pulse">Retrieving assignment and list of submissions...</p>
      </div>
    );
  }

  if (!currentAssignment) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4" id="teacher-details-error">
        <AlertTriangle className="h-12 w-12 text-error mx-auto" />
        <h3 className="text-xl font-bold">Assignment not found</h3>
        <p className="text-sm text-muted-foreground">The requested assignment sheet doesn't exist.</p>
        <Button onClick={() => navigate(-1)} className="btn-sm rounded-xl">Go Back</Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
      id="teacher-assignment-details-page"
    >
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-6 rounded-3xl border border-primary/20 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="icon"
            className="rounded-full bg-base-200 p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Grading Panel</span>
            <h1 className="text-2xl font-black text-foreground">{currentAssignment.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={openEditModal}
            className="flex items-center gap-2 rounded-2xl h-11 px-4 btn-outline font-bold text-xs"
            id="edit-assignment-trigger"
          >
            <Edit className="h-4 w-4" /> Edit Brief Settings
          </Button>
        </div>
      </div>

      {/* Main Workspace layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Student Submissions list */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-base-300 shadow-xl rounded-3xl bg-base-100 p-4">
            <h3 className="text-sm font-black text-foreground border-b pb-2 mb-3 flex items-center gap-2">
              <ClipboardList className="h-4.5 w-4.5 text-primary" /> Class Submissions
            </h3>

            {submissionsLoading ? (
              <div className="flex justify-center py-10">
                <div className="loading loading-spinner text-primary"></div>
              </div>
            ) : submissions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No submissions recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {submissions.map((sub) => {
                  const isGraded = sub.status === "graded";
                  const isSelected = selectedSubmission?._id === sub._id;

                  return (
                    <div
                      key={sub._id}
                      onClick={() => setSelectedSubmission(sub)}
                      className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-xs font-bold ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-lg scale-95"
                          : "bg-base-200/50 hover:bg-base-200 border-base-300/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="avatar placeholder rounded-xl bg-base-300 text-foreground text-2xs p-1 shrink-0 h-8 w-8 flex items-center justify-center font-bold">
                          {sub.studentId?.avatar ? (
                            <img src={sub.studentId.avatar} alt="avatar" className="rounded-xl object-cover" />
                          ) : (
                            <User className="h-4.5 w-4.5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="truncate flex-1">
                          <span className={`block truncate ${isSelected ? "text-white" : "text-foreground"}`}>
                            {sub.studentId?.name || "Anonymous Student"}
                          </span>
                          <span className={`text-[10px] block font-semibold ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                            {isGraded ? `Grade: ${sub.marks}/${currentAssignment.totalMarks}` : "Submitted"}
                          </span>
                        </div>
                        <span
                          className={`badge rounded-xl py-2 px-2 text-[9px] font-extrabold uppercase shrink-0 ${
                            isGraded
                              ? "badge-success text-white"
                              : sub.status === "late"
                              ? "badge-error"
                              : "badge-warning"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Center Panel: Submission viewer */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-base-300 shadow-xl rounded-3xl bg-base-100 p-6 min-h-[50vh] flex flex-col">
            {!selectedSubmission ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-20">
                <GraduationCap className="h-16 w-16 text-muted-foreground/40 mb-3" />
                <h4 className="text-base font-black text-foreground">Awaiting Student Evaluation</h4>
                <p className="text-xs max-w-sm mt-1 leading-relaxed">Select a student record from the left sidebar panel to begin grading their essay, documents, or coding attachments.</p>
              </div>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col">
                {/* Header */}
                <div className="border-b pb-4 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder rounded-2xl bg-base-200 text-foreground p-1 h-12 w-12 flex items-center justify-center font-bold">
                      {selectedSubmission.studentId?.avatar ? (
                        <img src={selectedSubmission.studentId.avatar} alt="student" className="rounded-2xl" />
                      ) : (
                        <User className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-foreground text-sm">{selectedSubmission.studentId?.name}</h4>
                      <p className="text-2xs text-muted-foreground">{selectedSubmission.studentId?.email}</p>
                    </div>
                  </div>
                  <div className="text-right text-2xs font-semibold text-muted-foreground space-y-1">
                    <span className="block flex items-center gap-1 justify-end">
                      <Clock className="h-3.5 w-3.5" /> Received: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                    </span>
                    {selectedSubmission.status === "late" && (
                      <span className="badge badge-error rounded-xl py-2 px-2 text-[9px] font-black uppercase text-white animate-pulse">Late Submission</span>
                    )}
                  </div>
                </div>

                {/* Answer body */}
                <div className="space-y-4 flex-1">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-wider block">Student Text Answer</span>
                    {selectedSubmission.textAnswer ? (
                      <div className="bg-base-200/50 p-4 border border-base-300 rounded-2xl text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans min-h-[120px]">
                        {selectedSubmission.textAnswer}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No text answer written.</p>
                    )}
                  </div>

                  {/* Clickable files */}
                  {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-black text-muted-foreground uppercase tracking-wider block">Student Attachments</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedSubmission.files.map((fileUrl, index) => {
                          const parts = fileUrl.split("/");
                          const filename = parts[parts.length - 1] || `Attachment_${index + 1}`;

                          return (
                            <a
                              key={index}
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3.5 bg-base-200/60 border border-base-300/80 rounded-2xl hover:bg-base-200 hover:border-primary/45 transition-all text-xs font-bold text-muted-foreground"
                            >
                              <div className="flex items-center gap-2 truncate pr-2">
                                <FileText className="h-5 w-5 text-primary shrink-0" />
                                <span className="truncate hover:underline hover:text-primary">{filename}</span>
                              </div>
                              <ArrowUpRight className="h-4.5 w-4.5 text-muted-foreground/60 shrink-0" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Panel: Scoring, Rubric sliders */}
        <div className="lg:col-span-1 space-y-4">
          {selectedSubmission && (
            <Card className="border-base-300 shadow-xl rounded-3xl bg-base-100 p-5">
              <form onSubmit={handleGradeSubmit} className="space-y-5">
                <h3 className="text-sm font-black text-foreground border-b pb-2 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" /> Grade Evaluation
                </h3>

                {/* Rubric Evaluator Sliders */}
                {currentAssignment.rubric && currentAssignment.rubric.length > 0 ? (
                  <div className="space-y-4">
                    {currentAssignment.rubric.map((r, idx) => {
                      const currentScore = rubricScores[r.criterion] || 0;

                      return (
                        <div key={idx} className="space-y-2 border-b border-base-200 pb-3 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-center text-xs font-black">
                            <span className="text-foreground truncate max-w-[70%]">{r.criterion}</span>
                            <span className="text-primary">{currentScore} / {r.maxPoints} pts</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">{r.description}</p>
                          <input
                            type="range"
                            min="0"
                            max={r.maxPoints}
                            value={currentScore}
                            onChange={(e) =>
                              setRubricScores({
                                ...rubricScores,
                                [r.criterion]: Number(e.target.value),
                              })
                            }
                            className="range range-xs range-primary"
                          />
                          <input
                            type="text"
                            placeholder="Score notes / criteria feedback..."
                            value={rubricFeedbacks[r.criterion] || ""}
                            onChange={(e) =>
                              setRubricFeedbacks({
                                ...rubricFeedbacks,
                                [r.criterion]: e.target.value,
                              })
                            }
                            className="input input-xs bg-base-200 border-none rounded-lg text-[10px] w-full font-semibold focus:bg-base-100"
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // General overall score grading fallback
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Overall Marks Score</label>
                    <input
                      type="number"
                      min="0"
                      max={currentAssignment.totalMarks}
                      value={rubricScores["Overall"] || 0}
                      onChange={(e) =>
                        setRubricScores({
                          ...rubricScores,
                          Overall: Number(e.target.value),
                        })
                      }
                      className="input bg-base-200 border-none rounded-xl text-sm w-full font-bold focus:bg-base-100 h-11 pl-4"
                      required
                    />
                  </div>
                )}

                {/* Overall Feedback */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">General Feedback Comments</label>
                  <textarea
                    value={overallFeedback}
                    onChange={(e) => setOverallFeedback(e.target.value)}
                    placeholder="Provide constructive feedback, key learnings, or recommendations..."
                    className="textarea textarea-bordered border-base-300 w-full h-[100px] rounded-xl bg-base-200 text-xs p-3 focus:bg-base-100"
                  />
                </div>

                {/* Total Marks sum calculations live */}
                <div className="bg-primary/15 p-4 rounded-2xl flex justify-between items-center text-xs font-bold">
                  <span className="text-primary font-extrabold">Evaluated Sum:</span>
                  <span className="text-base font-black text-foreground">
                    {calculateTotalScore()} / {currentAssignment.totalMarks}
                  </span>
                </div>

                {/* Submit grade */}
                <Button
                  type="submit"
                  disabled={submittingGrade}
                  className="w-full text-white rounded-xl h-11 flex items-center justify-center btn-primary font-bold text-xs"
                >
                  {submittingGrade ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : selectedSubmission.status === "graded" ? (
                    "Re-submit Evaluations"
                  ) : (
                    "Publish Grade Feedback"
                  )}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>

      {/* EDIT BRIEF & RUBRIC BUILDER MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-base-100 w-full max-w-2xl rounded-3xl border border-base-300 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 bg-base-200 border-b border-base-300 flex items-center justify-between">
                <h3 className="font-extrabold text-xl text-foreground flex items-center gap-2">
                  <Edit className="h-5.5 w-5.5 text-primary" /> Edit Brief Settings
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <form onSubmit={handleUpdateAssignment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Title</label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="e.g. Redux Toolkit Integrations"
                        className="h-11 bg-base-200 border-none rounded-xl pl-4 text-xs font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Due Date</label>
                      <Input
                        type="datetime-local"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="h-11 bg-base-200 border-none rounded-xl pl-4 text-xs font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Brief Category</label>
                      <select
                        className="select select-bordered border-base-300 w-full h-11 rounded-xl px-3 bg-base-200 text-xs"
                        value={editAssignmentType}
                        onChange={(e) => setEditAssignmentType(e.target.value)}
                      >
                        <option value="written">Written / Essay</option>
                        <option value="mcq">MCQ Choice Grid</option>
                        <option value="code">Coding Project</option>
                        <option value="document">PDF / Doc File</option>
                      </select>
                    </div>
                    {editRubric.length === 0 && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">Total Marks Score</label>
                        <Input
                          type="number"
                          value={editTotalMarks}
                          onChange={(e) => setEditTotalMarks(Number(e.target.value))}
                          className="h-11 bg-base-200 border-none rounded-xl pl-4 text-xs font-bold"
                          min={10}
                          max={100}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Description Overview</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Brief overview summary..."
                      className="textarea textarea-bordered border-base-300 w-full h-[70px] rounded-xl bg-base-200 text-xs p-3 focus:bg-base-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Instructions Markdown Details</label>
                    <textarea
                      value={editInstructions}
                      onChange={(e) => setEditInstructions(e.target.value)}
                      placeholder="Markdown details, rules..."
                      className="textarea textarea-bordered border-base-300 w-full h-[120px] rounded-xl bg-base-200 text-xs p-3 font-mono focus:bg-base-100"
                    />
                  </div>

                  {/* Rubric Criteria Builder */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                        <BookOpen className="h-4.5 w-4.5 text-primary" /> Evaluation Criteria Rubric
                      </span>
                      <Button
                        type="button"
                        onClick={addRubricCriterion}
                        className="btn-xs rounded-lg gap-1 py-1 px-2.5 font-bold text-2xs"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Criterion
                      </Button>
                    </div>

                    {editRubric.length > 0 ? (
                      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                        {editRubric.map((rubricItem, index) => (
                          <div
                            key={index}
                            className="p-4 bg-base-200 border border-base-300 rounded-2xl space-y-3 relative"
                          >
                            <button
                              type="button"
                              onClick={() => removeRubricCriterion(index)}
                              className="absolute top-2 right-2 text-muted-foreground hover:text-error transition-colors p-1"
                            >
                              <Trash className="h-4 w-4" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="md:col-span-2 space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground">Criterion Title</label>
                                <Input
                                  value={rubricItem.criterion}
                                  onChange={(e) => updateRubricCriterion(index, "criterion", e.target.value)}
                                  placeholder="e.g. Logic Flow, Code Quality"
                                  className="h-9 bg-base-100 border-none rounded-lg pl-3 text-xs"
                                  required
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground">Max Points</label>
                                <Input
                                  type="number"
                                  value={rubricItem.maxPoints}
                                  onChange={(e) => updateRubricCriterion(index, "maxPoints", e.target.value)}
                                  className="h-9 bg-base-100 border-none rounded-lg pl-3 text-xs font-bold"
                                  min={1}
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground">Criterion Description</label>
                              <Input
                                value={rubricItem.description || ""}
                                onChange={(e) => updateRubricCriterion(index, "description", e.target.value)}
                                placeholder="Explain criteria evaluation rules..."
                                className="h-9 bg-base-100 border-none rounded-lg pl-3 text-xs"
                              />
                            </div>
                          </div>
                        ))}

                        {/* Calculated sum indicator */}
                        <div className="flex justify-end pr-2 text-2xs font-extrabold text-muted-foreground">
                          Calculated Sum Total:{" "}
                          <span className="text-foreground ml-1">
                            {editRubric.reduce((sum, item) => sum + (item.maxPoints || 0), 0)} Marks
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-2xs text-muted-foreground/60 italic font-bold text-center">No rubric criteria added. The system will use the general overall total marks score default.</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-base-300">
                    <Button variant="ghost" type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button type="submit" className="btn-primary text-white font-bold text-xs">Update Brief</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

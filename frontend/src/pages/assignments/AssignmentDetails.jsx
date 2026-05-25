// src/pages/assignments/AssignmentDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  Award,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Upload,
  X,
  ChevronRight,
  Download,
  Sparkles,
  Clock,
  ExternalLink,
  MessageSquare,
  Bookmark,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAssignmentById } from "../../services/assignmentService";
import { getAssignmentSubmissions, submitAssignment } from "../../services/submissionService";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import toast from "react-hot-toast";

export default function AssignmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  // State Management
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Submission States
  const [textAnswer, setTextAnswer] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Load All Required Data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getAssignmentById(id);
        if (res.data?.success) {
          setAssignment(res.data.data.assignment);
          setSubmission(res.data.data.submission);
          if (res.data.data.submission) {
            setTextAnswer(res.data.data.submission.textAnswer || "");
            setUploadedFiles(res.data.data.submission.files || []);
          }

          // If Teacher or Admin, load all student submissions
          if (user?.role !== "student") {
            const subsRes = await getAssignmentSubmissions(id);
            if (subsRes.data?.success) {
              setSubmissionsList(subsRes.data.data || []);
            }
          }
        } else {
          toast.error("Failed to load details");
        }
      } catch (err) {
        console.error("Error loading assignment details:", err);
        toast.error("Error loading assignment records");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user]);

  // Simulated File Upload handler
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          // Append mock upload URLs
          const mockUrls = files.map(f => `/mock-uploads/${Date.now()}-${f.name}`);
          setUploadedFiles((existing) => [...existing, ...mockUrls]);
          toast.success("Files parsed and uploaded securely to LMS PRO cloud");
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const removeFile = (indexToRemove) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit Homework Answer
  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!textAnswer.trim() && !uploadedFiles.length) {
      toast.error("Please provide either a text answer or upload project attachments");
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitAssignment({
        assignmentId: id,
        textAnswer,
        files: uploadedFiles,
      });

      if (res.data?.success) {
        setSubmission(res.data.data);
        toast.success(res.data.message || "Assignment submitted successfully!");
      } else {
        toast.error("Failed to post submission");
      }
    } catch (err) {
      console.error("Error submitting work:", err);
      toast.error("Encountered error posting submission");
    } finally {
      setSubmitting(false);
    }
  };

  // Format Dates
  const getFormattedDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" id="assignment-details-loading">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading assignment sheet details...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-20 bg-base-100 rounded-3xl border border-base-300 shadow-xl max-w-lg mx-auto mt-10">
        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-warning" />
        <h2 className="text-2xl font-bold mb-2">Assignment Not Found</h2>
        <p className="text-muted-foreground text-sm mb-6">The requested assignment could not be retrieved. It may have been archived or deleted.</p>
        <Button onClick={() => navigate(-1)} className="rounded-2xl gap-2">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const isClosed = new Date() > new Date(assignment.dueDate);

  return (
    <div className="space-y-8" id="assignment-details-workspace">
      {/* BACK NAVIGATION */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate(isStudent ? "/student/assignments" : "/teacher/assignments")}
          variant="ghost"
          className="rounded-2xl gap-2 hover:bg-base-200 border border-base-300"
          id="assignment-details-back-btn"
        >
          <ArrowLeft className="h-4 w-4" /> Back to List
        </Button>

        <span className={`badge ${isClosed ? "badge-secondary" : "badge-primary"} gap-1.5 py-3 px-3.5 rounded-2xl text-xs font-bold`}>
          <Clock className="h-3.5 w-3.5" /> Due Date: {getFormattedDate(assignment.dueDate)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: ASSIGNMENT INFO */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-base-100 shadow-2xl border border-base-300 rounded-3xl overflow-hidden" id="assignment-info-card">
            <div className="bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-8 border-b border-base-300">
              <div className="flex items-center gap-2 mb-3">
                <span className="badge badge-outline border-primary/40 text-primary text-xs font-semibold px-2 py-2 rounded-lg">
                  {assignment.courseId?.title}
                </span>
                {assignment.moduleId && (
                  <span className="badge badge-neutral text-xs font-semibold px-2 py-2 rounded-lg">
                    {assignment.moduleId?.title}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-3">{assignment.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-medium">
                <span className="flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-primary" /> {assignment.totalMarks} Total Marks
                </span>
                <span className="flex items-center gap-2">
                  <Bookmark className="h-4.5 w-4.5 text-secondary" /> Type: <span className="capitalize">{assignment.assignmentType}</span>
                </span>
              </div>
            </div>

            <CardContent className="p-8 space-y-6">
              {/* Description */}
              {assignment.description && (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> Overview Description
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line bg-base-200/50 p-5 rounded-2xl border border-base-300">
                    {assignment.description}
                  </p>
                </div>
              )}

              {/* Instructions / AI Questions */}
              {assignment.instructions && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-secondary" /> Assignment Instructions & Questions
                  </h3>
                  <div className="text-sm leading-relaxed bg-base-200/80 p-6 rounded-2xl border border-base-300 font-mono overflow-auto max-h-[400px] whitespace-pre-line">
                    {assignment.instructions}
                  </div>
                </div>
              )}

              {/* Downloadable attachments */}
              {assignment.attachments && assignment.attachments.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-md font-bold text-foreground">Lecture Slides & Reference Documents</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {assignment.attachments.map((url, idx) => {
                      const fileName = url.substring(url.lastIndexOf("/") + 1);
                      return (
                        <div key={idx} className="flex items-center justify-between bg-base-200 p-3 rounded-xl border border-base-300 text-xs">
                          <span className="font-mono text-muted-foreground truncate max-w-[180px]">{fileName}</span>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs btn-primary gap-1 rounded-lg"
                          >
                            <Download className="h-3 w-3" /> Get file
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* TEACHER/ADMIN SUBMISSIONS TABLE */}
          {!isStudent && (
            <Card className="bg-base-100 shadow-2xl border border-base-300 rounded-3xl overflow-hidden" id="teacher-submissions-list-card">
              <div className="p-6 bg-base-200/50 border-b border-base-300 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Student Submissions</h2>
                  <p className="text-xs text-muted-foreground">Grade and deliver constructive feedback reviews.</p>
                </div>
                <span className="badge badge-primary rounded-xl font-bold px-3 py-2 text-xs">
                  {submissionsList.length} Received
                </span>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="table w-full text-sm">
                    <thead>
                      <tr className="border-b border-base-300 bg-base-200/20 text-muted-foreground">
                        <th>Student</th>
                        <th>Submitted At</th>
                        <th>Status</th>
                        <th>Grade / Score</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissionsList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-muted-foreground text-xs">
                            No student has submitted work for this assignment yet.
                          </td>
                        </tr>
                      ) : (
                        submissionsList.map((sub) => {
                          const routePrefix = user?.role === "super_admin" ? "admin" : "teacher";
                          return (
                            <tr key={sub._id} className="border-b border-base-200 hover:bg-base-200/30 transition-colors">
                              <td className="font-semibold flex items-center gap-3">
                                <div className="avatar placeholder">
                                  <div className="w-8 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                                    {sub.studentId?.name?.charAt(0) || "S"}
                                  </div>
                                </div>
                                <div className="space-y-0.5">
                                  <span className="block font-bold">{sub.studentId?.name || "Student"}</span>
                                  <span className="block text-xs text-muted-foreground">{sub.studentId?.email}</span>
                                </div>
                              </td>
                              <td className="text-xs text-muted-foreground">
                                {getFormattedDate(sub.submittedAt)}
                              </td>
                              <td>
                                <span className={`badge rounded-lg px-2 py-1 text-xs font-bold text-white capitalize ${
                                  sub.status === "graded" ? "bg-success" : sub.status === "late" ? "bg-error" : "bg-warning"
                                }`}>
                                  {sub.status}
                                </span>
                              </td>
                              <td className="font-bold">
                                {sub.marks !== null ? (
                                  <span className="text-success">{sub.marks} / {assignment.totalMarks}</span>
                                ) : (
                                  <span className="text-muted-foreground text-xs italic">Not Graded</span>
                                )}
                              </td>
                              <td className="text-right">
                                <Button
                                  onClick={() => navigate(`/${routePrefix}/assignments/submissions/${sub._id}`)}
                                  className="btn btn-sm btn-ghost hover:btn-primary text-xs rounded-xl"
                                >
                                  Evaluate <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: STUDENT WORK PANEL */}
        {isStudent && (
          <div className="space-y-6">
            {/* GRADED FEEDBACK BOX */}
            {submission && submission.status === "graded" && (
              <Card className="bg-gradient-to-br from-success/15 via-base-100 to-base-100 border border-success/30 shadow-2xl rounded-3xl overflow-hidden" id="student-graded-panel">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-success/20 p-4 text-success border border-success/30">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-success">Homework Graded!</h3>
                  <div className="inline-block bg-success/10 border border-success/20 py-2.5 px-6 rounded-2xl">
                    <span className="text-3xl font-extrabold text-foreground">{submission.marks}</span>
                    <span className="text-muted-foreground text-sm font-semibold"> / {assignment.totalMarks} Marks</span>
                  </div>
                  {submission.feedback && (
                    <div className="text-left bg-base-200 p-4 rounded-xl border border-base-300 text-xs">
                      <span className="font-bold text-muted-foreground block mb-1">Instructor Review Notes:</span>
                      <p className="text-foreground leading-relaxed italic">"{submission.feedback}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* SUBMIT FORM PANEL */}
            <Card className="bg-base-100 shadow-2xl border border-base-300 rounded-3xl overflow-hidden" id="student-submission-submit-panel">
              <div className="p-6 bg-base-200/50 border-b border-base-300">
                <h3 className="font-bold text-lg">Your Submission Panel</h3>
                <p className="text-xs text-muted-foreground">
                  {submission ? "Update and override your uploaded workspace below." : "Deliver your response brief to get graded."}
                </p>
              </div>
              <CardContent className="p-6">
                <form onSubmit={handleSubmitWork} className="space-y-5">
                  {/* Text answer */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground flex items-center justify-between">
                      <span>Written Answers / Coding Work</span>
                      <span className="font-mono text-[10px] text-muted-foreground/60">{textAnswer.length} chars</span>
                    </label>
                    <textarea
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      placeholder="Write your homework text answer, paste output codes or write descriptions here..."
                      className="textarea textarea-bordered border-base-300 w-full h-[180px] rounded-2xl bg-base-200 focus:bg-base-100 text-sm p-4"
                      id="student-text-answer-field"
                    />
                  </div>

                  {/* Attachment uploader */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-muted-foreground block">
                      Files / Document Sheets
                    </label>
                    <div className="border-2 border-dashed border-base-300 bg-base-200 hover:bg-base-200/40 rounded-2xl p-6 text-center cursor-pointer transition-colors relative">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        id="student-file-input"
                      />
                      <Upload className="mx-auto mb-2 h-8 w-8 text-primary" />
                      <p className="text-xs font-bold text-foreground">Click or Drag & Drop Documents</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Accepts PDF, ZIP, DOCX, images up to 25MB</p>
                    </div>

                    {/* Progress indicator */}
                    {isUploading && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>Uploading assets...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <progress className="progress progress-primary w-full" value={uploadProgress} max="100"></progress>
                      </div>
                    )}

                    {/* Uploaded files stack */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-muted-foreground block">Uploaded Files Stack:</span>
                        <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                          {uploadedFiles.map((fileUrl, idx) => {
                            const name = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
                            return (
                              <div key={idx} className="flex items-center justify-between bg-primary/5 border border-primary/20 p-2.5 rounded-xl text-xs">
                                <span className="font-mono text-primary font-semibold truncate max-w-[170px]">{name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeFile(idx)}
                                  className="btn btn-circle btn-xs btn-ghost text-error"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting || isUploading}
                    className="btn btn-primary w-full rounded-2xl gap-2 text-white h-12 mt-2"
                    id="student-submit-assignment-btn"
                  >
                    {submitting ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        {submission ? "Save / Resubmit Workspace" : "Submit Assignment"}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

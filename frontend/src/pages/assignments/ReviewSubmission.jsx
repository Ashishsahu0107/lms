// src/pages/assignments/ReviewSubmission.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  MessageSquare,
  AlertTriangle,
  Download,
  Sparkles,
} from "lucide-react";
import {
  getSubmissionById,
  gradeSubmission,
} from "../../services/submissionService";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import toast from "react-hot-toast";

export default function ReviewSubmission() {
  const { id } = useParams(); // submissionId
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Grading states
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function loadSubmission() {
      try {
        setLoading(true);
        const res = await getSubmissionById(id);
        if (res.data?.success) {
          const sub = res.data.data;
          setSubmission(sub);
          setMarks(sub.marks !== null ? sub.marks.toString() : "");
          setFeedback(sub.feedback || "");
        } else {
          toast.error("Failed to load submission");
        }
      } catch (err) {
        console.error("Error fetching submission details:", err);
        toast.error("Error fetching submission records from API");
      } finally {
        setLoading(false);
      }
    }
    loadSubmission();
  }, [id]);

  const handlePostGrade = async (e) => {
    e.preventDefault();
    if (marks === "" || marks === null) {
      toast.error("Please enter a numeric score to grade the submission.");
      return;
    }

    const numericMarks = Number(marks);
    const maxMarks = submission?.assignmentId?.totalMarks || 100;

    if (numericMarks < 0 || numericMarks > maxMarks) {
      toast.error(`Invalid score! Marks must be between 0 and ${maxMarks}.`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await gradeSubmission(id, {
        marks: numericMarks,
        feedback,
      });

      if (res.data?.success) {
        toast.success("Submission successfully evaluated and graded!");
        // Navigate back to the parent assignment details view where submissions are listed
        navigate(-1);
      } else {
        toast.error("Failed to submit grades");
      }
    } catch (err) {
      console.error("Error grading submission:", err);
      toast.error(
        err.response?.data?.message || "Encountered error grading submission",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
        id="review-submission-loading"
      >
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="text-sm text-muted-foreground animate-pulse">
          Retrieving student submission workspace...
        </p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-20 bg-base-100 rounded-3xl border border-base-300 shadow-xl max-w-lg mx-auto mt-10">
        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-warning" />
        <h2 className="text-2xl font-bold mb-2">Submission Not Found</h2>
        <p className="text-muted-foreground text-sm mb-6">
          The requested student submission could not be retrieved.
        </p>
        <Button onClick={() => navigate(-1)} className="rounded-2xl gap-2">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const assignment = submission.assignmentId;
  const student = submission.studentId;

  return (
    <div className="space-y-6" id="review-submission-workspace">
      {/* HEADER PANELS */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="rounded-2xl gap-2 hover:bg-base-200 border border-base-300"
          id="review-submission-back-btn"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Assignment
        </Button>

        <span className="badge badge-outline border-base-300 text-muted-foreground text-xs font-mono font-semibold px-3 py-2.5 rounded-xl">
          Submission ID: {submission._id}
        </span>
      </div>

      <div className="bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-6 rounded-3xl border border-base-300 shadow-xl">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="avatar placeholder">
            <div className="w-14 rounded-2xl bg-primary text-primary-content text-xl font-bold flex items-center justify-center">
              {student?.name?.charAt(0) || "S"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="badge badge-primary text-xs font-semibold py-2.5 px-3 rounded-xl capitalize">
                Status: {submission.status}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">
              {student?.name || "Student Submission"}
            </h1>
            <p className="text-muted-foreground text-xs font-medium">
              Evaluating answers for assignment:{" "}
              <span className="font-bold text-primary">
                "{assignment?.title}"
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: STUDENT CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            className="bg-base-100 shadow-xl border border-base-300 rounded-3xl overflow-hidden"
            id="student-submission-work-details"
          >
            <div className="bg-base-200/50 p-6 border-b border-base-300 flex items-center justify-between">
              <h3 className="font-bold text-md flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Submitted Written
                Answer
              </h3>
              <span className="text-xs text-muted-foreground font-mono">
                Submitted At:{" "}
                {new Date(submission.submittedAt).toLocaleString()}
              </span>
            </div>
            <CardContent className="p-6 space-y-6">
              {submission.textAnswer ? (
                <div className="bg-base-200 p-6 rounded-2xl border border-base-300 font-mono text-sm overflow-x-auto whitespace-pre-line leading-relaxed min-h-[160px]">
                  {submission.textAnswer}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs italic py-8 text-center bg-base-200 rounded-2xl">
                  No text response was entered by the student.
                </p>
              )}

              {/* Uploaded attachments cards */}
              {submission.files && submission.files.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Uploaded Project Assets & Documentation (
                    {submission.files.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {submission.files.map((fileUrl, idx) => {
                      const name = fileUrl.substring(
                        fileUrl.lastIndexOf("/") + 1,
                      );
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-base-200 p-4 rounded-xl border border-base-300 text-xs hover:border-primary/20 transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate max-w-[170px]">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="font-mono text-muted-foreground truncate">
                              {name}
                            </span>
                          </div>
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs btn-primary gap-1 rounded-lg text-white"
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
        </div>

        {/* RIGHT COLUMN: GRADING & FEEDBACK FORM */}
        <div>
          <Card
            className="bg-base-100 shadow-xl border border-base-300 rounded-3xl overflow-hidden sticky top-6"
            id="teacher-grading-panel"
          >
            <div className="p-6 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 border-b border-base-300">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />{" "}
                Grading Evaluation
              </h3>
              <p className="text-xs text-muted-foreground">
                Rate submission marks out of assignment total allowed.
              </p>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handlePostGrade} className="space-y-5">
                {/* Marks input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground flex items-center justify-between">
                    <span>Grade Score</span>
                    <span>Max: {assignment?.totalMarks || 100} Marks</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={marks}
                      onChange={(e) => setMarks(e.target.value)}
                      placeholder="e.g. 85"
                      className="pr-16 h-12 bg-base-200 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary w-full text-sm font-bold pl-4"
                      id="grade-marks-input-field"
                      min={0}
                      max={assignment?.totalMarks || 100}
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      / {assignment?.totalMarks || 100}
                    </div>
                  </div>
                </div>

                {/* Feedback description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Instructor Feedback &
                    Review Comments
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Write descriptive remarks, highlight code bugs, and give students feedback..."
                    className="textarea textarea-bordered border-base-300 w-full h-[150px] rounded-2xl bg-base-200 focus:bg-base-100 text-sm p-4"
                    id="grade-feedback-input-field"
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary w-full rounded-2xl gap-2 text-white h-12 mt-2"
                  id="grade-submit-btn"
                >
                  {submitting ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Publish Grades & Feedback
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

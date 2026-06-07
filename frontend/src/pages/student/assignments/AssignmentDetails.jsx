import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  X,
  Printer,
  ChevronLeft,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { fetchAssignmentById } from "../../../redux/slices/assignmentSlice";
import { submitAssignmentBrief, clearSubmissionState } from "../../../redux/slices/submissionSlice";
import client from "../../../services/apiClient";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import toast from "react-hot-toast";

const pageVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function AssignmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux Selectors
  const { currentAssignment, loading: assignmentLoading, error: assignmentError } = useSelector(
    (state) => state.assignments
  );
  const { loading: submitLoading, success: submitSuccess, error: submitError } = useSelector(
    (state) => state.submissions
  );

  // Local state
  const [textAnswer, setTextAnswer] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchAssignmentById(id));
  }, [id, dispatch]);

  // Handle load of existing submission
  const currentSubmission = useSelector((state) => state.assignments.currentSubmission);

  useEffect(() => {
    if (currentSubmission) {
      const urls = (currentSubmission.files || []).map((url) => {
        const parts = url.split("/");
        const filename = parts[parts.length - 1] || "Uploaded File";
        return { filename, url };
      });
      setTimeout(() => {
        setTextAnswer(currentSubmission.textAnswer || "");
        setUploadedUrls(urls);
      }, 0);
    }
  }, [currentSubmission]);

  useEffect(() => {
    if (submitSuccess) {
      toast.success("Submission successfully uploaded!");
      dispatch(fetchAssignmentById(id));
      dispatch(clearSubmissionState());
    }
    if (submitError) {
      toast.error(submitError);
      dispatch(clearSubmissionState());
    }
  }, [submitSuccess, submitError, id, dispatch]);

  if (assignmentLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" id="assignment-details-loading">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading assignment briefing details...</p>
      </div>
    );
  }

  if (assignmentError || !currentAssignment) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4" id="assignment-details-error">
        <AlertTriangle className="h-12 w-12 text-error mx-auto" />
        <h3 className="text-xl font-bold">Failed to load assignment</h3>
        <p className="text-sm text-muted-foreground">{assignmentError || "Assignment brief not found."}</p>
        <Button onClick={() => navigate(-1)} className="btn-sm rounded-xl">Go Back</Button>
      </div>
    );
  }

  const isClosed = new Date() > new Date(currentAssignment.dueDate);
  const formattedDueDate = new Date(currentAssignment.dueDate).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Handle local file selection
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const newUploaded = [...uploadedUrls];

    for (const file of files) {
      // Validate file size (10 MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds the 10 MB size limit.`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await client.post("/submissions/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data?.success) {
          newUploaded.push({
            filename: res.data.data.filename,
            url: res.data.data.url,
          });
          toast.success(`Uploaded "${file.name}" successfully!`);
        }
      } catch (err) {
        // Interceptor handles toast error
        console.error("Upload error:", err);
      }
    }

    setUploadedUrls(newUploaded);
    setUploading(false);
  };

  const removeUploadedFile = (idx) => {
    setUploadedUrls(uploadedUrls.filter((_, i) => i !== idx));
  };

  // Submit Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!textAnswer.trim() && uploadedUrls.length === 0) {
      toast.error("Please provide either a text response or upload at least one submission file.");
      return;
    }

    dispatch(
      submitAssignmentBrief({
        assignmentId: currentAssignment._id,
        textAnswer,
        files: uploadedUrls.map((f) => f.url),
      })
    );
  };

  // Print scorecard report handler
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-5xl mx-auto print:p-0 print:space-y-4"
      id="assignment-details-page"
    >
      {/* Header Panel */}
      <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-primary/15 via-base-100 to-base-100 p-6 rounded-3xl border border-primary/20 shadow-xl backdrop-blur-md print:hidden">
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
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Course Assignment</span>
            <h1 className="text-2xl font-black text-foreground">{currentAssignment.title}</h1>
          </div>
        </div>

        {currentSubmission?.status === "graded" && (
          <Button
            onClick={handlePrintReport}
            className="flex items-center gap-2 btn-outline rounded-2xl h-11 px-4 text-xs font-bold"
          >
            <Printer className="h-4 w-4" /> Print Feedback
          </Button>
        )}
      </div>

      {/* Grid: Details and Submission */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start print:grid-cols-1 print:gap-4">
        {/* Left Side: Brief Instructions */}
        <div className="lg:col-span-2 space-y-6 print:col-span-1 print:space-y-4">
          <Card className="border-base-300 shadow-xl rounded-3xl overflow-hidden bg-base-100 p-6 space-y-6 print:border-none print:shadow-none print:p-0">
            <div>
              <h2 className="text-lg font-black text-foreground border-b pb-3 mb-4">Assignment Briefing</h2>
              {currentAssignment.description && (
                <p className="text-sm text-foreground/80 leading-relaxed bg-base-200/40 p-4 rounded-2xl mb-4 italic">
                  {currentAssignment.description}
                </p>
              )}
              <div className="prose max-w-none text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {currentAssignment.instructions || "No detailed instructions provided."}
              </div>
            </div>

            {/* Rubric display */}
            {currentAssignment.rubric && currentAssignment.rubric.length > 0 && (
              <div className="space-y-4 border-t pt-6 print:mt-2">
                <h3 className="text-md font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="h-4.5 w-4.5 text-primary" /> Evaluation Rubric
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {currentAssignment.rubric.map((r, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-base-200/60 border border-base-300 rounded-2xl flex justify-between items-start gap-4 text-xs font-semibold"
                    >
                      <div className="space-y-1">
                        <span className="text-sm font-extrabold text-foreground block">{r.criterion}</span>
                        <p className="text-muted-foreground text-xs font-medium leading-relaxed">{r.description || "No description provided."}</p>
                      </div>
                      <span className="badge badge-primary rounded-xl font-bold py-2 px-3 shrink-0">{r.maxPoints} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Status, Grade Summary, and submission form */}
        <div className="space-y-6 print:col-span-1 print:space-y-4">
          {/* Due date and Marks Summary */}
          <Card className="border-base-300 shadow-xl rounded-3xl bg-base-100 p-6 space-y-4 print:border-none print:shadow-none print:p-0">
            <h3 className="text-md font-black text-foreground border-b pb-2">Status Panel</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground font-semibold">Points Value</span>
                <span className="text-sm font-extrabold text-foreground">{currentAssignment.totalMarks} Marks</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-base-200">
                <span className="text-muted-foreground font-semibold">Due Date</span>
                <span className={`text-sm font-extrabold ${isClosed ? "text-error" : "text-foreground"}`}>
                  {formattedDueDate}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-base-200">
                <span className="text-muted-foreground font-semibold">Submission Status</span>
                {currentSubmission ? (
                  <span className={`badge ${currentSubmission.status === "graded" ? "badge-success text-white" : currentSubmission.status === "late" ? "badge-warning" : "badge-info"} rounded-xl font-bold py-2.5 px-3 uppercase text-[10px]`}>
                    {currentSubmission.status}
                  </span>
                ) : (
                  <span className="badge badge-secondary rounded-xl font-bold py-2.5 px-3 uppercase text-[10px]">Unsubmitted</span>
                )}
              </div>
            </div>
          </Card>

          {/* Graded Feedback Card */}
          {currentSubmission && currentSubmission.status === "graded" && (
            <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-xl rounded-3xl p-6 space-y-6 print:bg-transparent print:border-none print:shadow-none print:p-0" id="graded-report-card">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl shrink-0">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-emerald-800 dark:text-emerald-400">Graded Scorecard</h3>
                  <span className="text-xs text-muted-foreground font-medium">Evaluation finalized</span>
                </div>
              </div>

              {/* Dynamic Rubric Score Breakdown */}
              {currentSubmission.rubricEvaluation && currentSubmission.rubricEvaluation.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Criterion Breakdown</span>
                  <div className="space-y-2.5">
                    {currentSubmission.rubricEvaluation.map((re, idx) => (
                      <div key={idx} className="bg-base-100 border border-base-300/60 p-3 rounded-xl space-y-1 text-xs">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-foreground">{re.criterionTitle}</span>
                          <span className="text-primary">{re.score} pts</span>
                        </div>
                        {re.feedback && <p className="text-muted-foreground text-2xs italic leading-snug font-medium">"{re.feedback}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Grade Summary */}
              <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-4 rounded-2xl flex justify-between items-center">
                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Final Grade Score</span>
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                  {currentSubmission.marks} / {currentAssignment.totalMarks}
                </span>
              </div>

              {currentSubmission.feedback && (
                <div className="space-y-1 bg-white dark:bg-base-300 border border-base-300/40 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Instructor Comments</span>
                  <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap italic font-semibold">
                    "{currentSubmission.feedback}"
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Submission Form Card */}
          {(!currentSubmission || currentSubmission.status !== "graded") && (
            <Card className="border-base-300 shadow-xl rounded-3xl bg-base-100 p-6 print:hidden">
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-md font-black text-foreground border-b pb-2">Your Work Space</h3>

                {/* Text Answer */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Text Response / Remarks</label>
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Type details of your submission, explanations, or links..."
                    className="textarea textarea-bordered border-base-300 w-full h-[120px] rounded-xl bg-base-200 text-xs p-3 focus:bg-base-100"
                    disabled={isClosed}
                  />
                </div>

                {/* File Upload Dropzone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground block">Submission Attachments</label>
                  <div className="relative border-2 border-dashed border-base-300 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors bg-base-200/50 cursor-pointer">
                    <input
                      type="file"
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      disabled={isClosed || uploading}
                    />
                    <UploadCloud className="h-8 w-8 text-muted-foreground/60 animate-bounce" />
                    <span className="text-xs font-bold text-foreground">Click or drag files to upload</span>
                    <span className="text-[10px] text-muted-foreground">PDF, DOCX, PPTX, ZIP, Images up to 10MB</span>
                  </div>

                  {uploading && (
                    <div className="flex items-center gap-2 text-xs text-primary animate-pulse font-medium justify-center pt-2">
                      <div className="loading loading-spinner loading-xs"></div> Uploading attachments...
                    </div>
                  )}
                </div>

                {/* Uploaded Files list */}
                {uploadedUrls.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-muted-foreground block">Uploaded Files:</span>
                    <div className="space-y-1.5">
                      {uploadedUrls.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-base-200 border border-base-300/80 px-3 py-2.5 rounded-xl text-xs"
                        >
                          <div className="flex items-center gap-2 truncate pr-2 font-semibold text-muted-foreground">
                            <FileText className="h-4.5 w-4.5 text-primary shrink-0" />
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline hover:text-primary truncate"
                            >
                              {file.filename}
                            </a>
                          </div>
                          {!isClosed && (
                            <button
                              type="button"
                              onClick={() => removeUploadedFile(idx)}
                              className="text-muted-foreground hover:text-error transition-colors p-1"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submission button */}
                <Button
                  type="submit"
                  disabled={isClosed || submitLoading || uploading}
                  className="w-full text-white rounded-xl h-11 flex items-center justify-center gap-2 btn-primary font-bold text-sm"
                >
                  {submitLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : currentSubmission ? (
                    <>
                      Resubmit Work <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Submit Assessment <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                {isClosed && (
                  <div className="flex items-center gap-1.5 justify-center text-[10px] text-error font-extrabold bg-error/10 py-2.5 rounded-xl">
                    <AlertTriangle className="h-3.5 w-3.5" /> Deadline passed! Submissions closed.
                  </div>
                )}
              </form>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}

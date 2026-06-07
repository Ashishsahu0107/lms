// src/pages/student/quiz/QuizAttempt.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Flag,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Maximize,
  Minimize,
  Sparkles,
} from "lucide-react";
import { startAttempt, saveAttemptAnswers, submitAttempt } from "../../../services/attemptService";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import toast from "react-hot-toast";

export default function QuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  // Attempt Lifecycle States
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Answers & Flags State
  // Format: { [questionId]: { selectedAnswers: [String], isFlagged: Boolean } }
  const [userAnswers, setUserAnswers] = useState({});

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef(null);

  // Timer States
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [timeSpent, setTimeSpent] = useState(0); // in seconds
  const timerRef = useRef(null);

  // Submit Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Submission Execution
  const executeSubmission = useCallback(async () => {
    if (!attemptId) return;

    try {
      setSubmitting(true);
      clearInterval(timerRef.current);

      // Convert answers state to backend array format
      const formattedAnswers = Object.keys(userAnswers).map((qId) => ({
        questionId: qId,
        selectedAnswers: userAnswers[qId].selectedAnswers,
        isFlagged: userAnswers[qId].isFlagged,
      }));

      const res = await submitAttempt(attemptId, {
        answers: formattedAnswers,
        timeSpent,
      });

      if (res.data?.success) {
        toast.success("Assessment submitted successfully!");
        setShowSubmitModal(false);
        // Exits fullscreen if active
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        navigate(`/student/quizzes/result/${attemptId}`);
      } else {
        toast.error("Failed to post quiz answers");
      }
    } catch {
      toast.error("Encountered error posting quiz solutions");
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, userAnswers, timeSpent, navigate]);

  // Auto submit when time hits 0
  const handleAutoSubmit = useCallback(async () => {
    toast.error("Time limit reached! Submitting answers automatically.");
    await executeSubmission();
  }, [executeSubmission]);

  // 1. Initialize Attempt on mount
  useEffect(() => {
    async function initQuizAttempt() {
      try {
        setLoading(true);
        const res = await startAttempt(quizId);
        if (res.data?.success) {
          const attemptData = res.data.data;

          // Check date bounds
          const now = new Date();
          if (attemptData.startDate && now < new Date(attemptData.startDate)) {
            toast.error(`This quiz starts on ${new Date(attemptData.startDate).toLocaleString()}.`);
            navigate(-1);
            return;
          }
          if (attemptData.endDate && now > new Date(attemptData.endDate)) {
            toast.error(`This quiz ended on ${new Date(attemptData.endDate).toLocaleString()}.`);
            navigate(-1);
            return;
          }

          setAttemptId(attemptData.attemptId);
          setQuizTitle(attemptData.title);
          setTimeRemaining(attemptData.duration * 60);

          // If shuffleOptions is enabled, shuffle the options once
          let processedQuestions = attemptData.questions || [];
          if (attemptData.shuffleOptions) {
            processedQuestions = processedQuestions.map((q) => {
              if (q.options && q.options.length > 0) {
                const shuffled = [...q.options];
                for (let i = shuffled.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                return { ...q, options: shuffled };
              }
              return q;
            });
          }
          setQuestions(processedQuestions);

          // Populate empty selections
          const initialAnswers = {};
          processedQuestions.forEach((q) => {
            initialAnswers[q._id] = { selectedAnswers: [], isFlagged: false };
          });
          setUserAnswers(initialAnswers);

          toast.success("Good luck! Timer started.");
        } else {
          toast.error("Failed to start attempt");
          navigate(-1);
        }
      } catch (err) {
        console.error("Error starting attempt:", err);
        toast.error(err.response?.data?.message || "Failed to initialize quiz attempt");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    }
    initQuizAttempt();
  }, [quizId, navigate]);

  // 2. Countdown Timer
  useEffect(() => {
    if (loading || !attemptId || timeRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, attemptId, timeRemaining, handleAutoSubmit]);

  // 3. Background Auto-Save Daemon
  async function triggerAutoSave(updatedAnswers) {
    if (!attemptId) return;

    // Convert state to backend format
    const formattedAnswers = Object.keys(updatedAnswers).map((qId) => ({
      questionId: qId,
      selectedAnswers: updatedAnswers[qId].selectedAnswers,
      isFlagged: updatedAnswers[qId].isFlagged,
    }));

    try {
      await saveAttemptAnswers(attemptId, formattedAnswers);
    } catch (err) {
      console.error("Background autosave failed:", err);
    }
  }

  // Fullscreen Handlers
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        toast.error("Fullscreen mode blocked by browser safety rules");
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Monitor escape from fullscreen
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Answer Toggles
  const handleSelection = (val) => {
    const activeQ = questions[currentIdx];
    const currentQAns = userAnswers[activeQ._id] || { selectedAnswers: [], isFlagged: false };

    let newSelections = [];
    if (activeQ.type === "mcq" || activeQ.type === "true_false" || activeQ.type === "short" || activeQ.type === "long" || activeQ.type === "code") {
      newSelections = [val];
    } else if (activeQ.type === "multiple_select") {
      // Toggle selections array
      const exists = currentQAns.selectedAnswers.includes(val);
      newSelections = exists
        ? currentQAns.selectedAnswers.filter((item) => item !== val)
        : [...currentQAns.selectedAnswers, val];
    }

    const updated = {
      ...userAnswers,
      [activeQ._id]: {
        ...currentQAns,
        selectedAnswers: newSelections,
      },
    };

    setUserAnswers(updated);
    triggerAutoSave(updated);
  };

  // Flag Toggle
  const toggleFlag = () => {
    const activeQ = questions[currentIdx];
    const currentQAns = userAnswers[activeQ._id] || { selectedAnswers: [], isFlagged: false };

    const updated = {
      ...userAnswers,
      [activeQ._id]: {
        ...currentQAns,
        isFlagged: !currentQAns.isFlagged,
      },
    };

    setUserAnswers(updated);
    triggerAutoSave(updated);
  };

  // executeSubmission callback defined above

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4" id="quiz-attempt-loading">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="text-sm text-muted-foreground animate-pulse">Initializing quiz environment and active timer...</p>
      </div>
    );
  }

  const activeQ = questions[currentIdx];
  const activeAns = userAnswers[activeQ._id] || { selectedAnswers: [], isFlagged: false };
  const answeredCount = Object.values(userAnswers).filter(ans => ans.selectedAnswers.length > 0).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  // Digital clock formatting
  const formattedTime = () => {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div
      ref={playerRef}
      className={`space-y-6 ${isFullscreen ? "bg-base-300 p-8 min-h-screen overflow-y-auto" : ""}`}
      id="quiz-player-viewport"
    >
      {/* Timer Bar & Actions Panel */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-5 rounded-2xl border border-base-300 shadow-lg">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" /> {quizTitle}
          </h2>
          <span className="text-xs text-muted-foreground font-semibold">
            Answering Question {currentIdx + 1} of {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            size="icon"
            className="rounded-xl border border-base-300 bg-base-200 hover:bg-base-300 h-10 w-10 flex items-center justify-center"
            title="Focus Mode"
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>

          <Button
            onClick={toggleFlag}
            variant="ghost"
            className={`rounded-xl border border-base-300 gap-1.5 h-10 px-3.5 ${activeAns.isFlagged ? "bg-amber-100 border-amber-300 text-amber-700" : "bg-base-200"}`}
          >
            <Flag className="h-4 w-4" />
            {activeAns.isFlagged ? "Flagged for Review" : "Flag Question"}
          </Button>

          <div className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white font-mono font-bold ${timeRemaining < 60 ? "bg-error animate-pulse" : "bg-neutral"}`}>
            <Clock className="h-4.5 w-4.5" />
            <span>{formattedTime()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* LEFT 3 COLS: ACTIVE QUESTION CANVAS */}
        <div className="lg:col-span-3 space-y-6">
          {/* Progress bar */}
          <div className="bg-base-100 border border-base-300 p-4 rounded-2xl shadow-sm space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-muted-foreground">
              <span>Quiz completion progress</span>
              <span>{answeredCount} / {questions.length} Answered ({progressPercent}%)</span>
            </div>
            <progress className="progress progress-primary w-full h-2.5 rounded-full" value={progressPercent} max="100"></progress>
          </div>

          <Card className="border border-base-300 bg-base-100 shadow-2xl rounded-3xl overflow-hidden min-h-[350px]">
            <div className="bg-base-200/50 p-6 border-b border-base-300 flex justify-between items-center">
              <span className="font-extrabold text-sm text-primary uppercase tracking-wider">Question #{currentIdx + 1}</span>
              <span className="badge badge-outline border-base-300 text-muted-foreground text-xs font-semibold px-2.5 py-2.5 rounded-xl capitalize">
                Marks: {activeQ.marks} pts | Difficulty: {activeQ.difficulty}
              </span>
            </div>
            <CardContent className="p-8 space-y-8">
              <h3 className="text-xl font-bold text-foreground leading-relaxed">
                {activeQ.question}
              </h3>

              {/* DYNAMIC QUESTION OPTIONS INPUTS */}
              <div className="space-y-3" id="quiz-options-canvas">
                {/* MCQ (Radio Grid) */}
                {activeQ.type === "mcq" && activeQ.options.map((opt, idx) => {
                  const isSelected = activeAns.selectedAnswers.includes(opt);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelection(opt)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 font-semibold ${
                        isSelected
                          ? "bg-primary/10 border-primary text-primary shadow-md"
                          : "bg-base-200 border-base-300 hover:bg-base-300"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground"}`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                      </div>
                      <span>{opt}</span>
                    </button>
                  );
                })}

                {/* Multiple Select (Checkboxes) */}
                {activeQ.type === "multiple_select" && activeQ.options.map((opt, idx) => {
                  const isSelected = activeAns.selectedAnswers.includes(opt);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelection(opt)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 font-semibold ${
                        isSelected
                          ? "bg-primary/10 border-primary text-primary shadow-md"
                          : "bg-base-200 border-base-300 hover:bg-base-300"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground"}`}>
                        {isSelected && <span className="text-[10px] font-black">✓</span>}
                      </div>
                      <span>{opt}</span>
                    </button>
                  );
                })}

                {/* True / False cards */}
                {activeQ.type === "true_false" && (
                  <div className="grid grid-cols-2 gap-4">
                    {["True", "False"].map((opt) => {
                      const isSelected = activeAns.selectedAnswers.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => handleSelection(opt)}
                          className={`p-8 rounded-3xl border transition-all text-center font-bold text-lg ${
                            isSelected
                              ? "bg-primary/10 border-primary text-primary shadow-md scale-[1.02]"
                              : "bg-base-200 border-base-300 hover:bg-base-300"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer */}
                {activeQ.type === "short" && (
                  <Input
                    value={activeAns.selectedAnswers[0] || ""}
                    onChange={(e) => handleSelection(e.target.value)}
                    placeholder="Type your exact short response value here..."
                    className="h-14 bg-base-200 border-none rounded-2xl pl-5 text-sm font-semibold"
                  />
                )}

                {/* Long/Coding Work Editor area */}
                {(activeQ.type === "long" || activeQ.type === "code") && (
                  <textarea
                    value={activeAns.selectedAnswers[0] || ""}
                    onChange={(e) => handleSelection(e.target.value)}
                    placeholder={
                      activeQ.type === "code"
                        ? "Write your clean code compiler solution or code snippets here..."
                        : "Write your complete descriptive essay answer logs here..."
                    }
                    className="textarea textarea-bordered border-base-300 w-full h-[220px] rounded-3xl bg-base-200 focus:bg-base-100 text-sm p-5 font-mono leading-relaxed"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              variant="ghost"
              className="rounded-2xl border border-base-300 bg-base-100 hover:bg-base-200 gap-2 h-11 px-5"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>

            {currentIdx === questions.length - 1 ? (
              <Button
                onClick={() => setShowSubmitModal(true)}
                className="rounded-2xl gap-2 h-11 px-6 text-white"
              >
                Submit Assessment <CheckCircle className="h-4.5 w-4.5" />
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                className="rounded-2xl gap-2 h-11 px-6 text-white"
              >
                Next Question <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: QUESTION GRID NAVIGATOR */}
        <div className="lg:col-span-1">
          <Card className="border border-base-300 bg-base-100 shadow-xl rounded-3xl sticky top-6 overflow-hidden">
            <div className="p-5 bg-base-200 border-b border-base-300">
              <h3 className="font-extrabold text-sm text-foreground">Question Navigator</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Click any grid cell to navigate directly.</p>
            </div>
            <CardContent className="p-5 space-y-6">
              {/* Grid cell matrix */}
              <div className="grid grid-cols-4 gap-2.5">
                {questions.map((q, idx) => {
                  const qAns = userAnswers[q._id] || { selectedAnswers: [], isFlagged: false };
                  const isCurrent = currentIdx === idx;
                  const isAnswered = qAns.selectedAnswers.length > 0;
                  const isFlagged = qAns.isFlagged;

                  return (
                    <button
                      key={q._id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-full aspect-square rounded-xl font-extrabold text-xs transition-all border flex items-center justify-center ${
                        isCurrent
                          ? "bg-primary text-white border-primary shadow-md scale-105"
                          : isFlagged
                          ? "bg-amber-100 border-amber-300 text-amber-700"
                          : isAnswered
                          ? "bg-success/15 border-success/30 text-success"
                          : "bg-base-200 border-base-300 hover:bg-base-300 text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legends explanation */}
              <div className="border-t border-base-300 pt-4 space-y-2 text-[10px] font-bold text-muted-foreground">
                <span className="block text-xs font-black uppercase text-foreground mb-1">Legends</span>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-primary"></div>
                  <span>Current Active Question</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-success/20 border border-success/30"></div>
                  <span>Answered / Saved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300"></div>
                  <span>Flagged Review Bookmarks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-base-200 border border-base-300"></div>
                  <span>Unanswered / Skipped</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CONFIRMATION SUBMIT WORK MODAL */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Assessment?"
        description={`You have provided answers for ${answeredCount} out of ${questions.length} questions.`}
      >
        <div className="space-y-4">
          {answeredCount < questions.length && (
            <div className="flex gap-3 bg-warning/10 border border-warning/30 p-4 rounded-xl text-amber-700 text-xs leading-relaxed font-semibold">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning" />
              <span>
                WARNING: You have skipped {questions.length - answeredCount} unanswered questions. Unanswered questions will receive 0 marks.
              </span>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Once submitted, your final attempts score and accuracy report will be evaluated instantly.
          </p>

          <div className="flex gap-3 justify-end pt-3 border-t mt-4 border-base-300">
            <Button variant="ghost" onClick={() => setShowSubmitModal(false)}>Continue Answering</Button>
            <Button
              onClick={() => executeSubmission()}
              disabled={submitting}
              className="btn btn-primary text-white"
            >
              {submitting ? <span className="loading loading-spinner loading-sm"></span> : "Confirm & Submit"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

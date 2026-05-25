// src/pages/student/quiz/QuizResult.jsx

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Download,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { getAttemptDetails } from "../../../services/attemptService";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import toast from "react-hot-toast";

export default function QuizResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);

  // Printing certificate state
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    async function loadAttemptDetails() {
      try {
        setLoading(true);
        const res = await getAttemptDetails(attemptId);
        if (res.data?.success) {
          setAttempt(res.data.data.attempt);
          setQuestions(res.data.data.questions || []);
        } else {
          toast.error("Failed to load results details");
        }
      } catch (err) {
        console.error("Error querying attempt results:", err);
        toast.error("Error loading assessment score sheet");
      } finally {
        setLoading(false);
      }
    }
    loadAttemptDetails();
  }, [attemptId]);

  // Certificate printing simulator
  const handlePrintCertificate = () => {
    setIsPrinting(true);
    toast.success("Preparing high-resolution PDF download...");
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4" id="quiz-result-loading">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="text-sm text-muted-foreground animate-pulse">Analyzing scoring metrics and question review charts...</p>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="text-center py-20 bg-base-100 rounded-3xl border border-base-300 shadow-xl max-w-lg mx-auto mt-10">
        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-warning" />
        <h2 className="text-2xl font-bold mb-2">Results Not Found</h2>
        <p className="text-muted-foreground text-sm mb-6">The requested quiz attempt scorecard could not be found.</p>
        <Button onClick={() => navigate("/student/quizzes")} className="rounded-2xl gap-2">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const quiz = attempt.quizId;
  const isPassed = attempt.score >= quiz.passingMarks;

  // Format Duration format (mm:ss)
  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} min ${s} sec`;
  };

  return (
    <div className="space-y-8" id="quiz-result-workspace">
      {/* HEADER CONTROLS */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate("/student/quizzes")}
          variant="ghost"
          className="rounded-2xl gap-2 hover:bg-base-200 border border-base-300"
          id="quiz-result-back-btn"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Quizzes
        </Button>

        <span className="text-xs text-muted-foreground font-mono font-semibold">
          Attempt Evaluated: {new Date(attempt.submittedAt).toLocaleString()}
        </span>
      </div>

      {/* CORE RESULT DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: ACCURACY METRICS CARD */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-base-300 bg-base-100 shadow-2xl rounded-3xl overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 border-b border-base-300 flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1.5">
                <span className="badge badge-primary text-[10px] font-bold py-2.5 px-3 rounded-xl capitalize">
                  {quiz.quizType} Complete
                </span>
                <h1 className="text-2xl font-black text-foreground">{quiz.title}</h1>
                <p className="text-xs text-muted-foreground font-semibold">
                  Course: <span className="text-primary font-bold">{quiz.courseId?.title}</span>
                </p>
              </div>

              {/* Glowing Pass/Fail indicator */}
              <div className="text-right">
                <span className={`inline-block text-lg font-black tracking-widest px-6 py-2.5 rounded-2xl border text-white capitalize ${
                  isPassed
                    ? "bg-success border-success shadow-lg shadow-success/20 animate-pulse"
                    : "bg-error border-error shadow-lg shadow-error/20"
                }`}>
                  {isPassed ? "PASSED" : "FAILED"}
                </span>
              </div>
            </div>

            <CardContent className="p-8 space-y-8">
              {/* Score circular visual progress or metrics */}
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 bg-base-200 p-6 rounded-3xl border border-base-300">
                <div className="text-center space-y-2">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">Achieved Score</span>
                  <div className="inline-block bg-base-100 border border-base-300 py-3.5 px-8 rounded-3xl">
                    <span className="text-4xl font-extrabold text-foreground">{attempt.score}</span>
                    <span className="text-muted-foreground text-sm font-semibold"> / {quiz.totalMarks} Marks</span>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">Percentage Accuracy</span>
                  <div className="inline-block bg-base-100 border border-base-300 py-3.5 px-8 rounded-3xl text-primary">
                    <span className="text-4xl font-extrabold">{attempt.accuracy}%</span>
                  </div>
                </div>
              </div>

              {/* Accuracy stats matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-base-200 rounded-2xl border border-base-300 text-center space-y-1">
                  <Clock className="h-5 w-5 text-warning mx-auto" />
                  <span className="text-[10px] text-muted-foreground block font-bold">TIME SPENT</span>
                  <span className="text-sm font-bold text-foreground block">{formatDuration(attempt.timeSpent)}</span>
                </div>

                <div className="p-4 bg-base-200 rounded-2xl border border-base-300 text-center space-y-1">
                  <Award className="h-5 w-5 text-primary mx-auto" />
                  <span className="text-[10px] text-muted-foreground block font-bold">TOTAL QUESTIONS</span>
                  <span className="text-sm font-bold text-foreground block">{questions.length} Items</span>
                </div>

                <div className="p-4 bg-base-200 rounded-2xl border border-base-300 text-center space-y-1">
                  <CheckCircle className="h-5 w-5 text-success mx-auto" />
                  <span className="text-[10px] text-muted-foreground block font-bold">PASS THRESHOLD</span>
                  <span className="text-sm font-bold text-foreground block">{quiz.passingMarks} pts ({Math.round((quiz.passingMarks/quiz.totalMarks)*100)}%)</span>
                </div>

                <div className="p-4 bg-base-200 rounded-2xl border border-base-300 text-center space-y-1">
                  <TrendingUp className="h-5 w-5 text-secondary mx-auto" />
                  <span className="text-[10px] text-muted-foreground block font-bold">STATUS BADGE</span>
                  <span className="text-sm font-bold block capitalize text-foreground">{attempt.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: PASSING CERTIFICATE GENERATOR MOCKUP */}
        {isPassed && (
          <div className="lg:col-span-1">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-base-100 to-base-100 shadow-2xl rounded-3xl overflow-hidden" id="student-certificate-card">
              <div className="p-6 text-center space-y-5">
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/15 p-4 text-primary border border-primary/30 animate-pulse">
                    <Award className="h-10 w-10" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-foreground">Certificate Unlocked!</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Outstanding effort! You successfully passed the exam guidelines and achieved system certification.
                  </p>
                </div>

                {/* Printable Certificate Miniature mockup frame */}
                <div className="border border-base-300 bg-base-200 p-4 rounded-2xl text-[9px] font-mono leading-tight space-y-2 text-center text-muted-foreground relative overflow-hidden select-none">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"></div>
                  <div className="border border-primary/30 p-2.5 rounded-lg space-y-2">
                    <h5 className="font-extrabold text-primary tracking-widest text-[10px]">LMS PRO CERTIFICATE</h5>
                    <span className="block text-[7px]">This is proudly presented to:</span>
                    <span className="block font-bold text-foreground text-[9px] underline underline-offset-2">{attempt.studentId?.name}</span>
                    <span className="block text-[6px]">For completing assessment parameters:</span>
                    <span className="block font-bold text-foreground text-[8px] italic">"{quiz.title}"</span>
                    <div className="flex justify-between items-center text-[5px] pt-1.5 border-t border-base-300/60 font-semibold">
                      <span>DATE: {new Date(attempt.submittedAt).toLocaleDateString()}</span>
                      <span className="text-primary font-bold">LMS PRO TEAM</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePrintCertificate}
                  disabled={isPrinting}
                  className="btn btn-primary w-full rounded-2xl gap-2 text-white h-11 text-xs"
                >
                  {isPrinting ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      <Download className="h-4 w-4" /> Download Certificate PDF
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* DETAILED TOPIC-WISE QUESTION REVIEW SECTION */}
      <div className="space-y-4" id="quiz-attempt-answers-review">
        <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" /> Questions Review Sheet
        </h2>

        <div className="space-y-4">
          {questions.map((question, index) => {
            // Find student response answers
            const studentAns = attempt.answers.find(ans => ans.questionId.toString() === question._id.toString());
            const selected = studentAns ? studentAns.selectedAnswers || [] : [];
            const correct = question.correctAnswer || [];

            let isCorrect = false;
            let isSkipped = selected.length === 0;

            if (!isSkipped) {
              if (question.type === "mcq" || question.type === "true_false" || question.type === "short") {
                if (selected[0].toString().trim().toLowerCase() === correct[0].toString().trim().toLowerCase()) {
                  isCorrect = true;
                }
              } else if (question.type === "multiple_select") {
                const stdSet = new Set(selected.map(s => s.toString().trim().toLowerCase()));
                const crtSet = new Set(correct.map(c => c.toString().trim().toLowerCase()));
                if (stdSet.size === crtSet.size && [...stdSet].every(item => crtSet.has(item))) {
                  isCorrect = true;
                }
              } else {
                if (selected[0] && correct[0] && selected[0].toString().trim().toLowerCase() === correct[0].toString().trim().toLowerCase()) {
                  isCorrect = true;
                }
              }
            }

            return (
              <Card
                key={question._id}
                className={`border bg-base-100 shadow-xl rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                  isSkipped
                    ? "border-warning/30 hover:border-warning/50"
                    : isCorrect
                    ? "border-success/30 hover:border-success/50"
                    : "border-error/30 hover:border-error/50"
                }`}
              >
                <div className="p-5 bg-base-200/50 border-b border-base-300 flex justify-between items-center flex-wrap gap-2">
                  <span className="font-extrabold text-xs text-muted-foreground">Question {index + 1} ({question.type.toUpperCase()})</span>
                  <span className={`badge text-white text-[10px] font-bold py-2.5 px-3.5 rounded-xl capitalize ${
                    isSkipped ? "bg-warning" : isCorrect ? "bg-success" : "bg-error"
                  }`}>
                    {isSkipped ? "Skipped (0 pts)" : isCorrect ? `Correct (+${question.marks} pts)` : "Incorrect (0 pts)"}
                  </span>
                </div>

                <CardContent className="p-6 space-y-5">
                  {/* Question Title */}
                  <h4 className="text-lg font-bold text-foreground leading-relaxed">{question.question}</h4>

                  {/* Options Stack (Choices list) for MCQ & Multiple Select */}
                  {(question.type === "mcq" || question.type === "multiple_select" || question.type === "true_false") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(question.type === "true_false" ? ["True", "False"] : question.options).map((opt) => {
                        const wasSelected = selected.includes(opt);
                        const isCorrectOption = correct.includes(opt);

                        return (
                          <div
                            key={opt}
                            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
                              isCorrectOption
                                ? "bg-success/10 border-success text-success font-extrabold"
                                : wasSelected && !isCorrectOption
                                ? "bg-error/10 border-error text-error"
                                : "bg-base-200 border-base-300"
                            }`}
                          >
                            <span>{opt}</span>
                            <div className="flex items-center gap-1.5">
                              {isCorrectOption && <CheckCircle className="h-4.5 w-4.5 text-success" />}
                              {wasSelected && !isCorrectOption && <XCircle className="h-4.5 w-4.5 text-error" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Text-based responses checks */}
                  {(question.type === "short" || question.type === "long" || question.type === "code") && (
                    <div className="space-y-3">
                      <div className="bg-base-200 border border-base-300 p-4 rounded-xl text-xs space-y-1">
                        <span className="font-bold text-muted-foreground block uppercase">Your Response:</span>
                        <p className="font-mono text-foreground leading-relaxed whitespace-pre-line bg-base-100 p-3 rounded-lg">
                          {selected[0] || <span className="text-warning/80 italic font-bold">No response provided (Skipped)</span>}
                        </p>
                      </div>

                      <div className="bg-success/5 border border-success/20 p-4 rounded-xl text-xs space-y-1">
                        <span className="font-extrabold text-success block uppercase">Expected Correct Solution Guidelines:</span>
                        <p className="font-mono text-success leading-relaxed whitespace-pre-line bg-success/10 p-3 rounded-lg font-bold">
                          {correct[0]}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Explanations Bubble */}
                  {question.explanation && (
                    <div className="bg-gradient-to-r from-primary/5 to-base-200 p-4 rounded-2xl border border-base-300 text-xs flex gap-3">
                      <HelpCircle className="h-5 w-5 flex-shrink-0 text-primary animate-pulse" />
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-primary">Concept Explanation:</span>
                        <p className="text-muted-foreground leading-relaxed italic">"{question.explanation}"</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

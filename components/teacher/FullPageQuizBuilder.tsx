"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  HelpCircle,
  Eye,
  Edit3,
  Save,
  Check,
  X,
  Sparkles,
  AlertCircle,
  Layers,
  ArrowRight,
  Clock,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { API_URL } from "@/lib/api-config";

export interface QuestionItem {
  id?: string;
  type: "mcq" | "multiple_select" | "true_false";
  question: string;
  options: string[];
  correctAnswer: string[];
  explanation?: string;
  marks: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface QuizItem {
  id?: string;
  title: string;
  description: string;
  instructions?: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  status: "published" | "draft";
  topicId: string;
  moduleId?: string;
  courseId?: string;
  questions: QuestionItem[];
}

interface FullPageQuizBuilderProps {
  topicId: string;
  moduleId?: string;
  courseId?: string;
  onStatsUpdated?: (count: number) => void;
}

export default function FullPageQuizBuilder({
  topicId,
  moduleId,
  courseId,
  onStatsUpdated,
}: FullPageQuizBuilderProps) {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Active quiz metadata
  const [title, setTitle] = useState("Topic Quiz");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(20);
  const [passingMarks, setPassingMarks] = useState(10);
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [questions, setQuestions] = useState<QuestionItem[]>([]);

  // Preview Mode
  const [isPreview, setIsPreview] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string[]>>({});
  const [previewScore, setPreviewScore] = useState<number | null>(null);

  // Question editing form state
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number | null>(null);
  const [qType, setQType] = useState<"mcq" | "multiple_select" | "true_false">("mcq");
  const [qText, setQText] = useState("");
  const [qOptions, setQOptions] = useState<string[]>(["", "", "", ""]);
  const [qCorrect, setQCorrect] = useState<string[]>([]);
  const [qMarks, setQMarks] = useState(5);
  const [qDifficulty, setQDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [qExplanation, setQExplanation] = useState("");

  // Load quizzes for this topic
  const fetchQuizzes = useCallback(async () => {
    if (!topicId) return;
    setLoading(true);
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch(`${API_URL}/quizzes?topicId=${topicId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      if (data.success) {
        const list: QuizItem[] = data.data.quizzes || [];
        setQuizzes(list);
        if (onStatsUpdated) onStatsUpdated(list.length);

        if (list.length > 0) {
          loadQuiz(list[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load quizzes:", err);
    } finally {
      setLoading(false);
    }
  }, [topicId, onStatsUpdated]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Load a quiz into editor
  const loadQuiz = (quiz: QuizItem) => {
    setActiveQuizId(quiz.id || null);
    setTitle(quiz.title || "Topic Quiz");
    setDescription(quiz.description || "");
    setDuration(quiz.duration || 20);
    setPassingMarks(quiz.passingMarks || 10);
    setStatus(quiz.status || "published");

    const mappedQuestions: QuestionItem[] = (quiz.questions || []).map((q: any) => ({
      id: q.id,
      type: (q.type as any) || "mcq",
      question: q.question || "",
      options: q.options || [],
      correctAnswer: q.correctAnswer || [],
      explanation: q.explanation || "",
      marks: q.marks || 5,
      difficulty: q.difficulty || "medium",
    }));

    setQuestions(mappedQuestions);
    setShowQuestionForm(false);
    setEditingQuestionIdx(null);
  };

  // Create a new blank quiz
  const handleCreateNewQuiz = () => {
    setActiveQuizId(null);
    setTitle("New Quiz");
    setDescription("");
    setDuration(20);
    setPassingMarks(10);
    setStatus("draft");
    setQuestions([]);
    setShowQuestionForm(false);
  };

  // Reorder questions
  const handleReorderQuestion = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const reordered = [...questions];
    [reordered[index], reordered[targetIdx]] = [reordered[targetIdx], reordered[index]];
    setQuestions(reordered);
    toast.success("Question order updated");
  };

  // Delete question
  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, idx) => idx !== index);
    setQuestions(updated);
    toast.success("Question removed");
  };

  // Open Edit question
  const handleOpenEditQuestion = (index: number) => {
    const q = questions[index];
    setEditingQuestionIdx(index);
    setQType(q.type);
    setQText(q.question);
    setQOptions(q.options.length ? q.options : ["", "", "", ""]);
    setQCorrect(q.correctAnswer);
    setQMarks(q.marks);
    setQDifficulty(q.difficulty);
    setQExplanation(q.explanation || "");
    setShowQuestionForm(true);
  };

  // Reset question form
  const handleResetQuestionForm = () => {
    setShowQuestionForm(false);
    setEditingQuestionIdx(null);
    setQText("");
    setQOptions(["", "", "", ""]);
    setQCorrect([]);
    setQMarks(5);
    setQDifficulty("medium");
    setQExplanation("");
  };

  // Switch question type
  const handleTypeChange = (type: "mcq" | "multiple_select" | "true_false") => {
    setQType(type);
    if (type === "true_false") {
      setQOptions(["True", "False"]);
      setQCorrect(["True"]);
    } else if (qOptions.length !== 4) {
      setQOptions(["", "", "", ""]);
      setQCorrect([]);
    }
  };

  // Toggle correct answer
  const handleToggleCorrectOption = (optVal: string) => {
    if (!optVal.trim()) return;
    if (qType === "mcq" || qType === "true_false") {
      setQCorrect([optVal]);
    } else {
      // multiple_select
      if (qCorrect.includes(optVal)) {
        setQCorrect(qCorrect.filter((c) => c !== optVal));
      } else {
        setQCorrect([...qCorrect, optVal]);
      }
    }
  };

  // Save question into local list
  const handleSaveQuestion = () => {
    if (!qText.trim()) {
      toast.error("Please enter the question text");
      return;
    }

    const filteredOptions = qOptions.map((o) => o.trim());
    if (filteredOptions.some((o) => !o)) {
      toast.error("Please fill in all options");
      return;
    }

    if (qCorrect.length === 0) {
      toast.error("Please select at least one correct answer");
      return;
    }

    const questionItem: QuestionItem = {
      type: qType,
      question: qText.trim(),
      options: filteredOptions,
      correctAnswer: qCorrect,
      marks: Number(qMarks) || 5,
      difficulty: qDifficulty,
      explanation: qExplanation.trim(),
    };

    if (editingQuestionIdx !== null) {
      const updated = [...questions];
      updated[editingQuestionIdx] = questionItem;
      setQuestions(updated);
      toast.success("Question updated");
    } else {
      setQuestions([...questions, questionItem]);
      toast.success("Question added");
    }

    handleResetQuestionForm();
  };

  // Save entire Quiz to backend
  const handleSaveQuiz = async (overrideStatus?: "published" | "draft") => {
    if (!title.trim()) {
      toast.error("Please enter quiz title");
      return;
    }
    if (questions.length === 0) {
      toast.error("Please add at least one question to the quiz");
      return;
    }

    const token = localStorage.getItem("token") || "";
    setSaving(true);
    const toastId = toast.loading("Saving quiz...");

    const targetStatus = overrideStatus || status;
    const computedTotalMarks = questions.reduce((sum, q) => sum + (q.marks || 5), 0);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      duration: Number(duration) || 20,
      totalMarks: computedTotalMarks,
      passingMarks: Number(passingMarks) || 10,
      status: targetStatus,
      topicId,
      moduleId,
      courseId,
      questions,
    };

    try {
      const url = activeQuizId
        ? `${API_URL}/quizzes/${activeQuizId}`
        : `${API_URL}/quizzes`;
      const method = activeQuizId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save quiz");
      }

      setStatus(targetStatus);
      toast.success(
        targetStatus === "published" ? "Quiz published!" : "Quiz draft saved!",
        { id: toastId }
      );

      fetchQuizzes();
    } catch (err: any) {
      toast.error(err.message || "Error saving quiz", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Delete Quiz
  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm("Delete this quiz? This action cannot be undone.")) return;
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch(`${API_URL}/quizzes/${quizId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      toast.success("Quiz deleted");
      const remaining = quizzes.filter((q) => q.id !== quizId);
      setQuizzes(remaining);
      if (onStatsUpdated) onStatsUpdated(remaining.length);

      if (remaining.length > 0) {
        loadQuiz(remaining[0]);
      } else {
        handleCreateNewQuiz();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete quiz");
    }
  };

  const totalCalculatedMarks = questions.reduce(
    (sum, q) => sum + (Number(q.marks) || 5),
    0
  );

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[600px] w-full overflow-hidden bg-base-100 text-base-content">
      {/* ── LEFT SIDEBAR: QUIZZES LIST */}
      <aside className="w-64 sm:w-72 shrink-0 border-r border-base-300 bg-base-200/40 flex flex-col justify-between">
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle size={16} className="text-warning" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-base-content/70">
              Quizzes ({quizzes.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCreateNewQuiz}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-warning/15 text-warning hover:bg-warning/25 text-xs font-semibold transition-all active:scale-95 shadow-2xs"
            title="Create New Quiz"
          >
            <Plus size={13} />
            <span>New Quiz</span>
          </button>
        </div>

        {/* List of quizzes */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {quizzes.length === 0 ? (
            <div className="p-6 text-center text-xs text-base-content/50">
              No quizzes created yet. Click "+ New Quiz" to start.
            </div>
          ) : (
            quizzes.map((q) => {
              const isSelected = q.id === activeQuizId;
              return (
                <div
                  key={q.id}
                  onClick={() => loadQuiz(q)}
                  className={`group relative flex flex-col gap-1 p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-base-100 border-warning/40 shadow-xs"
                      : "border-transparent hover:bg-base-200/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-base-content truncate">
                      {q.title || "Untitled Quiz"}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0 ${
                        q.status === "published"
                          ? "bg-success/15 text-success"
                          : "bg-base-300 text-base-content/60"
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[11px] text-base-content/40">
                    <span>{q.questions?.length || 0} Questions</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (q.id) handleDeleteQuiz(q.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-base-content/50 hover:text-error hover:bg-error/10 transition-all"
                      title="Delete Quiz"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-base-300 text-[11px] text-base-content/50 flex items-center justify-between">
          <span>Question Manager</span>
          <span className="text-warning font-medium">MCQ • MSQ • T/F</span>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 bg-base-100 overflow-hidden">
        {/* Top Control Bar */}
        <div className="border-b border-base-300 bg-base-100/90 backdrop-blur-xs px-6 py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-base-content truncate">
              {title || "Quiz Builder"}
            </h2>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                status === "published"
                  ? "bg-success/15 text-success border border-success/30"
                  : "bg-warning/15 text-warning border border-warning/30"
              }`}
            >
              {status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsPreview(!isPreview);
                setUserAnswers({});
                setPreviewScore(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isPreview
                  ? "bg-warning text-warning-content border-warning"
                  : "bg-base-200 text-base-content/80 border-base-300 hover:bg-base-300"
              }`}
            >
              {isPreview ? <Edit3 size={14} /> : <Eye size={14} />}
              <span>{isPreview ? "Exit Preview" : "Student Preview"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveQuiz("draft")}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-base-200 hover:bg-base-300 text-base-content transition-all border border-base-300 disabled:opacity-50"
            >
              <Save size={14} />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleSaveQuiz(status === "published" ? "draft" : "published")
              }
              disabled={saving}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-sm ${
                status === "published"
                  ? "bg-success text-success-content hover:bg-success/90"
                  : "bg-warning text-warning-content hover:bg-warning/90"
              }`}
            >
              <Check size={14} />
              <span>{status === "published" ? "Published" : "Publish Quiz"}</span>
            </button>
          </div>
        </div>

        {/* ── PREVIEW MODE AS STUDENT */}
        {isPreview ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-3xl mx-auto w-full space-y-6 animate-fade-in">
            <div className="p-5 rounded-2xl border border-warning/30 bg-warning/5 text-base-content">
              <div className="flex items-center gap-2 font-bold text-warning mb-1">
                <Sparkles size={16} />
                <span>Student Quiz Preview</span>
              </div>
              <p className="text-xs text-base-content/70">
                You are previewing this quiz exactly as a student sees it. Choose
                options and test answer evaluation.
              </p>
            </div>

            {/* Quiz Info */}
            <div className="p-6 rounded-2xl border border-base-300 bg-base-100 shadow-sm space-y-2">
              <h1 className="text-2xl font-bold font-display">{title}</h1>
              {description && (
                <p className="text-sm text-base-content/70">{description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-base-content/50 pt-2 border-t border-base-200">
                <span className="flex items-center gap-1">
                  <Clock size={13} /> {duration} Mins
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Award size={13} /> {totalCalculatedMarks} Total Marks
                </span>
                <span>•</span>
                <span>Passing: {passingMarks} Marks</span>
              </div>
            </div>

            {/* Questions list */}
            {questions.map((q, qIdx) => {
              const selected = userAnswers[qIdx] || [];
              return (
                <div
                  key={qIdx}
                  className="p-6 rounded-2xl border border-base-200 bg-base-100 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-bold text-base-content">
                      Question {qIdx + 1}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-base-200 text-base-content/70 font-semibold font-mono">
                      {q.marks} Marks
                    </span>
                  </div>

                  <p className="text-sm text-base-content font-medium leading-relaxed">
                    {q.question}
                  </p>

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selected.includes(opt);
                      const isCorrect = q.correctAnswer.includes(opt);
                      const showResult = previewScore !== null;

                      let optClasses =
                        "border-base-200 bg-base-100 text-base-content hover:bg-base-200/50";
                      if (isChosen && !showResult) {
                        optClasses =
                          "border-primary bg-primary/10 text-primary font-semibold";
                      }
                      if (showResult) {
                        if (isCorrect) {
                          optClasses =
                            "border-success bg-success/15 text-success font-bold";
                        } else if (isChosen && !isCorrect) {
                          optClasses =
                            "border-error bg-error/15 text-error line-through";
                        }
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => {
                            if (showResult) return;
                            if (q.type === "mcq" || q.type === "true_false") {
                              setUserAnswers({ ...userAnswers, [qIdx]: [opt] });
                            } else {
                              const curr = userAnswers[qIdx] || [];
                              const next = curr.includes(opt)
                                ? curr.filter((c) => c !== opt)
                                : [...curr, opt];
                              setUserAnswers({ ...userAnswers, [qIdx]: next });
                            }
                          }}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${optClasses}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-base-200/80 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="text-xs sm:text-sm">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Test submission button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="primary"
                onClick={() => {
                  let score = 0;
                  questions.forEach((q, idx) => {
                    const ans = userAnswers[idx] || [];
                    const isAllCorrect =
                      ans.length === q.correctAnswer.length &&
                      ans.every((a) => q.correctAnswer.includes(a));
                    if (isAllCorrect) {
                      score += q.marks || 5;
                    }
                  });
                  setPreviewScore(score);
                  toast.success(
                    `Test Scored: ${score} / ${totalCalculatedMarks} Marks`
                  );
                }}
              >
                Evaluate Answers
              </Button>
            </div>
          </div>
        ) : (
          /* ── BUILDER MODE */
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-4xl mx-auto w-full space-y-6">
            {/* Quiz General Settings Card */}
            <div className="p-6 rounded-2xl border border-base-200 bg-base-100 shadow-sm space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-base-content/60">
                  Quiz Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mid-term Assessment: React Architecture"
                  className="w-full text-lg font-bold rounded-xl border border-base-300 bg-base-100 px-3.5 py-2 text-base-content focus:border-warning focus:outline-none focus:ring-2 focus:ring-warning/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-base-content/60">
                  Description / Instructions
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Provide instructions or background for this quiz..."
                  className="w-full text-xs rounded-xl border border-base-300 bg-base-100 px-3.5 py-2 text-base-content focus:border-warning focus:outline-none focus:ring-2 focus:ring-warning/20"
                />
              </div>

              {/* Timing & Marks row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-base-content/60 mb-1 block">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full rounded-xl border border-base-300 bg-base-100 px-3 py-1.5 text-xs text-base-content focus:border-warning focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-base-content/60 mb-1 block">
                    Total Marks (Sum: {totalCalculatedMarks})
                  </label>
                  <input
                    type="number"
                    value={totalCalculatedMarks}
                    disabled
                    className="w-full rounded-xl border border-base-300 bg-base-200/50 px-3 py-1.5 text-xs text-base-content/70 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-base-content/60 mb-1 block">
                    Passing Marks
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(Number(e.target.value))}
                    className="w-full rounded-xl border border-base-300 bg-base-100 px-3 py-1.5 text-xs text-base-content focus:border-warning focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Questions Header */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <h3 className="text-base font-bold text-base-content">
                  Questions ({questions.length})
                </h3>
                <p className="text-xs text-base-content/60">
                  Add multiple choice, multiple select or true/false questions.
                </p>
              </div>

              {!showQuestionForm && (
                <Button
                  onClick={() => {
                    handleResetQuestionForm();
                    setShowQuestionForm(true);
                  }}
                  variant="primary"
                >
                  <Plus size={15} /> Add Question
                </Button>
              )}
            </div>

            {/* ── QUESTION EDITING FORM */}
            {showQuestionForm && (
              <div className="p-6 rounded-2xl border-2 border-warning/40 bg-base-100 shadow-lg space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-base-200 pb-3">
                  <h4 className="text-sm font-bold text-warning flex items-center gap-1.5">
                    <Sparkles size={15} />
                    <span>
                      {editingQuestionIdx !== null
                        ? `Edit Question #${editingQuestionIdx + 1}`
                        : "New Question"}
                    </span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleResetQuestionForm}
                    className="p-1 rounded-lg text-base-content/50 hover:bg-base-200 text-xs"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Question Type selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-base-content/70">
                    Type:
                  </span>
                  <div className="flex gap-1 bg-base-200 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleTypeChange("mcq")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        qType === "mcq"
                          ? "bg-warning text-warning-content shadow-xs"
                          : "text-base-content/70 hover:text-base-content"
                      }`}
                    >
                      Single Choice (MCQ)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange("multiple_select")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        qType === "multiple_select"
                          ? "bg-warning text-warning-content shadow-xs"
                          : "text-base-content/70 hover:text-base-content"
                      }`}
                    >
                      Multiple Select
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange("true_false")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        qType === "true_false"
                          ? "bg-warning text-warning-content shadow-xs"
                          : "text-base-content/70 hover:text-base-content"
                      }`}
                    >
                      True / False
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-base-content/60">
                    Question Text
                  </label>
                  <textarea
                    rows={2}
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    placeholder="Enter question text..."
                    className="w-full text-sm rounded-xl border border-base-300 bg-base-100 px-3.5 py-2 text-base-content focus:border-warning focus:outline-none focus:ring-2 focus:ring-warning/20"
                  />
                </div>

                {/* Options List */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-base-content/60 flex items-center justify-between">
                    <span>
                      Options & Correct Answer (Click radio/checkbox to set correct)
                    </span>
                    <span className="text-[11px] text-warning">
                      {qType === "multiple_select"
                        ? "Check all that apply"
                        : "Select single correct answer"}
                    </span>
                  </label>

                  {qOptions.map((opt, optIdx) => {
                    const isCorrect = qCorrect.includes(opt) && opt.trim() !== "";
                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                          isCorrect
                            ? "border-success bg-success/5"
                            : "border-base-200 bg-base-100"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleCorrectOption(opt)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            isCorrect
                              ? "bg-success text-success-content"
                              : "border border-base-300 hover:border-success text-transparent"
                          }`}
                          title={isCorrect ? "Correct answer" : "Mark as correct"}
                        >
                          <Check size={12} className="stroke-[3]" />
                        </button>

                        <span className="text-xs font-bold font-mono text-base-content/40 w-4">
                          {String.fromCharCode(65 + optIdx)}
                        </span>

                        <input
                          value={opt}
                          disabled={qType === "true_false"}
                          onChange={(e) => {
                            const val = e.target.value;
                            const next = [...qOptions];
                            next[optIdx] = val;
                            setQOptions(next);
                            // If it was selected as correct, update
                            if (qCorrect.includes(opt)) {
                              setQCorrect(
                                qCorrect.map((c) => (c === opt ? val : c))
                              );
                            }
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          className="flex-1 text-xs rounded-lg border border-base-200 bg-base-100 px-3 py-1.5 text-base-content focus:border-warning focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Marks & Difficulty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-base-content/60 mb-1 block">
                      Marks for this question
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={qMarks}
                      onChange={(e) => setQMarks(Number(e.target.value))}
                      className="w-full text-xs rounded-xl border border-base-300 bg-base-100 px-3 py-1.5 text-base-content focus:border-warning focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-base-content/60 mb-1 block">
                      Difficulty Level
                    </label>
                    <select
                      value={qDifficulty}
                      onChange={(e) => setQDifficulty(e.target.value as any)}
                      className="w-full text-xs rounded-xl border border-base-300 bg-base-100 px-3 py-1.5 text-base-content focus:border-warning focus:outline-none"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-base-content/60">
                    Explanation / Solution Notes (Optional)
                  </label>
                  <input
                    value={qExplanation}
                    onChange={(e) => setQExplanation(e.target.value)}
                    placeholder="Brief explanation shown after answering..."
                    className="w-full text-xs rounded-xl border border-base-300 bg-base-100 px-3 py-1.5 text-base-content focus:border-warning focus:outline-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-base-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetQuestionForm}
                  >
                    Cancel
                  </Button>
                  <Button type="button" variant="primary" onClick={handleSaveQuestion}>
                    <Check size={14} />
                    <span>
                      {editingQuestionIdx !== null
                        ? "Update Question"
                        : "Add Question"}
                    </span>
                  </Button>
                </div>
              </div>
            )}

            {/* Questions List */}
            {questions.length === 0 && !showQuestionForm ? (
              <div className="p-12 text-center border border-dashed border-base-300 rounded-2xl bg-base-100">
                <HelpCircle size={32} className="mx-auto text-warning/50 mb-2" />
                <h4 className="text-sm font-bold text-base-content">
                  No Questions Added Yet
                </h4>
                <p className="text-xs text-base-content/60 max-w-sm mx-auto mt-1 mb-4">
                  Create your first question above to build this quiz.
                </p>
                <Button
                  onClick={() => setShowQuestionForm(true)}
                  variant="primary"
                >
                  <Plus size={14} /> Add First Question
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-base-200 bg-base-100 hover:border-base-300 transition-all shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-warning/15 text-warning font-bold font-mono text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-base-200 font-semibold uppercase tracking-wider text-base-content/70">
                          {q.type.replace("_", " ")}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            q.difficulty === "easy"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : q.difficulty === "medium"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>

                      {/* Action buttons (Reorder, Edit, Delete) */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleReorderQuestion(idx, -1)}
                          className="p-1.5 rounded-lg text-base-content/50 hover:bg-base-200 disabled:opacity-30 transition-colors"
                          title="Move Up"
                        >
                          <ChevronUp size={15} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === questions.length - 1}
                          onClick={() => handleReorderQuestion(idx, 1)}
                          className="p-1.5 rounded-lg text-base-content/50 hover:bg-base-200 disabled:opacity-30 transition-colors"
                          title="Move Down"
                        >
                          <ChevronDown size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditQuestion(idx)}
                          className="p-1.5 rounded-lg text-base-content/50 hover:text-warning hover:bg-warning/10 transition-colors"
                          title="Edit Question"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(idx)}
                          className="p-1.5 rounded-lg text-base-content/50 hover:text-error hover:bg-error/10 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-base-content leading-relaxed">
                      {q.question}
                    </p>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = q.correctAnswer.includes(opt);
                        return (
                          <div
                            key={oIdx}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border ${
                              isCorrect
                                ? "border-success/40 bg-success/10 text-success font-semibold"
                                : "border-base-200 bg-base-100 text-base-content/80"
                            }`}
                          >
                            <span className="font-mono text-base-content/40">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            <span className="truncate">{opt}</span>
                            {isCorrect && (
                              <CheckCircle2
                                size={14}
                                className="ml-auto text-success shrink-0"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

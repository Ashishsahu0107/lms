"use client";

// components/student/StudentQuizzes.tsx — Quizzes list and active quiz attempt modal
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function StudentQuizzes() {
  const { token } = useAuth();
  const [quizzes, setQuizzes] = useState<Array<Record<string, unknown>>>([]);
  const [attempts, setAttempts] = useState<Array<Record<string, unknown>>>([]);
  const [activeQuiz, setActiveQuiz] = useState<Record<string, unknown> | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [qRes, aRes] = await Promise.all([
        fetch(`${API_URL}/quizzes`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/quiz-attempts`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const qData = await qRes.json();
      const aData = await aRes.json();

      if (qData.success) setQuizzes(qData.data.quizzes || []);
      if (aData.success) setAttempts(aData.data.attempts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStartQuiz = async (quiz: Record<string, unknown>) => {
    // Fetch full quiz with questions
    try {
      const res = await fetch(`${API_URL}/quizzes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const found = (data.data.quizzes || []).find((q: Record<string, unknown>) => q.id === quiz.id);
      setActiveQuiz(found || quiz);
      setUserAnswers({});
    } catch {
      setActiveQuiz(quiz);
    }
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: [answer],
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || !token) return;
    setSubmitting(true);

    const answersPayload = Object.entries(userAnswers).map(([questionId, selectedAnswers]) => ({
      questionId,
      selectedAnswers,
    }));

    try {
      const res = await fetch(`${API_URL}/quiz-attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quizId: activeQuiz.id,
          answers: answersPayload,
          timeSpent: 120,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success(`Quiz Completed! Score: ${data.data.attempt.score}/${activeQuiz.totalMarks || 100}`);
      setActiveQuiz(null);
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Quiz submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const getAttempt = (quizId: string) => {
    return attempts.find((a) => a.quizId === quizId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-base-content font-display">
          Interactive Quizzes 🧠
        </h1>
        <p className="text-sm text-base-content/60 mt-1">
          Test your domain knowledge, earn XP, and track accuracy performance.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((q) => {
            const attempt = getAttempt(q.id as string);

            return (
              <div
                key={q.id as string}
                className="card bg-base-100 shadow border border-base-200 hover:shadow-lg transition-all"
              >
                <div className="card-body p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-base line-clamp-1">{q.title as string}</h3>
                    <span className="badge badge-primary badge-sm">
                      {q.quizType as string || "Exam"}
                    </span>
                  </div>

                  <p className="text-xs text-base-content/60 line-clamp-2 mb-4">
                    {q.description as string || "Test your subject understanding."}
                  </p>

                  <div className="flex items-center justify-between text-xs py-2 border-y border-base-200 text-base-content/70">
                    <span>⏱️ {q.duration as number || 30} mins</span>
                    <span>🎯 {q.passingMarks as number || 40}% to pass</span>
                    <span>⭐ {q.totalMarks as number || 100} pts</span>
                  </div>

                  {attempt && (
                    <div className="mt-3 p-2 bg-success/10 text-success rounded-lg text-xs font-semibold text-center">
                      Score: {attempt.score as number}/{q.totalMarks as number || 100} ({Math.round(attempt.accuracy as number || 0)}% accuracy)
                    </div>
                  )}

                  <div className="card-actions justify-end mt-4">
                    {!attempt ? (
                      <button
                        onClick={() => handleStartQuiz(q)}
                        className="btn btn-primary btn-sm w-full"
                      >
                        🚀 Take Quiz Now
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartQuiz(q)}
                        className="btn btn-outline btn-sm w-full"
                      >
                        🔄 Retake Quiz
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-base-content/40 bg-base-100 rounded-2xl border border-base-200">
          <p className="text-5xl mb-3">🧠</p>
          <p className="font-bold text-lg text-base-content">No quizzes published yet</p>
        </div>
      )}

      {/* Active Quiz Player Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="card bg-base-100 max-w-2xl w-full shadow-2xl animate-fade-in border border-base-200">
            <div className="card-body p-6">
              <div className="flex items-center justify-between border-b border-base-200 pb-3 mb-4">
                <div>
                  <h3 className="font-bold text-lg">{activeQuiz.title as string}</h3>
                  <p className="text-xs text-base-content/50">Duration: {activeQuiz.duration as number} mins</p>
                </div>
                <button onClick={() => setActiveQuiz(null)} className="btn btn-ghost btn-xs btn-circle">✕</button>
              </div>

              {/* Sample Questions View */}
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {[
                  {
                    id: "q1",
                    question: "What is the primary function of Next.js App Router?",
                    options: [
                      "Server-side rendering and simplified routing",
                      "Database query engine",
                      "CSS styling library",
                      "State management framework",
                    ],
                  },
                  {
                    id: "q2",
                    question: "Which Prisma command generates the type-safe client?",
                    options: [
                      "npx prisma generate",
                      "npx prisma push",
                      "npx prisma seed",
                      "npx prisma migrate",
                    ],
                  },
                ].map((q, idx) => (
                  <div key={q.id} className="p-4 bg-base-200/50 rounded-xl border border-base-300">
                    <p className="font-semibold text-sm mb-3">
                      Q{idx + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const isSelected = userAnswers[q.id]?.[0] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`w-full text-left p-3 rounded-lg text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-primary text-primary-content font-bold shadow-sm"
                                : "bg-base-100 hover:bg-base-300 text-base-content"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="card-actions justify-end gap-2 mt-6 pt-4 border-t border-base-200">
                <button onClick={() => setActiveQuiz(null)} className="btn btn-ghost btn-sm">
                  Cancel
                </button>
                <button onClick={handleSubmitQuiz} disabled={submitting} className="btn btn-primary btn-sm">
                  {submitting ? <span className="loading loading-spinner loading-xs" /> : null}
                  Submit Answers
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

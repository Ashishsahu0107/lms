// src/pages/student/quiz/Quiz.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  Calendar,
  BookOpen,
  Search,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Award,
} from "lucide-react";

import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { getQuizzes } from "../../../services/quizService";
import { getQuizAttempts } from "../../../services/attemptService";
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

export default function StudentQuizList() {
  const navigate = useNavigate();
  const [quizzesList, setQuizzesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Selected Quiz for instructions overlay
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [attemptsHistory, setAttemptsHistory] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  useEffect(() => {
    async function loadQuizzes() {
      try {
        setLoading(true);
        const res = await getQuizzes();
        if (res.data?.success) {
          setQuizzesList(res.data.data || []);
        } else {
          toast.error("Failed to load active assessments");
        }
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        toast.error("Error querying assessment logs from API");
      } finally {
        setLoading(false);
      }
    }
    loadQuizzes();
  }, []);

  const handleOpenInstructions = async (quiz) => {
    setSelectedQuiz(quiz);
    try {
      setLoadingAttempts(true);
      const res = await getQuizAttempts(quiz._id);
      if (res.data?.success) {
        setAttemptsHistory(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching attempts history:", err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleStartAttempt = () => {
    if (!selectedQuiz) return;
    setSelectedQuiz(null);
    navigate(`/student/quizzes/attempt/${selectedQuiz._id}`);
  };

  const filteredQuizzes = quizzesList.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (quiz.courseId?.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
      id="student-quizzes-dashboard"
    >
      {/* Header Panel */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-6 rounded-3xl border border-primary/20 shadow-xl backdrop-blur-md"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge badge-primary gap-1 py-3 px-3 rounded-full text-xs font-semibold">
              <Sparkles className="h-3 w-3 animate-pulse" /> Assessment Hub
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Interactive Quizzes</h1>
          <p className="text-muted-foreground text-sm">
            Evaluate your knowledge base. Take course-wise exams, view grades, and unlock achievements.
          </p>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-base-100 border border-base-300 p-4 rounded-2xl shadow-md"
      >
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quizzes by title or course..."
            className="pl-11 h-12 bg-base-200 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary w-full text-sm"
            id="student-quizzes-search-field"
          />
        </div>
      </motion.div>

      {/* Quizzes List */}
      <motion.div variants={itemVariants} id="student-quizzes-list-panel">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="text-sm text-muted-foreground animate-pulse font-medium">Fetching active assessments...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <Card className="bg-base-100 shadow-xl border border-base-300 rounded-3xl" id="student-quizzes-empty-card">
            <CardContent className="py-20 text-center flex flex-col items-center max-w-md mx-auto">
              <div className="rounded-full bg-base-200 p-5 mb-5 text-muted-foreground">
                <HelpCircle className="h-10 w-10 text-muted-foreground/60" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Quizzes Published</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Your instructors have not published any exams or practice challenges for your enrolled courses yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="student-quizzes-grid">
            {filteredQuizzes.map((quiz) => (
              <motion.div
                key={quiz._id}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="cursor-pointer"
                onClick={() => handleOpenInstructions(quiz)}
                id={`student-quiz-item-${quiz._id}`}
              >
                <Card className="border border-base-300 bg-base-100 shadow-lg hover:shadow-xl hover:border-primary/20 transition-all duration-300 rounded-3xl overflow-hidden h-full flex flex-col justify-between">
                  <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <span className="badge badge-outline border-primary/40 text-primary text-[10px] font-bold px-2 py-2 rounded-lg truncate max-w-[150px]">
                          {quiz.courseId?.title || "Assigned Course"}
                        </span>
                        <span className="badge badge-neutral text-[10px] font-bold px-2.5 py-2.5 rounded-xl capitalize">
                          {quiz.quizType}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-foreground line-clamp-1 mb-2">{quiz.title}</h3>
                      <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed mb-4">
                        {quiz.description || "Take this course assessment to evaluate your concepts."}
                      </p>
                    </div>

                    <div className="border-t border-base-300 pt-4 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-warning/80" /> {quiz.duration} mins
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-primary/80" /> {quiz.totalMarks} Marks
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl bg-base-200 hover:bg-primary hover:text-white p-2 flex items-center gap-1 text-[10px]"
                      >
                        Details <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* QUIZ INSTRUCTIONS MODAL */}
      <Modal
        isOpen={!!selectedQuiz}
        onClose={() => setSelectedQuiz(null)}
        title={selectedQuiz?.title || "Assessment Guidelines"}
      >
        {selectedQuiz && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-base-200 p-5 rounded-2xl border border-primary/15 space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Target Course</span>
              <h3 className="font-bold text-lg text-foreground">{selectedQuiz.courseId?.title}</h3>
            </div>

            {selectedQuiz.instructions && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground block">Quiz Instructions:</span>
                <p className="text-xs text-muted-foreground leading-relaxed bg-base-200 p-4 rounded-xl border border-base-300 font-mono overflow-auto max-h-[120px]">
                  {selectedQuiz.instructions}
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-base-200 border border-base-300 rounded-xl text-center space-y-0.5">
                <span className="text-xl font-extrabold text-foreground">{selectedQuiz.duration}</span>
                <span className="text-[10px] font-bold text-muted-foreground block">Minutes</span>
              </div>
              <div className="p-3 bg-base-200 border border-base-300 rounded-xl text-center space-y-0.5">
                <span className="text-xl font-extrabold text-foreground">{selectedQuiz.totalMarks}</span>
                <span className="text-[10px] font-bold text-muted-foreground block">Total Marks</span>
              </div>
              <div className="p-3 bg-base-200 border border-base-300 rounded-xl text-center space-y-0.5">
                <span className="text-xl font-extrabold text-foreground">{selectedQuiz.passingMarks}</span>
                <span className="text-[10px] font-bold text-muted-foreground block">Pass score</span>
              </div>
            </div>

            {/* Attempts History List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground block">Your Attempts History:</span>
              {loadingAttempts ? (
                <div className="flex justify-center py-4">
                  <span className="loading loading-spinner loading-sm text-primary"></span>
                </div>
              ) : attemptsHistory.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic text-center py-3 bg-base-200 rounded-xl">
                  You haven't attempted this quiz yet.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                  {attemptsHistory.map((attempt, index) => (
                    <div
                      key={attempt._id}
                      onClick={() => {
                        setSelectedQuiz(null);
                        navigate(`/student/quizzes/result/${attempt._id}`);
                      }}
                      className="flex items-center justify-between bg-primary/5 hover:bg-primary/10 border border-primary/20 p-2.5 rounded-xl text-xs cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="font-bold text-foreground">Attempt #{attemptsHistory.length - index}</span>
                        <span className="text-[10px] text-muted-foreground">({new Date(attempt.submittedAt).toLocaleDateString()})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-success">{attempt.score} / {selectedQuiz.totalMarks}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Start Button */}
            <Button
              onClick={handleStartAttempt}
              disabled={selectedQuiz.attemptLimit > 0 && attemptsHistory.length >= selectedQuiz.attemptLimit}
              className="btn btn-primary w-full rounded-2xl text-white font-bold h-12 flex items-center justify-center gap-2"
              id="student-start-quiz-btn"
            >
              <Sparkles className="h-5 w-5" />
              {selectedQuiz.attemptLimit > 0 && attemptsHistory.length >= selectedQuiz.attemptLimit
                ? "Attempt Limit Exceeded"
                : attemptsHistory.length > 0
                ? `Retake Quiz (${selectedQuiz.attemptLimit - attemptsHistory.length} Left)`
                : "Start Quiz Attempt"}
            </Button>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
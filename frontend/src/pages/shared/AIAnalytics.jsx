import { useState, useEffect } from "react";
import { Sparkles, Brain, Cpu, RefreshCw, Zap } from "lucide-react";
import { getAiRecommendations, generateAiQuiz } from "../../services/aiService";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function AIAnalytics() {
  const [recs, setRecs] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  // Quiz generator states
  const [topic, setTopic] = useState("React Hooks");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const loadRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const res = await getAiRecommendations();
      if (res && res.success) {
        setRecs(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    try {
      setLoadingQuiz(true);
      setQuizQuestions([]);
      setCurrentQuestion(0);
      setSelectedOption(null);
      setScore(0);
      setQuizCompleted(false);

      const res = await generateAiQuiz(topic);
      if (res && res.success) {
        setQuizQuestions(res.data || []);
        toast.success(`Generated 3 MCQs on '${topic}' successfully!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleOptionSelect = (index) => {
    if (selectedOption !== null) return; // Answer locked
    setSelectedOption(index);

    const isCorrect = index === quizQuestions[currentQuestion].correctOption;
    if (isCorrect) {
      setScore((s) => s + 1);
      toast.success("Correct Answer! +5 XP!");
    } else {
      toast.error("Incorrect Answer. Study explanation.");
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    if (currentQuestion + 1 < quizQuestions.length) {
      setCurrentQuestion((c) => c + 1);
    } else {
      setQuizCompleted(true);
      // Award XP toast milestone!
      toast(
        () => (
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
            <Zap className="h-4 w-4 text-amber-400 animate-pulse" /> Quiz
            complete! Awarded +10 XP streak bonus!
          </span>
        ),
        { duration: 4000 },
      );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-400 animate-pulse" /> AI
            recommendations & Quiz Labs
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Get AI-customized study pathways and build topic multiple-choice
            testing drills instantly.
          </p>
        </div>
      </div>

      {/* Grid: Course recommendations vs Quiz Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quiz Builder Box */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="h-5 w-5 text-blue-400" /> AI Classroom Quiz
              Generator
            </h2>

            {/* Topic input Form */}
            <form onSubmit={handleGenerateQuiz} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter study topic (e.g. React Redux, Node express REST)..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loadingQuiz}
                className="flex-1 rounded-xl border border-white/10 bg-black/30 py-2.5 px-4 text-xs text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={loadingQuiz || !topic.trim()}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-xs font-bold text-white hover:opacity-90 shadow"
              >
                {loadingQuiz ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Build Questions"
                )}
              </button>
            </form>

            {/* Quiz active viewport */}
            <div className="rounded-2xl border border-white/5 bg-black/20 p-5 min-h-[250px] flex flex-col justify-between">
              {loadingQuiz ? (
                <div className="flex-1 flex flex-col items-center justify-center text-white/40 text-xs gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />{" "}
                  Generating 3 MCQs on '{topic}'...
                </div>
              ) : quizQuestions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-xs text-center space-y-2">
                  <Brain className="h-10 w-10 text-white/10" />
                  <p className="font-semibold text-white/50">
                    Questions Laboratory Ready
                  </p>
                  <p className="text-[10px]">
                    Type any syllabus subject above to generate custom MCQs
                    study drills.
                  </p>
                </div>
              ) : quizCompleted ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <Sparkles className="h-12 w-12 text-amber-400 animate-bounce" />
                  <div>
                    <h3 className="font-black text-white text-lg">
                      Congratulations!
                    </h3>
                    <p className="text-xs text-white/50 mt-1">
                      You scored{" "}
                      <span className="text-amber-400 font-bold">
                        {score}/{quizQuestions.length}
                      </span>{" "}
                      correct answers on {topic}!
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateQuiz}
                    className="flex items-center gap-1.5 rounded-lg border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-400"
                  >
                    Retake Quiz
                  </button>
                </div>
              ) : (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-white/30 tracking-wider">
                      <span>
                        Question {currentQuestion + 1} of {quizQuestions.length}
                      </span>
                      <span>Score: {score}</span>
                    </div>

                    <h4 className="font-bold text-white text-xs leading-relaxed">
                      {quizQuestions[currentQuestion].questionText}
                    </h4>

                    {/* Options list */}
                    <div className="grid grid-cols-1 gap-2">
                      {quizQuestions[currentQuestion].options.map(
                        (opt, oIdx) => {
                          const isSelected = selectedOption === oIdx;
                          const isCorrect =
                            oIdx ===
                            quizQuestions[currentQuestion].correctOption;
                          let optStyle =
                            "border-white/10 bg-white/5 text-white hover:bg-white/10";

                          if (selectedOption !== null) {
                            if (isCorrect)
                              optStyle =
                                "border-emerald-500/30 bg-emerald-500/20 text-emerald-400 font-bold";
                            else if (isSelected)
                              optStyle =
                                "border-rose-500/30 bg-rose-500/20 text-rose-400";
                            else
                              optStyle =
                                "border-white/5 bg-white/5 opacity-55 text-white/70";
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleOptionSelect(oIdx)}
                              disabled={selectedOption !== null}
                              className={`w-full text-left rounded-xl border p-3 text-xs transition-all ${optStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>

                  {selectedOption !== null && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                      <div className="text-[10px] text-white/60 leading-relaxed font-semibold bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="font-black text-blue-400 block mb-0.5 uppercase tracking-wider text-[8px]">
                          AI Coach Explanation
                        </span>
                        {quizQuestions[currentQuestion].explanation}
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleNext}
                          className="rounded-lg bg-blue-500 px-4 py-1.5 text-xs font-bold text-white"
                        >
                          {currentQuestion + 1 < quizQuestions.length
                            ? "Next Question"
                            : "Complete Quiz"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Recommendations Dashboard */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-4">
            <Sparkles className="h-5 w-5 text-amber-400 animate-spin" /> AI
            Study Recommendations
          </h2>

          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {loadingRecs ? (
              <div className="text-white/30 text-xs py-8 text-center flex items-center justify-center gap-1.5">
                <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />{" "}
                Computing pathways...
              </div>
            ) : recs.length === 0 ? (
              <div className="text-white/30 text-xs py-8 text-center">
                No recommendations loaded.
              </div>
            ) : (
              recs.map((rec, idx) => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  key={idx}
                  className="rounded-xl border border-white/5 bg-white/5 p-4 space-y-2 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-xs font-black text-white leading-snug line-clamp-1">
                      {rec.title}
                    </h3>
                    <span className="text-[8px] font-black uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded shrink-0">
                      {rec.aiMatchPercentage}% Match
                    </span>
                  </div>

                  <p className="text-[10px] text-white/50 line-clamp-2">
                    {rec.description}
                  </p>

                  <div className="text-[9px] text-blue-400 font-bold leading-normal bg-blue-500/5 p-2 rounded border border-blue-500/10">
                    {rec.aiReason}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

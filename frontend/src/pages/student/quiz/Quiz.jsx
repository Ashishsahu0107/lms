import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Award,
  RotateCcw,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Modal } from "../../components/ui/Modal";
import { RadioGroup } from "../../components/ui/Checkbox";

const quizData = {
  title: "JavaScript Fundamentals",
  course: "Advanced JavaScript",
  timeLimit: 30,
  totalQuestions: 10,
  passingScore: 70,
};

const questions = [
  {
    id: 1,
    question: "What is the difference between 'let' and 'var' in JavaScript?",
    options: [
      { value: "a", label: "They are exactly the same" },
      { value: "b", label: "let is block-scoped, var is function-scoped" },
      { value: "c", label: "let is only used in loops, var is for general use" },
      { value: "d", label: "var is deprecated, use let instead" },
    ],
    correctAnswer: "b",
  },
  {
    id: 2,
    question: "Which method is used to add an element to the end of an array?",
    options: [
      { value: "a", label: "append()" },
      { value: "b", label: "push()" },
      { value: "c", label: "add()" },
      { value: "d", label: "insert()" },
    ],
    correctAnswer: "b",
  },
  {
    id: 3,
    question: "What does '=== ' operator check for?",
    options: [
      { value: "a", label: "Value equality only" },
      { value: "b", label: "Type equality only" },
      { value: "c", label: "Both value and type equality" },
      { value: "d", label: "Reference equality" },
    ],
    correctAnswer: "c",
  },
];

export default function QuizPage() {
  const [quizState, setQuizState] = useState("intro"); // intro, active, review, result
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(quizData.timeLimit * 60);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const activeQuestion = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const handleAnswerSelect = (value) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: value }));
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) =>
      prev.includes(currentQuestion)
        ? prev.filter((q) => q !== currentQuestion)
        : [...prev, currentQuestion]
    );
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id - 1] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  if (quizState === "result") {
    const score = calculateScore();
    const passed = score >= quizData.passingScore;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div
              className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                passed ? "bg-emerald-100" : "bg-red-100"
              }`}
            >
              {passed ? (
                <Award className="h-12 w-12 text-emerald-600" />
              ) : (
                <XCircle className="h-12 w-12 text-red-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
            <p className="text-muted-foreground mb-6">
              You scored {score}% on {quizData.title}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-emerald-50">
                <p className="text-2xl font-bold text-emerald-600">
                  {questions.filter((q) => answers[q.id - 1] === q.correctAnswer).length}
                </p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="p-4 rounded-xl bg-red-50">
                <p className="text-2xl font-bold text-red-600">
                  {questions.filter((q) => answers[q.id - 1] && answers[q.id - 1] !== q.correctAnswer).length}
                </p>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold">{answeredCount}</p>
                <p className="text-sm text-muted-foreground">Answered</p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setQuizState("intro");
                  setAnswers({});
                  setCurrentQuestion(0);
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </Button>
              <Button className="gap-2">
                <Eye className="h-4 w-4" />
                Review Answers
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (quizState === "review") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Review Answers</h1>
          <Button variant="outline" onClick={() => setQuizState("result")}>
            View Score
          </Button>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const is unanswered = !userAnswer;

            return (
              <Card
                key={question.id}
                className={isCorrect ? "border-emerald-200" : is unanswered ? "border-amber-200" : "border-red-200"}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                      Question {index + 1}
                    </CardTitle>
                    <Badge variant={isCorrect ? "success" : is unanswered ? "warning" : "destructive"}>
                      {isCorrect ? "Correct" : is unanswered ? "Skipped" : "Incorrect"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{question.question}</p>
                  <div className="space-y-2">
                    {question.options.map((option) => {
                      const isSelected = userAnswer === option.value;
                      const isCorrectOption = option.value === question.correctAnswer;
                      return (
                        <div
                          key={option.value}
                          className={`p-3 rounded-lg border ${
                            isCorrectOption
                              ? "bg-emerald-50 border-emerald-200"
                              : isSelected && !isCorrectOption
                              ? "bg-red-50 border-red-200"
                              : "bg-muted/50"
                          }`}
                        >
                          <span className="font-medium mr-2">{option.value}.</span>
                          {option.label}
                          {isCorrectOption && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 inline ml-2" />
                          )}
                          {isSelected && !isCorrectOption && (
                            <XCircle className="h-4 w-4 text-red-600 inline ml-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>
    );
  }

  if (quizState === "intro") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card>
          <CardContent className="pt-8 pb-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{quizData.title}</h2>
              <p className="text-muted-foreground">{quizData.course}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-muted text-center">
                <p className="text-2xl font-bold">{quizData.timeLimit}</p>
                <p className="text-sm text-muted-foreground">Minutes</p>
              </div>
              <div className="p-4 rounded-xl bg-muted text-center">
                <p className="text-2xl font-bold">{quizData.totalQuestions}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Passing score: {quizData.passingScore}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>You can flag questions for review</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Timer cannot be paused once started</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => setQuizState("active")}
            >
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      {/* Quiz Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">{quizData.title}</h1>
            <p className="text-sm text-muted-foreground">{quizData.course}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFlag}
              className={`gap-2 ${flaggedQuestions.includes(currentQuestion) ? "bg-amber-50 border-amber-200" : ""}`}
            >
              <Flag className="h-4 w-4" />
              {flaggedQuestions.includes(currentQuestion) ? "Flagged" : "Flag"}
            </Button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
              <Clock className="h-4 w-4" />
              <span className="font-mono font-medium">
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
        <ProgressBar value={progress} />
        <p className="text-sm text-muted-foreground mt-2">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      {/* Question Navigator */}
      <div className="flex flex-wrap gap-2 mb-6">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestion(index)}
            className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
              currentQuestion === index
                ? "bg-primary text-primary-foreground"
                : answers[index]
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : flaggedQuestions.includes(index)
                ? "bg-amber-100 text-amber-700 border border-amber-200"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{activeQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion] || ""}
            onChange={handleAnswerSelect}
            options={activeQuestion.options.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {currentQuestion === questions.length - 1 ? (
            <Button onClick={() => setShowConfirmSubmit(true)} className="gap-2">
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Confirm Submit Modal */}
      <Modal
        isOpen={showConfirmSubmit}
        onClose={() => setShowConfirmSubmit(false)}
        title="Submit Quiz?"
        description={`You have answered ${answeredCount} out of ${questions.length} questions.`}
      >
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
            Continue Quiz
          </Button>
          <Button onClick={() => setQuizState("result")}>Submit Quiz</Button>
        </div>
      </Modal>
    </motion.div>
  );
}
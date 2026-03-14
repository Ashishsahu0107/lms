import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

const QuizTake = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
    if (!enrolledCourses.includes(courseId)) {
      navigate(`/course/${courseId}`);
      return;
    }

    setTimeout(() => {
      const quizData = {
        id: quizId,
        title: "React Basics Quiz",
        questions: [
          {
            id: 1,
            question: "What is React?",
            options: [
              "A JavaScript library",
              "A programming language",
              "A database",
              "An OS"
            ],
            correct: 0,
            explanation: "React is a JavaScript library for building UIs."
          },
          {
            id: 2,
            question: "What is JSX?",
            options: [
              "JavaScript XML",
              "Java Syntax",
              "JSON XML",
              "None"
            ],
            correct: 0,
            explanation: "JSX is a syntax extension for JavaScript."
          }
        ]
      };

      setQuiz(quizData);
      setSelectedAnswers(new Array(quizData.questions.length).fill(null));
      setLoading(false);
    }, 500);
  }, [courseId, quizId, navigate]);

  useEffect(() => {
    if (showResults || !quiz) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResults, quiz]);

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quiz.questions[index].correct) {
        correctCount++;
      }
    });
    
    const finalScore = Math.round((correctCount / quiz.questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-6">
              {score >= 70 ? (
                <CheckCircle className="w-full h-full text-green-500" />
              ) : (
                <XCircle className="w-full h-full text-red-500" />
              )}
            </div>
            
            <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
            <p className="text-gray-600 mb-6">{quiz.title}</p>
            
            <div className="text-5xl font-bold text-blue-600 mb-4">
              {score}%
            </div>

            <button
              onClick={() => navigate(`/course/${courseId}/learn`)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(`/course/${courseId}/learn`)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <ChevronLeft size={20} />
          Back to Course
        </button>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Q{currentQuestion + 1}/{quiz.questions.length}
          </span>
          <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${
            timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'
          }`}>
            <Clock className="w-4 h-4 inline mr-1" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="bg-white px-4">
        <div className="w-full bg-gray-200 h-2">
          <div 
            className="bg-blue-600 h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-6">
            {question.question}
          </h2>

          <div className="space-y-3 mb-8">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(currentQuestion, idx)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  selectedAnswers[currentQuestion] === idx
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                    selectedAnswers[currentQuestion] === idx
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswers[currentQuestion] === idx && '✓'}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                currentQuestion === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>

            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={selectedAnswers.includes(null)}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  selectedAnswers.includes(null)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTake;
import { useEffect, useState } from "react";
import api from "../utils/api";

const Quiz = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 NEW: Timer
  const [timeLeft, setTimeLeft] = useState(60);

  // ================= COURSES =================
  useEffect(() => {
    api.get("/courses")
      .then((res) => setCourses(res.data || []))
      .catch((err) => {
        console.log("Course Error:", err);
        setCourses([]);
      });
  }, []);

  // ================= LOAD QUIZ =================
  useEffect(() => {
    if (!selectedCourse) return;

    setLoading(true);
    setQuiz([]);
    setAnswers({});
    setScore(null);
    setTimeLeft(60); // 🔥 reset timer

    api.get(`/quiz/${selectedCourse}`)
      .then((res) => {
        // 🔥 SHUFFLE QUESTIONS
        const shuffled = (res.data || []).sort(() => Math.random() - 0.5);
        setQuiz(shuffled);
      })
      .catch((err) => {
        console.log("Quiz Error:", err?.response?.data || err);
        alert("Quiz load error (check backend/token)");
        setQuiz([]);
      })
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  // ================= TIMER =================
  useEffect(() => {
    if (!selectedCourse || score !== null) return;

    if (timeLeft === 0) {
      submitQuiz(); // 🔥 auto submit
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, selectedCourse, score]);

  // ================= SELECT ANSWER =================
  const selectAnswer = (qId, index) => {
    setAnswers((prev) => ({ ...prev, [qId]: index }));
  };

  // ================= SUBMIT =================
  const submitQuiz = async () => {
    if (!selectedCourse) return alert("Select course");
    if (quiz.length === 0) return alert("No quiz available");

    try {
      const res = await api.post(`/quiz/submit/${selectedCourse}`, { answers });
      setScore(res.data.score);
      localStorage.setItem("quizUpdated", Date.now());
    } catch (err) {
      console.log(err?.response?.data || err);
      alert("Submit error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg p-8 space-y-6 border border-gray-100">
        <h2 className="text-3xl font-extrabold text-blue-700 flex items-center gap-2">
          <span className="inline-block">❓</span> Quiz Section
        </h2>

        {/* COURSE SELECT */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Choose a course --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* TIMER + PROGRESS BAR */}
        {selectedCourse && score === null && (
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-blue-700">Time Left</span>
              <span className="text-sm font-bold text-red-500">{timeLeft}s</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(timeLeft / 60) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex items-center gap-2 text-blue-600 font-semibold animate-pulse">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            Loading quiz...
          </div>
        )}

        {/* NO QUIZ */}
        {!loading && selectedCourse && quiz.length === 0 && (
          <div className="text-red-500 bg-red-50 border border-red-200 rounded p-3 text-center font-semibold">
            No quiz available for this course.
          </div>
        )}

        {/* QUESTIONS */}
        {!loading && quiz.length > 0 && (
          <div className="space-y-6">
            {quiz.map((q, idx) => (
              <div key={q._id} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-600">Q{idx + 1}.</span>
                  <span className="font-medium text-gray-800">{q.question}</span>
                </div>
                <div className="space-y-2 mt-2">
                  {q.options.map((opt, i) => (
                    <label key={i} className={`flex items-center gap-2 cursor-pointer p-2 rounded transition ${answers[q._id] === i ? 'bg-blue-100' : ''} ${score !== null ? 'opacity-70' : ''}`}>
                      <input
                        type="radio"
                        name={q._id}
                        checked={answers[q._id] === i}
                        disabled={score !== null}
                        onChange={() => selectAnswer(q._id, i)}
                        className="accent-blue-500"
                      />
                      <span className="text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUBMIT BUTTON */}
        {!loading && quiz.length > 0 && score === null && (
          <div className="flex justify-end">
            <button
              onClick={submitQuiz}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded-lg font-semibold shadow"
            >
              Submit Quiz
            </button>
          </div>
        )}

        {/* RESULT */}
        {score !== null && (
          <div className="mt-4 p-5 bg-green-50 border border-green-200 rounded-lg text-center">
            <span className="text-2xl">🎉</span>
            <div className="text-lg font-bold text-green-700 mt-2">Your Score: <span className="text-2xl">{score}%</span></div>
            <div className="text-sm text-gray-600 mt-1">Thank you for participating!</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
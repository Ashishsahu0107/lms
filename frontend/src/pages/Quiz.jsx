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
    <div className="p-6 space-y-4">

      <h2 className="text-2xl font-bold">Quiz Section ❓</h2>

      {/* COURSE SELECT */}
      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="border p-2 mb-4 rounded"
      >
        <option value="">Select Course</option>
        {courses.map((c) => (
          <option key={c._id} value={c._id}>{c.title}</option>
        ))}
      </select>

      {/* TIMER */}
      {selectedCourse && score === null && (
        <p className="text-red-500 font-bold">
          ⏱ Time Left: {timeLeft}s
        </p>
      )}

      {/* LOADING */}
      {loading && <p>Loading quiz...</p>}

      {/* NO QUIZ */}
      {!loading && selectedCourse && quiz.length === 0 && (
        <p className="text-red-500">No quiz available</p>
      )}

      {/* QUESTIONS */}
      {!loading && quiz.map((q) => (
        <div key={q._id} className="border p-3 mb-3 rounded">
          <p className="font-medium">{q.question}</p>

          {q.options.map((opt, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="radio"
                name={q._id}
                checked={answers[q._id] === i}
                disabled={score !== null} // 🔒 lock after submit
                onChange={() => selectAnswer(q._id, i)}
              />
              <span>{opt}</span>
            </div>
          ))}
        </div>
      ))}

      {/* SUBMIT BUTTON */}
      {!loading && quiz.length > 0 && score === null && (
        <button
          onClick={submitQuiz}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      )}

      {/* RESULT */}
      {score !== null && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          🎉 Your Score: <b>{score}%</b>
        </div>
      )}

    </div>
  );
};

export default Quiz;
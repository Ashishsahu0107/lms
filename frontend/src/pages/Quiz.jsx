import { useEffect, useState } from "react";
import api from "../utils/api";

const Quiz = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  // courses
  useEffect(() => {
    api.get("/courses")
      .then((res) => setCourses(res.data || []))
      .catch((err) => {
        console.log("Course Error:", err);
        setCourses([]);
      });
  }, []);

  // quiz
  useEffect(() => {
    if (!selectedCourse) return;

    setLoading(true);
    setQuiz([]);
    setAnswers({});
    setScore(null);

    api.get(`/quiz/${selectedCourse}`)
      .then((res) => {
        setQuiz(res.data || []);
      })
      .catch((err) => {
        console.log("Quiz Error:", err?.response?.data || err);
        alert("Quiz load error (check backend/token)");
        setQuiz([]);
      })
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  const selectAnswer = (qId, index) => {
    setAnswers((prev) => ({ ...prev, [qId]: index }));
  };

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
    <div>
      <h2 className="text-2xl font-bold mb-4">Quiz Section ❓</h2>

      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="border p-2 mb-4"
      >
        <option value="">Select Course</option>
        {courses.map((c) => (
          <option key={c._id} value={c._id}>{c.title}</option>
        ))}
      </select>

      {loading && <p>Loading quiz...</p>}

      {!loading && selectedCourse && quiz.length === 0 && (
        <p>No quiz available</p>
      )}

      {!loading && quiz.map((q) => (
        <div key={q._id} className="border p-3 mb-3">
          <p>{q.question}</p>
          {q.options.map((opt, i) => (
            <div key={i}>
              <input
                type="radio"
                name={q._id}
                checked={answers[q._id] === i}
                onChange={() => selectAnswer(q._id, i)}
              />
              {opt}
            </div>
          ))}
        </div>
      ))}

      {!loading && quiz.length > 0 && (
        <button onClick={submitQuiz} className="bg-blue-500 text-white px-4 py-2">
          Submit
        </button>
      )}

      {score !== null && <p>Score: {score}%</p>}
    </div>
  );
};

export default Quiz;
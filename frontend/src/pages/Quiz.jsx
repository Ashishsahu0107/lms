import { useEffect, useState } from "react";
import api from "../utils/api";

export default function Quiz() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch courses
  useEffect(() => {
    api
      .get("/courses")
      .then((res) => setCourses(res.data))
      .catch((err) => console.log("Course Error:", err));
  }, []);

  // 🔹 Fetch quiz
  useEffect(() => {
    if (!selectedCourse) return;

    setLoading(true);
    setQuiz([]);
    setAnswers({});
    setScore(null);

    api
      .get(`/quiz/${selectedCourse}`)
      .then((res) => {
        setQuiz(res.data || []);
      })
      .catch((err) => {
        console.log("Quiz Error:", err);
        setQuiz([]);
      })
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  // 🔹 Select answer
  const selectAnswer = (qId, index) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: index,
    }));
  };

  // 🔹 Submit quiz
  const submitQuiz = async () => {
    if (!selectedCourse) {
      alert("Please select a course");
      return;
    }

    if (quiz.length === 0) {
      alert("No quiz available");
      return;
    }

    if (Object.keys(answers).length !== quiz.length) {
      alert("Please answer all questions");
      return;
    }

    try {
      const res = await api.post(
        `/quiz/submit/${selectedCourse}`,
        { answers }
      );

      setScore(res.data.score);

      // 🔥 Dashboard refresh trigger
      localStorage.setItem("quizUpdated", Date.now());

    } catch (err) {
      console.log("Submit Error:", err?.response?.data || err);
      alert("Error submitting quiz");
    }
  };

  return (
    <div>

      <h2 className="text-2xl font-bold mb-4">
        Quiz Section ❓
      </h2>

      {/* 🔹 Course Select */}
      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="border p-2 mb-4"
      >
        <option value="">Select Course</option>

        {courses.map((c) => (
          <option key={c._id} value={c._id}>
            {c.title}
          </option>
        ))}
      </select>

      {/* 🔹 Loading */}
      {loading && <p>Loading quiz...</p>}

      {/* 🔹 No Quiz */}
      {!loading && selectedCourse && quiz.length === 0 && (
        <p className="text-gray-500">
          No quiz available for this course
        </p>
      )}

      {/* 🔹 Quiz */}
      {quiz.map((q) => (
        <div key={q._id} className="border p-3 mb-3 rounded">

          <p className="font-semibold">{q.question}</p>

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

      {/* 🔹 Submit */}
      {quiz.length > 0 && (
        <button
          onClick={submitQuiz}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      )}

      {/* 🔹 Score */}
      {score !== null && (
        <p className="mt-3 text-green-500 font-bold">
          Score: {score}%
        </p>
      )}

    </div>
  );
}
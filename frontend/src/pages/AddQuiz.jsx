import { useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function AddQuiz() {
  const [form, setForm] = useState({
    title: "",
    questions: "",
  });

  const handleSubmit = async () => {
    try {
      const payload = {
        title: form.title,
        questions: form.questions.split("\n"),
      };

      await api.post("/quiz/create", payload);

      toast.success("Quiz Created 🎉");

      setForm({
        title: "",
        questions: "",
      });
    } catch (err) {
      toast.error("Error creating quiz");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Add Quiz
      </h2>

      <input
        placeholder="Quiz Title"
        value={form.title}
        onChange={(e) =>
          setForm({ ...form, title: e.target.value })
        }
        className="w-full border p-2 mb-3 rounded"
      />

      <textarea
        placeholder="Enter questions (one per line)"
        value={form.questions}
        onChange={(e) =>
          setForm({ ...form, questions: e.target.value })
        }
        className="w-full border p-2 mb-3 rounded h-40"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Quiz
      </button>
    </div>
  );
}
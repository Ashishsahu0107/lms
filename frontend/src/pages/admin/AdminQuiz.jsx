
import { useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function AdminQuiz() {
  const [form, setForm] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    answer: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Manual Add
  const handleAdd = async () => {
    const { question, option1, option2, option3, option4, answer } = form;

    if (!question || !option1 || !option2 || !option3 || !option4 || !answer) {
      return toast.error("Fill all fields");
    }

    try {
      setLoading(true);

      await api.post("/quiz/create", {
        question,
        options: [option1, option2, option3, option4],
        answer,
      });

      toast.success("Quiz Added ✅");

      setForm({
        question: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        answer: "",
      });
    } catch {
      toast.error("Error adding quiz");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Upload
  const handleUpload = async () => {
    if (!file) return toast.error("Select file");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      await api.post("/quiz/upload", formData);

      toast.success("Quiz Uploaded 🎉");
      setFile(null);
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">
        Admin Quiz Panel
      </h2>

      {/* 🔥 Manual Quiz */}
      <div className="bg-white p-5 rounded-xl shadow space-y-3">
        <h3 className="font-bold">Add Quiz (Manual)</h3>

        <input
          placeholder="Question"
          value={form.question}
          onChange={(e) =>
            setForm({ ...form, question: e.target.value })
          }
          className="w-full border p-2 rounded"
        />

        <input placeholder="Option 1" className="input"
          onChange={(e)=>setForm({...form,option1:e.target.value})}/>

        <input placeholder="Option 2" className="input"
          onChange={(e)=>setForm({...form,option2:e.target.value})}/>

        <input placeholder="Option 3" className="input"
          onChange={(e)=>setForm({...form,option3:e.target.value})}/>

        <input placeholder="Option 4" className="input"
          onChange={(e)=>setForm({...form,option4:e.target.value})}/>

        <input
          placeholder="Correct Answer"
          value={form.answer}
          onChange={(e) =>
            setForm({ ...form, answer: e.target.value })
          }
          className="w-full border p-2 rounded"
        />

        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Adding..." : "Add Quiz"}
        </button>
      </div>

      {/* 🔥 Upload Quiz */}
      <div className="bg-white p-5 rounded-xl shadow space-y-3">
        <h3 className="font-bold">Upload Quiz (JSON / CSV)</h3>

        <input
          type="file"
          accept=".json,.csv"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={handleUpload}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
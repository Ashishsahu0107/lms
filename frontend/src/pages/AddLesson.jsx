import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function AddLesson() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    api.get("/courses").then((res) => {
      setCourses(res.data);
    });
  }, []);

  const handleAdd = async () => {
    if (!courseId || !title || !notes) {
      return toast.error("Fill all fields");
    }

    try {
      await api.post(`/courses/add-lesson/${courseId}`, {
        title,
        notes,
      });

      toast.success("Lesson added 🎉");

      setTitle("");
      setNotes("");
    } catch {
      toast.error("Error adding lesson");
    }
  };

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-2xl font-bold mb-4">
        Add Course Lesson
      </h2>

      {/* 🔥 COURSE DROPDOWN */}
      <select
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        className="w-full border p-2 mb-3 rounded"
      >
        <option value="">Select Course</option>
        {courses.map((c) => (
          <option key={c._id} value={c._id}>
            {c.title}
          </option>
        ))}
      </select>

      <input
        placeholder="Lesson Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
      />

      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
      />

      <button
        onClick={handleAdd}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Lesson
      </button>
    </div>
  );
}
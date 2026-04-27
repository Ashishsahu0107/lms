import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function AdminLessons() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        setCourses(res.data);
      } catch {
        toast.error("Failed to load courses");
      }
    };

    fetchCourses();
  }, []);

  const selectedCourse = courses.find(
    (c) => c._id === selectedCourseId
  );

  // 🔹 DELETE
  const handleDelete = async (index) => {
    try {
      await api.delete(
        `/courses/delete-lesson/${selectedCourseId}/${index}`
      );

      toast.success("Lesson deleted");

      // update UI
      setCourses((prev) =>
        prev.map((c) =>
          c._id === selectedCourseId
            ? {
                ...c,
                lessons: c.lessons.filter((_, i) => i !== index),
              }
            : c
        )
      );
    } catch {
      toast.error("Delete failed");
    }
  };

  // 🔹 EDIT
  const handleEdit = async (index, lesson) => {
    const title = prompt("Edit Title", lesson.title);
    const notes = prompt("Edit Notes", lesson.notes);

    if (!title || !notes) return;

    try {
      await api.put(
        `/courses/update-lesson/${selectedCourseId}/${index}`,
        { title, notes }
      );

      toast.success("Lesson updated");

      // update UI
      setCourses((prev) =>
        prev.map((c) =>
          c._id === selectedCourseId
            ? {
                ...c,
                lessons: c.lessons.map((l, i) =>
                  i === index ? { ...l, title, notes } : l
                ),
              }
            : c
        )
      );
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        Manage Lessons 👑
      </h2>

      {/* 🔥 Course Dropdown */}
      <select
        value={selectedCourseId}
        onChange={(e) => setSelectedCourseId(e.target.value)}
        className="w-full border p-2 mb-6 rounded"
      >
        <option value="">Select Course</option>
        {courses.map((c) => (
          <option key={c._id} value={c._id}>
            {c.title}
          </option>
        ))}
      </select>

      {/* 🔥 Lessons List */}
      {!selectedCourse ? (
        <p className="text-gray-500">Select a course</p>
      ) : selectedCourse.lessons?.length === 0 ? (
        <p className="text-gray-500">No lessons found</p>
      ) : (
        <div className="space-y-4">
          {selectedCourse.lessons.map((lesson, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow"
            >
              <h3 className="font-bold text-lg dark:text-white">
                {lesson.title}
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                {lesson.notes}
              </p>

              {/* 🔥 ACTION BUTTONS */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleEdit(index, lesson)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(index)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
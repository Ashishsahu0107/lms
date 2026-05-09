import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function CourseDetail() {

  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [openLesson, setOpenLesson] = useState(null); // Track which lesson is open

  useEffect(() => {
    api.get("/courses").then((res) => {
      const c = res.data.find((x) => x._id === id);
      setCourse(c);
    });
  }, [id]);


  const toggleLesson = (index) => {
    setOpenLesson((prev) => (prev === index ? null : index));
  };

  const toggleComplete = async (index, completed) => {
    if (completed) {
      // Mark as incomplete (optional: implement API if needed)
      await api.put(`/courses/${id}/lesson/${index}/incomplete`);
      toast.success("Lesson marked as incomplete");
    } else {
      await api.put(`/courses/${id}/lesson/${index}`);
      toast.success("Lesson Completed");
    }
    setCourse((prev) => {
      const updated = { ...prev };
      updated.lessons = updated.lessons.map((l, i) =>
        i === index ? { ...l, completed: !completed } : l
      );
      return updated;
    });
  };

  if (!course) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        {course.title}
      </h2>

      {/* 🔹 Collapsible Lessons */}
      <div className="space-y-4">
        {course.lessons?.map((l, i) => (
          <div key={i} className="border rounded">
            <button
              className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 focus:outline-none"
              onClick={() => toggleLesson(i)}
            >
              <span className="font-bold text-left">{l.title}</span>
              <span>{openLesson === i ? "▲" : "▼"}</span>
            </button>
            {openLesson === i && (
              <div className="p-4 border-t">
                <p>{l.notes}</p>
                <button
                  onClick={() => toggleComplete(i, l.completed)}
                  className={`mt-2 px-3 py-1 rounded text-white ${l.completed ? "bg-gray-500" : "bg-green-500"}`}
                >
                  {l.completed ? "Mark as Incomplete" : "Mark as Complete"}
                </button>
                {l.completed && (
                  <p className="text-green-500 mt-2">✔ Completed</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
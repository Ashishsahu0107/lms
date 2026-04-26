import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    api.get("/courses").then((res) => {
      const c = res.data.find((x) => x._id === id);
      setCourse(c);
    });
  }, [id]);

  const completeLesson = async (index) => {
    await api.put(`/courses/${id}/lesson/${index}`);
    toast.success("Lesson Completed");

    setCourse((prev) => {
      const updated = { ...prev };
      updated.lessons[index].completed = true;
      return updated;
    });
  };

  if (!course) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        {course.title}
      </h2>

      {/* 🔹 ONLY NOTES */}
      <div className="space-y-4">
        {course.lessons?.map((l, i) => (
          <div key={i} className="border p-4 rounded">

            <h3 className="font-bold">{l.title}</h3>

            <p>{l.notes}</p>

            {!l.completed ? (
              <button
                onClick={() => completeLesson(i)}
                className="mt-2 bg-green-500 text-white px-3 py-1"
              >
                Complete
              </button>
            ) : (
              <p className="text-green-500">
                ✔ Completed
              </p>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
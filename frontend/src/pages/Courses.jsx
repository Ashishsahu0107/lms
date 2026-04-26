import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/courses").then((res) => setCourses(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        My Courses
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {courses.map((c) => {
          const progress =
            (c.completedLessons / c.totalLessons) * 100;

          return (
            <div
              key={c._id}
              onClick={() => navigate(`/courses/${c._id}`)}
              className="cursor-pointer bg-white dark:bg-gray-800 p-5 rounded-2xl shadow hover:shadow-xl transition"
            >
              <h3 className="font-bold text-lg dark:text-white">
                {c.title}
              </h3>

              <p className="text-gray-500 text-sm">
                {c.instructor}
              </p>

              <div className="mt-4 bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <p className="text-sm mt-1 dark:text-white">
                {Math.round(progress)}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
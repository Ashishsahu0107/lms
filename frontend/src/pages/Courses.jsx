import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        setCourses(res.data);
      } catch (err) {
        console.error("Error fetching courses", err);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        My Courses
      </h2>

      {courses.length === 0 ? (
        <p className="text-gray-500">No courses found</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {courses.map((c) => {
            // ✅ FIXED PROGRESS LOGIC
            const total = c.lessons?.length || 0;
            const completed =
              c.lessons?.filter((l) => l.completed).length || 0;

            const progress =
              total === 0 ? 0 : (completed / total) * 100;

            return (
              <div
                key={c._id}
                onClick={() => navigate(`/courses/${c._id}`)}
                className="cursor-pointer bg-white dark:bg-gray-800 p-5 rounded-2xl shadow hover:shadow-xl transition duration-300"
              >
                <h3 className="font-bold text-lg dark:text-white">
                  {c.title}
                </h3>

                <p className="text-gray-500 text-sm">
                  {c.instructor}
                </p>

                {/* 🔥 Progress Bar */}
                <div className="mt-4 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <p className="text-sm mt-2 dark:text-white">
                  {completed}/{total} Lessons •{" "}
                  {Math.round(progress)}%
                </p>

                {/* 🔥 Status Badge */}
                <div className="mt-3">
                  {progress === 100 ? (
                    <span className="text-green-500 text-sm font-semibold">
                      ✔ Completed
                    </span>
                  ) : progress > 0 ? (
                    <span className="text-yellow-500 text-sm font-semibold">
                      In Progress
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm font-semibold">
                      Not Started
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
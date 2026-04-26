import { useEffect, useState } from "react";
import api from "../utils/api";

export default function Profile() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get("/courses").then((res) => setCourses(res.data));
  }, []);

  const total = courses.length;

  const completed = courses.filter(
    (c) => c.completedLessons === c.totalLessons
  ).length;

  const progress =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        My Profile 👤
      </h2>

      <div className="bg-white p-6 rounded-xl shadow">

        <p>Total Courses: {total}</p>
        <p>Completed: {completed}</p>

        <div className="mt-4 bg-gray-200 h-3 rounded-full">
          <div
            className="bg-blue-500 h-3 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-2">{progress}% Progress</p>

      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= FETCH =================
  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses/all");
      setCourses(res.data || []);
    } catch {
      toast.error("Failed to load courses");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ================= REMOVE USER =================
  const removeUser = async (courseId, userId) => {
    try {
      setLoading(true);

      await api.post("/courses/remove-user", {
        courseId,
        userId,
      });

      toast.success("User removed");

      fetchCourses(); // 🔥 refresh

    } catch {
      toast.error("Remove failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">

      <h2 className="text-3xl font-bold">
        📚 Course Management
      </h2>

      {courses.length === 0 && (
        <p>No courses found</p>
      )}

      {courses.map((course) => (
        <div
          key={course._id}
          className="bg-white p-5 rounded-xl shadow"
        >
          <h3 className="text-xl font-bold">
            {course.title}
          </h3>

          <p className="text-gray-500 mb-3">
            Instructor: {course.instructor || "N/A"}
          </p>

          {/* USERS */}
          <div>
            <h4 className="font-semibold mb-2">
              Enrolled Users:
            </h4>

            {course.users?.length === 0 && (
              <p className="text-gray-400">
                No users enrolled
              </p>
            )}

            {course.users?.map((u) => (
              <div
                key={u._id}
                className="flex justify-between items-center border-b py-2"
              >
                <span>{u.name}</span>

                <button
                  onClick={() =>
                    removeUser(course._id, u._id)
                  }
                  className="text-red-500"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

        </div>
      ))}
    </div>
  );
}
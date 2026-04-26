import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    userId: "",
    title: "",
    instructor: "",
    totalLessons: "",
  });

  // 🔹 fetch users
  useEffect(() => {
    api.get("/auth/users").then((res) => setUsers(res.data));
  }, []);

  // 🔹 enroll course
  const enroll = async () => {
    await api.post("/courses/enroll", form);

    toast.success("Course Assigned 🎉");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        Admin Panel 👑
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        {/* 🔹 User List */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow">
          <h3 className="font-bold mb-4 dark:text-white">
            Users
          </h3>

          {users.map((u) => (
            <div
              key={u._id}
              className="flex justify-between py-2 border-b"
            >
              <span className="dark:text-white">
                {u.name}
              </span>

              <button
                onClick={() =>
                  setForm({ ...form, userId: u._id })
                }
                className="text-blue-500"
              >
                Select
              </button>
            </div>
          ))}
        </div>

        {/* 🔹 Assign Course */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow">

          <h3 className="font-bold mb-4 dark:text-white">
            Assign Course
          </h3>

          <input
            placeholder="Course Title"
            className="w-full border p-2 mb-2 rounded"
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <input
            placeholder="Instructor"
            className="w-full border p-2 mb-2 rounded"
            onChange={(e) =>
              setForm({ ...form, instructor: e.target.value })
            }
          />

          <input
            placeholder="Total Lessons"
            className="w-full border p-2 mb-2 rounded"
            onChange={(e) =>
              setForm({
                ...form,
                totalLessons: e.target.value,
              })
            }
          />

          <button
            onClick={enroll}
            className="w-full bg-blue-500 text-white py-2 rounded-lg"
          >
            Assign Course
          </button>

        </div>

      </div>
    </div>
  );
}
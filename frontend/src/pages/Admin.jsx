import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom"; // 🔥 ADD THIS
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    userId: "",
    title: "",
    instructor: "",
    totalLessons: "",
  });

  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    course: "",
    dueDate: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/auth/users");
        setUsers(res.data);
      } catch (err) {
        toast.error("Failed to load users");
      }
    };

    fetchUsers();
  }, []);

  const enroll = async () => {
    if (!form.userId || !form.title) {
      return toast.error("Select user & enter course title");
    }

    try {
      setLoading(true);
      await api.post("/courses/enroll", form);
      toast.success("Course Assigned 🎉");

      setForm({
        userId: "",
        title: "",
        instructor: "",
        totalLessons: "",
      });
    } catch {
      toast.error("Error assigning course");
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async () => {
    const { title, description, course, dueDate } = assignmentForm;

    if (!title || !description || !course || !dueDate) {
      return toast.error("Fill all assignment fields");
    }

    try {
      setLoading(true);
      await api.post("/assignments", assignmentForm);
      toast.success("Assignment Created ✅");

      setAssignmentForm({
        title: "",
        description: "",
        course: "",
        dueDate: "",
      });
    } catch {
      toast.error("Error creating assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        Admin Panel 👑
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        {/* 🔹 Users */}
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
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg"
          >
            {loading ? "Processing..." : "Assign Course"}
          </button>
        </div>

        {/* 🔥 Assignment */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow md:col-span-2">
          <h3 className="font-bold mb-4 dark:text-white">
            Create Assignment
          </h3>

          <input
            placeholder="Title"
            value={assignmentForm.title}
            className="w-full border p-2 mb-2 rounded"
            onChange={(e) =>
              setAssignmentForm({
                ...assignmentForm,
                title: e.target.value,
              })
            }
          />

          <textarea
            placeholder="Description"
            value={assignmentForm.description}
            className="w-full border p-2 mb-2 rounded"
            onChange={(e) =>
              setAssignmentForm({
                ...assignmentForm,
                description: e.target.value,
              })
            }
          />

          <input
            placeholder="Course ID"
            value={assignmentForm.course}
            className="w-full border p-2 mb-2 rounded"
            onChange={(e) =>
              setAssignmentForm({
                ...assignmentForm,
                course: e.target.value,
              })
            }
          />

          <input
            type="date"
            value={assignmentForm.dueDate}
            className="w-full border p-2 mb-2 rounded"
            onChange={(e) =>
              setAssignmentForm({
                ...assignmentForm,
                dueDate: e.target.value,
              })
            }
          />

          <button
            onClick={createAssignment}
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 rounded-lg"
          >
            {loading ? "Creating..." : "Create Assignment"}
          </button>
        </div>

      </div>

      {/* 🔥 THIS LINE FIXES YOUR PROBLEM */}
      <Outlet />
    </div>
  );
}
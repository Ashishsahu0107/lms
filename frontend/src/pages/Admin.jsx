
import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Admin() {

  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
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
    const fetchData = async () => {
      try {
        const userRes = await api.get("/auth/users");
        setUsers(userRes.data);
        const courseRes = await api.get("/courses/all");
        setCourses(courseRes.data);
      } catch (err) {
        toast.error("Failed to load users/courses");
      }
    };
    fetchData();
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
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-extrabold text-blue-700 mb-8 flex items-center gap-2">
          <span className="inline-block">👑</span> Admin Panel
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Users */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="font-bold mb-4 text-lg text-blue-700">Users</h3>
            <div className="divide-y">
              {users.map((u) => (
                <div key={u._id} className="flex justify-between py-2 items-center">
                  <span className="font-medium text-gray-800">{u.name}</span>
                  <button
                    onClick={() => setForm({ ...form, userId: u._id })}
                    className={`px-3 py-1 rounded text-white font-semibold ${form.userId === u._id ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
                  >
                    {form.userId === u._id ? "Selected" : "Select"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Assign Course */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="font-bold mb-4 text-lg text-blue-700">Assign Course</h3>
            <input
              placeholder="Course Title"
              className="w-full border p-2 mb-2 rounded"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              placeholder="Instructor"
              className="w-full border p-2 mb-2 rounded"
              value={form.instructor}
              onChange={(e) => setForm({ ...form, instructor: e.target.value })}
            />
            <input
              placeholder="Total Lessons"
              className="w-full border p-2 mb-2 rounded"
              value={form.totalLessons}
              onChange={(e) => setForm({ ...form, totalLessons: e.target.value })}
            />
            <button
              onClick={enroll}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold mt-2"
            >
              {loading ? "Processing..." : "Assign Course"}
            </button>
          </div>
        </div>

        {/* Assignment Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mt-10">
          <h3 className="font-bold mb-4 text-lg text-green-700">Create Assignment</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Title"
              value={assignmentForm.title}
              className="w-full border p-2 mb-2 rounded"
              onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
            />
            <input
              type="date"
              value={assignmentForm.dueDate}
              className="w-full border p-2 mb-2 rounded"
              onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
            />
            <select
              value={assignmentForm.course}
              className="w-full border p-2 mb-2 rounded"
              onChange={(e) => setAssignmentForm({ ...assignmentForm, course: e.target.value })}
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
            <textarea
              placeholder="Description"
              value={assignmentForm.description}
              className="w-full border p-2 mb-2 rounded md:col-span-2"
              onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
              rows={2}
            />
          </div>
          <button
            onClick={createAssignment}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold mt-2"
          >
            {loading ? "Creating..." : "Create Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}
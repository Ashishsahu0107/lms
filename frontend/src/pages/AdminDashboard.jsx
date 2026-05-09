import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-extrabold text-gray-900">{value}</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow-sm"
          : "px-4 py-2 rounded-full bg-white text-gray-700 font-semibold ring-1 ring-gray-200 hover:bg-gray-50"
      }
    >
      {children}
    </button>
  );
}

function FieldLabel({ children }) {
  return <p className="text-sm font-semibold text-gray-700 mb-1">{children}</p>;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("courses");

  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(false);

  // course
  const [courseForm, setCourseForm] = useState({
    userId: "",
    title: "",
    instructor: "",
  });

  // enroll existing
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  // assignment
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    course: "",
    dueDate: "",
  });

  // quiz
  const [quizFile, setQuizFile] = useState(null);
  const [quizCourse, setQuizCourse] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/auth/users");
        setUsers(userRes.data || []);

        const courseRes = await api.get("/courses/all");
        setCourses(courseRes.data || []);
      } catch (err) {
        console.log("FETCH ERROR:", err);
        toast.error("Failed to load data");
      }
    };

    fetchData();
  }, []);

  const assignCourse = async () => {
    if (!courseForm.userId || !courseForm.title) {
      return toast.error("Select user & enter title");
    }

    try {
      setLoading(true);
      await api.post("/courses/enroll", courseForm);
      toast.success("Course Created & Assigned");

      setCourseForm({
        userId: "",
        title: "",
        instructor: "",
      });

      const res = await api.get("/courses/all");
      setCourses(res.data || []);
    } catch {
      toast.error("Error assigning course");
    } finally {
      setLoading(false);
    }
  };

  const enrollUser = async () => {
    if (!selectedUser || !selectedCourse) {
      return toast.error("Select user & course");
    }

    try {
      setLoading(true);

      await api.post("/courses/enroll-user", {
        userId: selectedUser,
        courseId: selectedCourse,
      });

      toast.success("User enrolled to course");

      setSelectedUser("");
      setSelectedCourse("");

      const res = await api.get("/courses/all");
      setCourses(res.data || []);
    } catch {
      toast.error("Enroll failed");
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
      toast.success("Assignment Created");

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

  const uploadQuiz = async () => {
    if (!quizFile || !quizCourse) {
      return toast.error("Select file & course");
    }

    const formData = new FormData();
    formData.append("file", quizFile);
    formData.append("courseId", quizCourse);

    try {
      setLoading(true);
      await api.post("/quiz/upload", formData);
      toast.success("Quiz Uploaded");
      setQuizFile(null);
      setQuizCourse("");
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "courses", label: "COURSES" },
    { key: "assignments", label: "ASSIGNMENTS" },
    { key: "quiz", label: "QUIZ" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-500">Admin Dashboard</p>
            <h2 className="text-3xl font-extrabold text-gray-900">
              👑 Professional Control Panel
            </h2>
            <p className="text-gray-600 mt-2">
              Manage users, courses, assignments and quiz uploads from one place.
            </p>
          </div>
        </div>

        {/* KPI */}
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Users" value={users.length} icon="👥" />
          <StatCard title="Courses" value={courses.length} icon="📚" />
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-2xl font-extrabold text-gray-900">
                  {loading ? "Working" : "Ready"}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                {loading ? "⏳" : "✅"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        {tabs.map((t) => (
          <TabButton key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
          </TabButton>
        ))}
      </div>

      {/* ================= COURSES ================= */}
      {tab === "courses" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* USERS */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-5">
            <h3 className="font-extrabold text-gray-900 mb-4">Users</h3>

            {users.length === 0 ? (
              <p className="text-gray-500">No users found.</p>
            ) : (
              <div className="divide-y">
                {users.map((u) => (
                  <div
                    key={u._id}
                    className="flex justify-between items-center py-3"
                  >
                    <span className="font-medium text-gray-800">{u.name}</span>
                    <button
                      onClick={() => setCourseForm({ ...courseForm, userId: u._id })}
                      className="text-blue-700 hover:text-blue-800 font-semibold"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CREATE COURSE */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-5">
            <h3 className="font-extrabold text-gray-900 mb-4">Create Course</h3>

            <div className="space-y-4">
              <div>
                <FieldLabel>Title</FieldLabel>
                <input
                  placeholder="Course title"
                  className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                />
              </div>

              <div>
                <FieldLabel>Instructor</FieldLabel>
                <input
                  placeholder="Instructor name"
                  className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                />
              </div>

              <button
                onClick={assignCourse}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold disabled:opacity-60"
              >
                {loading ? "Processing..." : "Create & Assign"}
              </button>
            </div>
          </div>

          {/* ENROLL EXISTING */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-5 md:col-span-2">
            <h3 className="font-extrabold text-gray-900 mb-4">
              Enroll User to Existing Course
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>User</FieldLabel>
                <select
                  value={selectedUser}
                  className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">Select User</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel>Course</FieldLabel>
                <select
                  value={selectedCourse}
                  className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={enrollUser}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold disabled:opacity-60"
              >
                {loading ? "Working..." : "Enroll User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ASSIGNMENTS ================= */}
      {tab === "assignments" && (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-5">
          <h3 className="font-extrabold text-gray-900 mb-4">Create Assignment</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Title</FieldLabel>
              <input
                placeholder="Assignment title"
                className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                value={assignmentForm.title}
              />
            </div>

            <div>
              <FieldLabel>Due date</FieldLabel>
              <input
                type="date"
                className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                value={assignmentForm.dueDate}
              />
            </div>

            <div className="md:col-span-2">
              <FieldLabel>Description</FieldLabel>
              <textarea
                placeholder="Assignment description"
                className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                value={assignmentForm.description}
              />
            </div>

            <div className="md:col-span-2">
              <FieldLabel>Course</FieldLabel>
              <select
                value={assignmentForm.course}
                className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setAssignmentForm({ ...assignmentForm, course: e.target.value })}
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={createAssignment}
            disabled={loading}
            className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Assignment"}
          </button>
        </div>
      )}

      {/* ================= QUIZ ================= */}
      {tab === "quiz" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-5">
            <h3 className="font-extrabold text-gray-900 mb-4">Upload Quiz</h3>

            <div className="space-y-4">
              <div>
                <FieldLabel>Course</FieldLabel>
                <select
                  value={quizCourse}
                  className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setQuizCourse(e.target.value)}
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel>File</FieldLabel>
                <input
                  type="file"
                  className="w-full"
                  onChange={(e) => setQuizFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload quiz JSON/CSV as supported by backend.
                </p>
              </div>

              <button
                onClick={uploadQuiz}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold disabled:opacity-60"
              >
                {loading ? "Uploading..." : "Upload Quiz"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-5">
            <h3 className="font-extrabold text-gray-900 mb-2">Tips</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Select a course before uploading.</li>
              <li>• Use correct file format expected by backend upload route.</li>
              <li>• Keep questions consistent for better evaluation.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}


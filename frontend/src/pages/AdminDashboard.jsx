import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [tab, setTab] = useState("courses");

  // data
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(false);

  // 🔥 OLD assign
  const [courseForm, setCourseForm] = useState({
    userId: "",
    title: "",
    instructor: "",
  });

  // 🔥 NEW enroll existing course
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  // 🔥 assignment
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    course: "",
    dueDate: "",
  });

  // 🔥 quiz
  const [quizFile, setQuizFile] = useState(null);
  const [quizCourse, setQuizCourse] = useState("");

  // ================= FETCH =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/auth/users");
        setUsers(userRes.data);

        const courseRes = await api.get("/courses/all");
        setCourses(courseRes.data);
      } catch (err) {
        console.log("FETCH ERROR:", err);
        toast.error("Failed to load data");
      }
    };

    fetchData();
  }, []);

  // ================= CREATE COURSE =================
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

      // 🔥 refresh courses
      const res = await api.get("/courses/all");
      setCourses(res.data);

    } catch {
      toast.error("Error assigning course");
    } finally {
      setLoading(false);
    }
  };

  // ================= ENROLL EXISTING =================
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

      // 🔥 reset selection
      setSelectedUser("");
      setSelectedCourse("");

      // 🔥 refresh courses
      const res = await api.get("/courses/all");
      setCourses(res.data);

    } catch {
      toast.error("Enroll failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= ASSIGNMENT =================
  const createAssignment = async () => {
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

  // ================= QUIZ =================
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

  return (
    <div className="p-6 space-y-6">

      <h2 className="text-3xl font-bold dark:text-white">
        👑 Admin Control Panel
      </h2>

      {/* Tabs */}
      <div className="flex gap-3">
        {["courses", "assignments", "quiz"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg ${
              tab === t ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ================= COURSES ================= */}
      {tab === "courses" && (
        <div className="grid md:grid-cols-2 gap-6">

          {/* USERS */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="font-bold mb-4">Users</h3>

            {users.map(u => (
              <div key={u._id} className="flex justify-between py-2 border-b">
                <span>{u.name}</span>
                <button
                  onClick={() =>
                    setCourseForm({ ...courseForm, userId: u._id })
                  }
                  className="text-blue-500"
                >
                  Select
                </button>
              </div>
            ))}
          </div>

          {/* CREATE COURSE */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="font-bold mb-4">Create Course</h3>

            <input
              placeholder="Title"
              className="w-full border p-2 mb-2"
              onChange={e =>
                setCourseForm({ ...courseForm, title: e.target.value })
              }
            />

            <input
              placeholder="Instructor"
              className="w-full border p-2 mb-2"
              onChange={e =>
                setCourseForm({ ...courseForm, instructor: e.target.value })
              }
            />

            <button
              onClick={assignCourse}
              className="w-full bg-blue-500 text-white py-2"
            >
              {loading ? "Processing..." : "Create & Assign"}
            </button>
          </div>

          {/* ENROLL EXISTING */}
          <div className="bg-white p-5 rounded-xl shadow md:col-span-2">
            <h3 className="font-bold mb-4">Enroll User to Existing Course</h3>

            <select
              value={selectedUser}
              className="w-full border p-2 mb-2"
              onChange={e => setSelectedUser(e.target.value)}
            >
              <option value="">Select User</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>

            <select
              value={selectedCourse}
              className="w-full border p-2 mb-2"
              onChange={e => setSelectedCourse(e.target.value)}
            >
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>

            <button
              onClick={enrollUser}
              className="w-full bg-green-500 text-white py-2"
            >
              Enroll User
            </button>
          </div>

        </div>
      )}

      {/* ================= ASSIGNMENTS ================= */}
      {tab === "assignments" && (
        <div className="bg-white p-5 rounded-xl shadow">

          <h3 className="font-bold mb-4">Create Assignment</h3>

          <input
            placeholder="Title"
            className="w-full border p-2 mb-2"
            onChange={e =>
              setAssignmentForm({ ...assignmentForm, title: e.target.value })
            }
          />

          <textarea
            placeholder="Description"
            className="w-full border p-2 mb-2"
            onChange={e =>
              setAssignmentForm({
                ...assignmentForm,
                description: e.target.value,
              })
            }
          />

          <select
            value={assignmentForm.course}
            className="w-full border p-2 mb-2"
            onChange={e =>
              setAssignmentForm({ ...assignmentForm, course: e.target.value })
            }
          >
            <option value="">Select Course</option>
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>

          <input
            type="date"
            className="w-full border p-2 mb-2"
            onChange={e =>
              setAssignmentForm({
                ...assignmentForm,
                dueDate: e.target.value,
              })
            }
          />

          <button
            onClick={createAssignment}
            className="w-full bg-green-500 text-white py-2"
          >
            Create Assignment
          </button>
        </div>
      )}

      {/* ================= QUIZ ================= */}
      {tab === "quiz" && (
        <div className="bg-white p-5 rounded-xl shadow">

          <h3 className="font-bold mb-4">Upload Quiz</h3>

          <select
            value={quizCourse}
            className="w-full border p-2 mb-2"
            onChange={e => setQuizCourse(e.target.value)}
          >
            <option value="">Select Course</option>
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>

          <input
            type="file"
            className="w-full mb-3"
            onChange={e => setQuizFile(e.target.files[0])}
          />

          <button
            onClick={uploadQuiz}
            className="w-full bg-purple-500 text-white py-2"
          >
            Upload Quiz
          </button>
        </div>
      )}

    </div>
  );
}
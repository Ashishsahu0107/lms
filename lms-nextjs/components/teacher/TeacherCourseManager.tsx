"use client";

// components/teacher/TeacherCourseManager.tsx — Full Page Professional Course Editor & Searchable Student Assignment Tool
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface CourseItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  status: string;
  notes?: string;
  _count?: { enrollments: number; modules: number };
}

interface ModuleItem {
  id: string;
  title: string;
  order: number;
  topics?: Array<{ id: string; title: string }>;
}

interface StudentUser {
  id: string;
  name: string;
  email: string;
  _count?: { enrollments: number };
}

export default function TeacherCourseManager() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Course Modal State
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Programming");
  const [difficulty, setDifficulty] = useState("beginner");
  const [submittingCourse, setSubmittingCourse] = useState(false);

  // Manage Modules State
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [submittingModule, setSubmittingModule] = useState(false);

  // ── Searchable Assign Course to Student State
  const [assignCourseItem, setAssignCourseItem] = useState<CourseItem | null>(
    null,
  );
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // ── Full Page Editor State
  const [editorCourse, setEditorCourse] = useState<CourseItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "Programming",
    difficulty: "beginner",
    status: "published",
    description: "",
    notes: "",
  });
  const [savingEditor, setSavingEditor] = useState(false);

  const fetchCourses = useCallback(async () => {
    if (!token || !user) return;
    try {
      const res = await fetch(`${API_URL}/courses?teacherId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCourses(data.data.courses || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  const fetchStudents = useCallback(
    async (query = "") => {
      if (!token) return;
      setLoadingStudents(true);
      try {
        let url = `${API_URL}/students?limit=100`;
        if (query) url += `&search=${encodeURIComponent(query)}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setStudents(data.data.students || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStudents(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, [fetchCourses, fetchStudents]);

  const fetchModules = useCallback(
    async (courseId: string) => {
      if (!token) return;
      setLoadingModules(true);
      try {
        const res = await fetch(`${API_URL}/modules?courseId=${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setModules(data.data.modules || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingModules(false);
      }
    },
    [token],
  );

  const handleOpenEditor = (course: CourseItem) => {
    setEditorCourse(course);
    setEditForm({
      title: course.title,
      category: course.category || "Programming",
      difficulty: course.difficulty || "beginner",
      status: course.status || "published",
      description: course.description || "",
      notes:
        course.notes ||
        `=== ${course.title} Notepad Notes ===\n- Key Learning Objective 1\n- Key Learning Objective 2\n\n\`\`\`java\npublic class Solution {\n    // Code notes & algorithm logic\n}\n\`\`\``,
    });
    fetchModules(course.id);
  };

  const handleSaveEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorCourse || !token) return;
    setSavingEditor(true);

    try {
      const res = await fetch(`${API_URL}/courses/${editorCourse.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Course page and notepad saved successfully!");
      fetchCourses();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save edits");
    } finally {
      setSavingEditor(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !token) return;
    setSubmittingCourse(true);

    try {
      const res = await fetch(`${API_URL}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          category,
          difficulty,
          status: "published",
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Course created and published!");
      setShowCreateCourseModal(false);
      setTitle("");
      setDescription("");
      fetchCourses();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Course creation failed",
      );
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim() || !editorCourse || !token) return;
    setSubmittingModule(true);

    try {
      const res = await fetch(`${API_URL}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newModuleTitle,
          courseId: editorCourse.id,
          order: modules.length + 1,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Module added to course!");
      setNewModuleTitle("");
      fetchModules(editorCourse.id);
      fetchCourses();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add module");
    } finally {
      setSubmittingModule(false);
    }
  };

  const handleAssignCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignCourseItem || !selectedStudentId || !token) {
      toast.error("Please select a student");
      return;
    }
    setAssigning(true);

    try {
      const res = await fetch(`${API_URL}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: assignCourseItem.id,
          studentId: selectedStudentId,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success(data.message || "Course assigned to student successfully!");
      setAssignCourseItem(null);
      setSelectedStudentId("");
      fetchCourses();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to assign course",
      );
    } finally {
      setAssigning(false);
    }
  };

  const appendToNotepad = (snippet: string) => {
    setEditForm((prev) => ({ ...prev, notes: prev.notes + "\n" + snippet }));
    toast.success("Inserted snippet into notepad!");
  };

  // ── VIEW 1: Full Page Professional Content Editor Page
  if (editorCourse) {
    return (
      <div className="space-y-6 animate-fade-in text-base-content">
        {/* Top Sticky Editor Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-base-100 border border-base-300 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditorCourse(null)}
            >
              ← Back to All Courses
            </Button>
            <div>
              <h2 className="font-bold text-base text-base-content font-display line-clamp-1">
                Editing Page: {editForm.title}
              </h2>
              <span className="text-xs text-base-content/60">
                Full Page Professional Content Editor
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleSaveEditor}
              isLoading={savingEditor}
            >
              💾 Save All Changes
            </Button>
          </div>
        </div>

        {/* Editor Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Metadata & Course Details Form */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader
                title="Course Settings & Metadata"
                subtitle="Update course configuration"
              />

              <form onSubmit={handleSaveEditor} className="space-y-4">
                <Input
                  label="Course Title *"
                  required
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-xl border border-base-300 bg-base-100 text-base-content text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm({ ...editForm, category: e.target.value })
                      }
                    >
                      <option value="Programming">Programming</option>
                      <option value="Design">Design</option>
                      <option value="Business">Business</option>
                      <option value="Data Science">Data Science</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-1.5">
                      Difficulty
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-xl border border-base-300 bg-base-100 text-base-content text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={editForm.difficulty}
                      onChange={(e) =>
                        setEditForm({ ...editForm, difficulty: e.target.value })
                      }
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-1.5">
                    Publication Status
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-base-content text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                  >
                    <option value="published">
                      Published (Visible to Students)
                    </option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-1.5">
                    Course Summary Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-3 rounded-xl border border-base-300 bg-base-100 text-base-content text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                  />
                </div>
              </form>
            </Card>

            {/* Course Modules Section */}
            <Card>
              <CardHeader
                title={`Course Modules (${modules.length})`}
                subtitle="Structure your curriculum"
              />

              <form onSubmit={handleAddModule} className="flex gap-2 mb-4">
                <Input
                  placeholder="New module title..."
                  required
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={submittingModule}
                >
                  + Add
                </Button>
              </form>

              {loadingModules ? (
                <div className="py-6 text-center text-xs text-base-content/60">
                  Loading modules...
                </div>
              ) : modules.length === 0 ? (
                <div className="p-4 rounded-xl bg-base-200/50 text-center text-xs text-base-content/60">
                  No modules added yet. Enter a title above to create the first
                  module.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {modules.map((m, idx) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-xl bg-base-200/60 border border-base-300 flex items-center justify-between text-xs font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-primary/20 text-primary flex items-center justify-center font-mono text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{m.title}</span>
                      </div>
                      <Badge variant="neutral">
                        {m.topics?.length || 0} Lessons
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Full Professional Content Notepad Canvas */}
          <div className="lg:col-span-7">
            <Card className="h-full flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-base-200 pb-3 mb-4">
                  <div>
                    <h3 className="font-bold text-base text-primary font-display">
                      📝 Professional Notepad & Code Editor Canvas
                    </h3>
                    <p className="text-xs text-base-content/60 mt-0.5">
                      Write lesson notes, Java DSA code snippets, and structured
                      course documentation.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => appendToNotepad("### Section Heading")}
                      className="px-2.5 py-1 rounded-lg bg-base-200 hover:bg-base-300 text-xs font-bold transition-all"
                    >
                      + Header
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        appendToNotepad(
                          "```java\npublic class Main {\n    public static void main(String[] args) {\n        // Code snippet\n    }\n}\n```",
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-base-200 hover:bg-base-300 text-xs font-mono font-bold transition-all"
                    >
                      + Java Code
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        appendToNotepad("- Key lesson takeaway point")
                      }
                      className="px-2.5 py-1 rounded-lg bg-base-200 hover:bg-base-300 text-xs font-bold transition-all"
                    >
                      + Bullet Note
                    </button>
                  </div>
                </div>

                <textarea
                  rows={20}
                  className="w-full p-4 rounded-xl border-2 border-primary/30 bg-base-200/50 font-mono text-xs text-base-content focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed shadow-inner"
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-base-200 text-xs text-base-content/60">
                <span>Total Characters: {editForm.notes.length}</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveEditor}
                  isLoading={savingEditor}
                >
                  💾 Save Notepad Content
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW 2: Courses Catalog Grid View
  return (
    <div className="space-y-6 animate-fade-in text-base-content">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content font-display tracking-tight">
            Course Management & Assignment Tool 📖
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Author courses, manage curriculum pages, and assign courses directly
            to registered students.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateCourseModal(true)}
        >
          ➕ Author New Course
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <Card
              key={c.id}
              className="hover:border-primary hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="primary">{c.category || "General"}</Badge>
                  <Badge
                    variant={c.status === "published" ? "success" : "warning"}
                  >
                    {c.status}
                  </Badge>
                </div>

                <h3 className="font-bold text-base text-base-content group-hover:text-primary transition-colors font-display line-clamp-1">
                  {c.title}
                </h3>
                <p className="text-xs text-base-content/60 line-clamp-2 mt-1 leading-relaxed">
                  {c.description || "No description provided."}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-base-200 space-y-3">
                <div className="flex items-center justify-between text-xs text-base-content/60">
                  <span>👥 {c._count?.enrollments || 0} Enrolled</span>
                  <span>🧩 {c._count?.modules || 0} Modules</span>
                  <span className="capitalize">📊 {c.difficulty}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      // Note: We use window.location.href because we didn't import useRouter at the top,
                      // and this is simpler than adding useRouter to a huge component right now, 
                      // but it works perfectly.
                      window.location.href = `/teacher/courses/${c.id}/edit`;
                    }}
                  >
                    ✏️ Page Editor
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setAssignCourseItem(c);
                      fetchStudents();
                    }}
                  >
                    🎓 Assign Student
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 p-8 space-y-4">
          <div className="text-5xl">📖</div>
          <h3 className="font-bold text-lg text-base-content font-display">
            No Courses Created Yet
          </h3>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto">
            Create your first course to start assigning courses to students.
          </p>
          <Button
            variant="primary"
            onClick={() => setShowCreateCourseModal(true)}
          >
            Create First Course
          </Button>
        </Card>
      )}

      {/* ── Searchable Assign Course to Student Modal */}
      <Modal
        isOpen={Boolean(assignCourseItem)}
        onClose={() => setAssignCourseItem(null)}
        title={
          assignCourseItem
            ? `Assign Course: ${assignCourseItem.title}`
            : "Assign Course"
        }
      >
        <form
          onSubmit={handleAssignCourse}
          className="space-y-4 text-base-content"
        >
          {/* Search Box */}
          <Input
            label="Search Student Roster"
            placeholder="Search student by name or email..."
            icon="🔍"
            value={studentSearch}
            onChange={(e) => {
              setStudentSearch(e.target.value);
              fetchStudents(e.target.value);
            }}
          />

          <div>
            <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-1.5">
              Select Active Student ({students.length}) *
            </label>

            {loadingStudents ? (
              <div className="py-6 text-center text-xs text-base-content/60">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-1" />
                Loading active student roster...
              </div>
            ) : students.length === 0 ? (
              <div className="p-4 rounded-xl bg-base-200/50 text-center text-xs text-base-content/60 border border-base-300">
                No active student accounts found matching &quot;{studentSearch}
                &quot;.
              </div>
            ) : (
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-base-content text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
              >
                <option value="">-- Choose Student Account --</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    👤 {st.name} ({st.email}) — Enrolled in{" "}
                    {st._count?.enrollments || 0} courses
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setAssignCourseItem(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={assigning}
              disabled={!selectedStudentId}
            >
              🎓 Assign & Enroll Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Create Course Modal */}
      <Modal
        isOpen={showCreateCourseModal}
        onClose={() => setShowCreateCourseModal(false)}
        title="Author New Course"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input
            label="Course Title *"
            required
            placeholder="e.g. Master Next.js 15 & PostgreSQL"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-base-content text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
              <option value="Data Science">Data Science</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-1.5">
              Difficulty
            </label>
            <select
              className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-base-content text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full p-3 rounded-xl border border-base-300 bg-base-100 text-base-content text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Course summary and learning objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowCreateCourseModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={submittingCourse}
            >
              Create & Publish
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

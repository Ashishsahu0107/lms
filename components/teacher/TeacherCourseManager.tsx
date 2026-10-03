"use client";

// components/teacher/TeacherCourseManager.tsx — Full Page Professional Course Editor & Searchable Student Assignment Tool
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import toast from "react-hot-toast";
import { API_URL } from "@/lib/api-config";
import {
  Pencil,
  Trash2,
  UserCheck,
  Layers,
  GraduationCap,
  Plus,
  BookOpen,
  Sparkles,
  Check,
  X,
  Users,
} from "lucide-react";

interface CourseItem {
  id: string;
  teacherId: string;
  teacher?: { id: string; name: string };
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

interface TeacherUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  status: string;
}

export default function TeacherCourseManager() {
  const { token, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === "super_admin";
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  // Create Course Modal State
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Programming");
  const [difficulty, setDifficulty] = useState("beginner");
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<CourseItem | null>(null);
  const [deletingCourse, setDeletingCourse] = useState(false);

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

  // ── In-Place Edit Course State
  const [editingCourseItem, setEditingCourseItem] = useState<CourseItem | null>(null);
  const [editingCourseForm, setEditingCourseForm] = useState({
    title: "",
    category: "Programming",
    difficulty: "beginner",
    status: "published",
    description: "",
    teacherId: "",
  });
  const [savingCourseEdit, setSavingCourseEdit] = useState(false);

  // ── Assign Course to Teacher State (Admin Only)
  const [assignTeacherCourseItem, setAssignTeacherCourseItem] = useState<CourseItem | null>(null);
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState("");
  const [assigningTeacher, setAssigningTeacher] = useState(false);

  const fetchCourses = useCallback(async () => {
    if (!token || !user || (user.role !== "teacher" && user.role !== "super_admin")) return;
    setPageError("");
    try {
      const res = await fetch(`${API_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load courses");
      setCourses(data.data.courses || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load courses";
      setPageError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  const fetchTeachers = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      const res = await fetch(`${API_URL}/admin/users?role=teacher&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load teachers");
      setTeachers((data.data.users || []).filter((teacher: TeacherUser) => teacher.isActive && teacher.status === "active"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load teachers");
    }
  }, [token, isAdmin]);

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
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      router.replace("/login");
      setLoading(false);
      return;
    }
    if (user.role !== "teacher" && user.role !== "super_admin") {
      router.replace(`/${user.role}/dashboard`);
      setLoading(false);
      return;
    }
    fetchCourses();
    fetchStudents();
    fetchTeachers();
  }, [authLoading, isAuthenticated, user, router, fetchCourses, fetchStudents, fetchTeachers]);

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




  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !title.trim() || !selectedTeacherId || !token) return;
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
          teacherId: selectedTeacherId,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Course created and published!");
      setShowCreateCourseModal(false);
      setTitle("");
      setDescription("");
      setSelectedTeacherId("");
      fetchCourses();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Course creation failed",
      );
    } finally {
      setSubmittingCourse(false);
    }
  };

  const openEditCourseModal = (course: CourseItem) => {
    if (!isAdmin) return;
    setEditingCourseItem(course);
    setEditingCourseForm({
      title: course.title,
      category: course.category || "Programming",
      difficulty: course.difficulty || "beginner",
      status: course.status || "published",
      description: course.description || "",
      teacherId: course.teacherId || "",
    });
  };

  const handleSaveCourseEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingCourseItem || !token) return;
    setSavingCourseEdit(true);

    try {
      const res = await fetch(`${API_URL}/courses/${editingCourseItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingCourseForm),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Course updated successfully!");
      setEditingCourseItem(null);
      fetchCourses();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save edits");
    } finally {
      setSavingCourseEdit(false);
    }
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !assignTeacherCourseItem || !selectedTeacherForAssign || !token) {
      toast.error("Please select a teacher");
      return;
    }
    setAssigningTeacher(true);

    try {
      const res = await fetch(`${API_URL}/courses/${assignTeacherCourseItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teacherId: selectedTeacherForAssign }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Course assigned to teacher successfully!");
      setAssignTeacherCourseItem(null);
      setSelectedTeacherForAssign("");
      fetchCourses();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to assign teacher");
    } finally {
      setAssigningTeacher(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!isAdmin || !courseToDelete || !token) return;
    setDeletingCourse(true);
    try {
      const res = await fetch(`${API_URL}/courses/${courseToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not delete course");
      setCourses((current) => current.filter((course) => course.id !== courseToDelete.id));
      setCourseToDelete(null);
      toast.success("Course deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete course");
    } finally {
      setDeletingCourse(false);
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

  // ── VIEW 2: Courses Catalog Grid View
  return (
    <div className="space-y-6 animate-fade-in text-base-content">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content font-display tracking-tight">
            {isAdmin ? "Course Management" : "My Assigned Courses"}
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            {isAdmin
              ? "Create courses, assign teachers, and manage the course catalog."
              : "Open an assigned course to manage its Classes and Topics."}
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => setShowCreateCourseModal(true)}>
            ➕ Create Course
          </Button>
        )}
      </div>

      {pageError && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-error/30 bg-error/5 p-4 text-sm text-error sm:flex-row sm:items-center sm:justify-between">
          <span>{pageError}</span>
          <Button type="button" size="sm" variant="outline" onClick={fetchCourses}>Retry</Button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div
              key={c.id}
              className="relative overflow-hidden rounded-2xl border border-base-300 bg-base-100/90 shadow-md hover:shadow-2xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-between group backdrop-blur-sm"
            >
              {/* Top ambient gradient accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-accent" />

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Category, Status Badges & Quick Action Icons */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-primary/10 text-primary border border-primary/20">
                        {c.category || "Programming"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                          c.status === "published"
                            ? "bg-success/10 text-success border border-success/20"
                            : "bg-warning/10 text-warning border border-warning/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            c.status === "published"
                              ? "bg-success animate-pulse"
                              : "bg-warning"
                          }`}
                        />
                        {c.status}
                      </span>
                    </div>

                    {/* Edit and Delete Icon Action Buttons */}
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Edit Course Details"
                          onClick={() => openEditCourseModal(c)}
                          className="p-1.5 rounded-lg bg-base-200/80 hover:bg-primary/10 text-base-content/70 hover:text-primary border border-base-300 hover:border-primary/30 transition-all shadow-sm active:scale-95"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          title="Delete Course"
                          onClick={() => setCourseToDelete(c)}
                          className="p-1.5 rounded-lg bg-base-200/80 hover:bg-error/10 text-base-content/70 hover:text-error border border-base-300 hover:border-error/30 transition-all shadow-sm active:scale-95"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Course Title */}
                  <h3 className="font-bold text-lg text-base-content group-hover:text-primary transition-colors font-display line-clamp-1">
                    {c.title}
                  </h3>

                  {/* Assigned Teacher Badge / Indicator */}
                  <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-base-200/60 border border-base-300 text-xs">
                    <span className="text-primary font-semibold flex items-center gap-1.5 shrink-0">
                      <UserCheck size={14} /> Teacher:
                    </span>
                    <span className="font-medium text-base-content truncate">
                      {c.teacher?.name || "Unassigned"}
                    </span>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-3.5 mt-3.5 border-t border-base-200 space-y-3">
                  {/* Stats Chips */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-base-content/70">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-base-200/50 border border-base-300/50 truncate">
                      <Users size={12} className="shrink-0 text-primary/70" />
                      <span className="truncate">{c._count?.enrollments || 0} Enrolled</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-base-200/50 border border-base-300/50 truncate">
                      <Layers size={12} className="shrink-0 text-secondary/70" />
                      <span className="truncate">{c._count?.modules || 0} Modules</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2 pt-1">
                    {/* Manage Classes button */}
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full font-medium py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                      onClick={() => {
                        window.location.href = `/teacher/courses/${c.id}/edit`;
                      }}
                    >
                      <Layers size={15} />
                      <span>Manage Classes</span>
                    </Button>

                    {/* Admin: ONLY Assign Teacher (NOT Student!) */}
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAssignTeacherCourseItem(c);
                          setSelectedTeacherForAssign(c.teacherId || "");
                        }}
                        className="w-full py-2 px-3 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
                      >
                        <UserCheck size={14} />
                        <span>👨‍🏫 Assign Teacher</span>
                      </button>
                    ) : (
                      /* Teachers: Enroll Student */
                      <button
                        type="button"
                        onClick={() => {
                          setAssignCourseItem(c);
                          fetchStudents();
                        }}
                        className="w-full py-2 px-3 rounded-xl border border-base-300 bg-base-200/70 text-base-content hover:bg-base-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <GraduationCap size={14} />
                        <span>🎓 Enroll Student</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 p-8 space-y-4">
          <div className="text-5xl">📖</div>
          <h3 className="font-bold text-lg text-base-content font-display">
            {isAdmin ? "No Courses Yet" : "No Courses Assigned Yet"}
          </h3>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto">
            {isAdmin ? "Create a course and assign it to a teacher." : "Courses assigned to you will appear here."}
          </p>
          {isAdmin && (
            <Button variant="primary" onClick={() => setShowCreateCourseModal(true)}>
              Create First Course
            </Button>
          )}
        </Card>
      )}

      {/* ── Assign Course to Teacher Modal (Admin Only) */}
      <Modal
        isOpen={isAdmin && Boolean(assignTeacherCourseItem)}
        onClose={() => setAssignTeacherCourseItem(null)}
        title={
          assignTeacherCourseItem
            ? `Assign Teacher: ${assignTeacherCourseItem.title}`
            : "Assign Teacher"
        }
      >
        <form onSubmit={handleAssignTeacher} className="space-y-4 text-base-content">
          <p className="text-xs text-base-content/70">
            Admin can assign or reassign this course to any active teacher on the platform.
          </p>

          <div>
            <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-1.5">
              Select Active Teacher ({teachers.length}) *
            </label>
            {teachers.length === 0 ? (
              <div className="p-4 rounded-xl bg-base-200/50 text-center text-xs text-warning border border-base-300">
                No active teacher accounts found. Please create or verify a teacher first.
              </div>
            ) : (
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-base-content text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={selectedTeacherForAssign}
                onChange={(e) => setSelectedTeacherForAssign(e.target.value)}
                required
              >
                <option value="">-- Choose Teacher --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    👨‍🏫 {t.name} ({t.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setAssignTeacherCourseItem(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={assigningTeacher}
              disabled={!selectedTeacherForAssign}
            >
              <UserCheck size={15} /> Confirm Teacher Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── In-Place Edit Course Modal (Admin Only) */}
      <Modal
        isOpen={isAdmin && Boolean(editingCourseItem)}
        onClose={() => setEditingCourseItem(null)}
        title={editingCourseItem ? `Edit Course: ${editingCourseItem.title}` : "Edit Course"}
      >
        <form onSubmit={handleSaveCourseEdit} className="space-y-4 text-base-content">
          <Input
            label="Course Title *"
            required
            value={editingCourseForm.title}
            onChange={(e) =>
              setEditingCourseForm({ ...editingCourseForm, title: e.target.value })
            }
          />

          <div>
            <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-1.5">
              Assigned Teacher *
            </label>
            <select
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-base-content text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={editingCourseForm.teacherId}
              onChange={(e) =>
                setEditingCourseForm({ ...editingCourseForm, teacherId: e.target.value })
              }
            >
              <option value="">Select a teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  👨‍🏫 {t.name} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                className="w-full px-3 py-2.5 rounded-xl border border-base-300 bg-base-100 text-base-content text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={editingCourseForm.category}
                onChange={(e) =>
                  setEditingCourseForm({ ...editingCourseForm, category: e.target.value })
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
                Status
              </label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-base-content text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={editingCourseForm.status}
                onChange={(e) =>
                  setEditingCourseForm({ ...editingCourseForm, status: e.target.value })
                }
              >
                <option value="published">Published</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-1.5">
              Course Description
            </label>
            <textarea
              rows={3}
              className="w-full p-3 rounded-xl border border-base-300 bg-base-100 text-base-content text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={editingCourseForm.description}
              onChange={(e) =>
                setEditingCourseForm({ ...editingCourseForm, description: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setEditingCourseItem(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={savingCourseEdit}
            >
              <Check size={15} /> Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Enroll Student Modal (Teacher Only) */}
      {!isAdmin && (
        <Modal
          isOpen={Boolean(assignCourseItem)}
          onClose={() => setAssignCourseItem(null)}
          title={
            assignCourseItem
              ? `Enroll Student: ${assignCourseItem.title}`
              : "Enroll Student"
          }
        >
          <form
            onSubmit={handleAssignCourse}
            className="space-y-4 text-base-content"
          >
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
                  No active student accounts found matching &quot;{studentSearch}&quot;.
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
                      👤 {st.name} ({st.email}) — Enrolled in {st._count?.enrollments || 0} courses
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
                🎓 Enroll Student
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Create Course Modal */}
      <Modal
        isOpen={isAdmin && showCreateCourseModal}
        onClose={() => setShowCreateCourseModal(false)}
        title="Create Course"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input
            label="Course Title *"
            required
            placeholder="e.g. Master Next.js 15 & MongoDB"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label htmlFor="course-teacher" className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-1.5">
              Assign Teacher
            </label>
            <select
              id="course-teacher"
              required
              value={selectedTeacherId}
              onChange={(event) => setSelectedTeacherId(event.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-base-content text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.email})</option>
              ))}
            </select>
            {teachers.length === 0 && (
              <p className="mt-1 text-xs text-warning">Create an active teacher account before creating a course.</p>
            )}
          </div>

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
              disabled={!title.trim() || !selectedTeacherId}
            >
              Create & Publish
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isAdmin && Boolean(courseToDelete)}
        onClose={() => { if (!deletingCourse) setCourseToDelete(null); }}
        title="Delete Course"
      >
        <p className="text-sm text-base-content/70">
          Delete <strong className="text-base-content">{courseToDelete?.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button" disabled={deletingCourse} onClick={() => setCourseToDelete(null)}>
            Cancel
          </Button>
          <Button variant="error" type="button" isLoading={deletingCourse} onClick={handleDeleteCourse}>
            Delete Course
          </Button>
        </div>
      </Modal>
    </div>
  );
}

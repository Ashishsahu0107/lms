import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, MoreVertical, Edit, Trash2, Users, Play, Clock,
  BookOpen, Eye, Loader2, ArrowLeft, FolderPlus, FilePlus,
  ExternalLink, ShieldAlert, AlertTriangle, X, Save,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { SearchBar } from "../../../components/ui/SearchBar";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/DropdownMenu";
import toast from "react-hot-toast";

import {
  fetchCourses,
  fetchCourseById,
  addCourse,
  editCourse,
  removeCourse,
  addModule,
  editModule,
  removeModule,
  addTopic,
  editTopic,
  removeTopic,
  setActiveCourse,
  clearActiveCourse,
} from "../../../redux/slices/courseSlice";

// ─── Animation Variants ───────────────────────────────────────────────────────
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

// ─── Blank Form States ────────────────────────────────────────────────────────
const BLANK_COURSE = { title: "", description: "", category: "", price: "", thumbnail: "", difficulty: "beginner", duration: "", tags: "", status: "draft" };
const BLANK_MODULE = { title: "", order: "" };
const BLANK_TOPIC  = { title: "", content: "", videoUrl: "", duration: "", moduleId: "" };

// ─── ConfirmDialog (replaces window.confirm) ──────────────────────────────────
function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, danger = false }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md rounded-2xl border border-base-300 bg-base-100 shadow-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${danger ? "bg-error/10" : "bg-warning/10"}`}>
            <AlertTriangle className={`h-5 w-5 ${danger ? "text-error" : "text-warning"}`} />
          </div>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={danger ? "destructive" : "default"} onClick={onConfirm}>Confirm</Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Validation Helpers ───────────────────────────────────────────────────────
function validateCourseForm({ title, price, videoUrl }) {
  if (!title?.trim()) return "Course title is required";
  if (price !== "" && (isNaN(Number(price)) || Number(price) < 0)) return "Price must be a positive number";
  return null;
}

function validateTopicForm({ title, duration, videoUrl }) {
  if (!title?.trim()) return "Topic title is required";
  if (duration !== "" && (isNaN(Number(duration)) || Number(duration) < 0)) return "Duration must be a positive number";
  if (videoUrl && !/^https?:\/\/.+/.test(videoUrl)) return "Video URL must start with http:// or https://";
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CourseManagement() {
  const dispatch = useDispatch();
  const { list: courses, activeCourse, loading, submitting } = useSelector((s) => s.courses);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentMode, setCurrentMode] = useState("list"); // 'list' | 'curriculum'

  // ── Modal visibility
  const [showCreateModal, setShowCreateModal]     = useState(false);
  const [showEditModal, setShowEditModal]         = useState(false);
  const [showAddModuleModal, setShowAddModuleModal]   = useState(false);
  const [showEditModuleModal, setShowEditModuleModal] = useState(false);
  const [showAddTopicModal, setShowAddTopicModal]     = useState(false);
  const [showEditTopicModal, setShowEditTopicModal]   = useState(false);
  const [confirmDialog, setConfirmDialog]         = useState(null); // { title, message, onConfirm, danger }

  // ── Form data
  const [courseForm, setCourseForm]   = useState(BLANK_COURSE);
  const [moduleForm, setModuleForm]   = useState(BLANK_MODULE);
  const [topicForm, setTopicForm]     = useState(BLANK_TOPIC);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingTopicId, setEditingTopicId]   = useState(null);

  // ── Load on mount
  useEffect(() => { dispatch(fetchCourses()); }, [dispatch]);

  // ── Filter
  const filteredCourses = courses.filter(
    (c) =>
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Enter curriculum builder
  function openCurriculum(course) {
    dispatch(fetchCourseById(course._id));
    dispatch(setActiveCourse(course));
    setCurrentMode("curriculum");
  }

  function closeCurriculum() {
    dispatch(clearActiveCourse());
    setCurrentMode("list");
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // COURSE HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  async function handleCreateCourse(e) {
    e.preventDefault();
    const err = validateCourseForm(courseForm);
    if (err) return toast.error(err);

    const result = await dispatch(addCourse({
      ...courseForm,
      price: Number(courseForm.price) || 0,
      tags: courseForm.tags ? courseForm.tags.split(",").map((t) => t.trim()) : [],
    }));

    if (addCourse.fulfilled.match(result)) {
      toast.success("Course created successfully!");
      setShowCreateModal(false);
      setCourseForm(BLANK_COURSE);
    } else {
      toast.error(result.payload || "Failed to create course");
    }
  }

  function openEditCourse(course) {
    setCourseForm({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      price: course.price ?? "",
      thumbnail: course.thumbnail || "",
      difficulty: course.difficulty || "beginner",
      duration: course.duration || "",
      tags: Array.isArray(course.tags) ? course.tags.join(", ") : "",
      status: course.status || "draft",
    });
    dispatch(setActiveCourse(course));
    setShowEditModal(true);
  }

  async function handleUpdateCourse(e) {
    e.preventDefault();
    const err = validateCourseForm(courseForm);
    if (err) return toast.error(err);

    const result = await dispatch(editCourse({
      id: activeCourse._id,
      data: {
        ...courseForm,
        price: Number(courseForm.price) || 0,
        tags: courseForm.tags ? courseForm.tags.split(",").map((t) => t.trim()) : [],
      },
    }));

    if (editCourse.fulfilled.match(result)) {
      toast.success("Course updated successfully!");
      setShowEditModal(false);
      setCourseForm(BLANK_COURSE);
    } else {
      toast.error(result.payload || "Failed to update course");
    }
  }

  async function handleUpdateStatus(course, newStatus) {
    const result = await dispatch(editCourse({ id: course._id, data: { status: newStatus } }));
    if (editCourse.fulfilled.match(result)) {
      toast.success(`Course ${newStatus === "published" ? "published" : "moved to draft"}`);
    } else {
      toast.error(result.payload || "Failed to update status");
    }
  }

  function confirmDeleteCourse(courseId) {
    setConfirmDialog({
      title: "Delete Course",
      message: "Are you sure? All modules, topics, and enrollments will be permanently erased. This cannot be undone.",
      danger: true,
      onConfirm: async () => {
        setConfirmDialog(null);
        const result = await dispatch(removeCourse(courseId));
        if (removeCourse.fulfilled.match(result)) {
          toast.success("Course deleted.");
          if (currentMode === "curriculum") closeCurriculum();
        } else {
          toast.error(result.payload || "Failed to delete course");
        }
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MODULE HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  async function handleCreateModule(e) {
    e.preventDefault();
    if (!moduleForm.title.trim()) return toast.error("Module title is required");

    const result = await dispatch(addModule({
      title: moduleForm.title,
      order: Number(moduleForm.order) || 0,
      courseId: activeCourse._id,
    }));

    if (addModule.fulfilled.match(result)) {
      toast.success("Module added!");
      setShowAddModuleModal(false);
      setModuleForm(BLANK_MODULE);
    } else {
      toast.error(result.payload || "Failed to create module");
    }
  }

  function openEditModule(mod) {
    setEditingModuleId(mod._id);
    setModuleForm({ title: mod.title, order: mod.order ?? "" });
    setShowEditModuleModal(true);
  }

  async function handleUpdateModule(e) {
    e.preventDefault();
    if (!moduleForm.title.trim()) return toast.error("Module title is required");

    const result = await dispatch(editModule({
      id: editingModuleId,
      data: { title: moduleForm.title, order: Number(moduleForm.order) || 0 },
      courseId: activeCourse._id,
    }));

    if (editModule.fulfilled.match(result)) {
      toast.success("Module updated!");
      setShowEditModuleModal(false);
      setModuleForm(BLANK_MODULE);
      setEditingModuleId(null);
    } else {
      toast.error(result.payload || "Failed to update module");
    }
  }

  function confirmDeleteModule(moduleId) {
    setConfirmDialog({
      title: "Delete Module",
      message: "This will permanently delete the module and all its topics. Continue?",
      danger: true,
      onConfirm: async () => {
        setConfirmDialog(null);
        const result = await dispatch(removeModule({ moduleId, courseId: activeCourse._id }));
        if (removeModule.fulfilled.match(result)) {
          toast.success("Module deleted.");
        } else {
          toast.error(result.payload || "Failed to delete module");
        }
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TOPIC HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  function openAddTopic(preselectedModuleId) {
    if (!activeCourse?.modules?.length) return toast.error("Create at least one module first!");
    const firstModId = activeCourse.modules[0]?._id;
    setTopicForm({ ...BLANK_TOPIC, moduleId: preselectedModuleId || firstModId || "" });
    setShowAddTopicModal(true);
  }

  async function handleCreateTopic(e) {
    e.preventDefault();
    const err = validateTopicForm(topicForm);
    if (err) return toast.error(err);

    const result = await dispatch(addTopic({
      data: { ...topicForm, duration: Number(topicForm.duration) || 0 },
      courseId: activeCourse._id,
    }));

    if (addTopic.fulfilled.match(result)) {
      toast.success("Topic added!");
      setShowAddTopicModal(false);
      setTopicForm(BLANK_TOPIC);
    } else {
      toast.error(result.payload || "Failed to create topic");
    }
  }

  function openEditTopic(topic, moduleId) {
    setEditingTopicId(topic._id);
    setTopicForm({
      title: topic.title || "",
      content: topic.content || "",
      videoUrl: topic.videoUrl || "",
      duration: topic.duration ?? "",
      moduleId: moduleId || topic.moduleId || "",
    });
    setShowEditTopicModal(true);
  }

  async function handleUpdateTopic(e) {
    e.preventDefault();
    const err = validateTopicForm(topicForm);
    if (err) return toast.error(err);

    const result = await dispatch(editTopic({
      id: editingTopicId,
      data: { ...topicForm, duration: Number(topicForm.duration) || 0 },
      courseId: activeCourse._id,
    }));

    if (editTopic.fulfilled.match(result)) {
      toast.success("Topic updated!");
      setShowEditTopicModal(false);
      setTopicForm(BLANK_TOPIC);
      setEditingTopicId(null);
    } else {
      toast.error(result.payload || "Failed to update topic");
    }
  }

  function confirmDeleteTopic(topicId) {
    setConfirmDialog({
      title: "Delete Topic",
      message: "This will permanently delete this lecture/topic. Continue?",
      danger: true,
      onConfirm: async () => {
        setConfirmDialog(null);
        const result = await dispatch(removeTopic({ topicId, courseId: activeCourse._id }));
        if (removeTopic.fulfilled.match(result)) {
          toast.success("Topic deleted.");
        } else {
          toast.error(result.payload || "Failed to delete topic");
        }
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── CONFIRM DIALOG ── */}
      <AnimatePresence>
        {confirmDialog && (
          <ConfirmDialog
            isOpen
            title={confirmDialog.title}
            message={confirmDialog.message}
            danger={confirmDialog.danger}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(null)}
          />
        )}
      </AnimatePresence>

      {currentMode === "list" ? (

        /* ══════════════════════════════════════════════════
           LIST VIEW
        ══════════════════════════════════════════════════ */
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

          {/* Header */}
          <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Course Management</h1>
              <p className="text-muted-foreground">Create and manage your course curriculum</p>
            </div>
            <Button className="gap-2" onClick={() => { setCourseForm(BLANK_COURSE); setShowCreateModal(true); }}>
              <Plus className="h-4 w-4" /> Create Course
            </Button>
          </motion.div>

          {/* Search */}
          <motion.div variants={item}>
            <SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search courses..." className="max-w-md" />
          </motion.div>

          {/* Course Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <Card className="p-12 text-center border bg-base-100/50">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/60" />
              <h3 className="text-xl font-bold mb-2">No Courses Found</h3>
              <p className="text-muted-foreground mb-6">Create your first course to start building curriculum.</p>
              <Button onClick={() => { setCourseForm(BLANK_COURSE); setShowCreateModal(true); }}>Create First Course</Button>
            </Card>
          ) : (
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  submitting={submitting}
                  onOpenCurriculum={() => openCurriculum(course)}
                  onEdit={() => openEditCourse(course)}
                  onDelete={() => confirmDeleteCourse(course._id)}
                  onStatusChange={(s) => handleUpdateStatus(course, s)}
                />
              ))}
            </motion.div>
          )}
        </motion.div>

      ) : (

        /* ══════════════════════════════════════════════════
           CURRICULUM BUILDER VIEW
        ══════════════════════════════════════════════════ */
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={closeCurriculum} className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <span className="text-xs font-semibold text-primary/80 uppercase tracking-widest">Curriculum Editor</span>
                <h1 className="text-2xl font-bold truncate max-w-lg">{activeCourse?.title}</h1>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-2" onClick={() => { setModuleForm(BLANK_MODULE); setShowAddModuleModal(true); }}>
                <FolderPlus className="h-4 w-4" /> Add Module
              </Button>
              <Button size="sm" className="gap-2" onClick={() => openAddTopic()}>
                <FilePlus className="h-4 w-4" /> Add Topic
              </Button>
            </div>
          </div>

          {loading && !activeCourse ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Course Info Sidebar */}
              <div className="space-y-4">
                <Card className="border bg-base-100/50 shadow-md">
                  <div className="relative h-44">
                    <img
                      src={activeCourse?.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"}
                      alt="Thumbnail"
                      className="w-full h-full object-cover rounded-t-2xl"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant={activeCourse?.status === "published" ? "success" : "warning"}>{activeCourse?.status}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">Course Specs</h3>
                      <Button size="xs" variant="outline" className="gap-1" onClick={() => openEditCourse(activeCourse)}>
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Button>
                    </div>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between text-muted-foreground"><span>Category</span><span className="font-medium text-foreground">{activeCourse?.category || "General"}</span></div>
                      <div className="flex justify-between text-muted-foreground"><span>Difficulty</span><span className="font-medium text-foreground capitalize">{activeCourse?.difficulty}</span></div>
                      <div className="flex justify-between text-muted-foreground"><span>Modules</span><span className="font-medium text-foreground">{activeCourse?.modules?.length || 0}</span></div>
                      <div className="flex justify-between text-muted-foreground"><span>Price</span><span className="font-medium text-success">${activeCourse?.price}</span></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Modules & Topics */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="font-bold text-xl flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Curriculum Modules</h2>
                {!activeCourse?.modules?.length ? (
                  <div className="p-12 text-center border border-dashed rounded-2xl bg-base-100/30">
                    <FolderPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
                    <p className="font-semibold text-muted-foreground">No modules yet.</p>
                    <p className="text-sm text-muted-foreground/80 mb-4">Modules divide your course into chapters.</p>
                    <Button size="sm" onClick={() => { setModuleForm(BLANK_MODULE); setShowAddModuleModal(true); }}>Add First Module</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeCourse.modules.map((mod) => (
                      <div key={mod._id} className="border border-base-300 rounded-2xl overflow-hidden bg-base-100 shadow-sm">
                        <div className="flex items-center justify-between p-4 bg-base-200/50 border-b">
                          <div>
                            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Module #{mod.order ?? 0}</span>
                            <h3 className="font-bold text-lg">{mod.title}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="xs" variant="outline" className="gap-1" onClick={() => openAddTopic(mod._id)}>
                              <FilePlus className="h-3 w-3" /> Add Topic
                            </Button>
                            <Button size="xs" variant="outline" className="gap-1" onClick={() => openEditModule(mod)}>
                              <Edit className="h-3 w-3" /> Edit
                            </Button>
                            <Button size="xs" variant="destructive" onClick={() => confirmDeleteModule(mod._id)} disabled={submitting}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="divide-y divide-base-200">
                          {!mod.topics?.length ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">No topics yet in this module.</div>
                          ) : (
                            mod.topics.map((topic) => (
                              <div key={topic._id} className="flex items-center justify-between p-4 hover:bg-base-200/30 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-xl bg-primary/10 text-primary"><Play className="h-4 w-4 fill-current" /></div>
                                  <div>
                                    <h4 className="font-medium text-sm">{topic.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                      <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {topic.duration} mins</span>
                                      {topic.videoUrl && <span className="flex items-center gap-0.5 text-blue-500 font-semibold"><ExternalLink className="h-3 w-3" /> Video</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1.5">
                                  <Button size="xs" variant="ghost" onClick={() => openEditTopic(topic, mod._id)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="xs" variant="ghost" className="text-error hover:bg-error/10" onClick={() => confirmDeleteTopic(topic._id)} disabled={submitting}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ══ CREATE COURSE MODAL ══ */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Course" size="2xl">
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <CourseFormFields form={courseForm} onChange={(f) => setCourseForm((p) => ({ ...p, ...f }))} />
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {submitting ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ══ EDIT COURSE MODAL ══ */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Course" size="2xl">
        <form onSubmit={handleUpdateCourse} className="space-y-4">
          <CourseFormFields form={courseForm} onChange={(f) => setCourseForm((p) => ({ ...p, ...f }))} showStatus />
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ══ ADD MODULE MODAL ══ */}
      <Modal isOpen={showAddModuleModal} onClose={() => setShowAddModuleModal(false)} title="Add Curriculum Module">
        <form onSubmit={handleCreateModule} className="space-y-4">
          <Input label="Module Title *" placeholder="e.g. Introduction & Setup" value={moduleForm.title} onChange={(e) => setModuleForm((p) => ({ ...p, title: e.target.value }))} required />
          <Input label="Sort Order" type="number" placeholder="e.g. 1" value={moduleForm.order} onChange={(e) => setModuleForm((p) => ({ ...p, order: e.target.value }))} />
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowAddModuleModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
              {submitting ? "Adding..." : "Add Module"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ══ EDIT MODULE MODAL ══ */}
      <Modal isOpen={showEditModuleModal} onClose={() => setShowEditModuleModal(false)} title="Edit Module">
        <form onSubmit={handleUpdateModule} className="space-y-4">
          <Input label="Module Title *" placeholder="e.g. Introduction & Setup" value={moduleForm.title} onChange={(e) => setModuleForm((p) => ({ ...p, title: e.target.value }))} required />
          <Input label="Sort Order" type="number" placeholder="e.g. 1" value={moduleForm.order} onChange={(e) => setModuleForm((p) => ({ ...p, order: e.target.value }))} />
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowEditModuleModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {submitting ? "Saving..." : "Save Module"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ══ ADD TOPIC MODAL ══ */}
      <Modal isOpen={showAddTopicModal} onClose={() => setShowAddTopicModal(false)} title="Add Topic / Lecture" size="2xl">
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <TopicFormFields form={topicForm} modules={activeCourse?.modules || []} onChange={(f) => setTopicForm((p) => ({ ...p, ...f }))} />
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowAddTopicModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus className="h-4 w-4" />}
              {submitting ? "Adding..." : "Add Lecture"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ══ EDIT TOPIC MODAL ══ */}
      <Modal isOpen={showEditTopicModal} onClose={() => setShowEditTopicModal(false)} title="Edit Topic / Lecture" size="2xl">
        <form onSubmit={handleUpdateTopic} className="space-y-4">
          <TopicFormFields form={topicForm} modules={activeCourse?.modules || []} onChange={(f) => setTopicForm((p) => ({ ...p, ...f }))} />
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowEditTopicModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {submitting ? "Saving..." : "Save Lecture"}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

// ─── Reusable Course Form Fields ──────────────────────────────────────────────
function CourseFormFields({ form, onChange, showStatus = false }) {
  return (
    <>
      <Input label="Course Title *" placeholder="e.g. JavaScript Deep Dive" value={form.title} onChange={(e) => onChange({ title: e.target.value })} required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Category" placeholder="e.g. Programming" value={form.category} onChange={(e) => onChange({ category: e.target.value })} />
        <Input label="Price ($)" type="number" min="0" placeholder="0" value={form.price} onChange={(e) => onChange({ price: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-semibold mb-1 block text-foreground/80">Description</label>
        <textarea
          className="textarea textarea-bordered border-base-300 w-full h-24 rounded-xl px-3 py-2 bg-card text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
          placeholder="Describe what students will learn..."
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Thumbnail URL" placeholder="https://..." value={form.thumbnail} onChange={(e) => onChange({ thumbnail: e.target.value })} />
        <Input label="Duration (e.g. 35 hours)" placeholder="e.g. 35 hours" value={form.duration} onChange={(e) => onChange({ duration: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold mb-1 block text-foreground/80">Difficulty Level</label>
          <select className="select select-bordered w-full h-10 px-3 bg-card border-base-300 rounded-xl text-sm" value={form.difficulty} onChange={(e) => onChange({ difficulty: e.target.value })}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        {showStatus ? (
          <div>
            <label className="text-sm font-semibold mb-1 block text-foreground/80">Status</label>
            <select className="select select-bordered w-full h-10 px-3 bg-card border-base-300 rounded-xl text-sm" value={form.status} onChange={(e) => onChange({ status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        ) : (
          <Input label="Tags (comma-separated)" placeholder="js, async, node" value={form.tags} onChange={(e) => onChange({ tags: e.target.value })} />
        )}
      </div>
      {showStatus && (
        <Input label="Tags (comma-separated)" placeholder="js, async, node" value={form.tags} onChange={(e) => onChange({ tags: e.target.value })} />
      )}
    </>
  );
}

// ─── Reusable Topic Form Fields ───────────────────────────────────────────────
function TopicFormFields({ form, modules, onChange }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold mb-1 block text-foreground/80">Select Module *</label>
          <select
            className="select select-bordered w-full h-10 px-3 bg-card border-base-300 rounded-xl text-sm"
            value={form.moduleId}
            onChange={(e) => onChange({ moduleId: e.target.value })}
            required
          >
            <option value="">-- Select Module --</option>
            {modules.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
          </select>
        </div>
        <Input label="Topic Title *" placeholder="e.g. Currying and Composition" value={form.title} onChange={(e) => onChange({ title: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Lecture Video URL" placeholder="https://www.youtube.com/embed/..." value={form.videoUrl} onChange={(e) => onChange({ videoUrl: e.target.value })} />
        <Input label="Duration (minutes) *" type="number" min="0" placeholder="e.g. 15" value={form.duration} onChange={(e) => onChange({ duration: e.target.value })} required />
      </div>
      <div>
        <label className="text-sm font-semibold mb-1 block text-foreground/80">Lecture Notes / Markdown Content</label>
        <textarea
          className="textarea textarea-bordered border-base-300 w-full h-32 rounded-xl px-3 py-2 bg-card text-sm focus:ring-1 focus:ring-primary outline-none font-mono resize-none"
          placeholder="### Key Takeaways&#10;&#10;Write markdown notes, code blocks, key concepts here..."
          value={form.content}
          onChange={(e) => onChange({ content: e.target.value })}
        />
      </div>
    </>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, submitting, onOpenCurriculum, onEdit, onDelete, onStatusChange }) {
  const modulesCount = course.modules?.length || 0;
  const topicsCount  = course.modules?.reduce((acc, m) => acc + (m.topics?.length || 0), 0) || 0;
  const studentsCount = course.students?.length || 0;

  return (
    <motion.div variants={item}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border border-base-300 bg-base-100">
        <div className="relative h-48 overflow-hidden bg-base-300">
          <img
            src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Badge className={`absolute top-3 right-3 border-0 text-white capitalize ${course.status === "published" ? "bg-success" : "bg-warning"}`}>
            {course.status}
          </Badge>
          <div className="absolute bottom-3 left-3 right-3">
            <Badge variant="secondary" className="mb-1 capitalize">{course.category || "General"}</Badge>
            <h3 className="text-xl font-bold text-white truncate">{course.title}</h3>
          </div>
        </div>

        <CardContent className="p-5">
          <div className="grid grid-cols-3 gap-2 text-center text-sm text-muted-foreground mb-5 pb-3 border-b border-base-200">
            <div className="flex flex-col"><span className="font-bold text-foreground">{studentsCount}</span><span>Students</span></div>
            <div className="flex flex-col border-x border-base-200"><span className="font-bold text-foreground">{modulesCount}</span><span>Modules</span></div>
            <div className="flex flex-col"><span className="font-bold text-foreground">{topicsCount}</span><span>Topics</span></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-success">${course.price}</span>
              <span className="text-xs text-muted-foreground capitalize">({course.difficulty})</span>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={onOpenCurriculum}>
                <Edit className="h-3.5 w-3.5" /> Curriculum
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl border border-base-300">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-base-100 border border-base-300 rounded-2xl shadow-xl">
                  <DropdownMenuItem onClick={onEdit} className="gap-2">
                    <Edit className="h-4 w-4" /> Edit Course Details
                  </DropdownMenuItem>
                  {course.status === "draft" ? (
                    <DropdownMenuItem onClick={() => onStatusChange("published")} className="text-success font-semibold">
                      <Play className="h-4 w-4 mr-2" /> Publish Course
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onStatusChange("draft")} className="text-warning font-semibold">
                      <ShieldAlert className="h-4 w-4 mr-2" /> Unpublish (Draft)
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-destructive font-semibold" onClick={onDelete} disabled={submitting}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Course
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
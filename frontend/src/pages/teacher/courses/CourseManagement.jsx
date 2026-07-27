import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Clock,
  BookOpen,
  Loader2,
  ArrowLeft,
  FolderPlus,
  FilePlus,
  ExternalLink,
  AlertTriangle,
  Save,
  Upload,
  X,
  ImagePlus,
  CheckCircle2,
  Globe,
  Lock,
  Archive,
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
import { getImageUrl, handleImageError } from "../../../utils/image";

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

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Programming",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Cybersecurity",
  "Database",
  "Design",
  "Business",
  "Marketing",
  "Photography",
  "Music",
  "Language",
  "Other",
];

const BLANK_COURSE = {
  title: "",
  description: "",
  category: "",
  price: "",
  difficulty: "beginner",
  duration: "",
  tags: "",
  status: "draft",
  thumbnailFile: null, // File object
  thumbnailPreview: "", // local object URL for preview
};
const BLANK_MODULE = { title: "", order: "" };
const BLANK_TOPIC = {
  title: "",
  content: "",
  videoUrl: "",
  duration: "",
  moduleId: "",
};

const anim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────────────────
function validateCourseForm(f) {
  if (!f.title?.trim()) return "Course title is required";
  if (f.title.trim().length < 3) return "Title must be at least 3 characters";
  if (f.title.trim().length > 200) return "Title cannot exceed 200 characters";
  if (f.description && f.description.length > 5000)
    return "Description cannot exceed 5000 characters";
  if (f.price !== "" && (isNaN(Number(f.price)) || Number(f.price) < 0))
    return "Price must be a positive number";
  if (
    f.duration !== "" &&
    (isNaN(Number(f.duration)) || Number(f.duration) < 0)
  )
    return "Duration must be a positive number (minutes)";
  return null;
}

function validateTopicForm(f) {
  if (!f.title?.trim()) return "Topic title is required";
  if (!f.moduleId) return "Please select a module";
  if (
    f.duration !== "" &&
    (isNaN(Number(f.duration)) || Number(f.duration) < 0)
  )
    return "Duration must be a positive number";
  if (f.videoUrl && !/^https?:\/\/.+/.test(f.videoUrl))
    return "Video URL must start with http:// or https://";
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM DIALOG
// ─────────────────────────────────────────────────────────────────────────────
function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  danger = false,
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="w-full max-w-md rounded-2xl border border-base-300 bg-base-100 shadow-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`p-2 rounded-xl ${danger ? "bg-error/10" : "bg-warning/10"}`}
          >
            <AlertTriangle
              className={`h-5 w-5 ${danger ? "text-error" : "text-warning"}`}
            />
          </div>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={danger ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {danger ? "Delete" : "Confirm"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// THUMBNAIL UPLOAD ZONE
// ─────────────────────────────────────────────────────────────────────────────
function ThumbnailUploader({ preview, existingUrl, onChange, onClear }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const displaySrc = preview || getImageUrl(existingUrl) || null;

  function handleFile(file) {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPEG, PNG, or WebP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Thumbnail must be under 5 MB");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    onChange(file, objectUrl);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground/80 block">
        Course Thumbnail{" "}
        <span className="text-muted-foreground font-normal">
          (JPEG/PNG/WebP · max 5 MB)
        </span>
      </label>

      {displaySrc ? (
        <div className="relative rounded-xl overflow-hidden border border-base-300 group h-44">
          <img
            src={displaySrc}
            onError={handleImageError}
            alt="Thumbnail preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-1.5" /> Replace
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-red-500/20 border-red-400/30 text-red-300 hover:bg-red-500/30"
              onClick={onClear}
            >
              <X className="h-4 w-4 mr-1.5" /> Remove
            </Button>
          </div>
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/80 text-white text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Uploaded
            </span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl h-44 flex flex-col items-center justify-center cursor-pointer transition-all gap-2
            ${
              dragging
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-base-300 hover:border-primary/60 hover:bg-primary/5 bg-base-200/40"
            }`}
        >
          <div className="p-3 rounded-2xl bg-primary/10">
            <ImagePlus className="h-7 w-7 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground/70">
            {dragging ? "Drop image here" : "Drag & drop or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG · PNG · WebP · Max 5 MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COURSE FORM FIELDS (shared between Create & Edit)
// ─────────────────────────────────────────────────────────────────────────────
function CourseFormFields({ form, onChange, showStatus = false }) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <Input
        label="Course Title *"
        placeholder="e.g. Complete JavaScript Bootcamp"
        value={form.title}
        onChange={(e) => onChange({ title: e.target.value })}
        required
        maxLength={200}
        helperText={`${form.title.length}/200 characters`}
      />

      {/* Description */}
      <div>
        <label className="text-sm font-semibold mb-1 block text-foreground/80">
          Description
        </label>
        <textarea
          className="textarea textarea-bordered border-base-300 w-full h-28 rounded-xl px-3 py-2.5 bg-card text-sm focus:ring-1 focus:ring-primary outline-none resize-none leading-relaxed"
          placeholder="What will students learn? What are the prerequisites? Who is this for?"
          value={form.description}
          maxLength={5000}
          onChange={(e) => onChange({ description: e.target.value })}
        />
        <p className="text-xs text-muted-foreground mt-0.5">
          {form.description.length}/5000
        </p>
      </div>

      {/* Category + Difficulty */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold mb-1 block text-foreground/80">
            Category
          </label>
          <select
            className="select select-bordered w-full h-10 px-3 bg-card border-base-300 rounded-xl text-sm"
            value={form.category}
            onChange={(e) => onChange({ category: e.target.value })}
          >
            <option value="">Select category...</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold mb-1 block text-foreground/80">
            Difficulty Level
          </label>
          <select
            className="select select-bordered w-full h-10 px-3 bg-card border-base-300 rounded-xl text-sm"
            value={form.difficulty}
            onChange={(e) => onChange({ difficulty: e.target.value })}
          >
            <option value="beginner">🟢 Beginner</option>
            <option value="intermediate">🟡 Intermediate</option>
            <option value="advanced">🔴 Advanced</option>
          </select>
        </div>
      </div>

      {/* Price + Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <Input
            label="Price (USD)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.price}
            onChange={(e) => onChange({ price: e.target.value })}
          />
        </div>
        <Input
          label="Duration (minutes)"
          type="number"
          min="0"
          placeholder="e.g. 480 (= 8 hrs)"
          value={form.duration}
          onChange={(e) => onChange({ duration: e.target.value })}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-semibold mb-1 block text-foreground/80">
          Tags
          <span className="ml-1 text-muted-foreground font-normal">
            (comma-separated, max 20)
          </span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full h-10 px-3 bg-card border-base-300 rounded-xl text-sm"
          placeholder="e.g. javascript, react, node, fullstack"
          value={form.tags}
          onChange={(e) => onChange({ tags: e.target.value })}
        />
        {/* Tag chips preview */}
        {form.tags && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
              .slice(0, 20)
              .map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20"
                >
                  # {t}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Status (edit mode only) */}
      {showStatus && (
        <div>
          <label className="text-sm font-semibold mb-1 block text-foreground/80">
            Publication Status
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                value: "draft",
                label: "Draft",
                icon: Lock,
                color: "text-warning",
              },
              {
                value: "published",
                label: "Published",
                icon: Globe,
                color: "text-success",
              },
              {
                value: "archived",
                label: "Archived",
                icon: Archive,
                color: "text-muted-foreground",
              },
            ].map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ status: value })}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all
                  ${
                    form.status === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-base-300 bg-base-100 text-muted-foreground hover:border-primary/40"
                  }`}
              >
                <Icon
                  className={`h-4 w-4 ${form.status === value ? "text-primary" : color}`}
                />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Thumbnail */}
      <ThumbnailUploader
        preview={form.thumbnailPreview}
        existingUrl={form.thumbnail}
        onChange={(file, preview) =>
          onChange({ thumbnailFile: file, thumbnailPreview: preview })
        }
        onClear={() =>
          onChange({ thumbnailFile: null, thumbnailPreview: "", thumbnail: "" })
        }
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPIC FORM FIELDS
// ─────────────────────────────────────────────────────────────────────────────
function TopicFormFields({ form, modules, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold mb-1 block text-foreground/80">
            Module *
          </label>
          <select
            className="select select-bordered w-full h-10 px-3 bg-card border-base-300 rounded-xl text-sm"
            value={form.moduleId}
            onChange={(e) => onChange({ moduleId: e.target.value })}
            required
          >
            <option value="">— Select module —</option>
            {modules.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Topic Title *"
          placeholder="e.g. Arrow Functions Deep Dive"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Video URL"
          placeholder="https://www.youtube.com/embed/..."
          value={form.videoUrl}
          onChange={(e) => onChange({ videoUrl: e.target.value })}
        />
        <Input
          label="Duration (minutes) *"
          type="number"
          min="0"
          placeholder="e.g. 15"
          value={form.duration}
          onChange={(e) => onChange({ duration: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="text-sm font-semibold mb-1 block text-foreground/80">
          Lecture Notes / Markdown Content
        </label>
        <textarea
          className="textarea textarea-bordered border-base-300 w-full h-32 rounded-xl px-3 py-2.5 bg-card text-sm focus:ring-1 focus:ring-primary outline-none font-mono resize-none"
          placeholder={
            "### Key Takeaways\n\n- Point 1\n- Point 2\n\n```js\n// code example\n```"
          }
          value={form.content}
          onChange={(e) => onChange({ content: e.target.value })}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function CourseManagement() {
  const dispatch = useDispatch();
  const {
    list: courses,
    activeCourse,
    loading,
    submitting,
  } = useSelector((s) => s.courses);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentMode, setCurrentMode] = useState("list");

  // Modal flags
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showEditModule, setShowEditModule] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [showEditTopic, setShowEditTopic] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Form states
  const [courseForm, setCourseForm] = useState(BLANK_COURSE);
  const [moduleForm, setModuleForm] = useState(BLANK_MODULE);
  const [topicForm, setTopicForm] = useState(BLANK_TOPIC);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingTopicId, setEditingTopicId] = useState(null);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (courseForm.thumbnailPreview)
        URL.revokeObjectURL(courseForm.thumbnailPreview);
    };
  }, [courseForm.thumbnailPreview]);

  const patchCourse = useCallback(
    (patch) => setCourseForm((p) => ({ ...p, ...patch })),
    [],
  );
  const patchModule = useCallback(
    (patch) => setModuleForm((p) => ({ ...p, ...patch })),
    [],
  );
  const patchTopic = useCallback(
    (patch) => setTopicForm((p) => ({ ...p, ...patch })),
    [],
  );

  const filtered = courses.filter(
    (c) =>
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  function openCurriculum(course) {
    dispatch(setActiveCourse(course));
    dispatch(fetchCourseById(course._id));
    setCurrentMode("curriculum");
  }
  function closeCurriculum() {
    dispatch(clearActiveCourse());
    setCurrentMode("list");
  }

  // ── COURSE CRUD ──────────────────────────────────────────────────────────────

  async function handleCreateCourse(e) {
    e.preventDefault();
    const err = validateCourseForm(courseForm);
    if (err) return toast.error(err);

    const result = await dispatch(
      addCourse({
        title: courseForm.title.trim(),
        description: courseForm.description,
        category: courseForm.category,
        price: courseForm.price || 0,
        difficulty: courseForm.difficulty,
        duration: courseForm.duration || 0,
        tags: courseForm.tags,
        status: courseForm.status,
        thumbnailFile: courseForm.thumbnailFile, // File | null
      }),
    );

    if (addCourse.fulfilled.match(result)) {
      toast.success("Course created successfully!");
      setShowCreate(false);
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
      difficulty: course.difficulty || "beginner",
      duration: course.duration ?? "",
      tags: Array.isArray(course.tags) ? course.tags.join(", ") : "",
      status: course.status || "draft",
      thumbnail: course.thumbnail || "",
      thumbnailFile: null,
      thumbnailPreview: "",
    });
    dispatch(setActiveCourse(course));
    setShowEdit(true);
  }

  async function handleUpdateCourse(e) {
    e.preventDefault();
    const err = validateCourseForm(courseForm);
    if (err) return toast.error(err);

    const result = await dispatch(
      editCourse({
        id: activeCourse._id,
        data: {
          title: courseForm.title.trim(),
          description: courseForm.description,
          category: courseForm.category,
          price: courseForm.price || 0,
          difficulty: courseForm.difficulty,
          duration: courseForm.duration || 0,
          tags: courseForm.tags,
          status: courseForm.status,
          thumbnailFile: courseForm.thumbnailFile,
        },
      }),
    );

    if (editCourse.fulfilled.match(result)) {
      toast.success("Course updated!");
      setShowEdit(false);
      setCourseForm(BLANK_COURSE);
    } else {
      toast.error(result.payload || "Failed to update course");
    }
  }

  async function handleStatusChange(course, newStatus) {
    const result = await dispatch(
      editCourse({ id: course._id, data: { status: newStatus } }),
    );
    if (editCourse.fulfilled.match(result)) {
      toast.success(
        `Course ${newStatus === "published" ? "published 🚀" : newStatus === "draft" ? "moved to draft" : "archived"}`,
      );
    }
  }

  function confirmDeleteCourse(courseId) {
    setConfirmDialog({
      title: "Delete Course",
      message:
        "This will permanently delete the course, all its modules, topics, and enrollments. This cannot be undone.",
      danger: true,
      onConfirm: async () => {
        setConfirmDialog(null);
        const result = await dispatch(removeCourse(courseId));
        if (removeCourse.fulfilled.match(result)) {
          toast.success("Course deleted");
          if (currentMode === "curriculum") closeCurriculum();
        } else {
          toast.error(result.payload || "Delete failed");
        }
      },
    });
  }

  // ── MODULE CRUD ──────────────────────────────────────────────────────────────

  async function handleCreateModule(e) {
    e.preventDefault();
    if (!moduleForm.title.trim())
      return toast.error("Module title is required");
    const result = await dispatch(
      addModule({
        title: moduleForm.title.trim(),
        order: Number(moduleForm.order) || 0,
        courseId: activeCourse._id,
      }),
    );
    if (addModule.fulfilled.match(result)) {
      toast.success("Module added!");
      setShowAddModule(false);
      setModuleForm(BLANK_MODULE);
    } else toast.error(result.payload || "Failed to add module");
  }

  function openEditModule(mod) {
    setEditingModuleId(mod._id);
    setModuleForm({ title: mod.title, order: mod.order ?? "" });
    setShowEditModule(true);
  }

  async function handleUpdateModule(e) {
    e.preventDefault();
    if (!moduleForm.title.trim())
      return toast.error("Module title is required");
    const result = await dispatch(
      editModule({
        id: editingModuleId,
        data: {
          title: moduleForm.title.trim(),
          order: Number(moduleForm.order) || 0,
        },
        courseId: activeCourse._id,
      }),
    );
    if (editModule.fulfilled.match(result)) {
      toast.success("Module updated!");
      setShowEditModule(false);
      setEditingModuleId(null);
    } else toast.error(result.payload || "Failed to update module");
  }

  function confirmDeleteModule(moduleId) {
    setConfirmDialog({
      title: "Delete Module",
      message: "All topics inside this module will be permanently deleted.",
      danger: true,
      onConfirm: async () => {
        setConfirmDialog(null);
        const result = await dispatch(
          removeModule({ moduleId, courseId: activeCourse._id }),
        );
        if (removeModule.fulfilled.match(result))
          toast.success("Module deleted");
        else toast.error(result.payload || "Failed to delete module");
      },
    });
  }

  // ── TOPIC CRUD ───────────────────────────────────────────────────────────────

  function openAddTopic(preselectedModuleId = "") {
    if (!activeCourse?.modules?.length)
      return toast.error("Create at least one module first!");
    const modId = preselectedModuleId || activeCourse.modules[0]?._id || "";
    setTopicForm({ ...BLANK_TOPIC, moduleId: modId });
    setShowAddTopic(true);
  }

  async function handleCreateTopic(e) {
    e.preventDefault();
    const err = validateTopicForm(topicForm);
    if (err) return toast.error(err);
    const result = await dispatch(
      addTopic({
        data: { ...topicForm, duration: Number(topicForm.duration) || 0 },
        courseId: activeCourse._id,
      }),
    );
    if (addTopic.fulfilled.match(result)) {
      toast.success("Topic added!");
      setShowAddTopic(false);
      setTopicForm(BLANK_TOPIC);
    } else toast.error(result.payload || "Failed to add topic");
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
    setShowEditTopic(true);
  }

  async function handleUpdateTopic(e) {
    e.preventDefault();
    const err = validateTopicForm(topicForm);
    if (err) return toast.error(err);
    const result = await dispatch(
      editTopic({
        id: editingTopicId,
        data: { ...topicForm, duration: Number(topicForm.duration) || 0 },
        courseId: activeCourse._id,
      }),
    );
    if (editTopic.fulfilled.match(result)) {
      toast.success("Topic updated!");
      setShowEditTopic(false);
      setEditingTopicId(null);
    } else toast.error(result.payload || "Failed to update topic");
  }

  function confirmDeleteTopic(topicId) {
    setConfirmDialog({
      title: "Delete Lecture",
      message: "This lecture / topic will be permanently removed.",
      danger: true,
      onConfirm: async () => {
        setConfirmDialog(null);
        const result = await dispatch(
          removeTopic({ topicId, courseId: activeCourse._id }),
        );
        if (removeTopic.fulfilled.match(result)) toast.success("Topic deleted");
        else toast.error(result.payload || "Failed to delete topic");
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Confirm Dialog */}
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

      {/* ════════════════════════════════════
          LIST VIEW
      ════════════════════════════════════ */}
      {currentMode === "list" && (
        <motion.div
          variants={anim}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Header */}
          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl font-bold">Course Management</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Build and publish your course curriculum
              </p>
            </div>
            <Button
              className="gap-2"
              onClick={() => {
                setCourseForm(BLANK_COURSE);
                setShowCreate(true);
              }}
            >
              <Plus className="h-4 w-4" /> Create Course
            </Button>
          </motion.div>

          {/* Search */}
          <motion.div variants={item}>
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, category, or tag..."
              className="max-w-lg"
            />
          </motion.div>

          {/* Course Grid */}
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <Card className="p-14 text-center border bg-base-100/60">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="text-xl font-bold mb-2">
                {searchQuery
                  ? "No courses match your search"
                  : "No Courses Yet"}
              </h3>
              <p className="text-muted-foreground mb-6 text-sm">
                {searchQuery
                  ? "Try a different keyword."
                  : "Create your first course to start building curriculum."}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => {
                    setCourseForm(BLANK_COURSE);
                    setShowCreate(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Create First Course
                </Button>
              )}
            </Card>
          ) : (
            <motion.div
              variants={item}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filtered.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  submitting={submitting}
                  onOpenCurriculum={() => openCurriculum(course)}
                  onEdit={() => openEditCourse(course)}
                  onDelete={() => confirmDeleteCourse(course._id)}
                  onStatusChange={(s) => handleStatusChange(course, s)}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ════════════════════════════════════
          CURRICULUM BUILDER
      ════════════════════════════════════ */}
      {currentMode === "curriculum" && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Builder Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={closeCurriculum}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <span className="text-xs font-bold text-primary/70 uppercase tracking-widest">
                  Curriculum Editor
                </span>
                <h1 className="text-xl font-bold truncate max-w-lg">
                  {activeCourse?.title}
                </h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  setModuleForm(BLANK_MODULE);
                  setShowAddModule(true);
                }}
              >
                <FolderPlus className="h-4 w-4" /> Add Module
              </Button>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => openAddTopic()}
              >
                <FilePlus className="h-4 w-4" /> Add Lecture
              </Button>
            </div>
          </div>

          {loading && !activeCourse ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sidebar */}
              <div className="space-y-4">
                <Card className="border bg-base-100/60 shadow-md overflow-hidden">
                  <div className="relative h-44">
                    <img
                      src={getImageUrl(activeCourse?.thumbnail)}
                      onError={handleImageError}
                      alt={activeCourse?.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={activeCourse?.status} />
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base">Course Info</h3>
                      <Button
                        size="xs"
                        variant="outline"
                        className="gap-1"
                        onClick={() => openEditCourse(activeCourse)}
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      {[
                        ["Category", activeCourse?.category || "—"],
                        ["Difficulty", activeCourse?.difficulty],
                        [
                          "Duration",
                          activeCourse?.duration
                            ? `${activeCourse.duration} min`
                            : "—",
                        ],
                        ["Modules", activeCourse?.modules?.length ?? 0],
                        ["Price", `$${activeCourse?.price ?? 0}`],
                      ].map(([k, v]) => (
                        <div
                          key={k}
                          className="flex justify-between text-muted-foreground"
                        >
                          <span>{k}</span>
                          <span className="font-medium text-foreground capitalize">
                            {v}
                          </span>
                        </div>
                      ))}
                    </div>
                    {activeCourse?.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {activeCourse.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Modules */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="font-bold text-xl flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Curriculum
                </h2>
                {!activeCourse?.modules?.length ? (
                  <div className="p-14 text-center border-2 border-dashed rounded-2xl bg-base-100/30">
                    <FolderPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="font-semibold text-muted-foreground mb-1">
                      No modules yet
                    </p>
                    <p className="text-sm text-muted-foreground/70 mb-5">
                      Modules group related lectures into sections.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setModuleForm(BLANK_MODULE);
                        setShowAddModule(true);
                      }}
                    >
                      <FolderPlus className="h-4 w-4 mr-1.5" /> Add First Module
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeCourse.modules.map((mod) => (
                      <div
                        key={mod._id}
                        className="border border-base-300 rounded-2xl overflow-hidden bg-base-100 shadow-sm"
                      >
                        {/* Module Header */}
                        <div className="flex items-center justify-between p-4 bg-base-200/60 border-b">
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                              Module #{mod.order ?? 0}
                            </p>
                            <h3 className="font-bold">{mod.title}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="xs"
                              variant="outline"
                              className="gap-1"
                              onClick={() => openAddTopic(mod._id)}
                            >
                              <FilePlus className="h-3 w-3" /> Lecture
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => openEditModule(mod)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="xs"
                              variant="destructive"
                              onClick={() => confirmDeleteModule(mod._id)}
                              disabled={submitting}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Topics */}
                        <div className="divide-y divide-base-200">
                          {!mod.topics?.length ? (
                            <div className="p-4 text-center text-sm text-muted-foreground/70">
                              No lectures yet — add the first one.
                            </div>
                          ) : (
                            mod.topics.map((topic) => (
                              <div
                                key={topic._id}
                                className="flex items-center justify-between px-4 py-3 hover:bg-base-200/30 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                    <Play className="h-3.5 w-3.5 fill-current" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {topic.title}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {topic.duration} min
                                      </span>
                                      {topic.videoUrl && (
                                        <span className="flex items-center gap-1 text-blue-500 font-semibold">
                                          <ExternalLink className="h-3 w-3" />{" "}
                                          Video
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1.5">
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={() =>
                                      openEditTopic(topic, mod._id)
                                    }
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    className="text-error hover:bg-error/10"
                                    onClick={() =>
                                      confirmDeleteTopic(topic._id)
                                    }
                                    disabled={submitting}
                                  >
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

      {/* ════ MODALS ════ */}

      {/* Create Course */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create New Course"
        size="2xl"
        noPadding
      >
        <form
          onSubmit={handleCreateCourse}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <CourseFormFields form={courseForm} onChange={patchCourse} />
          </div>
          <div className="flex gap-3 justify-end p-6 border-t bg-card sticky bottom-0 shrink-0 z-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="gap-2 min-w-[130px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Create Course
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Course */}
      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Course"
        size="2xl"
        noPadding
      >
        <form
          onSubmit={handleUpdateCourse}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <CourseFormFields
              form={courseForm}
              onChange={patchCourse}
              showStatus
            />
          </div>
          <div className="flex gap-3 justify-end p-6 border-t bg-card sticky bottom-0 shrink-0 z-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEdit(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="gap-2 min-w-[130px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Module */}
      <Modal
        isOpen={showAddModule}
        onClose={() => setShowAddModule(false)}
        title="Add Module"
        noPadding
      >
        <form
          onSubmit={handleCreateModule}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <Input
              label="Module Title *"
              placeholder="e.g. Introduction & Setup"
              value={moduleForm.title}
              onChange={(e) => patchModule({ title: e.target.value })}
              required
            />
            <Input
              label="Sort Order"
              type="number"
              min="0"
              placeholder="0"
              value={moduleForm.order}
              onChange={(e) => patchModule({ order: e.target.value })}
            />
          </div>
          <div className="flex gap-3 justify-end p-6 border-t bg-card sticky bottom-0 shrink-0 z-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModule(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FolderPlus className="h-4 w-4" />
              )}
              {submitting ? "Adding..." : "Add Module"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Module */}
      <Modal
        isOpen={showEditModule}
        onClose={() => setShowEditModule(false)}
        title="Edit Module"
        noPadding
      >
        <form
          onSubmit={handleUpdateModule}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <Input
              label="Module Title *"
              placeholder="e.g. Introduction & Setup"
              value={moduleForm.title}
              onChange={(e) => patchModule({ title: e.target.value })}
              required
            />
            <Input
              label="Sort Order"
              type="number"
              min="0"
              placeholder="0"
              value={moduleForm.order}
              onChange={(e) => patchModule({ order: e.target.value })}
            />
          </div>
          <div className="flex gap-3 justify-end p-6 border-t bg-card sticky bottom-0 shrink-0 z-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModule(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {submitting ? "Saving..." : "Save Module"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Topic */}
      <Modal
        isOpen={showAddTopic}
        onClose={() => setShowAddTopic(false)}
        title="Add Lecture / Topic"
        size="2xl"
        noPadding
      >
        <form
          onSubmit={handleCreateTopic}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <TopicFormFields
              form={topicForm}
              modules={activeCourse?.modules || []}
              onChange={patchTopic}
            />
          </div>
          <div className="flex gap-3 justify-end p-6 border-t bg-card sticky bottom-0 shrink-0 z-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddTopic(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FilePlus className="h-4 w-4" />
              )}
              {submitting ? "Adding..." : "Add Lecture"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Topic */}
      <Modal
        isOpen={showEditTopic}
        onClose={() => setShowEditTopic(false)}
        title="Edit Lecture / Topic"
        size="2xl"
        noPadding
      >
        <form
          onSubmit={handleUpdateTopic}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <TopicFormFields
              form={topicForm}
              modules={activeCourse?.modules || []}
              onChange={patchTopic}
            />
          </div>
          <div className="flex gap-3 justify-end p-6 border-t bg-card sticky bottom-0 shrink-0 z-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditTopic(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {submitting ? "Saving..." : "Save Lecture"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    published: { label: "Published", cls: "bg-success text-white" },
    draft: { label: "Draft", cls: "bg-warning text-white" },
    archived: { label: "Archived", cls: "bg-base-400 text-white" },
  };
  const cfg = map[status] || map.draft;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COURSE CARD
// ─────────────────────────────────────────────────────────────────────────────
function CourseCard({
  course,
  submitting,
  onOpenCurriculum,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const modulesCount = course.modules?.length || 0;
  const topicsCount =
    course.modules?.reduce((acc, m) => acc + (m.topics?.length || 0), 0) || 0;
  const studentsCount = course.students?.length || 0;
  const totalDuration = course.duration
    ? course.duration >= 60
      ? `${(course.duration / 60).toFixed(1)} hrs`
      : `${course.duration} min`
    : null;

  return (
    <motion.div variants={item}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border border-base-300 bg-base-100">
        {/* Thumbnail */}
        <div className="relative h-48 overflow-hidden bg-base-300">
          <img
            src={getImageUrl(course.thumbnail)}
            onError={handleImageError}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute top-3 right-3">
            <StatusBadge status={course.status} />
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            {course.category && (
              <Badge variant="secondary" className="mb-1.5 capitalize text-xs">
                {course.category}
              </Badge>
            )}
            <h3 className="text-lg font-bold text-white truncate leading-snug">
              {course.title}
            </h3>
          </div>
        </div>

        <CardContent className="p-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center text-sm text-muted-foreground mb-4 pb-4 border-b border-base-200">
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-bold text-foreground text-base">
                {studentsCount}
              </span>
              <span className="text-xs">Students</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 border-x border-base-200">
              <span className="font-bold text-foreground text-base">
                {modulesCount}
              </span>
              <span className="text-xs">Modules</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-bold text-foreground text-base">
                {topicsCount}
              </span>
              <span className="text-xs">Lectures</span>
            </div>
          </div>

          {/* Price + Duration */}
          <div className="flex items-center gap-3 mb-4 text-sm">
            <span className="text-xl font-extrabold text-success">
              ${course.price ?? 0}
            </span>
            <span className="text-muted-foreground capitalize">
              · {course.difficulty}
            </span>
            {totalDuration && (
              <span className="text-muted-foreground ml-auto flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {totalDuration}
              </span>
            )}
          </div>

          {/* Tags */}
          {course.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {course.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[10px] font-semibold border border-primary/15"
                >
                  #{t}
                </span>
              ))}
              {course.tags.length > 4 && (
                <span className="text-[10px] text-muted-foreground">
                  +{course.tags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5 text-xs"
              onClick={onOpenCurriculum}
            >
              <Edit className="h-3.5 w-3.5" /> Curriculum
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl border border-base-300"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-base-100 border border-base-300 rounded-2xl shadow-xl min-w-[180px]"
              >
                <DropdownMenuItem onClick={onEdit} className="gap-2">
                  <Edit className="h-4 w-4" /> Edit Course
                </DropdownMenuItem>
                {course.status !== "published" && (
                  <DropdownMenuItem
                    onClick={() => onStatusChange("published")}
                    className="text-success font-semibold gap-2"
                  >
                    <Globe className="h-4 w-4" /> Publish
                  </DropdownMenuItem>
                )}
                {course.status !== "draft" && (
                  <DropdownMenuItem
                    onClick={() => onStatusChange("draft")}
                    className="text-warning font-semibold gap-2"
                  >
                    <Lock className="h-4 w-4" /> Move to Draft
                  </DropdownMenuItem>
                )}
                {course.status !== "archived" && (
                  <DropdownMenuItem
                    onClick={() => onStatusChange("archived")}
                    className="text-muted-foreground gap-2"
                  >
                    <Archive className="h-4 w-4" /> Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive font-semibold gap-2"
                  onClick={onDelete}
                  disabled={submitting}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

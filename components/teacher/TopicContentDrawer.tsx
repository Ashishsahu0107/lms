"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  FileText,
  HelpCircle,
  ClipboardList,
  Video,
  Paperclip,
  Plus,
  Trash2,
  ExternalLink,
  Upload,
  Link as LinkIcon,
  Check,
  ChevronUp,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  Play,
  Pencil,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  FileCode,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { API_URL } from "@/lib/api-config";

export type DrawerTab =
  | "overview"
  | "docs"
  | "quiz"
  | "assignments"
  | "videos"
  | "resources";

export interface QuestionData {
  id?: string;
  type?: string;
  question: string;
  options: string[];
  correctAnswer: string[];
  explanation?: string;
  marks: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface QuizData {
  id?: string;
  title: string;
  description?: string;
  instructions?: string;
  duration?: number;
  totalMarks?: number;
  passingMarks?: number;
  status: "published" | "draft";
  questions?: QuestionData[];
}

export interface AssignmentData {
  id?: string;
  title: string;
  description?: string;
  instructions?: string;
  dueDate?: string | null;
  totalMarks?: number;
  assignmentType?: "written" | "file" | "both";
  attachments?: string[];
  status: "published" | "draft";
}

export interface ResourceData {
  id?: string;
  title: string;
  fileUrl: string;
  resourceType: string;
  description?: string;
}

interface TopicContentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  topic: any;
  classNameTitle?: string;
  courseId: string;
  moduleId: string;
  initialTab?: DrawerTab;
  onTopicUpdated: (updatedTopic: any) => void;
  onRefreshCourse: () => void;
}

export default function TopicContentDrawer({
  isOpen,
  onClose,
  topic,
  classNameTitle = "Class",
  courseId,
  moduleId,
  initialTab = "overview",
  onTopicUpdated,
  onRefreshCourse,
}: TopicContentDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>(initialTab);

  // Synchronize initial tab when drawer opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Topic resources, quizzes, and assignments state
  const [resources, setResources] = useState<ResourceData[]>([]);
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Uploading state
  const [uploadingFile, setUploadingFile] = useState(false);

  // ── DOCS STATE
  const [showDocForm, setShowDocForm] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docFileUrl, setDocFileUrl] = useState("");
  const [docMode, setDocMode] = useState<"upload" | "url">("upload");
  const [docDescription, setDocDescription] = useState("");
  const [savingDoc, setSavingDoc] = useState(false);

  // ── VIDEO STATE
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [videoDurationInput, setVideoDurationInput] = useState<number>(10);
  const [savingVideo, setSavingVideo] = useState(false);

  // ── QUIZ STATE
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizDuration, setQuizDuration] = useState(30);
  const [quizTotalMarks, setQuizTotalMarks] = useState(20);
  const [quizPassingMarks, setQuizPassingMarks] = useState(10);
  const [quizStatus, setQuizStatus] = useState<"published" | "draft">("published");
  const [quizQuestions, setQuizQuestions] = useState<QuestionData[]>([]);

  // Individual Question Editor
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [currentOptions, setCurrentOptions] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);
  const [currentCorrectOptionIdx, setCurrentCorrectOptionIdx] = useState<number>(0);
  const [currentQuestionMarks, setCurrentQuestionMarks] = useState(5);
  const [currentQuestionDifficulty, setCurrentQuestionDifficulty] =
    useState<"easy" | "medium" | "hard">("medium");
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number | null>(null);
  const [savingQuiz, setSavingQuiz] = useState(false);

  // ── ASSIGNMENT STATE
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDesc, setAssignmentDesc] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentMarks, setAssignmentMarks] = useState(100);
  const [assignmentType, setAssignmentType] = useState<"written" | "file" | "both">("file");
  const [assignmentAttachmentUrl, setAssignmentAttachmentUrl] = useState("");
  const [assignmentStatus, setAssignmentStatus] = useState<"published" | "draft">("published");
  const [savingAssignment, setSavingAssignment] = useState(false);

  // ── RESOURCES STATE
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceFileUrl, setResourceFileUrl] = useState("");
  const [resourceType, setResourceType] = useState("link");
  const [resourceDescription, setResourceDescription] = useState("");
  const [savingResource, setSavingResource] = useState(false);

  // Delete Confirm Dialog state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "resource" | "quiz" | "assignment" | "video";
    id?: string;
    title: string;
  } | null>(null);

  // Load topic specific items (resources, quizzes, assignments)
  const fetchTopicContent = useCallback(async () => {
    if (!topic?.id) return;
    setLoadingData(true);
    const token = localStorage.getItem("token") || "";

    try {
      // 1. Fetch resources
      const resPromise = fetch(`${API_URL}/topics/${topic.id}/resources`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then((r) => r.json());

      // 2. Fetch quizzes for topic
      const quizPromise = fetch(`${API_URL}/quizzes?topicId=${topic.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then((r) => r.json());

      // 3. Fetch assignments for topic
      const assignPromise = fetch(`${API_URL}/assignments?topicId=${topic.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then((r) => r.json());

      const [resData, quizData, assignData] = await Promise.all([
        resPromise,
        quizPromise,
        assignPromise,
      ]);

      if (resData.success) {
        setResources(resData.data.resources || []);
      }
      if (quizData.success) {
        setQuizzes(quizData.data.quizzes || []);
      }
      if (assignData.success) {
        setAssignments(assignData.data.assignments || []);
      }
    } catch (err) {
      console.error("Failed to load topic content:", err);
    } finally {
      setLoadingData(false);
    }
  }, [topic?.id]);

  useEffect(() => {
    if (isOpen && topic?.id) {
      fetchTopicContent();
      setVideoUrlInput(topic.videoUrl || "");
      setVideoDurationInput(topic.duration || 10);
    }
  }, [isOpen, topic?.id, fetchTopicContent]);

  if (!isOpen || !topic) return null;

  // ── FILE UPLOAD HELPER
  const handleUploadFile = async (
    file: File,
    folder: "documents" | "videos" = "documents"
  ): Promise<string | null> => {
    const token = localStorage.getItem("token") || "";
    setUploadingFile(true);
    const toastId = toast.loading(`Uploading ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch(`${API_URL}/uploads`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Upload failed");
      }

      toast.success("File uploaded successfully", { id: toastId });
      return data.data.url;
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  // ── SAVE VIDEO HANDLER
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token") || "";
    setSavingVideo(true);

    try {
      const res = await fetch(`${API_URL}/topics/${topic.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          videoUrl: videoUrlInput.trim(),
          duration: Number(videoDurationInput) || 10,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update video");
      }

      toast.success("Video updated successfully");
      const updated = {
        ...topic,
        videoUrl: videoUrlInput.trim(),
        duration: Number(videoDurationInput) || 10,
      };
      onTopicUpdated(updated);
      onRefreshCourse();
    } catch (err: any) {
      toast.error(err.message || "Could not save video");
    } finally {
      setSavingVideo(false);
    }
  };

  const handleRemoveVideo = async () => {
    const token = localStorage.getItem("token") || "";
    setSavingVideo(true);

    try {
      const res = await fetch(`${API_URL}/topics/${topic.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ videoUrl: "" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      toast.success("Video removed");
      setVideoUrlInput("");
      const updated = { ...topic, videoUrl: "" };
      onTopicUpdated(updated);
      onRefreshCourse();
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove video");
    } finally {
      setSavingVideo(false);
    }
  };

  // ── SAVE DOC / PDF HANDLER
  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docFileUrl.trim()) {
      toast.error("Please provide title and file / URL");
      return;
    }

    const token = localStorage.getItem("token") || "";
    setSavingDoc(true);

    try {
      const res = await fetch(`${API_URL}/topics/${topic.id}/resources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: docTitle.trim(),
          fileUrl: docFileUrl.trim(),
          resourceType: "pdf",
          description: docDescription.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      toast.success("Document added successfully");
      setDocTitle("");
      setDocFileUrl("");
      setDocDescription("");
      setShowDocForm(false);
      fetchTopicContent();
      onRefreshCourse();
    } catch (err: any) {
      toast.error(err.message || "Failed to add document");
    } finally {
      setSavingDoc(false);
    }
  };

  // ── DELETE RESOURCE / DOC HANDLER
  const handleDeleteResource = async (resourceId: string) => {
    const token = localStorage.getItem("token") || "";
    try {
      const res = await fetch(
        `${API_URL}/topics/${topic.id}/resources/${resourceId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      toast.success("Item deleted");
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
      setDeleteConfirm(null);
      onRefreshCourse();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item");
    }
  };

  // ── QUIZ QUESTIONS BUILDER HELPERS
  const handleAddQuestion = () => {
    if (!currentQuestionText.trim()) {
      toast.error("Please enter question text");
      return;
    }
    const filteredOptions = currentOptions.map((o) => o.trim());
    if (filteredOptions.some((o) => !o)) {
      toast.error("Please provide all 4 options");
      return;
    }

    const newQ: QuestionData = {
      question: currentQuestionText.trim(),
      options: filteredOptions,
      correctAnswer: [filteredOptions[currentCorrectOptionIdx]],
      marks: currentQuestionMarks,
      difficulty: currentQuestionDifficulty,
    };

    if (editingQuestionIdx !== null) {
      setQuizQuestions((prev) => {
        const copy = [...prev];
        copy[editingQuestionIdx] = newQ;
        return copy;
      });
      setEditingQuestionIdx(null);
      toast.success("Question updated");
    } else {
      setQuizQuestions((prev) => [...prev, newQ]);
      toast.success("Question added");
    }

    // Reset question inputs
    setCurrentQuestionText("");
    setCurrentOptions(["", "", "", ""]);
    setCurrentCorrectOptionIdx(0);
    setCurrentQuestionMarks(5);
  };

  const handleEditQuestion = (idx: number) => {
    const q = quizQuestions[idx];
    setCurrentQuestionText(q.question);
    setCurrentOptions([...q.options]);
    const correctIdx = q.options.findIndex((opt) => q.correctAnswer?.includes(opt));
    setCurrentCorrectOptionIdx(correctIdx >= 0 ? correctIdx : 0);
    setCurrentQuestionMarks(q.marks || 5);
    setCurrentQuestionDifficulty(q.difficulty || "medium");
    setEditingQuestionIdx(idx);
  };

  const handleDeleteQuestion = (idx: number) => {
    setQuizQuestions((prev) => prev.filter((_, i) => i !== idx));
    if (editingQuestionIdx === idx) {
      setEditingQuestionIdx(null);
      setCurrentQuestionText("");
      setCurrentOptions(["", "", "", ""]);
    }
  };

  const handleReorderQuestion = (idx: number, direction: -1 | 1) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= quizQuestions.length) return;
    setQuizQuestions((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[newIdx];
      copy[newIdx] = temp;
      return copy;
    });
  };

  // ── SAVE QUIZ HANDLER
  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) {
      toast.error("Please enter quiz title");
      return;
    }
    if (quizQuestions.length === 0) {
      toast.error("Please add at least 1 question to the quiz");
      return;
    }

    const token = localStorage.getItem("token") || "";
    setSavingQuiz(true);

    try {
      const totalMarksCalculated = quizQuestions.reduce(
        (sum, q) => sum + (Number(q.marks) || 5),
        0
      );

      const payload = {
        title: quizTitle.trim(),
        description: quizDescription.trim(),
        courseId,
        moduleId,
        topicId: topic.id,
        duration: Number(quizDuration) || 30,
        totalMarks: totalMarksCalculated || Number(quizTotalMarks) || 20,
        passingMarks: Number(quizPassingMarks) || 10,
        status: quizStatus,
        questions: quizQuestions,
      };

      const url = editingQuizId
        ? `${API_URL}/quizzes/${editingQuizId}`
        : `${API_URL}/quizzes`;
      const method = editingQuizId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      toast.success(editingQuizId ? "Quiz updated" : "Quiz created successfully");
      setShowQuizForm(false);
      setEditingQuizId(null);
      setQuizTitle("");
      setQuizDescription("");
      setQuizQuestions([]);
      fetchTopicContent();
      onRefreshCourse();
    } catch (err: any) {
      toast.error(err.message || "Failed to save quiz");
    } finally {
      setSavingQuiz(false);
    }
  };

  const openEditQuiz = (q: any) => {
    setEditingQuizId(q.id);
    setQuizTitle(q.title || "");
    setQuizDescription(q.description || "");
    setQuizDuration(q.duration || 30);
    setQuizTotalMarks(q.totalMarks || 20);
    setQuizPassingMarks(q.passingMarks || 10);
    setQuizStatus(q.status || "published");
    setQuizQuestions(
      (q.questions || []).map((quest: any) => ({
        id: quest.id,
        question: quest.question,
        options: quest.options || [],
        correctAnswer: quest.correctAnswer || [],
        marks: quest.marks || 5,
        difficulty: quest.difficulty || "medium",
      }))
    );
    setShowQuizForm(true);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    const token = localStorage.getItem("token") || "";
    try {
      const res = await fetch(`${API_URL}/quizzes/${quizId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      toast.success("Quiz deleted");
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      setDeleteConfirm(null);
      onRefreshCourse();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete quiz");
    }
  };

  // ── SAVE ASSIGNMENT HANDLER
  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentTitle.trim()) {
      toast.error("Please enter assignment title");
      return;
    }

    const token = localStorage.getItem("token") || "";
    setSavingAssignment(true);

    try {
      const payload = {
        title: assignmentTitle.trim(),
        description: assignmentDesc.trim(),
        courseId,
        moduleId,
        topicId: topic.id,
        dueDate: assignmentDueDate ? new Date(assignmentDueDate).toISOString() : null,
        totalMarks: Number(assignmentMarks) || 100,
        assignmentType,
        attachments: assignmentAttachmentUrl ? [assignmentAttachmentUrl] : [],
        status: assignmentStatus,
      };

      const url = editingAssignmentId
        ? `${API_URL}/assignments/${editingAssignmentId}`
        : `${API_URL}/assignments`;
      const method = editingAssignmentId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      toast.success(
        editingAssignmentId ? "Assignment updated" : "Assignment created"
      );
      setShowAssignmentForm(false);
      setEditingAssignmentId(null);
      setAssignmentTitle("");
      setAssignmentDesc("");
      setAssignmentDueDate("");
      setAssignmentAttachmentUrl("");
      fetchTopicContent();
      onRefreshCourse();
    } catch (err: any) {
      toast.error(err.message || "Failed to save assignment");
    } finally {
      setSavingAssignment(false);
    }
  };

  const openEditAssignment = (a: any) => {
    setEditingAssignmentId(a.id);
    setAssignmentTitle(a.title || "");
    setAssignmentDesc(a.description || a.instructions || "");
    setAssignmentDueDate(
      a.dueDate ? new Date(a.dueDate).toISOString().slice(0, 16) : ""
    );
    setAssignmentMarks(a.totalMarks || 100);
    setAssignmentType(a.assignmentType || "file");
    setAssignmentAttachmentUrl(a.attachments?.[0] || "");
    setAssignmentStatus(a.status || "published");
    setShowAssignmentForm(true);
  };

  const handleDeleteAssignment = async (assignId: string) => {
    const token = localStorage.getItem("token") || "";
    try {
      const res = await fetch(`${API_URL}/assignments/${assignId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      toast.success("Assignment deleted");
      setAssignments((prev) => prev.filter((a) => a.id !== assignId));
      setDeleteConfirm(null);
      onRefreshCourse();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete assignment");
    }
  };

  // ── SAVE RESOURCE HANDLER
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim() || !resourceFileUrl.trim()) {
      toast.error("Please provide title and file or link URL");
      return;
    }

    const token = localStorage.getItem("token") || "";
    setSavingResource(true);

    try {
      const payload = {
        title: resourceTitle.trim(),
        fileUrl: resourceFileUrl.trim(),
        resourceType,
        description: resourceDescription.trim(),
      };

      const url = editingResourceId
        ? `${API_URL}/topics/${topic.id}/resources/${editingResourceId}`
        : `${API_URL}/topics/${topic.id}/resources`;
      const method = editingResourceId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      toast.success(editingResourceId ? "Resource updated" : "Resource added");
      setShowResourceForm(false);
      setEditingResourceId(null);
      setResourceTitle("");
      setResourceFileUrl("");
      setResourceDescription("");
      fetchTopicContent();
      onRefreshCourse();
    } catch (err: any) {
      toast.error(err.message || "Failed to save resource");
    } finally {
      setSavingResource(false);
    }
  };

  const openEditResource = (r: ResourceData) => {
    setEditingResourceId(r.id || null);
    setResourceTitle(r.title);
    setResourceFileUrl(r.fileUrl);
    setResourceType(r.resourceType || "link");
    setResourceDescription(r.description || "");
    setShowResourceForm(true);
  };

  // Helper for YouTube embed
  const getEmbedVideoUrl = (url: string) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      const id = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("vimeo.com/")) {
      const id = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  };

  // Counts for Badges
  const docCount = resources.filter(
    (r) => r.resourceType === "pdf" || r.resourceType === "doc"
  ).length;
  const quizCount = quizzes.length;
  const assignmentCount = assignments.length;
  const hasVideo = Boolean(topic.videoUrl);
  const resourceCount = resources.filter(
    (r) => r.resourceType !== "pdf" && r.resourceType !== "doc"
  ).length;

  return (
    <>
      {/* ── BACKDROP OVERLAY */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[990] bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* ── RIGHT-SIDE SLIDING DRAWER */}
      <div className="fixed inset-y-0 right-0 z-[1000] flex w-full max-w-2xl flex-col border-l border-base-300 bg-base-100 shadow-2xl animate-in slide-in-from-right duration-300 text-base-content overflow-hidden">
        {/* ── DRAWER HEADER */}
        <div className="flex items-center justify-between border-b border-base-300 px-6 py-4 bg-base-200/50">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {classNameTitle}
              </span>
              <span className="text-xs text-base-content/40 font-mono">
                Topic #{topic.order || 1}
              </span>
            </div>
            <h2 className="text-lg font-bold text-base-content truncate font-display">
              {topic.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-base-content/50 hover:text-base-content hover:bg-base-200 transition-colors"
            title="Close Drawer (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── TABS NAVIGATION BAR */}
        <div className="flex items-center border-b border-base-300 px-4 bg-base-100 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-base-content/60 hover:text-base-content"
            }`}
          >
            <Sparkles size={14} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("docs")}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "docs"
                ? "border-info text-info"
                : "border-transparent text-base-content/60 hover:text-base-content"
            }`}
          >
            <FileText size={14} className={activeTab === "docs" ? "text-info" : ""} />
            <span>Docs</span>
            {docCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-info/15 text-info font-bold">
                {docCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "quiz"
                ? "border-warning text-warning"
                : "border-transparent text-base-content/60 hover:text-base-content"
            }`}
          >
            <HelpCircle size={14} className={activeTab === "quiz" ? "text-warning" : ""} />
            <span>Quiz</span>
            {quizCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-warning/15 text-warning font-bold">
                {quizCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("assignments")}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "assignments"
                ? "border-secondary text-secondary"
                : "border-transparent text-base-content/60 hover:text-base-content"
            }`}
          >
            <ClipboardList size={14} className={activeTab === "assignments" ? "text-secondary" : ""} />
            <span>Assignments</span>
            {assignmentCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-secondary/15 text-secondary font-bold">
                {assignmentCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("videos")}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "videos"
                ? "border-primary text-primary"
                : "border-transparent text-base-content/60 hover:text-base-content"
            }`}
          >
            <Video size={14} className={activeTab === "videos" ? "text-primary" : ""} />
            <span>Video</span>
            {hasVideo && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-primary/15 text-primary font-bold">
                1
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("resources")}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "resources"
                ? "border-emerald-500 text-emerald-500"
                : "border-transparent text-base-content/60 hover:text-base-content"
            }`}
          >
            <Paperclip size={14} className={activeTab === "resources" ? "text-emerald-500" : ""} />
            <span>Resources</span>
            {resourceCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/15 text-emerald-500 font-bold">
                {resourceCount}
              </span>
            )}
          </button>
        </div>

        {/* ── TAB CONTENT SCROLLABLE CONTAINER */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ═════════════════════════════════════════════ */}
          {/* 1. OVERVIEW TAB */}
          {/* ═════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-5">
                <h3 className="text-sm font-bold text-base-content mb-1">
                  Topic Content Summary
                </h3>
                <p className="text-xs text-base-content/60">
                  Manage independent learning materials, assessments, videos, and
                  handouts attached to this topic.
                </p>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("docs")}
                    className="flex flex-col items-start p-3 rounded-xl bg-base-100 border border-base-300 hover:border-info/40 hover:bg-info/5 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <FileText size={18} className="text-info" />
                      <span className="text-xs font-bold text-base-content">
                        {docCount}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-base-content group-hover:text-info">
                      Documents / PDF
                    </span>
                    <span className="text-[11px] text-base-content/50">
                      {docCount ? `${docCount} attached` : "None"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("quiz")}
                    className="flex flex-col items-start p-3 rounded-xl bg-base-100 border border-base-300 hover:border-warning/40 hover:bg-warning/5 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <HelpCircle size={18} className="text-warning" />
                      <span className="text-xs font-bold text-base-content">
                        {quizCount}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-base-content group-hover:text-warning">
                      Quizzes
                    </span>
                    <span className="text-[11px] text-base-content/50">
                      {quizCount ? `${quizCount} created` : "None"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("assignments")}
                    className="flex flex-col items-start p-3 rounded-xl bg-base-100 border border-base-300 hover:border-secondary/40 hover:bg-secondary/5 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <ClipboardList size={18} className="text-secondary" />
                      <span className="text-xs font-bold text-base-content">
                        {assignmentCount}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-base-content group-hover:text-secondary">
                      Assignments
                    </span>
                    <span className="text-[11px] text-base-content/50">
                      {assignmentCount ? `${assignmentCount} assigned` : "None"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("videos")}
                    className="flex flex-col items-start p-3 rounded-xl bg-base-100 border border-base-300 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <Video size={18} className="text-primary" />
                      <span className="text-xs font-bold text-base-content">
                        {hasVideo ? "1" : "0"}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-base-content group-hover:text-primary">
                      Video Lecture
                    </span>
                    <span className="text-[11px] text-base-content/50">
                      {hasVideo ? "Configured" : "None"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("resources")}
                    className="flex flex-col items-start p-3 rounded-xl bg-base-100 border border-base-300 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <Paperclip size={18} className="text-emerald-500" />
                      <span className="text-xs font-bold text-base-content">
                        {resourceCount}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-base-content group-hover:text-emerald-500">
                      Resources
                    </span>
                    <span className="text-[11px] text-base-content/50">
                      {resourceCount ? `${resourceCount} links/files` : "None"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-3">
                  Quick Actions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setActiveTab("docs");
                      setShowDocForm(true);
                    }}
                    className="justify-start gap-2 h-auto py-2.5"
                  >
                    <Plus size={15} className="text-info" />
                    <span>Upload Document / PDF</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setActiveTab("quiz");
                      setShowQuizForm(true);
                    }}
                    className="justify-start gap-2 h-auto py-2.5"
                  >
                    <Plus size={15} className="text-warning" />
                    <span>Create New Quiz</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setActiveTab("assignments");
                      setShowAssignmentForm(true);
                    }}
                    className="justify-start gap-2 h-auto py-2.5"
                  >
                    <Plus size={15} className="text-secondary" />
                    <span>New Assignment</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("videos")}
                    className="justify-start gap-2 h-auto py-2.5"
                  >
                    <Video size={15} className="text-primary" />
                    <span>Set / Change Video</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════ */}
          {/* 2. DOCS TAB */}
          {/* ═════════════════════════════════════════════ */}
          {activeTab === "docs" && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-base-content">
                    Topic Documents & Handouts
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Upload PDF notes, slides, or link documentation for this topic.
                  </p>
                </div>
                {!showDocForm && (
                  <Button
                    size="sm"
                    onClick={() => setShowDocForm(true)}
                    className="gap-1.5"
                  >
                    <Plus size={14} /> Add Document
                  </Button>
                )}
              </div>

              {/* Add Doc Form */}
              {showDocForm && (
                <form
                  onSubmit={handleSaveDoc}
                  className="rounded-2xl border border-info/30 bg-base-200/50 p-4 space-y-4 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-info">
                      Add New Document
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowDocForm(false)}
                      className="text-base-content/50 hover:text-base-content p-1"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-base-content/80 mb-1">
                      Document Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lecture Notes PDF / Chapter Summary"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-info focus:outline-none"
                    />
                  </div>

                  {/* Mode Selector */}
                  <div>
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setDocMode("upload")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          docMode === "upload"
                            ? "bg-info/15 text-info border-info/40"
                            : "bg-base-100 text-base-content/60 border-base-300"
                        }`}
                      >
                        Upload PDF / File
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocMode("url")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          docMode === "url"
                            ? "bg-info/15 text-info border-info/40"
                            : "bg-base-100 text-base-content/60 border-base-300"
                        }`}
                      >
                        Direct URL / Link
                      </button>
                    </div>

                    {docMode === "upload" ? (
                      <div className="space-y-2">
                        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-base-300 hover:border-info/50 rounded-xl bg-base-100 cursor-pointer transition-colors">
                          <Upload size={22} className="text-info mb-1" />
                          <span className="text-xs font-semibold text-base-content">
                            {uploadingFile ? "Uploading..." : "Click to select PDF or Doc"}
                          </span>
                          <span className="text-[10px] text-base-content/40 mt-0.5">
                            PDF, DOC, DOCX up to 50MB
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            disabled={uploadingFile}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (!docTitle) setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
                                const url = await handleUploadFile(file, "documents");
                                if (url) setDocFileUrl(url);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        {docFileUrl && (
                          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-base-100 border border-base-300 text-xs">
                            <span className="truncate text-info font-mono">
                              {docFileUrl}
                            </span>
                            <Check size={14} className="text-success shrink-0" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="url"
                        required
                        placeholder="https://example.com/document.pdf"
                        value={docFileUrl}
                        onChange={(e) => setDocFileUrl(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-info focus:outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-base-content/80 mb-1">
                      Notes / Description (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief notes about this document..."
                      value={docDescription}
                      onChange={(e) => setDocDescription(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-info focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowDocForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={savingDoc}
                      disabled={!docFileUrl.trim() || !docTitle.trim()}
                    >
                      Save Document
                    </Button>
                  </div>
                </form>
              )}

              {/* List of Documents */}
              {resources.filter(
                (r) => r.resourceType === "pdf" || r.resourceType === "doc"
              ).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/20 p-8 text-center">
                  <FileText size={32} className="mx-auto text-base-content/30 mb-2" />
                  <p className="text-sm font-semibold text-base-content">
                    No Documents Added
                  </p>
                  <p className="text-xs text-base-content/50 mt-1">
                    Upload a PDF or add a documentation URL for this topic.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDocForm(true)}
                    className="mt-3 gap-1.5"
                  >
                    <Plus size={14} /> Add First Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {resources
                    .filter((r) => r.resourceType === "pdf" || r.resourceType === "doc")
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-base-300 bg-base-100 hover:border-info/30 transition-all shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-info/10 text-info shrink-0">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-base-content truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs text-base-content/50 truncate font-mono">
                              {item.fileUrl}
                            </p>
                            {item.description && (
                              <p className="text-xs text-base-content/70 mt-0.5 line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-base-content/60 hover:text-info hover:bg-info/10 transition-colors"
                            title="Open / Download"
                          >
                            <ExternalLink size={16} />
                          </a>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                type: "resource",
                                id: item.id,
                                title: item.title,
                              })
                            }
                            className="p-1.5 rounded-lg text-base-content/60 hover:text-error hover:bg-error/10 transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════ */}
          {/* 3. QUIZ TAB */}
          {/* ═════════════════════════════════════════════ */}
          {activeTab === "quiz" && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-base-content">
                    Topic Quizzes
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Create questions with 4 options, marks, difficulty, and reordering.
                  </p>
                </div>
                {!showQuizForm && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingQuizId(null);
                      setQuizTitle(`${topic.title} Quiz`);
                      setQuizQuestions([]);
                      setShowQuizForm(true);
                    }}
                    className="gap-1.5"
                  >
                    <Plus size={14} /> Create Quiz
                  </Button>
                )}
              </div>

              {/* Quiz Create / Edit Form */}
              {showQuizForm && (
                <form
                  onSubmit={handleSaveQuiz}
                  className="rounded-2xl border border-warning/30 bg-base-200/50 p-5 space-y-5 animate-fade-in"
                >
                  <div className="flex items-center justify-between border-b border-base-300 pb-2">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-warning">
                      {editingQuizId ? "Edit Quiz" : "Create New Quiz"}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowQuizForm(false)}
                      className="text-base-content/50 hover:text-base-content p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-base-content/80 mb-1">
                        Quiz Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chapter 1 Mastery Quiz"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-warning focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-base-content/80 mb-1">
                        Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={quizDuration}
                        onChange={(e) => setQuizDuration(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-warning focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-base-content/80 mb-1">
                        Passing Marks
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={quizPassingMarks}
                        onChange={(e) => setQuizPassingMarks(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-warning focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-base-content/80 mb-1">
                        Status
                      </label>
                      <select
                        value={quizStatus}
                        onChange={(e) => setQuizStatus(e.target.value as any)}
                        className="w-full px-3.5 py-2 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-warning focus:outline-none"
                      >
                        <option value="published">Published (Visible to Students)</option>
                        <option value="draft">Draft (Hidden)</option>
                      </select>
                    </div>
                  </div>

                  {/* ── QUESTION BUILDER SUB-SECTION */}
                  <div className="pt-2 border-t border-base-300">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-base-content uppercase tracking-wider">
                        Questions ({quizQuestions.length})
                      </span>
                    </div>

                    {/* Question Builder Box */}
                    <div className="p-4 rounded-xl border border-base-300 bg-base-100 space-y-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-base-content/80 mb-1">
                          Question Prompt *
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. What is the output of typeof null in JavaScript?"
                          value={currentQuestionText}
                          onChange={(e) => setCurrentQuestionText(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-base-300 bg-base-200/50 text-sm focus:border-warning focus:outline-none"
                        />
                      </div>

                      {/* 4 Options */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-base-content/80">
                          Options (Choose correct answer radio) *
                        </label>
                        {["A", "B", "C", "D"].map((letter, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <label
                              className="flex items-center gap-1 cursor-pointer shrink-0"
                              title="Mark as correct answer"
                            >
                              <input
                                type="radio"
                                name="correctOption"
                                checked={currentCorrectOptionIdx === idx}
                                onChange={() => setCurrentCorrectOptionIdx(idx)}
                                className="radio radio-warning radio-sm"
                              />
                              <span className="text-xs font-bold w-4">{letter}</span>
                            </label>
                            <input
                              type="text"
                              placeholder={`Option ${letter} text`}
                              value={currentOptions[idx]}
                              onChange={(e) => {
                                const copy = [...currentOptions];
                                copy[idx] = e.target.value;
                                setCurrentOptions(copy);
                              }}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-base-300 bg-base-200/50 text-xs focus:border-warning focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Marks and Difficulty */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-semibold text-base-content/70 mb-1">
                            Marks
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={currentQuestionMarks}
                            onChange={(e) =>
                              setCurrentQuestionMarks(Number(e.target.value))
                            }
                            className="w-full px-3 py-1.5 rounded-lg border border-base-300 bg-base-200/50 text-xs focus:border-warning focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-base-content/70 mb-1">
                            Difficulty
                          </label>
                          <select
                            value={currentQuestionDifficulty}
                            onChange={(e) =>
                              setCurrentQuestionDifficulty(e.target.value as any)
                            }
                            className="w-full px-3 py-1.5 rounded-lg border border-base-300 bg-base-200/50 text-xs focus:border-warning focus:outline-none"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleAddQuestion}
                          className="gap-1 border-warning/40 text-warning hover:bg-warning/10"
                        >
                          <Plus size={14} />
                          {editingQuestionIdx !== null
                            ? "Update Question"
                            : "Add Question to Quiz"}
                        </Button>
                      </div>
                    </div>

                    {/* Added Questions List with Reordering */}
                    {quizQuestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {quizQuestions.map((q, qIdx) => (
                          <div
                            key={qIdx}
                            className="p-3 rounded-xl border border-base-300 bg-base-100 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-warning font-mono">
                                  Q{qIdx + 1}.
                                </span>
                                <span className="font-medium text-base-content truncate">
                                  {q.question}
                                </span>
                                <span className="px-1.5 py-0.2 rounded-md bg-base-200 text-[10px] font-semibold">
                                  {q.marks} pts
                                </span>
                                <span className="px-1.5 py-0.2 rounded-md bg-warning/15 text-warning text-[10px] uppercase font-bold">
                                  {q.difficulty}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-1 text-[11px] text-base-content/70 pl-5">
                                {q.options.map((opt, optIdx) => {
                                  const isCorrect = q.correctAnswer?.includes(opt);
                                  return (
                                    <span
                                      key={optIdx}
                                      className={`truncate ${
                                        isCorrect
                                          ? "text-success font-bold flex items-center gap-1"
                                          : ""
                                      }`}
                                    >
                                      {isCorrect && <Check size={11} />}
                                      {["A", "B", "C", "D"][optIdx]}: {opt}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={qIdx === 0}
                                onClick={() => handleReorderQuestion(qIdx, -1)}
                                className="p-1 rounded text-base-content/40 hover:text-base-content disabled:opacity-20"
                                title="Move Up"
                              >
                                <ChevronUp size={15} />
                              </button>
                              <button
                                type="button"
                                disabled={qIdx === quizQuestions.length - 1}
                                onClick={() => handleReorderQuestion(qIdx, 1)}
                                className="p-1 rounded text-base-content/40 hover:text-base-content disabled:opacity-20"
                                title="Move Down"
                              >
                                <ChevronDown size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditQuestion(qIdx)}
                                className="p-1 rounded text-base-content/40 hover:text-warning"
                                title="Edit Question"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteQuestion(qIdx)}
                                className="p-1 rounded text-base-content/40 hover:text-error"
                                title="Delete Question"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-base-300">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowQuizForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" isLoading={savingQuiz}>
                      <Check size={14} />
                      {editingQuizId ? "Update Quiz" : "Save & Publish Quiz"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Quizzes List */}
              {quizzes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/20 p-8 text-center">
                  <HelpCircle size={32} className="mx-auto text-base-content/30 mb-2" />
                  <p className="text-sm font-semibold text-base-content">
                    No Quizzes for this Topic
                  </p>
                  <p className="text-xs text-base-content/50 mt-1">
                    Add a quiz to assess student comprehension after this topic.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingQuizId(null);
                      setQuizTitle(`${topic.title} Quiz`);
                      setQuizQuestions([]);
                      setShowQuizForm(true);
                    }}
                    className="mt-3 gap-1.5"
                  >
                    <Plus size={14} /> Create First Quiz
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizzes.map((q: any) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl border border-base-300 bg-base-100 hover:border-warning/40 transition-all shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-warning/10 text-warning shrink-0">
                            <HelpCircle size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-base-content truncate">
                                {q.title}
                              </h4>
                              <span
                                className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase ${
                                  q.status === "published"
                                    ? "bg-success/15 text-success"
                                    : "bg-warning/15 text-warning"
                                }`}
                              >
                                {q.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-base-content/60 mt-1">
                              <span>
                                {q.questions?.length || q._count?.questions || 0} Questions
                              </span>
                              <span>•</span>
                              <span>{q.duration || 30} mins</span>
                              <span>•</span>
                              <span>{q.totalMarks || 100} Total Marks</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditQuiz(q)}
                            className="p-1.5 rounded-lg text-base-content/60 hover:text-warning hover:bg-warning/10 transition-colors"
                            title="Edit Quiz"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                type: "quiz",
                                id: q.id,
                                title: q.title,
                              })
                            }
                            className="p-1.5 rounded-lg text-base-content/60 hover:text-error hover:bg-error/10 transition-colors"
                            title="Delete Quiz"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════ */}
          {/* 4. ASSIGNMENTS TAB */}
          {/* ═════════════════════════════════════════════ */}
          {activeTab === "assignments" && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-base-content">
                    Topic Assignments
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Practical tasks, homework, and coding deliverables for this topic.
                  </p>
                </div>
                {!showAssignmentForm && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingAssignmentId(null);
                      setAssignmentTitle(`${topic.title} Assignment`);
                      setAssignmentDesc("");
                      setAssignmentDueDate("");
                      setAssignmentAttachmentUrl("");
                      setShowAssignmentForm(true);
                    }}
                    className="gap-1.5"
                  >
                    <Plus size={14} /> New Assignment
                  </Button>
                )}
              </div>

              {/* Create / Edit Assignment Form */}
              {showAssignmentForm && (
                <form
                  onSubmit={handleSaveAssignment}
                  className="rounded-2xl border border-secondary/30 bg-base-200/50 p-5 space-y-4 animate-fade-in"
                >
                  <div className="flex items-center justify-between border-b border-base-300 pb-2">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-secondary">
                      {editingAssignmentId ? "Edit Assignment" : "New Assignment"}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAssignmentForm(false)}
                      className="text-base-content/50 hover:text-base-content p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-base-content/80 mb-1">
                      Assignment Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Build an Interactive React Counter"
                      value={assignmentTitle}
                      onChange={(e) => setAssignmentTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-secondary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-base-content/80 mb-1">
                      Description & Instructions
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Requirements, rubric guidelines, and submission expectations..."
                      value={assignmentDesc}
                      onChange={(e) => setAssignmentDesc(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-secondary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-base-content/80 mb-1">
                        Due Date
                      </label>
                      <input
                        type="datetime-local"
                        value={assignmentDueDate}
                        onChange={(e) => setAssignmentDueDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-secondary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-base-content/80 mb-1">
                        Total Marks
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={assignmentMarks}
                        onChange={(e) => setAssignmentMarks(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-secondary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-base-content/80 mb-1">
                        Submission Type
                      </label>
                      <select
                        value={assignmentType}
                        onChange={(e) => setAssignmentType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-secondary focus:outline-none"
                      >
                        <option value="file">File Upload (.zip, .pdf, .docx)</option>
                        <option value="written">Online Text Submission</option>
                        <option value="both">Both Text & File Upload</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-base-content/80 mb-1">
                        Status
                      </label>
                      <select
                        value={assignmentStatus}
                        onChange={(e) => setAssignmentStatus(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-secondary focus:outline-none"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft (Hidden)</option>
                      </select>
                    </div>
                  </div>

                  {/* Attachment */}
                  <div>
                    <label className="block text-xs font-semibold text-base-content/80 mb-1">
                      Starter Code / Problem Statement File (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="File URL or upload starter file..."
                        value={assignmentAttachmentUrl}
                        onChange={(e) => setAssignmentAttachmentUrl(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-base-300 bg-base-100 text-xs focus:border-secondary focus:outline-none"
                      />
                      <label className="px-3 py-2 rounded-xl border border-base-300 bg-base-100 hover:bg-base-200 cursor-pointer text-xs font-semibold flex items-center gap-1.5 shrink-0">
                        <Upload size={14} />
                        <span>Upload</span>
                        <input
                          type="file"
                          disabled={uploadingFile}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleUploadFile(file, "documents");
                              if (url) setAssignmentAttachmentUrl(url);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-base-300">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAssignmentForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={savingAssignment}
                      className="bg-secondary text-secondary-content hover:bg-secondary/90"
                    >
                      <Check size={14} />
                      {editingAssignmentId
                        ? "Update Assignment"
                        : "Save Assignment"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Assignment List */}
              {assignments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/20 p-8 text-center">
                  <ClipboardList size={32} className="mx-auto text-base-content/30 mb-2" />
                  <p className="text-sm font-semibold text-base-content">
                    No Assignments Added
                  </p>
                  <p className="text-xs text-base-content/50 mt-1">
                    Assign practical coding or research work for this topic.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingAssignmentId(null);
                      setAssignmentTitle(`${topic.title} Assignment`);
                      setAssignmentDesc("");
                      setAssignmentDueDate("");
                      setAssignmentAttachmentUrl("");
                      setShowAssignmentForm(true);
                    }}
                    className="mt-3 gap-1.5"
                  >
                    <Plus size={14} /> Create First Assignment
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((a: any) => (
                    <div
                      key={a.id}
                      className="p-4 rounded-xl border border-base-300 bg-base-100 hover:border-secondary/40 transition-all shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0">
                            <ClipboardList size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-base-content truncate">
                                {a.title}
                              </h4>
                              <span
                                className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase ${
                                  a.status === "published"
                                    ? "bg-success/15 text-success"
                                    : "bg-warning/15 text-warning"
                                }`}
                              >
                                {a.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-base-content/60 mt-1">
                              <span>Max: {a.totalMarks || 100} Marks</span>
                              <span>•</span>
                              <span>Type: {a.assignmentType || "file"}</span>
                              {a.dueDate && (
                                <>
                                  <span>•</span>
                                  <span>
                                    Due: {new Date(a.dueDate).toLocaleDateString()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditAssignment(a)}
                            className="p-1.5 rounded-lg text-base-content/60 hover:text-secondary hover:bg-secondary/10 transition-colors"
                            title="Edit Assignment"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                type: "assignment",
                                id: a.id,
                                title: a.title,
                              })
                            }
                            className="p-1.5 rounded-lg text-base-content/60 hover:text-error hover:bg-error/10 transition-colors"
                            title="Delete Assignment"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════ */}
          {/* 5. VIDEOS TAB */}
          {/* ═════════════════════════════════════════════ */}
          {activeTab === "videos" && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-base-content">
                  Topic Video Lecture
                </h3>
                <p className="text-xs text-base-content/60">
                  Embed YouTube, Vimeo, or upload an MP4 video file with instant live preview.
                </p>
              </div>

              {/* Video URL Form */}
              <form
                onSubmit={handleSaveVideo}
                className="rounded-2xl border border-primary/30 bg-base-200/50 p-5 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-base-content/80 mb-1">
                    Video Stream / Embed URL (YouTube, Vimeo, MP4)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=... or .mp4 URL"
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-primary focus:outline-none"
                    />
                    <label className="px-3.5 py-2.5 rounded-xl border border-base-300 bg-base-100 hover:bg-base-200 cursor-pointer text-xs font-semibold flex items-center gap-1.5 shrink-0">
                      <Upload size={14} />
                      <span>Upload MP4</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        disabled={uploadingFile}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleUploadFile(file, "videos");
                            if (url) setVideoUrlInput(url);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="w-48">
                  <label className="block text-xs font-semibold text-base-content/80 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={videoDurationInput}
                    onChange={(e) => setVideoDurationInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-base-300">
                  {topic.videoUrl ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-error border-error/30 hover:bg-error/10"
                      onClick={() =>
                        setDeleteConfirm({
                          type: "video",
                          title: "Topic Video",
                        })
                      }
                    >
                      <Trash2 size={14} /> Remove Video
                    </Button>
                  ) : (
                    <div />
                  )}

                  <Button type="submit" size="sm" isLoading={savingVideo}>
                    <Check size={14} /> Save Video Settings
                  </Button>
                </div>
              </form>

              {/* Live Preview Container */}
              {videoUrlInput ? (
                <div className="rounded-2xl border border-base-300 bg-base-100 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <Play size={14} /> Live Video Preview
                  </div>
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
                    {videoUrlInput.includes("youtube") ||
                    videoUrlInput.includes("youtu.be") ||
                    videoUrlInput.includes("vimeo") ? (
                      <iframe
                        src={getEmbedVideoUrl(videoUrlInput) || ""}
                        title="Video Player"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        controls
                        src={videoUrlInput}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/20 p-8 text-center">
                  <Video size={32} className="mx-auto text-base-content/30 mb-2" />
                  <p className="text-sm font-semibold text-base-content">
                    No Video Configured
                  </p>
                  <p className="text-xs text-base-content/50 mt-1">
                    Paste a YouTube / Vimeo link or upload an MP4 file to preview here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════ */}
          {/* 6. RESOURCES TAB */}
          {/* ═════════════════════════════════════════════ */}
          {activeTab === "resources" && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-base-content">
                    Topic Resources & Links
                  </h3>
                  <p className="text-xs text-base-content/60">
                    GitHub repositories, cheatsheets, external articles, and tools.
                  </p>
                </div>
                {!showResourceForm && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingResourceId(null);
                      setResourceTitle("");
                      setResourceFileUrl("");
                      setResourceType("link");
                      setResourceDescription("");
                      setShowResourceForm(true);
                    }}
                    className="gap-1.5"
                  >
                    <Plus size={14} /> Add Resource
                  </Button>
                )}
              </div>

              {/* Add / Edit Resource Form */}
              {showResourceForm && (
                <form
                  onSubmit={handleSaveResource}
                  className="rounded-2xl border border-emerald-500/30 bg-base-200/50 p-4 space-y-4 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                      {editingResourceId ? "Edit Resource" : "Add Resource"}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowResourceForm(false)}
                      className="text-base-content/50 hover:text-base-content p-1"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-base-content/80 mb-1">
                      Resource Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Official Documentation / GitHub Repository"
                      value={resourceTitle}
                      onChange={(e) => setResourceTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-base-content/80 mb-1">
                        Resource Type
                      </label>
                      <select
                        value={resourceType}
                        onChange={(e) => setResourceType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="link">External Link / Website</option>
                        <option value="code">Source Code / Repo</option>
                        <option value="pdf">Cheatsheet / PDF</option>
                        <option value="doc">Document</option>
                        <option value="sheet">Spreadsheet / Data</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-base-content/80 mb-1">
                        Resource URL or Upload
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          required
                          placeholder="https://..."
                          value={resourceFileUrl}
                          onChange={(e) => setResourceFileUrl(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-base-300 bg-base-100 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                        <label className="p-2 rounded-xl border border-base-300 bg-base-100 hover:bg-base-200 cursor-pointer text-xs shrink-0" title="Upload File">
                          <Upload size={14} />
                          <input
                            type="file"
                            disabled={uploadingFile}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (!resourceTitle) setResourceTitle(file.name);
                                const url = await handleUploadFile(file, "documents");
                                if (url) setResourceFileUrl(url);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-base-content/80 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief note on how to use this resource..."
                      value={resourceDescription}
                      onChange={(e) => setResourceDescription(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-base-300 bg-base-100 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1 border-t border-base-300">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowResourceForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={savingResource}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Check size={14} />
                      {editingResourceId ? "Update Resource" : "Save Resource"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Resource List */}
              {resources.filter(
                (r) => r.resourceType !== "pdf" && r.resourceType !== "doc"
              ).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/20 p-8 text-center">
                  <Paperclip size={32} className="mx-auto text-base-content/30 mb-2" />
                  <p className="text-sm font-semibold text-base-content">
                    No Supplementary Resources
                  </p>
                  <p className="text-xs text-base-content/50 mt-1">
                    Add external links, source code, or reference materials.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingResourceId(null);
                      setResourceTitle("");
                      setResourceFileUrl("");
                      setResourceType("link");
                      setResourceDescription("");
                      setShowResourceForm(true);
                    }}
                    className="mt-3 gap-1.5"
                  >
                    <Plus size={14} /> Add First Resource
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {resources
                    .filter((r) => r.resourceType !== "pdf" && r.resourceType !== "doc")
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-base-300 bg-base-100 hover:border-emerald-500/30 transition-all shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                            {item.resourceType === "code" ? (
                              <FileCode size={18} />
                            ) : item.resourceType === "sheet" ? (
                              <FileSpreadsheet size={18} />
                            ) : (
                              <LinkIcon size={18} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-base-content truncate">
                                {item.title}
                              </h4>
                              <span className="px-1.5 py-0.2 rounded-md bg-base-200 text-[10px] uppercase font-semibold text-base-content/60">
                                {item.resourceType || "link"}
                              </span>
                            </div>
                            <p className="text-xs text-base-content/50 truncate font-mono">
                              {item.fileUrl}
                            </p>
                            {item.description && (
                              <p className="text-xs text-base-content/70 mt-0.5 line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-base-content/60 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                            title="Open Link"
                          >
                            <ExternalLink size={16} />
                          </a>
                          <button
                            type="button"
                            onClick={() => openEditResource(item)}
                            className="p-1.5 rounded-lg text-base-content/60 hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Edit Resource"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                type: "resource",
                                id: item.id,
                                title: item.title,
                              })
                            }
                            className="p-1.5 rounded-lg text-base-content/60 hover:text-error hover:bg-error/10 transition-colors"
                            title="Delete Resource"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── DELETE CONFIRMATION MODAL */}
        {deleteConfirm && (
          <div className="absolute inset-0 z-[1050] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl border border-error/30 bg-base-100 p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-error">
                <div className="p-2 rounded-xl bg-error/10">
                  <AlertTriangle size={20} />
                </div>
                <h4 className="font-bold text-base text-base-content">
                  Delete Confirmation
                </h4>
              </div>

              <p className="text-xs text-base-content/70">
                Are you sure you want to delete{" "}
                <span className="font-bold text-base-content">
                  &quot;{deleteConfirm.title}&quot;
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="error"
                  onClick={() => {
                    if (deleteConfirm.type === "resource" && deleteConfirm.id) {
                      handleDeleteResource(deleteConfirm.id);
                    } else if (deleteConfirm.type === "quiz" && deleteConfirm.id) {
                      handleDeleteQuiz(deleteConfirm.id);
                    } else if (
                      deleteConfirm.type === "assignment" &&
                      deleteConfirm.id
                    ) {
                      handleDeleteAssignment(deleteConfirm.id);
                    } else if (deleteConfirm.type === "video") {
                      handleRemoveVideo();
                    }
                  }}
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

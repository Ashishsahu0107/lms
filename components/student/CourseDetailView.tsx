"use client";

// components/student/CourseDetailView.tsx — Redesigned Course Player matching reference design
import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { API_URL } from "@/lib/api-config";

interface TopicItem {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  completed?: boolean;
  order?: number;
}

interface ModuleItem {
  id: string;
  title: string;
  order: number;
  topics?: TopicItem[];
}

type ActiveTab = "content" | "notes" | "resources" | "discussions";


function getTopicStatus(
  tp: TopicItem,
  activeTopic: TopicItem | null
): "completed" | "active" | "upcoming" {
  if (tp.id === activeTopic?.id) return "active";
  if (tp.completed) return "completed";
  return "upcoming";
}

function TopicStatusIcon({
  status,
}: {
  status: "completed" | "active" | "upcoming";
}) {
  if (status === "completed") {
    return (
      <span className="w-5 h-5 rounded-full bg-green-100 border border-green-300 flex items-center justify-center shrink-0">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 5.5L4 7.5L8 3"
            stroke="#16a34a"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <polygon points="2,1 7,4 2,7" fill="white" />
        </svg>
      </span>
    );
  }
  return (
    <span className="w-5 h-5 rounded-full border-2 border-base-300 flex items-center justify-center shrink-0" />
  );
}

function TopicStatusRightIcon({
  status,
}: {
  status: "completed" | "active" | "upcoming";
}) {
  if (status === "completed") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6.5" stroke="#16a34a" />
        <path
          d="M4 7.2L6.2 9.5L10 5"
          stroke="#16a34a"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return null;
}

export default function CourseDetailView({ courseId }: { courseId: string }) {
  const { user, token } = useAuth();
  const [course, setCourse] = useState<Record<string, unknown> | null>(null);
  const [activeTopic, setActiveTopic] = useState<TopicItem | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("content");
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  const [lessonProgress] = useState(60); // simulate lesson progress

  const flatTopicsRef = useRef<TopicItem[]>([]);

  const fetchCourseData = useCallback(async () => {
    try {
      const [cRes, eRes] = await Promise.all([
        fetch(`${API_URL}/courses/${courseId}`),
        token
          ? fetch(`${API_URL}/enrollments?courseId=${courseId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve(null),
      ]);

      const cData = await cRes.json();
      if (cData.success) {
        const c = cData.data.course;
        setCourse(c);

        const firstMod: ModuleItem = c.modules?.[0];
        if (firstMod) {
          setActiveModuleId(firstMod.id);
          if (firstMod.topics?.[0]) {
            setActiveTopic(firstMod.topics[0]);
          }
        }

        // Build flat topics list for prev/next navigation
        const flat: TopicItem[] = [];
        for (const mod of c.modules || []) {
          for (const tp of mod.topics || []) {
            flat.push(tp);
          }
        }
        flatTopicsRef.current = flat;
      }

      if (eRes) {
        const eData = await eRes.json();
        if (eData.success && (eData.data.enrollments || []).length > 0) {
          setIsEnrolled(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [courseId, token]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const handleEnroll = async () => {
    if (!token) {
      toast.error("Please login to enroll in this course");
      return;
    }
    setEnrolling(true);
    try {
      const res = await fetch(`${API_URL}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId: user?.id, courseId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success("Enrolled successfully!");
      setIsEnrolled(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  const toggleTopicCompletion = (tp: TopicItem) => {
    setActiveTopic({ ...tp, completed: !tp.completed });
    toast.success(tp.completed ? "Marked as incomplete" : "Lesson marked as complete! 🎉");
  };

  const goToPrev = () => {
    if (!activeTopic) return;
    const flat = flatTopicsRef.current;
    const idx = flat.findIndex((t) => t.id === activeTopic.id);
    if (idx > 0) setActiveTopic(flat[idx - 1]);
  };

  const goToNext = () => {
    if (!activeTopic) return;
    const flat = flatTopicsRef.current;
    const idx = flat.findIndex((t) => t.id === activeTopic.id);
    if (idx < flat.length - 1) setActiveTopic(flat[idx + 1]);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-20 text-center">
        <p className="text-xl font-bold text-base-content">Course not found</p>
      </div>
    );
  }

  const modules = (course.modules || []) as ModuleItem[];
  const teacher = (course.teacher || {}) as Record<string, unknown>;
  const courseTitle = course.title as string;

  // Compute overall progress
  const allTopics = modules.flatMap((m) => m.topics || []);
  const completedTopics = allTopics.filter((t) => t.completed).length;
  const overallProgress =
    allTopics.length > 0
      ? Math.round((completedTopics / allTopics.length) * 100)
      : 0;

  // Current module number / title for header

  const topicNumber = activeTopic
    ? (() => {
        const modIdx = modules.findIndex((m) =>
          (m.topics || []).some((t) => t.id === activeTopic.id)
        );
        const topicIdx = (modules[modIdx]?.topics || []).findIndex(
          (t) => t.id === activeTopic.id
        );
        return `${modIdx + 1}.${topicIdx + 1}`;
      })()
    : "";

  const lessonHeaderTitle = activeTopic
    ? `${topicNumber} ${activeTopic.title}`
    : courseTitle;

  const flatTopics = flatTopicsRef.current;
  const currentTopicIdx = flatTopics.findIndex((t) => t.id === activeTopic?.id);
  const hasPrev = currentTopicIdx > 0;
  const hasNext = currentTopicIdx < flatTopics.length - 1;

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: "content", label: "Content" },
    { key: "notes", label: "Notes" },
    { key: "resources", label: "Resources" },
    { key: "discussions", label: "Discussions" },
  ];

  return (
    <div className="flex flex-col gap-0 animate-fade-in min-h-[calc(100vh-4rem)]">
      {/* ── Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-base-content/50 mb-4 flex-wrap">
        <Link href="/student/dashboard" className="hover:text-indigo-600 transition-colors">
          Dashboard
        </Link>
        <span className="text-base-content/30">›</span>
        <Link href="/student/my-courses" className="hover:text-indigo-600 transition-colors">
          My Courses
        </Link>
        <span className="text-base-content/30">›</span>
        <span className="text-base-content/70 font-medium truncate max-w-[200px]">
          {courseTitle}
        </span>
      </nav>

      {/* ── Main Layout: Left Sidebar + Right Content */}
      <div className="flex gap-5 flex-1 min-h-0 items-start">

        {/* ══ LEFT SIDEBAR ══ */}
        <aside className="w-72 shrink-0 flex flex-col gap-0 bg-base-100 border border-base-300 rounded-2xl overflow-hidden shadow-sm">

          {/* Back to Courses */}
          <div className="px-4 pt-4 pb-3 border-b border-base-200">
            <Link
              href="/student/my-courses"
              className="inline-flex items-center gap-1.5 text-xs text-base-content/60 hover:text-indigo-600 transition-colors font-medium"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M9 11L5 7L9 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to Courses
            </Link>
          </div>

          {/* Course Info Card */}
          <div className="px-4 py-4 border-b border-base-200 space-y-3">
            <div className="flex items-start gap-3">
              {/* Course icon */}
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 text-xl font-bold">
                {"</>"
                  .split("")
                  .map((c, i) => (
                    <span key={i} style={{ fontSize: i === 1 ? "0.7rem" : "1rem" }}>
                      {c}
                    </span>
                  ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-base-content leading-tight line-clamp-2">
                  {courseTitle}
                </p>
                <p className="text-xs text-base-content/50 mt-0.5">
                  Instructor:{" "}
                  <span className="font-medium text-base-content/70">
                    {(teacher.name as string) || "Instructor"}
                  </span>
                </p>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-base-content/60">
                  {overallProgress}% Completed
                </span>
              </div>
              <div className="w-full h-1.5 bg-base-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Module + Topic Navigation */}
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-22rem)] divide-y divide-base-200">
            {modules.map((mod, mIdx) => {
              const topics = mod.topics || [];
              const isModuleOpen = activeModuleId === mod.id;
              const moduleCompletedCount = topics.filter((t) => t.completed).length;

              return (
                <div key={mod.id}>
                  {/* Module Header */}
                  <button
                    onClick={() =>
                      setActiveModuleId(isModuleOpen ? null : mod.id)
                    }
                    className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-base-200/60 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-base-content truncate">
                        Module {mIdx + 1}: {mod.title}
                      </p>
                      <p className="text-[11px] text-base-content/50 mt-0.5">
                        {moduleCompletedCount} / {topics.length} completed
                      </p>
                    </div>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className={`shrink-0 ml-2 text-base-content/40 transition-transform ${
                        isModuleOpen ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        d="M3 5L7 9L11 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Topics List */}
                  {isModuleOpen && (
                    <div className="bg-base-50 divide-y divide-base-100/60">
                      {topics.map((tp) => {
                        const status = getTopicStatus(tp, activeTopic);
                        return (
                          <button
                            key={tp.id}
                            onClick={() => {
                              setActiveTopic(tp);
                              setActiveModuleId(mod.id);
                            }}
                            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all ${
                              status === "active"
                                ? "bg-indigo-50 border-l-2 border-indigo-600"
                                : "hover:bg-base-200/40 border-l-2 border-transparent"
                            }`}
                          >
                            <TopicStatusIcon status={status} />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs truncate font-medium ${
                                  status === "active"
                                    ? "text-indigo-700"
                                    : status === "completed"
                                      ? "text-base-content/70"
                                      : "text-base-content/60"
                                }`}
                              >
                                {tp.title}
                              </p>
                              <p className="text-[10px] text-base-content/40">
                                {tp.duration || 5} min
                              </p>
                            </div>
                            <TopicStatusRightIcon status={status} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Remaining modules (collapsed) */}
            {modules.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-base-content/40">
                No modules available yet.
              </div>
            )}
          </div>

          {/* Overall Progress Bottom */}
          <div className="px-4 py-3 border-t border-base-200 bg-base-200/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-base-content/60">
                Overall Progress
              </span>
              <span className="text-[11px] font-bold text-indigo-600">
                {overallProgress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-base-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            {overallProgress < 100 && (
              <p className="text-[10px] text-base-content/40 mt-1">
                You&apos;re doing great! Keep it up.
              </p>
            )}
          </div>
        </aside>

        {/* ══ RIGHT CONTENT AREA ══ */}
        <div className="flex-1 min-w-0 flex flex-col gap-0 bg-base-100 border border-base-300 rounded-2xl overflow-hidden shadow-sm">

          {/* Content Header — Lesson Title + Prev/Next + Fullscreen */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-lg font-bold text-base-content truncate">
                {lessonHeaderTitle}
              </h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={goToPrev}
                disabled={!hasPrev}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-base-300 text-xs font-medium text-base-content/70 hover:bg-base-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M9 11L5 7L9 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Previous
              </button>
              <button
                onClick={goToNext}
                disabled={!hasNext}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M5 3L9 7L5 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                className="w-8 h-8 rounded-lg border border-base-300 flex items-center justify-center text-base-content/50 hover:bg-base-200 hover:text-base-content transition-all"
                title="Fullscreen"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 5V2H5M9 2H12V5M12 9V12H9M5 12H2V9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center border-b border-base-200 px-6 gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === tab.key
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-base-content/50 hover:text-base-content/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "content" && (
              <div className="px-6 py-6 space-y-5">
                {/* Lesson Title */}
                <div>
                  <h2 className="text-xl font-bold text-base-content mb-2">
                    {activeTopic?.title || courseTitle}
                  </h2>
                  <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-line">
                    {activeTopic?.content ||
                      (course.description as string) ||
                      "Select a topic from the sidebar to begin learning."}
                  </p>
                </div>

                {/* Video Player (if videoUrl exists) */}
                {activeTopic?.videoUrl && (
                  <div className="rounded-xl overflow-hidden border border-base-300 bg-black aspect-video">
                    <iframe
                      src={activeTopic.videoUrl}
                      className="w-full h-full"
                      allowFullScreen
                      title={activeTopic.title}
                    />
                  </div>
                )}

                {/* Enroll CTA */}
                {!isEnrolled && (
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-indigo-800">
                        Enroll to track your progress
                      </p>
                      <p className="text-xs text-indigo-600 mt-0.5">
                        Get full access to all lessons and resources.
                      </p>
                    </div>
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-all shrink-0"
                    >
                      {enrolling ? "Enrolling..." : "Enroll Free"}
                    </button>
                  </div>
                )}

                {/* Empty state when no topic selected */}
                {!activeTopic && (
                  <div className="rounded-xl bg-base-200/50 border border-base-300 px-6 py-10 text-center">
                    <span className="text-4xl block mb-3">📖</span>
                    <p className="text-sm font-semibold text-base-content/60">
                      Select a topic from the sidebar to start learning
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="px-6 py-10 text-center text-sm text-base-content/40">
                <span className="text-4xl block mb-3">📝</span>
                <p>No notes yet. Take your first note on this lesson!</p>
              </div>
            )}

            {activeTab === "resources" && (
              <div className="px-6 py-10 text-center text-sm text-base-content/40">
                <span className="text-4xl block mb-3">📎</span>
                <p>No resources attached to this lesson.</p>
              </div>
            )}

            {activeTab === "discussions" && (
              <div className="px-6 py-10 text-center text-sm text-base-content/40">
                <span className="text-4xl block mb-3">💬</span>
                <p>No discussions yet. Start the conversation!</p>
              </div>
            )}
          </div>

          {/* Footer: Prev / Next + Mark Complete */}
          <div className="px-6 py-4 border-t border-base-200 flex items-center justify-between gap-3">
            <button
              onClick={goToPrev}
              disabled={!hasPrev}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-base-300 text-xs font-medium text-base-content/70 hover:bg-base-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M9 11L5 7L9 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Previous
            </button>

            {activeTopic && (
              <button
                onClick={() => toggleTopicCompletion(activeTopic)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTopic.completed
                    ? "bg-green-50 border border-green-200 text-green-700 hover:bg-green-100"
                    : "bg-base-200 border border-base-300 text-base-content/70 hover:bg-base-300"
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M2 7L5 10L11 4"
                    stroke={activeTopic.completed ? "#16a34a" : "currentColor"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {activeTopic.completed ? "Completed ✓" : "Mark as Complete"}
              </button>
            )}

            <button
              onClick={goToNext}
              disabled={!hasNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M5 3L9 7L5 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Lesson Progress Bar */}
          <div className="px-6 py-3 border-t border-base-200 bg-base-200/30 flex items-center gap-4">
            <span className="text-xs font-medium text-base-content/60 shrink-0">
              Lesson Progress
            </span>
            <div className="flex-1 h-1.5 bg-base-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                style={{ width: `${lessonProgress}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-base-content/70 shrink-0">
              {lessonProgress}% Completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

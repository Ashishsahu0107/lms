"use client";

// components/student/CourseDetailView.tsx — Interactive Course Player with Left Collapsible Module Sidebar
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface TopicItem {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  completed?: boolean;
}

interface ModuleItem {
  id: string;
  title: string;
  order: number;
  topics?: TopicItem[];
}

export default function CourseDetailView({ courseId }: { courseId: string }) {
  const { user, token } = useAuth();
  const [course, setCourse] = useState<Record<string, unknown> | null>(null);
  const [activeTopic, setActiveTopic] = useState<TopicItem | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  // ── Collapsible Left Sidebar State (Open by default)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Active Module Tracking
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  const fetchCourseData = useCallback(async () => {
    try {
      const [cRes, eRes] = await Promise.all([
        fetch(`${API_URL}/courses/${courseId}`),
        token ? fetch(`${API_URL}/enrollments?courseId=${courseId}`, { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve(null),
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

  const toggleTopicCompletion = (topicId: string) => {
    if (!activeTopic) return;
    setActiveTopic({ ...activeTopic, completed: !activeTopic.completed });
    toast.success(activeTopic.completed ? "Marked as incomplete" : "Lesson marked as complete! 🎉");
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-xl font-bold text-base-content">Course not found</p>
      </div>
    );
  }

  const modules = (course.modules || []) as ModuleItem[];
  const teacher = (course.teacher || {}) as Record<string, unknown>;

  return (
    <div className="space-y-4 animate-fade-in text-base-content min-h-[calc(100vh-6rem)] flex flex-col">
      {/* Top Controls & Banner Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-base-100 border border-base-300 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-2 border border-primary/20 transition-all shadow-xs"
            title={sidebarOpen ? "Hide Module Sidebar" : "Show Module Sidebar"}
          >
            <span>{sidebarOpen ? "◀" : "▶"}</span>
            <span>{sidebarOpen ? "Collapse Modules" : "Show Modules Sidebar"}</span>
          </button>

          <div>
            <h1 className="text-lg font-bold text-base-content font-display line-clamp-1">
              {course.title as string}
            </h1>
            <p className="text-xs text-base-content/60">
              Instructor: <strong>{teacher.name as string || "Instructor"}</strong> • {modules.length} Modules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEnrolled ? (
            <Button variant="primary" size="sm" onClick={handleEnroll} isLoading={enrolling}>
              Enroll Course Free
            </Button>
          ) : (
            <Badge variant="success" className="py-1 px-3">
              ✓ Enrolled Member
            </Badge>
          )}
        </div>
      </div>

      {/* Main Course Viewer Layout (Sidebar + Content Workspace) */}
      <div className="flex-1 flex gap-6 relative min-h-0">
        {/* ── Left Collapsible Module Sidebar */}
        <aside
          className={`bg-base-100 border border-base-300 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 ease-in-out shrink-0 ${
            sidebarOpen ? "w-80 opacity-100" : "w-0 opacity-0 pointer-events-none border-0 p-0"
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-base-200 flex items-center justify-between bg-base-200/50">
            <span className="font-bold text-xs text-base-content font-display uppercase tracking-wider">
              Course Modules ({modules.length})
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-base-content/50 hover:text-base-content text-xs p-1 rounded-lg"
              title="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* Module & Topic Navigation Tree */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {modules.map((mod, mIdx) => {
              const topics = mod.topics || [];
              const isModuleActive = activeModuleId === mod.id;

              return (
                <div
                  key={mod.id}
                  className={`rounded-xl border transition-all ${
                    isModuleActive
                      ? "border-primary/40 bg-primary/5 shadow-xs"
                      : "border-base-200 bg-base-200/40"
                  }`}
                >
                  {/* Module Header */}
                  <button
                    onClick={() => setActiveModuleId(isModuleActive ? null : mod.id)}
                    className="w-full p-3 text-left flex items-center justify-between font-bold text-xs text-base-content hover:text-primary transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-md bg-primary/20 text-primary text-[10px] flex items-center justify-center font-mono">
                        {mIdx + 1}
                      </span>
                      <span className="truncate">{mod.title}</span>
                    </div>
                    <span className="text-[10px] opacity-60">{isModuleActive ? "▼" : "▶"}</span>
                  </button>

                  {/* Module Topics List */}
                  {isModuleActive && (
                    <div className="p-2 pt-0 space-y-1 border-t border-base-200/60">
                      {topics.map((tp) => {
                        const isTopicActive = activeTopic?.id === tp.id;
                        return (
                          <button
                            key={tp.id}
                            onClick={() => setActiveTopic(tp)}
                            className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between transition-all ${
                              isTopicActive
                                ? "bg-primary text-primary-content font-bold shadow-md shadow-primary/30"
                                : "hover:bg-base-200 text-base-content/80"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span>{tp.completed ? "✅" : "▶️"}</span>
                              <span className="truncate">{tp.title}</span>
                            </div>
                            <span className="text-[10px] opacity-70">
                              {tp.duration || 5}m
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── Main Content & Media Workspace (Expands to 100% full width when sidebar is collapsed) */}
        <main className="flex-1 min-w-0 flex flex-col gap-4 transition-all duration-300 ease-in-out">
          <Card className="flex-1 p-0 overflow-hidden flex flex-col">
            {/* Video Player Box */}
            <div className="w-full aspect-video bg-black/90 flex items-center justify-center relative shadow-inner">
              {activeTopic?.videoUrl ? (
                <iframe
                  src={activeTopic.videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title={activeTopic.title}
                />
              ) : (
                <div className="text-center p-8 text-white space-y-2">
                  <span className="text-5xl block animate-bounce">🎥</span>
                  <p className="font-bold text-base">
                    {activeTopic?.title || (course.title as string)}
                  </p>
                  <p className="text-xs text-white/60">
                    {activeTopic ? "Interactive Lesson Player" : "Select a topic from the left sidebar to start learning"}
                  </p>
                </div>
              )}
            </div>

            {/* Lesson Detail Bar & Mark Complete Controls */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="primary">
                    Lesson {activeTopic ? activeTopic.title : "Overview"}
                  </Badge>
                  <span className="text-xs text-base-content/60">
                    Est. Duration: {activeTopic?.duration || 10} mins
                  </span>
                </div>

                <h2 className="text-xl font-bold text-base-content font-display">
                  {activeTopic?.title || (course.title as string)}
                </h2>

                <p className="text-xs text-base-content/70 leading-relaxed whitespace-pre-line">
                  {activeTopic?.content || (course.description as string) || "No detailed notes provided for this lesson."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-base-200 flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant={activeTopic?.completed ? "success" : "outline"}
                  size="sm"
                  onClick={() => activeTopic && toggleTopicCompletion(activeTopic.id)}
                  disabled={!activeTopic}
                >
                  {activeTopic?.completed ? "✓ Lesson Completed" : "Mark as Complete ✓"}
                </Button>

                {!sidebarOpen && (
                  <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
                    ▶ Open Module Sidebar
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}

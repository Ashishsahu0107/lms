"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ChevronDown, ChevronUp, FileText, Paperclip, Pencil, Plus, Save, Trash2, Video, X } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL } from "@/lib/api-config";

type TopicResource = { id: string; title: string; fileUrl: string };
type TopicWithResources = {
  id: string;
  title: string;
  content: string;
  duration: number;
  videoUrl: string;
  order: number;
  resources: TopicResource[];
};
type ModuleWithTopics = {
  id: string;
  title: string;
  order: number;
  topics: TopicWithResources[];
};
type CourseWithModules = {
  id: string;
  title: string;
  modules: ModuleWithTopics[];
};

type PendingDelete =
  | { kind: "class"; classId: string; title: string }
  | { kind: "topic"; classId: string; topicId: string; title: string };

export default function CourseEditorView({
  course,
}: {
  course: CourseWithModules;
}) {
  const router = useRouter();
  const { token, user } = useAuth();
  const [classes, setClasses] = useState(course.modules);
  const [newClassTitle, setNewClassTitle] = useState("");
  const [creatingClass, setCreatingClass] = useState(false);
  const [newTopicTitles, setNewTopicTitles] = useState<Record<string, string>>({});
  const [creatingTopicClassId, setCreatingTopicClassId] = useState<string | null>(null);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingClassTitle, setEditingClassTitle] = useState("");
  const [savingClassId, setSavingClassId] = useState<string | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicTitle, setEditingTopicTitle] = useState("");
  const [savingTopicId, setSavingTopicId] = useState<string | null>(null);
  const [reorderingClassId, setReorderingClassId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [managerError, setManagerError] = useState("");
  const [showClassForm, setShowClassForm] = useState(false);
  const [isTopicEditorOpen, setIsTopicEditorOpen] = useState(false);

  useEffect(() => {
    setClasses(course.modules);
  }, [course.modules]);

  const [activeModuleId, setActiveModuleId] = useState<string | null>(
    course.modules[0]?.id || null,
  );

  // We keep activeTopic pointing to the original, but editedTopic for real-time edits
  const [activeTopic, setActiveTopic] = useState<TopicWithResources | null>(
    course.modules[0]?.topics[0] || null,
  );
  const [editedTopic, setEditedTopic] = useState<TopicWithResources | null>(
    course.modules[0]?.topics[0] || null,
  );

  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >({
    [course.modules[0]?.id || ""]: true,
  });

  const [activeContentType, setActiveContentType] = useState("Rich Text");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Sync edited topic when active topic changes
  useEffect(() => {
    setEditedTopic(activeTopic);
  }, [activeTopic]);

  // Toggle module accordion
  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const insertContent = (markdownSnippet: string) => {
    setEditedTopic((prev) => {
      if (!prev) return prev;
      const current = prev.content || "";
      const newContent = current.trim() ? current + "\n\n" + markdownSnippet : markdownSnippet;
      return { ...prev, content: newContent };
    });
    // Ensure we are in a text-compatible tab
    if (!["Rich Text", "Markdown", "HTML"].includes(activeContentType)) {
      setActiveContentType("Markdown");
    }
  };

  const handleSaveTopic = async (publish = false) => {
    if (!editedTopic || !token) return;

    if (publish) setIsPublishing(true);
    else setIsSaving(true);

    try {
      const res = await fetch(`${API_URL}/topics/${editedTopic.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editedTopic.title,
          content: editedTopic.content,
          duration: editedTopic.duration,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(publish ? "Lesson published!" : "Draft saved!");
        // Update the activeTopic with the new data to avoid losing state on re-render
        setActiveTopic(editedTopic);
        setClasses((current) => current.map((classItem) => classItem.id === activeModuleId
          ? { ...classItem, topics: classItem.topics.map((topic) => topic.id === editedTopic.id ? { ...topic, ...editedTopic } : topic) }
          : classItem));
        // Refresh the server component data
        router.refresh();
      } else {
        toast.error(data.message || "Failed to save lesson");
      }
    } catch {
      toast.error("An error occurred while saving.");
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  };

  const handleAddClass = async (event: React.FormEvent) => {
    event.preventDefault();
    const title = newClassTitle.trim();
    if (!token || !title) return;
    setCreatingClass(true);
    setManagerError("");
    try {
      const res = await fetch(`${API_URL}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          courseId: course.id,
          order: classes.length + 1,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not create Class");
      const createdClass = data.data.module as ModuleWithTopics;
      setClasses((current) => [...current, createdClass]);
      setExpandedModules((current) => ({ ...current, [createdClass.id]: true }));
      setActiveModuleId(createdClass.id);
      setNewClassTitle("");
      setShowClassForm(false);
      toast.success("Class created");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create Class";
      setManagerError(message);
      toast.error(message);
    } finally {
      setCreatingClass(false);
    }
  };

  const handleSaveClass = async (event: React.FormEvent, classId: string) => {
    event.preventDefault();
    const title = editingClassTitle.trim();
    if (!token || !title) return;
    setSavingClassId(classId);
    setManagerError("");
    try {
      const res = await fetch(`${API_URL}/modules/${classId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not update Class");
      setClasses((current) => current.map((item) => item.id === classId ? { ...item, title } : item));
      setEditingClassId(null);
      toast.success("Class updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update Class";
      setManagerError(message);
      toast.error(message);
    } finally {
      setSavingClassId(null);
    }
  };

  const handleAddTopic = async (event: React.FormEvent, classId: string) => {
    event.preventDefault();
    const title = newTopicTitles[classId]?.trim();
    if (!token || !title) return;
    setCreatingTopicClassId(classId);
    setManagerError("");
    try {
      const res = await fetch(`${API_URL}/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, moduleId: classId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not create Topic");
      const topic = data.data.topic as TopicWithResources;
      setClasses((current) => current.map((item) => item.id === classId
        ? { ...item, topics: [...item.topics, topic].sort((a, b) => a.order - b.order) }
        : item));
      setExpandedModules((current) => ({ ...current, [classId]: true }));
      setActiveModuleId(classId);
      setActiveTopic(topic);
      setEditedTopic(topic);
      setNewTopicTitles((current) => ({ ...current, [classId]: "" }));
      toast.success("Topic created");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create Topic";
      setManagerError(message);
      toast.error(message);
    } finally {
      setCreatingTopicClassId(null);
    }
  };

  const handleSaveTopicTitle = async (event: React.FormEvent, classId: string, topic: TopicWithResources) => {
    event.preventDefault();
    const title = editingTopicTitle.trim();
    if (!token || !title) return;
    setSavingTopicId(topic.id);
    setManagerError("");
    try {
      const res = await fetch(`${API_URL}/topics/${topic.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not update Topic");
      const updatedTopic = { ...topic, ...data.data.topic, title } as TopicWithResources;
      setClasses((current) => current.map((item) => item.id === classId
        ? { ...item, topics: item.topics.map((entry) => entry.id === topic.id ? updatedTopic : entry) }
        : item));
      if (activeTopic?.id === topic.id) {
        setActiveTopic(updatedTopic);
        setEditedTopic((current) => current ? { ...current, title } : updatedTopic);
      }
      setEditingTopicId(null);
      toast.success("Topic updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update Topic";
      setManagerError(message);
      toast.error(message);
    } finally {
      setSavingTopicId(null);
    }
  };

  const handleReorderTopics = async (classItem: ModuleWithTopics, topicIndex: number, direction: -1 | 1) => {
    const targetIndex = topicIndex + direction;
    if (!token || targetIndex < 0 || targetIndex >= classItem.topics.length) return;
    const reorderedTopics = [...classItem.topics];
    [reorderedTopics[topicIndex], reorderedTopics[targetIndex]] = [reorderedTopics[targetIndex], reorderedTopics[topicIndex]];
    setReorderingClassId(classItem.id);
    setManagerError("");
    try {
      const res = await fetch(`${API_URL}/topics/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ moduleId: classItem.id, topicIds: reorderedTopics.map((topic) => topic.id) }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not reorder Topics");
      const orderedTopics = reorderedTopics.map((topic, order) => ({ ...topic, order }));
      setClasses((current) => current.map((item) => item.id === classItem.id ? { ...item, topics: orderedTopics } : item));
      if (activeTopic) {
        const updatedActiveTopic = orderedTopics.find((topic) => topic.id === activeTopic.id);
        if (updatedActiveTopic) setActiveTopic(updatedActiveTopic);
      }
      toast.success("Topic order saved");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not reorder Topics";
      setManagerError(message);
      toast.error(message);
    } finally {
      setReorderingClassId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!token || !pendingDelete) return;
    setDeleting(true);
    setManagerError("");
    try {
      const url = pendingDelete.kind === "class"
        ? `${API_URL}/modules/${pendingDelete.classId}`
        : `${API_URL}/topics/${pendingDelete.topicId}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not delete item");

      if (pendingDelete.kind === "class") {
        setClasses((current) => current.filter((item) => item.id !== pendingDelete.classId));
        setExpandedModules((current) => {
          const next = { ...current };
          delete next[pendingDelete.classId];
          return next;
        });
        if (activeModuleId === pendingDelete.classId) {
          setActiveModuleId(null);
          setActiveTopic(null);
          setEditedTopic(null);
        }
        toast.success("Class and its Topics deleted");
      } else {
        setClasses((current) => current.map((item) => item.id === pendingDelete.classId
          ? { ...item, topics: item.topics.filter((topic) => topic.id !== pendingDelete.topicId) }
          : item));
        if (activeTopic?.id === pendingDelete.topicId) {
          setActiveTopic(null);
          setEditedTopic(null);
        }
        toast.success("Topic deleted");
      }
      setPendingDelete(null);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not delete item";
      setManagerError(message);
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  if (!isTopicEditorOpen) {
    return (
      <div className="space-y-5 text-base-content">
        <header className="flex flex-col gap-4 border-b border-base-300 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={user?.role === "super_admin" ? "/admin/dashboard" : "/teacher/courses"} className="rounded-full bg-base-200 p-2 text-base-content hover:bg-base-300" aria-label="Back to courses">
              ←
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-base-content/50">
                <span>LMS</span><span>›</span><span className="truncate">{course.title}</span>
              </div>
              <h1 className="mt-1 truncate text-xl font-bold text-base-content">Classes & Topics</h1>
            </div>
          </div>
          <Button type="button" onClick={() => setShowClassForm((shown) => !shown)}>
            <Plus size={16} /> Add Class
          </Button>
        </header>

        {managerError && (
          <div role="alert" className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            {managerError}
          </div>
        )}

        {showClassForm && (
          <form onSubmit={handleAddClass} className="flex flex-col gap-3 rounded-xl border border-base-300 bg-base-100 p-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label htmlFor="new-class-title" className="mb-1.5 block text-xs font-semibold text-base-content/70">Class title</label>
              <input
                id="new-class-title"
                autoFocus
                required
                maxLength={120}
                value={newClassTitle}
                onChange={(event) => setNewClassTitle(event.target.value)}
                placeholder="e.g. Class 1"
                className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 text-sm text-base-content focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" isLoading={creatingClass} disabled={!newClassTitle.trim()}><Save size={15} /> Save Class</Button>
              <Button type="button" variant="outline" onClick={() => { setShowClassForm(false); setNewClassTitle(""); }}>Cancel</Button>
            </div>
          </form>
        )}

        {classes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-base-300 bg-base-100 px-5 py-14 text-center">
            <h2 className="text-base font-semibold text-base-content">No Classes yet</h2>
            <p className="mt-1 text-sm text-base-content/60">Add a Class to begin structuring this course.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((classItem, classIndex) => {
              const expanded = Boolean(expandedModules[classItem.id]);
              return (
                <section key={classItem.id} className="overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-base-200 px-3 py-3 sm:px-5">
                    <span className="hidden text-base-content/40 sm:block" aria-hidden="true">⠿</span>
                    <button type="button" aria-expanded={expanded} onClick={() => toggleModule(classItem.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <ChevronDown size={17} className={`shrink-0 text-base-content/50 transition-transform ${expanded ? "" : "-rotate-90"}`} />
                      <span className="shrink-0 text-xs font-semibold text-primary">Class {classIndex + 1}</span>
                      <span className="truncate text-sm font-semibold text-base-content">{classItem.title}</span>
                      <span className="ml-auto shrink-0 rounded-full bg-base-200 px-2 py-0.5 text-[11px] text-base-content/60">{classItem.topics.length} Topics</span>
                    </button>
                    <div className="flex shrink-0 items-center gap-1">
                      <button type="button" title="Rename Class" aria-label={`Rename ${classItem.title}`} onClick={() => { setEditingClassId(classItem.id); setEditingClassTitle(classItem.title); }} className="rounded-md p-2 text-base-content/50 hover:bg-base-200 hover:text-primary"><Pencil size={15} /></button>
                      <button type="button" title="Delete Class" aria-label={`Delete ${classItem.title}`} onClick={() => setPendingDelete({ kind: "class", classId: classItem.id, title: classItem.title })} className="rounded-md p-2 text-base-content/50 hover:bg-error/10 hover:text-error"><Trash2 size={15} /></button>
                    </div>
                  </div>

                  {editingClassId === classItem.id && (
                    <form onSubmit={(event) => handleSaveClass(event, classItem.id)} className="flex flex-col gap-2 border-b border-base-200 bg-base-200/30 p-4 sm:flex-row">
                      <label className="sr-only" htmlFor={`class-title-${classItem.id}`}>Class title</label>
                      <input id={`class-title-${classItem.id}`} autoFocus required maxLength={120} value={editingClassTitle} onChange={(event) => setEditingClassTitle(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content" />
                      <Button type="submit" size="sm" isLoading={savingClassId === classItem.id} disabled={!editingClassTitle.trim()}><Save size={14} /> Save</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setEditingClassId(null)}><X size={14} /> Cancel</Button>
                    </form>
                  )}

                  {expanded && (
                    <div className="p-3 sm:p-5">
                      {classItem.topics.length === 0 ? (
                        <div className="rounded-lg bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/60">No Topics in this Class yet.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                            <thead>
                              <tr className="border-b border-base-200 text-[10px] font-semibold uppercase text-base-content/45">
                                <th className="px-3 py-3">Topic</th>
                                <th className="px-3 py-3 text-center">Doc</th>
                                <th className="px-3 py-3 text-center">Video</th>
                                <th className="px-3 py-3 text-center">Resources</th>
                                <th className="px-3 py-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-base-200">
                              {classItem.topics.map((topic, topicIndex) => (
                                <tr key={topic.id} className="group">
                                  <td className="px-3 py-3">
                                    <button type="button" onClick={() => { setActiveModuleId(classItem.id); setActiveTopic(topic); setEditedTopic(topic); setIsTopicEditorOpen(true); }} className="flex min-w-0 items-center gap-3 text-left hover:text-primary">
                                      <span className="shrink-0 font-mono text-xs text-base-content/40">{topicIndex + 1}.</span>
                                      <span className="truncate font-medium">{topic.title}</span>
                                    </button>
                                  </td>
                                  <td className="px-3 py-3 text-center">{topic.content ? <FileText size={16} className="mx-auto text-info" aria-label="Content added" /> : <span className="text-base-content/25">–</span>}</td>
                                  <td className="px-3 py-3 text-center">{topic.videoUrl ? <Video size={16} className="mx-auto text-secondary" aria-label="Video added" /> : <span className="text-base-content/25">–</span>}</td>
                                  <td className="px-3 py-3 text-center">{topic.resources?.length ? <span className="inline-flex items-center gap-1 text-xs text-base-content/60"><Paperclip size={14} />{topic.resources.length}</span> : <span className="text-base-content/25">–</span>}</td>
                                  <td className="px-3 py-2">
                                    {editingTopicId === topic.id ? (
                                      <form onSubmit={(event) => handleSaveTopicTitle(event, classItem.id, topic)} className="flex justify-end gap-2">
                                        <label className="sr-only" htmlFor={`topic-title-${topic.id}`}>Topic title</label>
                                        <input id={`topic-title-${topic.id}`} autoFocus required maxLength={160} value={editingTopicTitle} onChange={(event) => setEditingTopicTitle(event.target.value)} className="min-w-0 rounded-lg border border-base-300 bg-base-100 px-2.5 py-1.5 text-xs text-base-content" />
                                        <Button type="submit" size="sm" isLoading={savingTopicId === topic.id} disabled={!editingTopicTitle.trim()}><Save size={13} /></Button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => setEditingTopicId(null)}><X size={13} /></Button>
                                      </form>
                                    ) : (
                                      <div className="flex justify-end gap-1">
                                        <button type="button" title="Move up" aria-label={`Move ${topic.title} up`} disabled={topicIndex === 0 || reorderingClassId === classItem.id} onClick={() => handleReorderTopics(classItem, topicIndex, -1)} className="rounded-md p-2 text-base-content/45 hover:bg-base-200 disabled:opacity-30"><ChevronUp size={15} /></button>
                                        <button type="button" title="Move down" aria-label={`Move ${topic.title} down`} disabled={topicIndex === classItem.topics.length - 1 || reorderingClassId === classItem.id} onClick={() => handleReorderTopics(classItem, topicIndex, 1)} className="rounded-md p-2 text-base-content/45 hover:bg-base-200 disabled:opacity-30"><ChevronDown size={15} /></button>
                                        <button type="button" title="Edit Topic" aria-label={`Edit ${topic.title}`} onClick={() => { setEditingTopicId(topic.id); setEditingTopicTitle(topic.title); }} className="rounded-md p-2 text-base-content/45 hover:bg-base-200 hover:text-primary"><Pencil size={15} /></button>
                                        <button type="button" title="Delete Topic" aria-label={`Delete ${topic.title}`} onClick={() => setPendingDelete({ kind: "topic", classId: classItem.id, topicId: topic.id, title: topic.title })} className="rounded-md p-2 text-base-content/45 hover:bg-error/10 hover:text-error"><Trash2 size={15} /></button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <form onSubmit={(event) => handleAddTopic(event, classItem.id)} className="mt-4 flex flex-col gap-2 rounded-lg border border-dashed border-base-300 p-3 sm:flex-row">
                        <label className="sr-only" htmlFor={`new-topic-${classItem.id}`}>New Topic title</label>
                        <input id={`new-topic-${classItem.id}`} required maxLength={160} value={newTopicTitles[classItem.id] || ""} onChange={(event) => setNewTopicTitles((current) => ({ ...current, [classItem.id]: event.target.value }))} placeholder="Topic title" className="min-w-0 flex-1 rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content placeholder:text-base-content/40" />
                        <Button type="submit" size="sm" isLoading={creatingTopicClassId === classItem.id} disabled={!newTopicTitles[classItem.id]?.trim()}><Plus size={14} /> Add Topic</Button>
                      </form>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        <Modal
          isOpen={Boolean(pendingDelete)}
          onClose={() => { if (!deleting) setPendingDelete(null); }}
          title={pendingDelete?.kind === "class" ? "Delete Class" : "Delete Topic"}
        >
          <p className="text-sm text-base-content/70">Delete <strong className="text-base-content">{pendingDelete?.title}</strong>{pendingDelete?.kind === "class" ? " and all its Topics?" : "?"} This cannot be undone.</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={deleting} onClick={() => setPendingDelete(null)}>Cancel</Button>
            <Button type="button" variant="error" isLoading={deleting} onClick={handleConfirmDelete}><Trash2 size={14} /> Delete</Button>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-12rem)] w-full flex-col overflow-hidden bg-[#FAFBFF]">
      {/* 1. GLOBAL SIDEBAR (From layout, but we simulate the nav area shown in image for full fidelity) */}
      {/* Wait, the existing dashboard layout provides the global sidebar. 
          But the image shows a specific layout. If we use the existing layout, it wraps this page.
          Let's assume the outer layout provides the main sidebar (Dashboard, My Courses, etc.). 
          We will build the page content starting from the Breadcrumbs. 
          Actually, the image shows a white sidebar on the far left. Our current layout likely has one. 
          We'll focus on the area *right* of the main global sidebar. */}

      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* ══ TOP HEADER ══ */}
        <header className="h-[72px] px-8 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
            <button
              type="button"
              onClick={() => setIsTopicEditorOpen(false)}
              className="rounded-full bg-indigo-50 px-3 py-2 font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              ← Classes
            </button>
            <Link
              href={user?.role === "super_admin" ? "/admin/dashboard" : "/teacher/dashboard"}
              className="hover:text-indigo-600 transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-slate-300">›</span>
            <Link
              href="/teacher/courses"
              className="hover:text-indigo-600 transition-colors"
            >
              Courses
            </Link>
            <span className="text-slate-300">›</span>
            <span className="text-slate-800">{course.title}</span>
            <span className="text-slate-300">›</span>
            <span className="text-slate-800">
              {classes.find((item) => item.id === activeModuleId)?.title || "Classes"}
            </span>
            <span className="text-slate-300">›</span>
            <span className="text-slate-800 font-semibold">Edit Content</span>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Preview
            </button>
              <button
                onClick={() => handleSaveTopic(false)}
                disabled={isSaving || isPublishing}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {isSaving ? "Saving..." : "Save as Draft"}
              </button>
              <button
                onClick={() => handleSaveTopic(true)}
                disabled={isSaving || isPublishing}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {isPublishing ? "Publishing..." : "Publish"}
                <span className="border-l border-white/20 pl-2 ml-1">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
          </div>
        </header>

        {/* ══ PAGE CONTENT ══ */}
        <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
          {/* 2. INNER LEFT SIDEBAR (Modules & Lessons) */}
          <aside className="hidden">
            <div className="max-h-[45vh] flex-1 overflow-y-auto border-b border-slate-100 p-4 sm:p-6 lg:max-h-none lg:pb-2">
              {/* Modules List */}
              <div className="space-y-4">
                {managerError && (
                  <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {managerError}
                  </div>
                )}
                {classes.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                    <p className="text-sm font-semibold text-slate-700">No Classes yet</p>
                    <p className="mt-1 text-xs text-slate-500">Create a Class to start organizing Topics.</p>
                  </div>
                ) : classes.map((mod, modIdx) => {
                  const isOpen = expandedModules[mod.id];
                  return (
                    <div
                      key={mod.id}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                    >
                      <div className="flex items-start gap-2 p-4">
                        <div className="flex-1 min-w-0">
                          {editingClassId === mod.id ? (
                            <form onSubmit={(event) => handleSaveClass(event, mod.id)} className="space-y-2">
                              <label className="sr-only" htmlFor={`class-title-${mod.id}`}>Class title</label>
                              <input
                                id={`class-title-${mod.id}`}
                                autoFocus
                                maxLength={120}
                                value={editingClassTitle}
                                onChange={(event) => setEditingClassTitle(event.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                              />
                              <div className="flex gap-2">
                                <Button type="submit" size="sm" isLoading={savingClassId === mod.id} disabled={!editingClassTitle.trim()}>
                                  <Save size={14} /> Save
                                </Button>
                                <Button type="button" size="sm" variant="outline" onClick={() => setEditingClassId(null)}>
                                  <X size={14} /> Cancel
                                </Button>
                              </div>
                            </form>
                          ) : (
                            <button
                              type="button"
                              aria-expanded={Boolean(isOpen)}
                              onClick={() => toggleModule(mod.id)}
                              className="w-full flex items-start gap-3 text-left"
                            >
                              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                {modIdx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-slate-800 truncate">{mod.title}</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                  {mod.topics.length} {mod.topics.length === 1 ? "Topic" : "Topics"}
                                </p>
                              </div>
                              {isOpen ? <ChevronDown size={17} className="text-slate-400 mt-1 shrink-0" /> : <ChevronDown size={17} className="-rotate-90 text-slate-400 mt-1 shrink-0" />}
                            </button>
                          )}
                        </div>
                        {editingClassId !== mod.id && (
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              title="Rename Class"
                              aria-label={`Rename ${mod.title}`}
                              onClick={() => { setEditingClassId(mod.id); setEditingClassTitle(mod.title); }}
                              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                            ><Pencil size={15} /></button>
                            <button
                              type="button"
                              title="Delete Class"
                              aria-label={`Delete ${mod.title}`}
                              onClick={() => setPendingDelete({ kind: "class", classId: mod.id, title: mod.title })}
                              className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            ><Trash2 size={15} /></button>
                          </div>
                        )}
                      </div>

                      {/* Topics List */}
                      {isOpen && (
                        <div className="px-2 pb-2">
                          {mod.topics.map((topic, topicIdx) => {
                            const isActive = activeTopic?.id === topic.id;
                            return (
                              <div key={topic.id} className="mb-1">
                                <button
                                  onClick={() => {
                                    setActiveTopic(topic);
                                    setActiveModuleId(mod.id);
                                  }}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                                    isActive
                                      ? "bg-indigo-50 border border-indigo-200 shadow-sm"
                                      : "hover:bg-slate-50 border border-transparent"
                                  }`}
                                >
                                  <div className="flex items-center justify-center w-5 h-5 shrink-0 text-slate-300">
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <line x1="8" y1="6" x2="21" y2="6"></line>
                                      <line
                                        x1="8"
                                        y1="12"
                                        x2="21"
                                        y2="12"
                                      ></line>
                                      <line
                                        x1="8"
                                        y1="18"
                                        x2="21"
                                        y2="18"
                                      ></line>
                                      <line
                                        x1="3"
                                        y1="6"
                                        x2="3.01"
                                        y2="6"
                                      ></line>
                                      <line
                                        x1="3"
                                        y1="12"
                                        x2="3.01"
                                        y2="12"
                                      ></line>
                                      <line
                                        x1="3"
                                        y1="18"
                                        x2="3.01"
                                        y2="18"
                                      ></line>
                                    </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4
                                      className={`text-[13px] font-semibold truncate ${isActive ? "text-indigo-900" : "text-slate-700"}`}
                                    >
                                      {modIdx + 1}.{topicIdx + 1} {topic.title}
                                    </h4>
                                    <p
                                      className={`text-[11px] ${isActive ? "text-indigo-600/70" : "text-slate-400"}`}
                                    >
                                      {topic.duration} min
                                    </p>
                                  </div>
                                  {isActive ? (
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      className="text-indigo-600 shrink-0"
                                    >
                                      <circle cx="12" cy="12" r="1"></circle>
                                      <circle cx="12" cy="5" r="1"></circle>
                                      <circle cx="12" cy="19" r="1"></circle>
                                    </svg>
                                  ) : (
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      className="text-emerald-500 shrink-0"
                                    >
                                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                  )}
                                </button>

                                {editingTopicId === topic.id ? (
                                  <form onSubmit={(event) => handleSaveTopicTitle(event, mod.id, topic)} className="ml-2 mt-2 flex flex-wrap gap-2">
                                    <label className="sr-only" htmlFor={`topic-title-${topic.id}`}>Topic title</label>
                                    <input
                                      id={`topic-title-${topic.id}`}
                                      autoFocus
                                      required
                                      maxLength={160}
                                      value={editingTopicTitle}
                                      onChange={(event) => setEditingTopicTitle(event.target.value)}
                                      className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                    <Button type="submit" size="sm" isLoading={savingTopicId === topic.id} disabled={!editingTopicTitle.trim()}>
                                      <Save size={13} /> Save
                                    </Button>
                                    <Button type="button" size="sm" variant="outline" onClick={() => setEditingTopicId(null)}>
                                      <X size={13} />
                                    </Button>
                                  </form>
                                ) : (
                                  <div className="ml-9 mt-1 flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      title="Move Topic up"
                                      aria-label={`Move ${topic.title} up`}
                                      disabled={topicIdx === 0 || reorderingClassId === mod.id}
                                      onClick={() => handleReorderTopics(mod, topicIdx, -1)}
                                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
                                    ><ChevronUp size={15} /></button>
                                    <button
                                      type="button"
                                      title="Move Topic down"
                                      aria-label={`Move ${topic.title} down`}
                                      disabled={topicIdx === mod.topics.length - 1 || reorderingClassId === mod.id}
                                      onClick={() => handleReorderTopics(mod, topicIdx, 1)}
                                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
                                    ><ChevronDown size={15} /></button>
                                    <button
                                      type="button"
                                      title="Rename Topic"
                                      aria-label={`Rename ${topic.title}`}
                                      onClick={() => { setEditingTopicId(topic.id); setEditingTopicTitle(topic.title); }}
                                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                                    ><Pencil size={14} /></button>
                                    <button
                                      type="button"
                                      title="Delete Topic"
                                      aria-label={`Delete ${topic.title}`}
                                      onClick={() => setPendingDelete({ kind: "topic", classId: mod.id, topicId: topic.id, title: topic.title })}
                                      className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                    ><Trash2 size={14} /></button>
                                  </div>
                                )}

                                {/* Expanded active topic sub-menu */}
                                {isActive && (
                                  <div className="ml-9 mr-3 mt-1 mb-3 space-y-1">
                                    <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] font-medium text-indigo-600 hover:bg-indigo-50/50 rounded">
                                      <span className="w-1 h-1 rounded-full bg-indigo-600"></span>{" "}
                                      Content
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-50 rounded">
                                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>{" "}
                                      Resources ({topic.resources?.length || 0})
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-50 rounded">
                                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>{" "}
                                      Quiz (0 Questions)
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {mod.topics.length === 0 && (
                            <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                              No Topics in this Class yet. Add the first Topic below.
                            </p>
                          )}
                          <form onSubmit={(event) => handleAddTopic(event, mod.id)} className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row">
                            <label className="sr-only" htmlFor={`new-topic-${mod.id}`}>New Topic title</label>
                            <input
                              id={`new-topic-${mod.id}`}
                              required
                              maxLength={160}
                              value={newTopicTitles[mod.id] || ""}
                              onChange={(event) => setNewTopicTitles((current) => ({ ...current, [mod.id]: event.target.value }))}
                              placeholder="Topic title"
                              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <Button type="submit" size="sm" isLoading={creatingTopicClassId === mod.id} disabled={!newTopicTitles[mod.id]?.trim()}>
                              <Plus size={14} /> Add Topic
                            </Button>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleAddClass} className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
              <label htmlFor="new-class-title" className="block text-xs font-bold uppercase text-slate-500">Create Class</label>
              <input
                id="new-class-title"
                required
                maxLength={120}
                value={newClassTitle}
                onChange={(event) => setNewClassTitle(event.target.value)}
                placeholder="Class title"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <Button type="submit" size="sm" className="w-full" isLoading={creatingClass} disabled={!newClassTitle.trim()}>
                <Plus size={15} /> Add Class
              </Button>
            </form>
          </aside>

          {/* 3. MAIN CONTENT EDITOR */}
          <main className="flex-1 h-full overflow-y-auto bg-[#FAFBFF]">
            <div className="max-w-4xl mx-auto p-8 h-full flex flex-col">
              <div className="flex gap-6 mb-8">
                {/* Title Input */}
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    value={editedTopic?.title || ""}
                    onChange={(e) =>
                      setEditedTopic((prev) =>
                        prev ? { ...prev, title: e.target.value } : null,
                      )
                    }
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[15px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
                  />
                </div>
                {/* Duration Input */}
                <div className="w-40">
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={editedTopic?.duration || ""}
                    onChange={(e) =>
                      setEditedTopic((prev) =>
                        prev
                          ? { ...prev, duration: Number(e.target.value) }
                          : null,
                      )
                    }
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[15px] font-medium text-slate-800 focus:outline-none shadow-sm"
                  />
                </div>
              </div>
              {/* Content Type Selector */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Content Type
                </label>
                <div className="flex gap-2">
                  {[
                    "Rich Text",
                    "Markdown",
                    "Video",
                    "PDF",
                    "HTML",
                    "Embed",
                  ].map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveContentType(type)}
                      className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                        activeContentType === type
                          ? "bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm"
                          : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              {/* Editor Container */}
              <div className="bg-white border border-slate-200 rounded-2xl flex flex-col flex-1 min-h-[400px] shadow-sm overflow-hidden mb-8">
                {/* Editor Toolbar */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center flex-wrap gap-x-6 gap-y-2 bg-slate-50/50">
                  {/* Paragraph Select */}
                  <button className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-100 px-2 py-1 rounded">
                    Paragraph
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {/* Formatting Group */}
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold font-serif">
                      B
                    </button>
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 italic font-serif">
                      I
                    </button>
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 underline font-serif">
                      U
                    </button>
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100">
                      <span className="font-bold mr-1">A</span>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>

                  {/* Lists Group */}
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                      </svg>
                    </button>
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  {/* Insert Group */}
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </button>
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                      </svg>
                    </button>
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 font-serif font-bold">
                      {"{ }"}
                    </button>
                  </div>

                  {/* Undo/Redo */}
                  <div className="flex items-center gap-1 ml-auto">
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 7v6h6"></path>
                        <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                      </svg>
                    </button>
                    <button className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 7v6h-6"></path>
                        <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Editor Area */}
                <div className="p-6 flex-1 bg-white">
                  {["Rich Text", "Markdown", "HTML"].includes(activeContentType) ? (
                    <textarea
                      className="w-full h-full resize-none text-[15px] leading-relaxed text-slate-800 placeholder:text-slate-300 focus:outline-none"
                      placeholder="Start writing lesson content here..."
                      value={editedTopic?.content || ""}
                      onChange={(e) =>
                        setEditedTopic((prev) =>
                          prev ? { ...prev, content: e.target.value } : null,
                        )
                      }
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-4 text-2xl">🔗</div>
                      <h4 className="text-[15px] font-bold text-slate-700 mb-2">Provide a Link for {activeContentType}</h4>
                      <p className="text-[12px] text-slate-500 mb-6">Paste the URL for your {activeContentType} content below.</p>
                      <input
                        type="url"
                        placeholder={`Paste ${activeContentType} URL here...`}
                        value={editedTopic?.content || ""}
                        onChange={(e) => setEditedTopic(prev => prev ? { ...prev, content: e.target.value } : null)}
                        className="w-[80%] max-w-md px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:border-indigo-500 shadow-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Editor Status Bar */}
                <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-[11px] font-medium text-slate-400">
                  <div>
                    Words:{" "}
                    {editedTopic?.content?.trim()
                      ? editedTopic.content.trim().split(/\s+/).length
                      : 0}{" "}
                    &nbsp;&nbsp; Characters: {editedTopic?.content?.length || 0}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {activeTopic?.content !== editedTopic?.content ? (
                      <span className="text-amber-500">Unsaved changes</span>
                    ) : (
                      <>
                        Draft saved
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {/* Lesson Resources Bottom Area */}
              <div>
                <h3 className="text-[15px] font-bold text-slate-800 mb-1">
                  Lesson Resources
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Add supplementary materials for this lesson
                </p>

                <div className="flex gap-4">
                  {/* Sample Resource 1 */}
                  <div className="w-[300px] border border-slate-200 rounded-xl p-3 flex items-center gap-3 bg-white shadow-sm">
                    <div className="w-10 h-10 rounded bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM14 11h1V8.5h-1V11z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-slate-800 truncate">
                        HTML_Quick_Reference.pdf
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        2.4 MB • PDF
                      </p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-700">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </button>
                  </div>

                  {/* Sample Resource 2 */}
                  <div className="w-[300px] border border-slate-200 rounded-xl p-3 flex items-center gap-3 bg-white shadow-sm">
                    <div className="w-10 h-10 rounded bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-slate-800 truncate">
                        HTML_Examples.zip
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        1.8 MB • ZIP
                      </p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-700">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </button>
                  </div>

                  {/* Add Resource Button */}
                  <button className="w-[200px] border border-slate-200 border-dashed rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 bg-white transition-colors">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Resource
                  </button>
                </div>
              </div>
              <div className="h-16"></div> {/* Bottom padding */}
            </div>
          </main>

          {/* 4. RIGHT SIDEBAR (Insert Panel) */}
          <aside className="w-[300px] bg-white border-l border-slate-200 h-full overflow-y-auto shrink-0 p-6">
            {/* Insert / Media Section */}
            <div className="mb-6">
              <button className="flex items-center justify-between w-full mb-4 group">
                <h3 className="text-[13px] font-bold text-slate-800">Insert</h3>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-400 group-hover:text-slate-600 transition-colors"
                >
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </button>

              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Media
              </h4>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button className="h-[46px] rounded-lg border border-slate-200 flex items-center justify-center gap-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  Image
                </button>
                <button className="h-[46px] rounded-lg border border-slate-200 flex items-center justify-center gap-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect
                      x="1"
                      y="5"
                      width="15"
                      height="14"
                      rx="2"
                      ry="2"
                    ></rect>
                  </svg>
                  Video
                </button>
                <button className="h-[46px] rounded-lg border border-slate-200 flex items-center justify-center gap-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                  </svg>
                  Audio
                </button>
                <button className="h-[46px] rounded-lg border border-slate-200 flex items-center justify-center gap-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                  File
                </button>
              </div>

              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Elements
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Heading",
                    icon: (
                      <span className="font-serif font-bold text-sm">H</span>
                    ),
                    snippet: "### New Heading",
                  },
                  {
                    label: "Divider",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    ),
                    snippet: "---",
                  },
                  {
                    label: "Table",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                      </svg>
                    ),
                    snippet: "| Column 1 | Column 2 |\n| -------- | -------- |\n| Text     | Text     |",
                  },
                  {
                    label: "Code Block",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                      </svg>
                    ),
                    snippet: "```javascript\n// Write your code here\n```",
                  },
                  {
                    label: "Quote",
                    icon: (
                      <span className="font-serif font-bold text-lg leading-none h-4">"</span>
                    ),
                    snippet: "> This is a quote block.",
                  },
                  {
                    label: "Alert",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                    ),
                    snippet: "> [!NOTE]\n> This is an alert message.",
                  },
                  {
                    label: "List",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                      </svg>
                    ),
                    snippet: "- Item 1\n- Item 2",
                  },
                  {
                    label: "Checklist",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                    ),
                    snippet: "- [ ] Task 1\n- [ ] Task 2",
                  },
                ].map((el, i) => (
                  <button
                    key={i}
                    onClick={() => insertContent(el.snippet)}
                    className="h-[46px] rounded-lg border border-slate-200 flex items-center justify-start px-3 gap-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm"
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-slate-400">
                      {el.icon}
                    </span>
                    {el.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates Accordion */}
            <div className="border-t border-slate-100 py-5">
              <button className="flex items-center justify-between w-full group">
                <h3 className="text-[13px] font-bold text-slate-800">
                  Templates
                </h3>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-400 group-hover:text-slate-600 transition-colors"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* AI Assistant Accordion */}
            <div className="border-t border-slate-100 py-5">
              <button className="flex items-center justify-between w-full group">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-bold text-slate-800">
                    AI Assistant
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold">
                    New
                  </span>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-400 group-hover:text-slate-600 transition-colors"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
          </aside>
        </div>
      </div>
      <Modal
        isOpen={Boolean(pendingDelete)}
        onClose={() => { if (!deleting) setPendingDelete(null); }}
        title={pendingDelete?.kind === "class" ? "Delete Class" : "Delete Topic"}
      >
        <p className="text-sm text-base-content/70">
          Delete <span className="font-semibold text-base-content">{pendingDelete?.title}</span>
          {pendingDelete?.kind === "class" ? " and all of its Topics? This cannot be undone." : "? This cannot be undone."}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={deleting} onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          <Button type="button" variant="error" isLoading={deleting} onClick={handleConfirmDelete}>
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

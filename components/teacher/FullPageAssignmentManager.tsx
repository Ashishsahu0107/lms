"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  ClipboardList,
  Save,
  Check,
  X,
  ExternalLink,
  Calendar,
  Award,
  FileCheck,
  Upload,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { API_URL } from "@/lib/api-config";

export interface AssignmentItem {
  id?: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string | null;
  totalMarks: number;
  assignmentType: "written" | "file" | "both";
  attachments: string[];
  status: "published" | "draft";
  topicId: string;
  moduleId?: string;
  courseId?: string;
  createdAt?: string;
}

interface FullPageAssignmentManagerProps {
  topicId: string;
  moduleId?: string;
  courseId?: string;
  onStatsUpdated?: (count: number) => void;
}

export default function FullPageAssignmentManager({
  topicId,
  moduleId,
  courseId,
  onStatsUpdated,
}: FullPageAssignmentManagerProps) {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [marks, setMarks] = useState(100);
  const [assignmentType, setAssignmentType] = useState<"written" | "file" | "both">("file");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("published");

  // Load assignments
  const fetchAssignments = useCallback(async () => {
    if (!topicId) return;
    setLoading(true);
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch(`${API_URL}/assignments?topicId=${topicId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        const list: AssignmentItem[] = data.data.assignments || [];
        setAssignments(list);
        if (onStatsUpdated) onStatsUpdated(list.length);
      }
    } catch (err) {
      console.error("Failed to load assignments:", err);
    } finally {
      setLoading(false);
    }
  }, [topicId, onStatsUpdated]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    // Default due date to 7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDueDate(d.toISOString().slice(0, 16));
    setMarks(100);
    setAssignmentType("file");
    setAttachmentUrl("");
    setStatus("published");
    setShowForm(true);
  };

  const handleOpenEdit = (a: AssignmentItem) => {
    setEditingId(a.id || null);
    setTitle(a.title);
    setDescription(a.description || "");
    setDueDate(
      a.dueDate ? new Date(a.dueDate).toISOString().slice(0, 16) : ""
    );
    setMarks(a.totalMarks || 100);
    setAssignmentType(a.assignmentType || "file");
    setAttachmentUrl(a.attachments?.[0] || "");
    setStatus(a.status || "published");
    setShowForm(true);
  };

  const handleSave = async (overrideStatus?: "published" | "draft") => {
    if (!title.trim()) {
      toast.error("Please enter assignment title");
      return;
    }

    const token = localStorage.getItem("token") || "";
    setSaving(true);
    const targetStatus = overrideStatus || status;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      totalMarks: Number(marks) || 100,
      assignmentType,
      attachments: attachmentUrl.trim() ? [attachmentUrl.trim()] : [],
      status: targetStatus,
      topicId,
      moduleId,
      courseId,
    };

    try {
      const url = editingId
        ? `${API_URL}/assignments/${editingId}`
        : `${API_URL}/assignments`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save assignment");
      }

      toast.success(
        editingId ? "Assignment updated" : "Assignment created"
      );
      setShowForm(false);
      fetchAssignments();
    } catch (err: any) {
      toast.error(err.message || "Failed to save assignment");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch(`${API_URL}/assignments/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      toast.success("Assignment deleted");
      const remaining = assignments.filter((a) => a.id !== id);
      setAssignments(remaining);
      if (onStatsUpdated) onStatsUpdated(remaining.length);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete assignment");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-4xl mx-auto w-full space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <ClipboardList className="text-secondary" size={20} />
            <span>Topic Assignments ({assignments.length})</span>
          </h2>
          <p className="text-xs text-base-content/60">
            Create homework tasks, project briefs, coding exercises, or practical
            evaluations.
          </p>
        </div>

        {!showForm && (
          <Button onClick={handleOpenCreate} variant="primary">
            <Plus size={15} /> Create Assignment
          </Button>
        )}
      </div>

      {/* ── CREATE / EDIT ASSIGNMENT FORM */}
      {showForm && (
        <div className="p-6 rounded-2xl border-2 border-secondary/40 bg-base-100 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-base-200 pb-3">
            <h3 className="text-sm font-bold text-secondary">
              {editingId ? "Edit Assignment" : "New Assignment"}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-1 rounded-lg text-base-content/50 hover:bg-base-200"
            >
              <X size={15} />
            </button>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-base-content/60">
              Assignment Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build an Interactive Todo App in React"
              className="w-full text-sm font-semibold rounded-xl border border-base-300 bg-base-100 px-3.5 py-2 text-base-content focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-base-content/60">
              Description & Task Requirements
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the requirements, guidelines, deliverables, and grading criteria..."
              className="w-full text-xs rounded-xl border border-base-300 bg-base-100 px-3.5 py-2 text-base-content focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
            />
          </div>

          {/* Due date, Marks, Submission type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-base-content/60 mb-1 block">
                Due Date & Time
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs rounded-xl border border-base-300 bg-base-100 px-3 py-1.5 text-base-content focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/60 mb-1 block">
                Total Marks
              </label>
              <input
                type="number"
                min={1}
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                className="w-full text-xs rounded-xl border border-base-300 bg-base-100 px-3 py-1.5 text-base-content focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/60 mb-1 block">
                Submission Type
              </label>
              <select
                value={assignmentType}
                onChange={(e) => setAssignmentType(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-base-300 bg-base-100 px-3 py-1.5 text-base-content focus:border-secondary focus:outline-none"
              >
                <option value="file">File Upload (PDF / Code / Zip)</option>
                <option value="written">Written Text / Code Snippet</option>
                <option value="both">Both (File & Written Text)</option>
              </select>
            </div>
          </div>

          {/* Attachment / Starter code link */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-base-content/60">
              Attachment or Reference Link (Optional)
            </label>
            <input
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://github.com/... or link to starter project"
              className="w-full text-xs rounded-xl border border-base-300 bg-base-100 px-3.5 py-2 text-base-content focus:border-secondary focus:outline-none"
            />
          </div>

          {/* Status selector & actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-base-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-base-content/60">
                Status:
              </span>
              <button
                type="button"
                onClick={() =>
                  setStatus(status === "published" ? "draft" : "published")
                }
                className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                  status === "published"
                    ? "bg-success/15 border-success text-success"
                    : "bg-warning/15 border-warning text-warning"
                }`}
              >
                {status === "published" ? "● Published" : "○ Draft"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                isLoading={saving}
                onClick={() => handleSave()}
              >
                <Check size={14} />
                <span>
                  {editingId ? "Update Assignment" : "Save Assignment"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGNMENTS LIST */}
      {assignments.length === 0 && !showForm ? (
        <div className="p-12 text-center border border-dashed border-base-300 rounded-2xl bg-base-100">
          <ClipboardList size={36} className="mx-auto text-secondary/40 mb-2" />
          <h4 className="text-sm font-bold text-base-content">
            No Assignments for this Topic
          </h4>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto mt-1 mb-4">
            Give students practical tasks, project briefs, or assignments to assess
            their understanding.
          </p>
          <Button onClick={handleOpenCreate} variant="primary">
            <Plus size={14} /> Create First Assignment
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="p-6 rounded-2xl border border-base-200 bg-base-100 hover:border-base-300 transition-all shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-base-content">
                      {a.title}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        a.status === "published"
                          ? "bg-success/15 text-success border border-success/30"
                          : "bg-warning/15 text-warning border border-warning/30"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                  {a.description && (
                    <p className="text-xs text-base-content/70 leading-relaxed max-w-2xl whitespace-pre-line">
                      {a.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(a)}
                    className="p-1.5 rounded-lg text-base-content/50 hover:text-secondary hover:bg-secondary/10 transition-colors"
                    title="Edit Assignment"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => a.id && handleDelete(a.id)}
                    className="p-1.5 rounded-lg text-base-content/50 hover:text-error hover:bg-error/10 transition-colors"
                    title="Delete Assignment"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Metadata tags: Due date, Marks, Submission type, Attachment */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-base-200 text-xs">
                {a.dueDate && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200 text-base-content/70 font-medium">
                    <Calendar size={13} className="text-secondary" />
                    <span>Due: {new Date(a.dueDate).toLocaleString()}</span>
                  </span>
                )}

                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200 text-base-content/70 font-medium">
                  <Award size={13} className="text-warning" />
                  <span>{a.totalMarks} Marks</span>
                </span>

                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200 text-base-content/70 font-medium capitalize">
                  <FileCheck size={13} className="text-info" />
                  <span>{a.assignmentType} Submission</span>
                </span>

                {a.attachments?.[0] && (
                  <a
                    href={a.attachments[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors"
                  >
                    <Link2 size={13} />
                    <span>Attachment</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

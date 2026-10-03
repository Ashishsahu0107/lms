"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Paperclip,
  Plus,
  Trash2,
  Pencil,
  ExternalLink,
  Check,
  X,
  Link as LinkIcon,
  FileCode,
  FileText,
  FileSpreadsheet,
  Globe,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { API_URL } from "@/lib/api-config";

export interface ResourceItem {
  id?: string;
  title: string;
  fileUrl: string;
  resourceType: string;
  description?: string;
}

interface FullPageResourceManagerProps {
  topicId: string;
  onStatsUpdated?: (count: number) => void;
}

export default function FullPageResourceManager({
  topicId,
  onStatsUpdated,
}: FullPageResourceManagerProps) {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("link");
  const [description, setDescription] = useState("");

  const fetchResources = useCallback(async () => {
    if (!topicId) return;
    setLoading(true);
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch(`${API_URL}/topics/${topicId}/resources`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data.resources)) {
        // Filter out videos since videos has its own dedicated page
        const filtered = data.data.resources.filter(
          (r: any) => r.resourceType !== "video"
        );
        setResources(filtered);
        if (onStatsUpdated) onStatsUpdated(filtered.length);
      }
    } catch (err) {
      console.error("Failed to load resources:", err);
    } finally {
      setLoading(false);
    }
  }, [topicId, onStatsUpdated]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle("");
    setUrl("");
    setType("link");
    setDescription("");
    setShowForm(true);
  };

  const handleOpenEdit = (r: ResourceItem) => {
    setEditingId(r.id || null);
    setTitle(r.title);
    setUrl(r.fileUrl);
    setType(r.resourceType || "link");
    setDescription(r.description || "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !url.trim()) {
      toast.error("Please enter both title and URL");
      return;
    }

    const token = localStorage.getItem("token") || "";
    setSaving(true);

    const payload = {
      title: title.trim(),
      fileUrl: url.trim(),
      resourceType: type,
      description: description.trim(),
    };

    try {
      const targetUrl = editingId
        ? `${API_URL}/topics/${topicId}/resources/${editingId}`
        : `${API_URL}/topics/${topicId}/resources`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(targetUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      toast.success(editingId ? "Resource updated" : "Resource added");
      setShowForm(false);
      fetchResources();
    } catch (err: any) {
      toast.error(err.message || "Failed to save resource");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this resource?")) return;
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch(`${API_URL}/topics/${topicId}/resources/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      toast.success("Resource deleted");
      const remaining = resources.filter((r) => r.id !== id);
      setResources(remaining);
      if (onStatsUpdated) onStatsUpdated(remaining.length);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete resource");
    }
  };

  const getTypeIcon = (resType: string) => {
    switch (resType) {
      case "code":
        return <FileCode size={16} className="text-primary" />;
      case "pdf":
      case "document":
        return <FileText size={16} className="text-info" />;
      case "spreadsheet":
        return <FileSpreadsheet size={16} className="text-emerald-500" />;
      default:
        return <Globe size={16} className="text-emerald-500" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-4xl mx-auto w-full space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <Paperclip className="text-emerald-500" size={20} />
            <span>Topic Resources ({resources.length})</span>
          </h2>
          <p className="text-xs text-base-content/60">
            Share documentation links, GitHub repositories, cheat sheets, or
            recommended tools.
          </p>
        </div>

        {!showForm && (
          <Button onClick={handleOpenCreate} variant="primary">
            <Plus size={15} /> Add Resource
          </Button>
        )}
      </div>

      {/* ── CREATE / EDIT FORM */}
      {showForm && (
        <div className="p-6 rounded-2xl border-2 border-emerald-500/40 bg-base-100 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-base-200 pb-3">
            <h3 className="text-sm font-bold text-emerald-500">
              {editingId ? "Edit Resource" : "Add Resource"}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-1 rounded-lg text-base-content/50 hover:bg-base-200"
            >
              <X size={15} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-base-content/60">
                Resource Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Official React Documentation / Cheat Sheet"
                className="w-full text-xs font-semibold rounded-xl border border-base-300 bg-base-100 px-3.5 py-2 text-base-content focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-base-content/60">
                Resource Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full text-xs rounded-xl border border-base-300 bg-base-100 px-3 py-2 text-base-content focus:border-emerald-500 focus:outline-none"
              >
                <option value="link">Web Link / Article</option>
                <option value="code">GitHub / Code Repository</option>
                <option value="pdf">PDF Document</option>
                <option value="document">Doc / Presentation</option>
                <option value="spreadsheet">Spreadsheet / Data</option>
                <option value="other">Tool / Other Reference</option>
              </select>
            </div>
          </div>

          {/* URL */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-base-content/60">
              Resource URL
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://react.dev/reference/... or https://github.com/..."
              className="w-full text-xs rounded-xl border border-base-300 bg-base-100 px-3.5 py-2 text-base-content focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-base-content/60">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this resource cover and when should students reference it..."
              className="w-full text-xs rounded-xl border border-base-300 bg-base-100 px-3.5 py-2 text-base-content focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-base-200">
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
              onClick={handleSave}
            >
              <Check size={14} />
              <span>{editingId ? "Update Resource" : "Save Resource"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* ── RESOURCES LIST */}
      {resources.length === 0 && !showForm ? (
        <div className="p-12 text-center border border-dashed border-base-300 rounded-2xl bg-base-100">
          <Paperclip size={36} className="mx-auto text-emerald-500/40 mb-2" />
          <h4 className="text-sm font-bold text-base-content">
            No Resources for this Topic
          </h4>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto mt-1 mb-4">
            Provide external reading, GitHub repos, cheat sheets, or tools to support
            your students.
          </p>
          <Button onClick={handleOpenCreate} variant="primary">
            <Plus size={14} /> Add First Resource
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resources.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl border border-base-200 bg-base-100 hover:border-base-300 transition-all shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-base-200 flex items-center justify-center shrink-0">
                      {getTypeIcon(r.resourceType)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-base-content line-clamp-1">
                        {r.title}
                      </h4>
                      <span className="text-[10px] uppercase font-semibold text-base-content/40 tracking-wider">
                        {r.resourceType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(r)}
                      className="p-1.5 rounded-lg text-base-content/50 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                      title="Edit Resource"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => r.id && handleDelete(r.id)}
                      className="p-1.5 rounded-lg text-base-content/50 hover:text-error hover:bg-error/10 transition-colors"
                      title="Delete Resource"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {r.description && (
                  <p className="text-xs text-base-content/70 line-clamp-2">
                    {r.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-base-200">
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline truncate"
                >
                  <LinkIcon size={12} className="shrink-0" />
                  <span className="truncate">{r.fileUrl}</span>
                  <ExternalLink size={11} className="shrink-0 ml-auto" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

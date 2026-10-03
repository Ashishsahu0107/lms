"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Video as VideoIcon,
  Plus,
  Trash2,
  Pencil,
  Play,
  ExternalLink,
  Check,
  X,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { API_URL } from "@/lib/api-config";

export interface VideoItem {
  id?: string;
  title: string;
  fileUrl: string;
  description?: string;
  duration?: number;
  resourceType: "video";
  isPrimary?: boolean;
}

interface FullPageVideoManagerProps {
  topic: any;
  onStatsUpdated?: (count: number) => void;
  onTopicRefreshed?: () => void;
}

export default function FullPageVideoManager({
  topic,
  onStatsUpdated,
  onTopicRefreshed,
}: FullPageVideoManagerProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [duration, setDuration] = useState(15);
  const [description, setDescription] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  // Active playing preview video
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);

  // Parse embeddable video URL
  const getEmbedVideoUrl = (rawUrl: string) => {
    if (!rawUrl) return null;
    if (rawUrl.includes("youtube.com/watch?v=")) {
      const id = rawUrl.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (rawUrl.includes("youtu.be/")) {
      const id = rawUrl.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (rawUrl.includes("vimeo.com/")) {
      const id = rawUrl.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    return rawUrl;
  };

  // Load videos
  const fetchVideos = useCallback(async () => {
    if (!topic?.id) return;
    setLoading(true);
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch(`${API_URL}/topics/${topic.id}/resources`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      let videoList: VideoItem[] = [];

      // 1. If topic has main videoUrl, add it as primary
      if (topic.videoUrl) {
        videoList.push({
          id: "primary",
          title: "Main Lecture Video",
          fileUrl: topic.videoUrl,
          duration: topic.duration || 15,
          description: "Primary lecture video for this topic",
          resourceType: "video",
          isPrimary: true,
        });
      }

      // 2. Add supplementary videos from resources
      if (data.success && Array.isArray(data.data.resources)) {
        const extraVideos = data.data.resources
          .filter((r: any) => r.resourceType === "video")
          .map((r: any) => ({
            id: r.id,
            title: r.title,
            fileUrl: r.fileUrl,
            description: r.description,
            duration: r.duration || 10,
            resourceType: "video",
            isPrimary: false,
          }));
        videoList = [...videoList, ...extraVideos];
      }

      setVideos(videoList);
      if (onStatsUpdated) onStatsUpdated(videoList.length);
      if (!playingVideoUrl && videoList.length > 0) {
        setPlayingVideoUrl(videoList[0].fileUrl);
      }
    } catch (err) {
      console.error("Failed to load videos:", err);
    } finally {
      setLoading(false);
    }
  }, [topic?.id, topic?.videoUrl, topic?.duration, playingVideoUrl, onStatsUpdated]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle("");
    setUrl("");
    setDuration(15);
    setDescription("");
    setIsPrimary(videos.length === 0);
    setShowForm(true);
  };

  const handleOpenEdit = (v: VideoItem) => {
    setEditingId(v.id || null);
    setTitle(v.title);
    setUrl(v.fileUrl);
    setDuration(v.duration || 15);
    setDescription(v.description || "");
    setIsPrimary(Boolean(v.isPrimary));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !url.trim()) {
      toast.error("Please provide both title and video URL");
      return;
    }

    const token = localStorage.getItem("token") || "";
    setSaving(true);

    try {
      if (editingId === "primary" || isPrimary) {
        // Update main topic video
        const res = await fetch(`${API_URL}/topics/${topic.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            videoUrl: url.trim(),
            duration: Number(duration) || 15,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);
      } else {
        // Save as video resource
        const payload = {
          title: title.trim(),
          fileUrl: url.trim(),
          resourceType: "video",
          description: description.trim(),
          duration: Number(duration) || 15,
        };

        const targetUrl = editingId
          ? `${API_URL}/topics/${topic.id}/resources/${editingId}`
          : `${API_URL}/topics/${topic.id}/resources`;
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
      }

      toast.success(editingId ? "Video updated" : "Video added successfully");
      setShowForm(false);
      setPlayingVideoUrl(url.trim());
      if (onTopicRefreshed) onTopicRefreshed();
      fetchVideos();
    } catch (err: any) {
      toast.error(err.message || "Failed to save video");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (v: VideoItem) => {
    if (!window.confirm(`Delete "${v.title}"?`)) return;
    const token = localStorage.getItem("token") || "";

    try {
      if (v.isPrimary) {
        const res = await fetch(`${API_URL}/topics/${topic.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ videoUrl: "" }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);
      } else if (v.id) {
        const res = await fetch(
          `${API_URL}/topics/${topic.id}/resources/${v.id}`,
          {
            method: "DELETE",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);
      }

      toast.success("Video deleted");
      if (playingVideoUrl === v.fileUrl) {
        setPlayingVideoUrl(null);
      }
      if (onTopicRefreshed) onTopicRefreshed();
      fetchVideos();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete video");
    }
  };

  const previewEmbedUrl = getEmbedVideoUrl(url || playingVideoUrl || "");

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-8">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <VideoIcon className="text-primary" size={20} />
            <span>Topic Videos ({videos.length})</span>
          </h2>
          <p className="text-xs text-base-content/60">
            Add YouTube, Vimeo, or direct MP4 video links with live interactive player
            previews.
          </p>
        </div>

        {!showForm && (
          <Button onClick={handleOpenCreate} variant="primary">
            <Plus size={15} /> Add Video
          </Button>
        )}
      </div>

      {/* ── LIVE INTERACTIVE VIDEO PLAYER PREVIEW */}
      {previewEmbedUrl && (
        <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden shadow-lg space-y-3">
          <div className="aspect-video w-full bg-black relative flex items-center justify-center">
            {previewEmbedUrl.includes("youtube.com/embed") ||
            previewEmbedUrl.includes("player.vimeo.com") ? (
              <iframe
                src={previewEmbedUrl}
                title="Video preview"
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={previewEmbedUrl}
                controls
                className="w-full h-full object-contain"
              />
            )}
          </div>

          <div className="px-5 py-3 flex items-center justify-between text-xs text-base-content/70">
            <span className="font-semibold flex items-center gap-1.5 text-primary">
              <Play size={14} className="fill-primary" />
              <span>Interactive Player Preview</span>
            </span>
            <span className="text-base-content/50 truncate max-w-xs font-mono">
              {playingVideoUrl}
            </span>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT FORM */}
      {showForm && (
        <div className="p-6 rounded-2xl border-2 border-primary/40 bg-base-100 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-base-200 pb-3">
            <h3 className="text-sm font-bold text-primary">
              {editingId ? "Edit Video" : "Add New Video"}
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
                Video Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full Lecture: React State & Redux Toolkit"
                className="w-full text-xs font-semibold rounded-xl border border-base-300 bg-base-100 px-3.5 py-2 text-base-content focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-base-content/60">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full text-xs rounded-xl border border-base-300 bg-base-100 px-3 py-2 text-base-content focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* URL Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-base-content/60 flex items-center justify-between">
              <span>Video URL (YouTube, Vimeo, or direct MP4 URL)</span>
              <span className="text-[11px] text-primary">Live preview supported</span>
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
              className="w-full text-xs rounded-xl border border-base-300 bg-base-100 px-3.5 py-2 text-base-content focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              placeholder="Brief overview of what is covered in this video..."
              className="w-full text-xs rounded-xl border border-base-300 bg-base-100 px-3.5 py-2 text-base-content focus:border-primary focus:outline-none"
            />
          </div>

          {/* Primary toggle & actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-base-200">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-base-content/80">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="checkbox checkbox-primary checkbox-xs"
              />
              <span>Set as Main Lecture Video for Topic</span>
            </label>

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
                onClick={handleSave}
              >
                <Check size={14} />
                <span>{editingId ? "Update Video" : "Save Video"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIDEOS LIST */}
      {videos.length === 0 && !showForm ? (
        <div className="p-12 text-center border border-dashed border-base-300 rounded-2xl bg-base-100">
          <VideoIcon size={36} className="mx-auto text-primary/40 mb-2" />
          <h4 className="text-sm font-bold text-base-content">
            No Videos for this Topic
          </h4>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto mt-1 mb-4">
            Embed YouTube videos, Vimeo lessons, or uploaded video lectures for your
            students.
          </p>
          <Button onClick={handleOpenCreate} variant="primary">
            <Plus size={14} /> Add First Video
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videos.map((v, idx) => {
            const isCurrentlyPlaying = playingVideoUrl === v.fileUrl;
            return (
              <div
                key={v.id || idx}
                className={`p-5 rounded-2xl border transition-all shadow-sm space-y-3 flex flex-col justify-between ${
                  isCurrentlyPlaying
                    ? "border-primary bg-primary/5"
                    : "border-base-200 bg-base-100 hover:border-base-300"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-base-content">
                        {v.title}
                      </span>
                      {v.isPrimary && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/20">
                          Main Video
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(v)}
                        className="p-1.5 rounded-lg text-base-content/50 hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit Video"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(v)}
                        className="p-1.5 rounded-lg text-base-content/50 hover:text-error hover:bg-error/10 transition-colors"
                        title="Delete Video"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {v.description && (
                    <p className="text-xs text-base-content/70 line-clamp-2">
                      {v.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-base-200 text-xs text-base-content/50">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {v.duration || 15} Mins
                  </span>

                  <button
                    type="button"
                    onClick={() => setPlayingVideoUrl(v.fileUrl)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                      isCurrentlyPlaying
                        ? "bg-primary text-primary-content shadow-xs"
                        : "bg-base-200 hover:bg-base-300 text-base-content"
                    }`}
                  >
                    <Play size={12} className={isCurrentlyPlaying ? "fill-current" : ""} />
                    <span>{isCurrentlyPlaying ? "Playing" : "Preview"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

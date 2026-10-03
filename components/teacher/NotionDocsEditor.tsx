"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  RotateCw,
  Eye,
  Edit3,
  Save,
  Check,
  Plus,
  Trash2,
  Copy,
  Clock,
  Sparkles,
  FileText,
  CheckCircle2,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { API_URL } from "@/lib/api-config";

export interface NoteDoc {
  id: string;
  title: string;
  content: string;
  status: "draft" | "published";
  topicId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface NotionDocsEditorProps {
  topicId: string;
  initialDocs?: NoteDoc[];
  onStatsUpdated?: (count: number) => void;
}

export default function NotionDocsEditor({
  topicId,
  initialDocs = [],
  onStatsUpdated,
}: NotionDocsEditorProps) {
  const [docs, setDocs] = useState<NoteDoc[]>(initialDocs);
  const [activeDocId, setActiveDocId] = useState<string | null>(
    initialDocs[0]?.id || null
  );
  const [loading, setLoading] = useState(false);

  // Active note fields
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved"
  );
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Word count and char count
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Fetch docs for topic
  const fetchDocs = useCallback(async () => {
    if (!topicId) return;
    setLoading(true);
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch(`${API_URL}/topics/${topicId}/docs`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        const fetchedDocs: NoteDoc[] = data.data.docs || [];
        setDocs(fetchedDocs);
        if (onStatsUpdated) onStatsUpdated(fetchedDocs.length);

        if (!activeDocId && fetchedDocs.length > 0) {
          selectDoc(fetchedDocs[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load topic docs:", e);
    } finally {
      setLoading(false);
    }
  }, [topicId, activeDocId, onStatsUpdated]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // Select a doc
  const selectDoc = (doc: NoteDoc) => {
    setActiveDocId(doc.id);
    setTitle(doc.title);
    setStatus(doc.status);
    setSaveStatus("saved");

    if (editorRef.current) {
      editorRef.current.innerHTML = doc.content || "<p><br></p>";
      updateStats();
    }
  };

  // Sync activeDocId with current doc data
  useEffect(() => {
    if (!activeDocId && docs.length > 0) {
      selectDoc(docs[0]);
    }
  }, [docs, activeDocId]);

  // Update stats (word/character count)
  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    setCharCount(text.length);
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
  };

  // Format action helper using document.execCommand
  const format = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    triggerAutoSave();
    updateStats();
  };

  // Trigger link prompt
  const handleInsertLink = () => {
    const url = window.prompt("Enter URL:", "https://");
    if (url) {
      format("createLink", url);
    }
  };

  // Trigger code block
  const handleInsertCodeBlock = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString() : "";
    const codeHtml = `<pre class="bg-base-200/90 text-primary p-3 rounded-xl font-mono text-xs my-2 border border-base-300 overflow-x-auto"><code>${
      selectedText || "// your code here"
    }</code></pre><p><br></p>`;
    document.execCommand("insertHTML", false, codeHtml);
    triggerAutoSave();
    updateStats();
  };

  // Trigger horizontal rule
  const handleInsertDivider = () => {
    format("insertHorizontalRule");
  };

  // Save current note
  const handleSaveDoc = async (
    targetStatus?: "draft" | "published",
    showToast = false
  ) => {
    if (!activeDocId) return;
    const token = localStorage.getItem("token") || "";
    const currentHtml = editorRef.current?.innerHTML || "";
    const newStatus = targetStatus || status;

    setIsSaving(true);
    setSaveStatus("saving");

    try {
      const res = await fetch(`${API_URL}/topics/${topicId}/docs/${activeDocId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          title: title.trim() || "Untitled Note",
          content: currentHtml,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save note");
      }

      const updated = data.data.doc;
      setStatus(newStatus);
      setSaveStatus("saved");
      setLastSavedAt(new Date());

      setDocs((prev) =>
        prev.map((d) => (d.id === activeDocId ? { ...d, ...updated } : d))
      );

      if (showToast) {
        toast.success(
          newStatus === "published" ? "Note published!" : "Draft saved!"
        );
      }
    } catch (err: any) {
      setSaveStatus("unsaved");
      if (showToast) toast.error(err.message || "Error saving note");
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save debounced handler
  const triggerAutoSave = () => {
    setSaveStatus("unsaved");
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      handleSaveDoc();
    }, 2000);
  };

  // Create a brand new note
  const handleCreateNewDoc = async () => {
    const token = localStorage.getItem("token") || "";
    try {
      const res = await fetch(`${API_URL}/topics/${topicId}/docs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          title: "Untitled Note",
          content: "<p>Start writing your notes here...</p>",
          status: "draft",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      const created = data.data.doc;
      setDocs((prev) => [created, ...prev]);
      if (onStatsUpdated) onStatsUpdated(docs.length + 1);
      selectDoc(created);
      toast.success("New note created");
    } catch (err: any) {
      toast.error(err.message || "Failed to create note");
    }
  };

  // Duplicate an existing note
  const handleDuplicateDoc = async (docToDup: NoteDoc) => {
    const token = localStorage.getItem("token") || "";
    try {
      const res = await fetch(`${API_URL}/topics/${topicId}/docs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          title: `${docToDup.title} (Copy)`,
          content: docToDup.content,
          status: "draft",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      const created = data.data.doc;
      setDocs((prev) => [created, ...prev]);
      if (onStatsUpdated) onStatsUpdated(docs.length + 1);
      selectDoc(created);
      toast.success("Note duplicated");
    } catch (err: any) {
      toast.error(err.message || "Failed to duplicate note");
    }
  };

  // Delete an existing note
  const handleDeleteDoc = async (docId: string) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch(`${API_URL}/topics/${topicId}/docs/${docId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      const remaining = docs.filter((d) => d.id !== docId);
      setDocs(remaining);
      if (onStatsUpdated) onStatsUpdated(remaining.length);

      if (activeDocId === docId) {
        if (remaining.length > 0) {
          selectDoc(remaining[0]);
        } else {
          setActiveDocId(null);
          setTitle("");
          if (editorRef.current) editorRef.current.innerHTML = "";
        }
      }
      toast.success("Note deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete note");
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[600px] w-full overflow-hidden bg-base-100 text-base-content">
      {/* ── LEFT SIDEBAR: NOTES LIST */}
      <aside className="w-64 sm:w-72 shrink-0 border-r border-base-300 bg-base-200/40 flex flex-col justify-between">
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-info" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-base-content/70">
              Notes ({docs.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCreateNewDoc}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-info/15 text-info hover:bg-info/25 text-xs font-semibold transition-all active:scale-95 shadow-2xs"
            title="Create New Note"
          >
            <Plus size={13} />
            <span>New Note</span>
          </button>
        </div>

        {/* Scrollable list of notes */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {docs.length === 0 ? (
            <div className="p-6 text-center text-xs text-base-content/50">
              No notes yet. Click "+ New Note" to start writing.
            </div>
          ) : (
            docs.map((doc) => {
              const isSelected = doc.id === activeDocId;
              return (
                <div
                  key={doc.id}
                  onClick={() => selectDoc(doc)}
                  className={`group relative flex flex-col gap-1 p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-base-100 border-info/40 shadow-xs"
                      : "border-transparent hover:bg-base-200/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-base-content truncate">
                      {doc.title || "Untitled Note"}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0 ${
                        doc.status === "published"
                          ? "bg-success/15 text-success"
                          : "bg-base-300 text-base-content/60"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[11px] text-base-content/40">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {doc.updatedAt
                        ? new Date(doc.updatedAt).toLocaleDateString()
                        : "Just now"}
                    </span>

                    {/* Quick duplicate / delete */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateDoc(doc);
                        }}
                        className="p-1 rounded text-base-content/50 hover:text-base-content hover:bg-base-300 transition-colors"
                        title="Duplicate Note"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDoc(doc.id);
                        }}
                        className="p-1 rounded text-base-content/50 hover:text-error hover:bg-error/10 transition-colors"
                        title="Delete Note"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-base-300 text-[11px] text-base-content/50 flex items-center justify-between">
          <span>Notion / Notepad Mode</span>
          <span className="text-[10px] text-info font-medium">Rich Text</span>
        </div>
      </aside>

      {/* ── MAIN EDITOR WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 bg-base-100 overflow-hidden">
        {docs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-info/10 text-info flex items-center justify-center mb-3">
              <FileText size={28} />
            </div>
            <h3 className="text-base font-bold text-base-content mb-1">
              No Document Selected
            </h3>
            <p className="text-xs text-base-content/60 max-w-sm mb-4">
              Write lecture notes, student guides, summaries, or reference
              content with a clean Notion-style editor.
            </p>
            <Button onClick={handleCreateNewDoc} variant="primary">
              <Plus size={15} /> Create First Note
            </Button>
          </div>
        ) : (
          <>
            {/* ── TOP ACTION BAR & TOOLBAR */}
            <div className="border-b border-base-300 bg-base-100/90 backdrop-blur-xs px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
              {/* Left: Rich text formatting tools */}
              <div className="flex items-center flex-wrap gap-1">
                {/* Undo / Redo */}
                <button
                  type="button"
                  onClick={() => format("undo")}
                  className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                  title="Undo (Ctrl+Z)"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => format("redo")}
                  className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                  title="Redo (Ctrl+Y)"
                >
                  <RotateCw size={14} />
                </button>

                <div className="w-px h-4 bg-base-300 mx-1" />

                {/* Headings */}
                <button
                  type="button"
                  onClick={() => format("formatBlock", "<h1>")}
                  className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors font-bold text-xs"
                  title="Heading 1"
                >
                  <Heading1 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => format("formatBlock", "<h2>")}
                  className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors font-bold text-xs"
                  title="Heading 2"
                >
                  <Heading2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => format("formatBlock", "<h3>")}
                  className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors font-bold text-xs"
                  title="Heading 3"
                >
                  <Heading3 size={15} />
                </button>

                <div className="w-px h-4 bg-base-300 mx-1" />

                {/* Text Styling */}
                <button
                  type="button"
                  onClick={() => format("bold")}
                  className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                  title="Bold (Ctrl+B)"
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => format("italic")}
                  className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                  title="Italic (Ctrl+I)"
                >
                  <Italic size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => format("underline")}
                  className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                  title="Underline (Ctrl+U)"
                >
                  <Underline size={14} />
                </button>

                <div className="w-px h-4 bg-base-300 mx-1" />

                {/* Alignment */}
                <button
                  type="button"
                  onClick={() => format("justifyLeft")}
                  className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                  title="Align Left"
                >
                  <AlignLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => format("justifyCenter")}
                  className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                  title="Align Center"
                >
                  <AlignCenter size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => format("justifyRight")}
                  className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                  title="Align Right"
                >
                  <AlignRight size={14} />
                </button>

                <div className="w-px h-4 bg-base-300 mx-1" />

                {/* Lists */}
                <button
                  type="button"
                  onClick={() => format("insertUnorderedList")}
                  className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                  title="Bullet List"
                >
                  <List size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => format("insertOrderedList")}
                  className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                  title="Numbered List"
                >
                  <ListOrdered size={14} />
                </button>

                <div className="w-px h-4 bg-base-300 mx-1" />

                {/* Blocks: Quote, Code, Link, Divider */}
                <button
                  type="button"
                  onClick={() => format("formatBlock", "<blockquote>")}
                  className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                  title="Quote Block"
                >
                  <Quote size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleInsertCodeBlock}
                  className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                  title="Code Block"
                >
                  <Code size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleInsertLink}
                  className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                  title="Insert Link"
                >
                  <Link2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleInsertDivider}
                  className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                  title="Divider"
                >
                  <Minus size={14} />
                </button>
              </div>

              {/* Right: Autosave status & Actions */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-base-content/50 mr-1 flex items-center gap-1">
                  {saveStatus === "saving" && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                  )}
                  {saveStatus === "saved" && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-success" />
                  )}
                  {saveStatus === "unsaved" && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-base-content/40" />
                  )}
                  {saveStatus === "saving"
                    ? "Saving..."
                    : saveStatus === "saved"
                    ? "Saved"
                    : "Unsaved changes"}
                </span>

                <button
                  type="button"
                  onClick={() => setIsPreview(!isPreview)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isPreview
                      ? "bg-primary text-primary-content border-primary"
                      : "bg-base-200 text-base-content/80 border-base-300 hover:bg-base-300"
                  }`}
                  title={isPreview ? "Back to Edit" : "Preview Mode"}
                >
                  {isPreview ? <Edit3 size={13} /> : <Eye size={13} />}
                  <span>{isPreview ? "Edit" : "Preview"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveDoc("draft", true)}
                  disabled={isSaving}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-base-200 hover:bg-base-300 text-base-content transition-all border border-base-300 disabled:opacity-50"
                >
                  <Save size={13} />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSaveDoc(
                      status === "published" ? "draft" : "published",
                      true
                    )
                  }
                  disabled={isSaving}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 shadow-sm ${
                    status === "published"
                      ? "bg-success text-success-content hover:bg-success/90"
                      : "bg-info text-info-content hover:bg-info/90"
                  }`}
                >
                  <Check size={14} />
                  <span>{status === "published" ? "Published" : "Publish"}</span>
                </button>
              </div>
            </div>

            {/* ── EDITOR BODY: TITLE & CONTENT */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-12 md:px-20 py-8 max-w-4xl mx-auto w-full">
              {/* Note Title Input */}
              <input
                ref={titleInputRef}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  triggerAutoSave();
                }}
                disabled={isPreview}
                placeholder="Untitled Note..."
                className="w-full text-2xl sm:text-3xl font-extrabold text-base-content placeholder:text-base-content/30 bg-transparent border-none outline-none focus:ring-0 mb-6 font-display"
              />

              {/* Status pill & metadata bar */}
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-base-200 text-xs text-base-content/40">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    status === "published"
                      ? "bg-success/15 text-success border border-success/30"
                      : "bg-warning/15 text-warning border border-warning/30"
                  }`}
                >
                  {status}
                </span>
                <span>•</span>
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{charCount} characters</span>
                {lastSavedAt && (
                  <>
                    <span>•</span>
                    <span>Last saved {lastSavedAt.toLocaleTimeString()}</span>
                  </>
                )}
              </div>

              {/* Rich text editable container */}
              {isPreview ? (
                <div
                  className="prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[400px] leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      editorRef.current?.innerHTML ||
                      "<p className='text-base-content/40 italic'>Empty document</p>",
                  }}
                />
              ) : (
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={() => {
                    triggerAutoSave();
                    updateStats();
                  }}
                  onBlur={() => handleSaveDoc()}
                  className="prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[450px] leading-relaxed cursor-text selection:bg-primary/20"
                  data-placeholder="Start typing your notes, lecture material, formulas, or summaries here..."
                />
              )}
            </div>

            {/* ── FOOTER STATUS BAR */}
            <div className="px-6 py-2 border-t border-base-300 bg-base-200/50 flex items-center justify-between text-[11px] text-base-content/50 shrink-0">
              <div className="flex items-center gap-3">
                <span>Markdown & HTML supported</span>
                <span>•</span>
                <span>Auto-save enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{wordCount} words</span>
                <span>|</span>
                <span>{charCount} chars</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

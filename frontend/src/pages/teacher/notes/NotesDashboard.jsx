import React, { useState, useEffect } from "react";
import { BookOpen, FileText, Upload, Plus, Trash2, RefreshCw, Sparkles, HelpCircle } from "lucide-react";
import { getNotes, createNote, deleteNote } from "../../../services/notesService";
import { getCourses } from "../../../services/courseService";
import { useSocket } from "../../../context/SocketContext";
import { toast } from "react-hot-toast";

export default function NotesDashboard() {
  const { socket } = useSocket();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Upload fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await getCourses();
        if (res && res.success) {
          const list = Array.isArray(res.data) ? res.data : res.data?.courses || [];
          setCourses(list);
          if (list.length > 0) {
            setSelectedCourse(list[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCourses();
  }, []);

  const loadNotes = async () => {
    if (!selectedCourse) return;
    try {
      setLoading(true);
      const res = await getNotes(selectedCourse);
      if (res && res.success) {
        setNotes(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [selectedCourse]);

  useEffect(() => {
    if (!socket || !selectedCourse) return;

    const handleNoteCreated = (data) => {
      if (data.courseId === selectedCourse) {
        setNotes((prevNotes) => {
          if (prevNotes.some((n) => n._id === data.note._id)) return prevNotes;
          return [data.note, ...prevNotes];
        });
      }
    };

    const handleNoteDeleted = (data) => {
      if (data.courseId === selectedCourse) {
        setNotes((prevNotes) => prevNotes.filter((n) => n._id !== data.noteId));
      }
    };

    socket.on("note-created", handleNoteCreated);
    socket.on("note-deleted", handleNoteDeleted);

    return () => {
      socket.off("note-created", handleNoteCreated);
      socket.off("note-deleted", handleNoteDeleted);
    };
  }, [socket, selectedCourse]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !selectedCourse) {
      toast.error("Please fill in Title and choose a Course");
      return;
    }

    try {
      setCreating(true);
      const res = await createNote({
        title,
        content,
        fileUrl,
        courseId: selectedCourse,
      });

      if (res && res.success) {
        toast.success("Notes document uploaded successfully!");
        setTitle("");
        setContent("");
        setFileUrl("");
        setShowUploadModal(false);
        loadNotes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this notes resource?")) return;

    try {
      const res = await deleteNote(noteId);
      if (res && res.success) {
        toast.success("Notes document removed successfully");
        loadNotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Notes Management & Resources
          </h1>
          <p className="text-sm text-white/50 mt-1">Upload PDF materials, rich summaries, and learning study guides for your course classrooms.</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 shadow-xl shadow-purple-500/20 transition-all"
        >
          <Plus className="h-4 w-4" /> Upload Note Summary
        </button>
      </div>

      {/* Select Course dropdown */}
      <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 flex items-center gap-2 max-w-md">
        <BookOpen className="h-4 w-4 text-white/50" />
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full bg-transparent text-sm text-white focus:outline-none cursor-pointer"
        >
          {courses.map((course) => (
            <option key={course._id} value={course._id} className="bg-neutral-900 text-white">
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="py-12 flex items-center justify-center text-white/40 gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" /> Loading course summaries...
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center text-white/40 space-y-3">
          <FileText className="h-12 w-12 mx-auto text-white/20" />
          <p className="font-semibold text-white/60">No Notes Uploaded</p>
          <p className="text-xs max-w-sm mx-auto">You have not published any study summaries or files for this course yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notes.map((note) => (
            <div
              key={note._id}
              className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2 text-purple-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white leading-tight">{note.title}</h3>
                  </div>
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="rounded-lg p-2 border border-white/5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
                    title="Remove notes"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-xs text-white/70 leading-relaxed font-medium bg-black/20 p-4 rounded-xl border border-white/5 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {note.content || "No summary notes provided."}
                </div>
              </div>

              {note.fileUrl && (
                <div className="mt-5 border-t border-white/5 pt-4 flex items-center justify-between text-xs text-white/40">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5" /> PDF Resource Link
                  </span>
                  <a
                    href={note.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-400 hover:underline truncate max-w-xs font-semibold"
                  >
                    {note.fileUrl}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Notes Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-neutral-900 p-8 shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-400" /> Upload Course Notes Summary
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Lecture 4: State Hook Patterns"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 px-4 text-sm text-white focus:border-purple-500/50 focus:outline-none"
                  required
                />
              </div>

              {/* Rich text summaries */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Notes Summary (Rich Content)</label>
                <textarea
                  rows="4"
                  placeholder="Type outline summary or HTML study tips here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 px-4 text-sm text-white focus:border-purple-500/50 focus:outline-none resize-none"
                />
              </div>

              {/* File Url */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">PDF notes Document Link</label>
                <input
                  type="text"
                  placeholder="e.g. https://domain.edu/notes/lecture-4.pdf"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 px-4 text-sm text-white focus:border-purple-500/50 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2 text-sm font-bold text-white hover:opacity-90 shadow"
                >
                  {creating ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                  Publish Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { BookOpen, FileText, Download, HelpCircle, RefreshCw, Search } from "lucide-react";
import { getNotes } from "../../../services/notesService";
import { getCourses } from "../../../services/adminService";
import { toast } from "react-hot-toast";

export default function MyNotes() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

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

  useEffect(() => {
    if (!selectedCourse) return;

    async function loadNotes() {
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
    }
    loadNotes();
  }, [selectedCourse]);

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            My Course Notes & Resources
          </h1>
          <p className="text-sm text-white/50 mt-1">Access rich summaries and download lecture resources uploaded by your teachers.</p>
        </div>
      </div>

      {/* Select Course and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Selector */}
        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 flex items-center gap-2">
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

        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search notes summaries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* Notes Display */}
      {loading ? (
        <div className="py-12 flex items-center justify-center text-white/40 gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" /> Loading classroom materials...
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center text-white/40 space-y-3">
          <FileText className="h-12 w-12 mx-auto text-white/20" />
          <p className="font-semibold text-white/60">No Notes Available</p>
          <p className="text-xs max-w-sm mx-auto">No study guides or summary outlines are uploaded for this course yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-tight">{note.title}</h3>
                    <p className="text-[10px] text-white/40 font-semibold">Uploaded by: {note.teacherId?.name || "Instructor"}</p>
                  </div>
                </div>

                <div className="text-xs text-white/70 leading-relaxed font-medium bg-black/20 p-4 rounded-xl border border-white/5 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {note.content || "No summary text provided. Download the notes document attachment."}
                </div>
              </div>

              {note.fileUrl && (
                <div className="mt-5 border-t border-white/5 pt-4 flex items-center justify-between">
                  <span className="text-[10px] text-white/35 font-bold uppercase tracking-widest flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5" /> PDF Resource Attached
                  </span>
                  <a
                    href={note.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-blue-500/25 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-all"
                  >
                    <Download className="h-3.5 w-3.5" /> Download Notes
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

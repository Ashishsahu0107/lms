import React, { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, Video, Clock, Trophy, RefreshCw, BookOpen, ArrowLeft } from "lucide-react";
import { getCalendarEvents, createSchedule, deleteSchedule } from "../../services/scheduleService";
import { getCourses } from "../../services/adminService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function ScheduleManager() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("class");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const evRes = await getCalendarEvents();
      if (evRes && evRes.success) {
        // Filter out auto-generated assignment/quiz deadlines to manage only custom schedules
        const customOnly = (evRes.data || []).filter(e => e.type === "class" || e.type === "event");
        setEvents(customOnly);
      }

      const crsRes = await getCourses();
      if (crsRes && crsRes.success) {
        const list = Array.isArray(crsRes.data) ? crsRes.data : crsRes.data?.courses || [];
        setCourses(list);
        if (list.length > 0) {
          setCourseId(list[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      toast.error("Please fill in Title, Start Date, and End Date");
      return;
    }

    try {
      setCreating(true);
      const res = await createSchedule({
        title,
        description,
        type,
        startDate,
        endDate,
        courseId: courseId || null,
        meetingUrl
      });

      if (res && res.success) {
        toast.success("Schedule registered successfully!");
        setTitle("");
        setDescription("");
        setMeetingUrl("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule event?")) return;
    try {
      const res = await deleteSchedule(id);
      if (res && res.success) {
        toast.success("Event removed from calendar");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const typeIcons = {
    class: Video,
    event: Calendar
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <button
            onClick={() => navigate("/admin/calendar")}
            className="flex items-center gap-1 text-xs text-white/50 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Calendar
          </button>
          <h1 className="text-3xl font-extrabold text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Schedule & Live Class Manager
          </h1>
          <p className="text-sm text-white/50 mt-1">Schedule Zoom classes, syllabus events, and custom timetables.</p>
        </div>
      </div>

      {/* Grid: Create Form vs Current List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation Form */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-sm font-bold tracking-wider text-blue-400 uppercase flex items-center gap-2">
            <Plus className="h-5 w-5" /> Schedule New Event
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs text-white/40 uppercase font-bold">Event Title</label>
              <input
                type="text"
                placeholder="e.g. React hooks live class"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 px-4 text-xs text-white focus:outline-none"
                required
              />
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-xs text-white/40 uppercase font-bold">Schedule Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 px-4 text-xs text-white focus:outline-none"
              >
                <option value="class" className="bg-neutral-900">Live Zoom Class</option>
                <option value="event" className="bg-neutral-900">Custom Event</option>
              </select>
            </div>

            {/* Course select */}
            <div className="space-y-1">
              <label className="text-xs text-white/40 uppercase font-bold">Assign to Course</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 px-4 text-xs text-white focus:outline-none"
              >
                <option value="" className="bg-neutral-900">Personal (No Course)</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id} className="bg-neutral-900">{c.title}</option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-white/40 uppercase font-bold">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-2 px-3 text-[10px] text-white focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/40 uppercase font-bold">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-2 px-3 text-[10px] text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Meeting link (Zoom) */}
            {type === "class" && (
              <div className="space-y-1">
                <label className="text-xs text-white/40 uppercase font-bold">Zoom/Meet URL (Leave blank to generate)</label>
                <input
                  type="text"
                  placeholder="https://zoom.us/j/..."
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 px-4 text-xs text-white focus:outline-none"
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs text-white/40 uppercase font-bold">Event Description</label>
              <textarea
                rows="3"
                placeholder="concept syllabus to be reviewed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 px-4 text-xs text-white focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-xs font-bold text-white hover:opacity-90 shadow flex items-center justify-center gap-1.5"
            >
              {creating ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              Publish Schedule
            </button>
          </form>
        </div>

        {/* Schedules List */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl flex flex-col justify-between space-y-4">
          <h2 className="text-sm font-bold tracking-wider text-blue-400 uppercase flex items-center justify-between">
            <span>Schedules Timeline Directory</span>
            <button onClick={loadData} disabled={loading} className="text-white/40 hover:text-white">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </h2>

          <div className="flex-1 overflow-y-auto space-y-4 max-h-[450px] pr-1">
            {events.length === 0 ? (
              <div className="text-center text-white/40 py-12 text-xs">
                No active custom classes or events found. Set one in the scheduler panel!
              </div>
            ) : (
              events.map((e) => {
                const Icon = typeIcons[e.type] || Calendar;
                return (
                  <div
                    key={e._id}
                    className="rounded-xl border border-white/5 bg-white/5 p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-500/15 border border-blue-500/25 p-2 text-blue-400 h-fit shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-white truncate">{e.title}</h3>
                        <p className="text-[10px] text-white/50 font-medium truncate mt-0.5">
                          {new Date(e.startDate).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(e._id)}
                      className="rounded-lg p-2 border border-white/5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

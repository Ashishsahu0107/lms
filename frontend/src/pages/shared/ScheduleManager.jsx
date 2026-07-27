// src/pages/shared/ScheduleManager.jsx — LUXURY GOLD EDITION

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  Video,
  Clock,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  Link2,
} from "lucide-react";
import {
  getCalendarEvents,
  createSchedule,
  deleteSchedule,
} from "../../services/scheduleService";
import { getCourses as getAdminCourses } from "../../services/adminService";
import { getTeacherCourses } from "../../services/teacherService";
import { getCourses as getPublicCourses } from "../../services/courseService";
import { getStoredUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// ─── Gold constants ──────────────────
const GOLD = "#C9A227";
const GOLD_LIGHT = "#F59E0B";

// ─── Shared input style ──────────────
const inputStyle = {
  background: "rgba(15,23,42,0.7)",
  border: "1px solid rgba(201,162,39,0.2)",
  color: "#fff",
  borderRadius: "0.75rem",
  width: "100%",
  padding: "0.625rem 1rem",
  fontSize: "0.75rem",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

function LuxuryInput({ label, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          className="block text-[10px] font-black uppercase tracking-widest"
          style={{ color: "rgba(201,162,39,0.7)" }}
        >
          {label}
        </label>
      )}
      <input
        {...props}
        style={{
          ...inputStyle,
          borderColor: focused ? GOLD : "rgba(201,162,39,0.2)",
          boxShadow: focused ? "0 0 0 3px rgba(201,162,39,0.12)" : "none",
          ...props.style,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function LuxurySelect({ label, children, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          className="block text-[10px] font-black uppercase tracking-widest"
          style={{ color: "rgba(201,162,39,0.7)" }}
        >
          {label}
        </label>
      )}
      <select
        {...props}
        style={{
          ...inputStyle,
          appearance: "none",
          cursor: "pointer",
        }}
      >
        {children}
      </select>
    </div>
  );
}

function LuxuryTextarea({ label, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          className="block text-[10px] font-black uppercase tracking-widest"
          style={{ color: "rgba(201,162,39,0.7)" }}
        >
          {label}
        </label>
      )}
      <textarea
        {...props}
        style={{
          ...inputStyle,
          resize: "none",
          borderColor: focused ? GOLD : "rgba(201,162,39,0.2)",
          boxShadow: focused ? "0 0 0 3px rgba(201,162,39,0.12)" : "none",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════
export default function ScheduleManager() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Form
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

      // ── 1. Load Calendar Events ──────────────────────────
      const evRes = await getCalendarEvents();
      // apiGet returns Axios response → actual payload is in .data
      const evPayload = evRes?.data ?? evRes;
      if (evPayload?.success) {
        const customOnly = (evPayload.data || []).filter(
          (e) => e.type === "class" || e.type === "event",
        );
        setEvents(customOnly);
      }

      // ── 2. Load Courses — role-aware ─────────────────────
      const currentUser = getStoredUser();
      const role = currentUser?.role;

      let crsRes;
      if (role === "super_admin") {
        crsRes = await getAdminCourses();
      } else if (role === "teacher") {
        crsRes = await getTeacherCourses();
      } else {
        crsRes = await getPublicCourses();
      }

      // Unwrap Axios response envelope: res.data.data or res.data
      const crsPayload = crsRes?.data ?? crsRes;
      console.log("[ScheduleManager] courses payload:", crsPayload);

      if (crsPayload?.success !== false) {
        // Support multiple shapes: { data: [...] } or { courses: [...] } or [...]
        let list = [];
        if (Array.isArray(crsPayload?.data)) {
          list = crsPayload.data;
        } else if (Array.isArray(crsPayload?.data?.courses)) {
          list = crsPayload.data.courses;
        } else if (Array.isArray(crsPayload?.courses)) {
          list = crsPayload.courses;
        } else if (Array.isArray(crsPayload)) {
          list = crsPayload;
        }

        setCourses(list);
        if (list.length > 0) setCourseId(list[0]._id);
      }
    } catch (err) {
      console.error("[ScheduleManager] loadData error:", err);
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
        meetingUrl,
      });
      const payload = res?.data ?? res;
      if (payload?.success !== false) {
        toast.success("Schedule created successfully! 🎓");
        setTitle("");
        setDescription("");
        setMeetingUrl("");
        setStartDate("");
        setEndDate("");
        loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create schedule");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteSchedule(id);
      const payload = res?.data ?? res;
      if (payload?.success !== false) {
        toast.success("Event removed from calendar");
        setConfirmDeleteId(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete event");
    }
  };

  const typeConfig = {
    class: {
      icon: Video,
      label: "Live Class",
      color: GOLD,
      bg: "rgba(201,162,39,0.12)",
    },
    event: {
      icon: Calendar,
      label: "Event",
      color: "#818CF8",
      bg: "rgba(129,140,248,0.12)",
    },
  };

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.startDate) > now);
  const past = events.filter((e) => new Date(e.startDate) <= now);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6"
        style={{ borderBottom: "1px solid rgba(201,162,39,0.12)" }}
      >
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold mb-3 transition-all"
            style={{ color: "rgba(201,162,39,0.6)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(201,162,39,0.6)")
            }
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Calendar
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #C9A227, #F59E0B)",
              }}
            >
              <Calendar className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Schedule & Live Class{" "}
                <span style={{ color: GOLD }}>Manager</span>
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">
                Schedule Zoom classes, syllabus events, and custom timetables.
              </p>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-4">
          {[
            { label: "Total", value: events.length, color: GOLD },
            { label: "Upcoming", value: upcoming.length, color: "#34D399" },
            { label: "Past", value: past.length, color: "#94A3B8" },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center px-4 py-2.5 rounded-xl"
              style={{
                background: "rgba(30,41,59,0.7)",
                border: "1px solid rgba(201,162,39,0.1)",
              }}
            >
              <p className="text-xl font-black" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── 3-column grid: Form + List ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Create Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 rounded-3xl p-6 space-y-5 relative overflow-hidden"
          style={{
            background: "rgba(30,41,59,0.7)",
            border: "1px solid rgba(201,162,39,0.15)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Gold top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, #C9A227, transparent)",
            }}
          />

          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(201,162,39,0.15)" }}
            >
              <Plus className="h-4 w-4" style={{ color: GOLD }} />
            </div>
            <h2
              className="text-sm font-black uppercase tracking-widest"
              style={{ color: GOLD }}
            >
              New Event
            </h2>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <LuxuryInput
              label="Event Title"
              type="text"
              placeholder="e.g. React Hooks Live Class"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <LuxurySelect
              label="Schedule Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="class" style={{ background: "#0F172A" }}>
                🎥 Live Zoom Class
              </option>
              <option value="event" style={{ background: "#0F172A" }}>
                📅 Custom Event
              </option>
            </LuxurySelect>

            <LuxurySelect
              label="Assign to Course"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="" style={{ background: "#0F172A" }}>
                Personal (No Course)
              </option>
              {courses.map((c) => (
                <option
                  key={c._id}
                  value={c._id}
                  style={{ background: "#0F172A" }}
                >
                  {c.title}
                </option>
              ))}
            </LuxurySelect>

            {/* Dates */}
            <div className="grid grid-cols-1 gap-3">
              <LuxuryInput
                label="Start Date & Time"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={{ fontSize: "0.7rem" }}
              />
              <LuxuryInput
                label="End Date & Time"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                style={{ fontSize: "0.7rem" }}
              />
            </div>

            {/* Meeting URL (only for class type) */}
            <AnimatePresence>
              {type === "class" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <LuxuryInput
                    label="Zoom / Meet URL"
                    type="url"
                    placeholder="https://zoom.us/j/..."
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <LuxuryTextarea
              label="Description"
              rows={3}
              placeholder="Concepts & topics to be reviewed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <motion.button
              type="submit"
              disabled={creating}
              whileHover={{ scale: creating ? 1 : 1.02, y: creating ? 0 : -1 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={{
                background: creating
                  ? "rgba(201,162,39,0.4)"
                  : "linear-gradient(135deg, #C9A227, #F59E0B)",
                color: "#0F172A",
                boxShadow: creating
                  ? "none"
                  : "0 4px 20px rgba(201,162,39,0.35)",
              }}
            >
              {creating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Publish Schedule
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* RIGHT: Schedules List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 rounded-3xl p-6 flex flex-col gap-5 relative overflow-hidden"
          style={{
            background: "rgba(30,41,59,0.7)",
            border: "1px solid rgba(201,162,39,0.15)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, #C9A227, transparent)",
            }}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(201,162,39,0.15)" }}
              >
                <Calendar className="h-4 w-4" style={{ color: GOLD }} />
              </div>
              <h2
                className="text-sm font-black uppercase tracking-widest"
                style={{ color: GOLD }}
              >
                Scheduled Events
              </h2>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-xl transition-all"
              style={{
                background: "rgba(201,162,39,0.08)",
                border: "1px solid rgba(201,162,39,0.15)",
              }}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                style={{ color: GOLD }}
              />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[520px] pr-1 scrollbar-none">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3">
                <RefreshCw
                  className="h-5 w-5 animate-spin"
                  style={{ color: GOLD }}
                />
                <span className="text-sm text-slate-500">
                  Loading events...
                </span>
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(201,162,39,0.08)",
                    border: "1px solid rgba(201,162,39,0.12)",
                  }}
                >
                  <Calendar
                    className="h-8 w-8 opacity-30"
                    style={{ color: GOLD }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-400">
                    No Events Scheduled
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Create your first class or event using the form.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Upcoming */}
                {upcoming.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ background: "#34D399" }}
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        Upcoming ({upcoming.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {upcoming.map((ev) => (
                        <EventCard
                          key={ev._id}
                          event={ev}
                          typeConfig={typeConfig}
                          onDelete={() => setConfirmDeleteId(ev._id)}
                          isUpcoming
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Past */}
                {past.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 mt-4">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#94A3B8" }}
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Past ({past.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {past.map((ev) => (
                        <EventCard
                          key={ev._id}
                          event={ev}
                          typeConfig={typeConfig}
                          onDelete={() => setConfirmDeleteId(ev._id)}
                          isUpcoming={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(12px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="relative p-8 rounded-3xl max-w-sm w-full text-center space-y-5"
              style={{
                background: "rgba(15,23,42,0.98)",
                border: "1px solid rgba(239,68,68,0.3)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <Trash2 className="h-7 w-7 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Delete Event?</h3>
                <p className="text-sm text-slate-400 mt-1">
                  This event will be permanently removed from the calendar.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-3 rounded-full font-bold text-sm transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#94A3B8",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteId)}
                  className="flex-1 py-3 rounded-full font-bold text-sm transition-all"
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#F87171",
                  }}
                >
                  Delete Event
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Event Card Sub-Component ─────────────────────────────
function EventCard({ event: ev, typeConfig, onDelete, isUpcoming }) {
  const cfg = typeConfig[ev.type] || typeConfig.event;
  const Icon = cfg.icon;
  const startStr = new Date(ev.startDate).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const endStr = new Date(ev.endDate).toLocaleTimeString([], {
    timeStyle: "short",
  });

  const isLiveNow =
    new Date() >= new Date(ev.startDate) && new Date() <= new Date(ev.endDate);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between gap-4 p-4 rounded-2xl transition-all group"
      style={{
        background: isLiveNow
          ? "rgba(52,211,153,0.06)"
          : isUpcoming
            ? "rgba(201,162,39,0.04)"
            : "rgba(255,255,255,0.02)",
        border: isLiveNow
          ? "1px solid rgba(52,211,153,0.25)"
          : isUpcoming
            ? "1px solid rgba(201,162,39,0.1)"
            : "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Type icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: isLiveNow ? "rgba(52,211,153,0.15)" : cfg.bg }}
        >
          <Icon
            className="h-4.5 w-4.5"
            style={{ color: isLiveNow ? "#34D399" : cfg.color }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            {isLiveNow && (
              <span
                className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full animate-pulse"
                style={{
                  background: "rgba(52,211,153,0.15)",
                  color: "#34D399",
                  border: "1px solid rgba(52,211,153,0.3)",
                }}
              >
                Live Now
              </span>
            )}
            <span
              className="text-[9px] font-black uppercase tracking-widest"
              style={{
                color: isUpcoming && !isLiveNow ? "#C9A227" : "#94A3B8",
              }}
            >
              {cfg.label}
            </span>
          </div>
          <h3 className="text-sm font-bold text-white truncate">{ev.title}</h3>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {startStr} – {endStr}
            </span>
          </div>
          {ev.meetingUrl && (
            <a
              href={ev.meetingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-semibold flex items-center gap-1 mt-0.5 transition-colors"
              style={{ color: "rgba(201,162,39,0.6)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A227")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(201,162,39,0.6)")
              }
            >
              <Link2 className="h-3 w-3" />
              Join Meeting Link
            </a>
          )}
        </div>
      </div>

      <button
        onClick={onDelete}
        className="p-2 rounded-xl shrink-0 transition-all opacity-0 group-hover:opacity-100"
        style={{
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.15)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(239,68,68,0.15)";
          e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(239,68,68,0.08)";
          e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)";
        }}
      >
        <Trash2 className="h-4 w-4 text-red-400" />
      </button>
    </motion.div>
  );
}

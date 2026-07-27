// src/pages/shared/LiveClasses.jsx — LUXURY GOLD EDITION

import { useState, useEffect } from "react";
import {
  Video,
  Calendar,
  RefreshCw,
  AlertCircle,
  PlayCircle,
  Clock,
  Plus,
  ExternalLink,
  Signal,
  Zap,
} from "lucide-react";
import { getCalendarEvents } from "../../services/scheduleService";
import { getStoredUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const GOLD = "#C9A227";
const GOLD_LIGHT = "#F59E0B";

// ─── Duration formatter ───────────────────────────────
function formatDuration(start, end) {
  const ms = new Date(end) - new Date(start);
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// ─── Countdown Timer ──────────────────────────────────
function CountdownBadge({ startDate }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(startDate) - new Date();
      if (diff <= 0) {
        setTimeLeft("Starting now!");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 0) setTimeLeft(`${h}h ${m}m`);
      else if (m > 0) setTimeLeft(`${m}m ${s}s`);
      else setTimeLeft(`${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startDate]);

  return (
    <span
      className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1"
      style={{
        background: "rgba(201,162,39,0.15)",
        color: GOLD,
        border: "1px solid rgba(201,162,39,0.25)",
      }}
    >
      <Zap className="h-3 w-3" />
      {timeLeft}
    </span>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function LiveClasses() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | live | upcoming | past

  const loadClasses = async () => {
    try {
      setLoading(true);
      const res = await getCalendarEvents();
      // apiGet returns Axios response → payload is in res.data
      const payload = res?.data ?? res;
      if (payload?.success !== false) {
        const liveOnly = (payload?.data || []).filter(
          (e) => e.type === "class",
        );
        setClasses(liveOnly);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const now = new Date();
  const isLive = (cls) =>
    now >= new Date(cls.startDate) && now <= new Date(cls.endDate);
  const isUpcoming = (cls) => new Date(cls.startDate) > now;
  const isPast = (cls) => new Date(cls.endDate) < now;

  const liveNow = classes.filter(isLive);
  const upcoming = classes.filter(isUpcoming);
  const past = classes.filter(isPast);

  const filteredClasses =
    filter === "live"
      ? liveNow
      : filter === "upcoming"
        ? upcoming
        : filter === "past"
          ? past
          : classes;

  const isAdmin = user?.role === "super_admin";
  const isTeacher = user?.role === "teacher";
  const canSchedule = isAdmin || isTeacher;

  const scheduleRoute = isAdmin
    ? "/admin/schedule-manager"
    : "/teacher/schedule-manager";

  const filterTabs = [
    { key: "all", label: "All Classes", count: classes.length },
    {
      key: "live",
      label: "Live Now",
      count: liveNow.length,
      pulse: liveNow.length > 0,
    },
    { key: "upcoming", label: "Upcoming", count: upcoming.length },
    { key: "past", label: "Past", count: past.length },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 pb-6"
        style={{ borderBottom: "1px solid rgba(201,162,39,0.12)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
            style={{
              background: "linear-gradient(135deg, #C9A227, #F59E0B)",
              boxShadow: "0 0 25px rgba(201,162,39,0.4)",
            }}
          >
            <Video className="h-7 w-7 text-slate-950" />
            {liveNow.length > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 animate-pulse"
                style={{ background: "#34D399", borderColor: "#0F172A" }}
              />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Live <span style={{ color: GOLD }}>Classrooms</span>
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Join scheduled Zoom/Meet sessions and video lectures.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Live count badge */}
          {liveNow.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "rgba(52,211,153,0.12)",
                border: "1px solid rgba(52,211,153,0.3)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#34D399" }}
              />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                {liveNow.length} Live Now
              </span>
            </motion.div>
          )}

          {canSchedule && (
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(scheduleRoute)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all"
              style={{
                background: "linear-gradient(135deg, #C9A227, #F59E0B)",
                color: "#0F172A",
                boxShadow: "0 4px 15px rgba(201,162,39,0.3)",
              }}
            >
              <Plus className="h-4 w-4" />
              Schedule Class
            </motion.button>
          )}

          <button
            onClick={loadClasses}
            disabled={loading}
            className="p-2.5 rounded-xl transition-all"
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
      </motion.div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all duration-200"
            style={
              filter === tab.key
                ? {
                    background: "linear-gradient(135deg, #C9A227, #F59E0B)",
                    color: "#0F172A",
                    boxShadow: "0 4px 12px rgba(201,162,39,0.3)",
                  }
                : {
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#94A3B8",
                  }
            }
          >
            {tab.pulse && filter !== tab.key && (
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#34D399" }}
              />
            )}
            {tab.label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${filter === tab.key ? "bg-black/20" : "bg-white/5"}`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Classes Grid ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(201,162,39,0.1)",
              border: "1px solid rgba(201,162,39,0.15)",
            }}
          >
            <RefreshCw
              className="h-7 w-7 animate-spin"
              style={{ color: GOLD }}
            />
          </div>
          <p className="text-sm text-slate-500">Loading live classrooms...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-5 rounded-3xl"
          style={{
            background: "rgba(30,41,59,0.5)",
            border: "1px solid rgba(201,162,39,0.08)",
          }}
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{
              background: "rgba(201,162,39,0.08)",
              border: "1px solid rgba(201,162,39,0.12)",
            }}
          >
            <Video
              className="h-10 w-10"
              style={{ color: "rgba(201,162,39,0.3)" }}
            />
          </div>
          <div className="text-center max-w-sm">
            <p className="text-lg font-black text-white mb-2">
              {filter === "live"
                ? "No Live Classes Right Now"
                : filter === "upcoming"
                  ? "No Upcoming Classes"
                  : filter === "past"
                    ? "No Past Classes"
                    : "No Classes Scheduled"}
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              {filter === "live"
                ? "Check back soon — upcoming sessions will appear here when they go live."
                : "There are no scheduled live classes at the moment. Check back soon!"}
            </p>
          </div>
          {canSchedule && (
            <button
              onClick={() => navigate(scheduleRoute)}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm mt-2 transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #C9A227, #F59E0B)",
                color: "#0F172A",
                boxShadow: "0 4px 15px rgba(201,162,39,0.3)",
              }}
            >
              <Plus className="h-4 w-4" />
              Schedule First Class
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filteredClasses.map((cls, i) => {
              const live = isLive(cls);
              const upcoming_ = isUpcoming(cls);
              const past_ = isPast(cls);

              return (
                <motion.div
                  key={cls._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="relative rounded-3xl p-6 flex flex-col gap-5 transition-all cursor-default overflow-hidden"
                  style={{
                    background: live
                      ? "linear-gradient(135deg, rgba(52,211,153,0.08), rgba(16,185,129,0.04))"
                      : "rgba(30,41,59,0.7)",
                    border: live
                      ? "1px solid rgba(52,211,153,0.3)"
                      : upcoming_
                        ? "1px solid rgba(201,162,39,0.15)"
                        : "1px solid rgba(255,255,255,0.05)",
                    boxShadow: live ? "0 0 30px rgba(52,211,153,0.08)" : "none",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  {/* Gold top accent for upcoming */}
                  {upcoming_ && !live && (
                    <div
                      className="absolute top-0 left-0 right-0 h-px"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, #C9A227, transparent)",
                      }}
                    />
                  )}

                  {/* Status + duration */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={
                        live
                          ? {
                              background: "rgba(52,211,153,0.15)",
                              color: "#34D399",
                              border: "1px solid rgba(52,211,153,0.3)",
                            }
                          : upcoming_
                            ? {
                                background: "rgba(201,162,39,0.12)",
                                color: GOLD,
                                border: "1px solid rgba(201,162,39,0.25)",
                              }
                            : {
                                background: "rgba(255,255,255,0.05)",
                                color: "#94A3B8",
                                border: "1px solid rgba(255,255,255,0.08)",
                              }
                      }
                    >
                      {live
                        ? "🔴 Live Now"
                        : upcoming_
                          ? "⏳ Upcoming"
                          : "✓ Ended"}
                    </span>

                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(cls.startDate, cls.endDate)}
                    </span>
                  </div>

                  {/* Title & description */}
                  <div className="flex-1">
                    <h3 className="font-black text-white text-base leading-snug line-clamp-2 mb-2">
                      {cls.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {cls.description ||
                        "Join this live session to review active concepts with your instructor."}
                    </p>
                  </div>

                  {/* Time info */}
                  <div
                    className="space-y-1.5 py-3 rounded-xl px-3"
                    style={{
                      background: "rgba(15,23,42,0.4)",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                      <Calendar
                        className="h-3.5 w-3.5"
                        style={{ color: live ? "#34D399" : GOLD }}
                      />
                      Start:{" "}
                      {new Date(cls.startDate).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      End:{" "}
                      {new Date(cls.endDate).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>

                  {/* Countdown (only for upcoming within 24h) */}
                  {upcoming_ && new Date(cls.startDate) - now < 86400000 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-500">
                        Starts in:
                      </span>
                      <CountdownBadge startDate={cls.startDate} />
                    </div>
                  )}

                  {/* Action button */}
                  {cls.meetingUrl ? (
                    <a
                      href={cls.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
                      style={
                        live
                          ? {
                              background:
                                "linear-gradient(135deg, #34D399, #059669)",
                              color: "#fff",
                              boxShadow: "0 4px 20px rgba(52,211,153,0.3)",
                            }
                          : upcoming_
                            ? {
                                background:
                                  "linear-gradient(135deg, #C9A227, #F59E0B)",
                                color: "#0F172A",
                                boxShadow: "0 4px 15px rgba(201,162,39,0.3)",
                              }
                            : {
                                background: "rgba(255,255,255,0.05)",
                                color: "#94A3B8",
                                border: "1px solid rgba(255,255,255,0.08)",
                              }
                      }
                    >
                      {live ? (
                        <>
                          <Signal className="h-4 w-4" /> Join Live Session
                        </>
                      ) : upcoming_ ? (
                        <>
                          <ExternalLink className="h-4 w-4" /> Open Meeting Link
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4" /> View Recording
                        </>
                      )}
                    </a>
                  ) : (
                    <div
                      className="w-full py-3 rounded-full flex items-center justify-center gap-2 text-xs font-bold"
                      style={{
                        background: "rgba(245,158,11,0.08)",
                        border: "1px solid rgba(245,158,11,0.2)",
                        color: "#F59E0B",
                      }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      No Meeting Link Provided
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Bottom CTA for teachers/admins ── */}
      {canSchedule && classes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center pt-4"
        >
          <button
            onClick={() => navigate(scheduleRoute)}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
            style={{
              background: "rgba(201,162,39,0.08)",
              border: "1px solid rgba(201,162,39,0.2)",
              color: GOLD,
            }}
          >
            <Plus className="h-4 w-4" />
            Schedule Another Class
          </button>
        </motion.div>
      )}
    </div>
  );
}

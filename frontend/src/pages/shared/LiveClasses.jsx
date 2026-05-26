import React, { useState, useEffect } from "react";
import { Video, Calendar, RefreshCw, AlertCircle, PlayCircle, Clock } from "lucide-react";
import { getCalendarEvents } from "../../services/scheduleService";
import { getStoredUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function LiveClasses() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const res = await getCalendarEvents();
      if (res && res.success) {
        // Filter only 'class' events
        const liveOnly = (res.data || []).filter((e) => e.type === "class");
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
            <Video className="h-8 w-8 text-blue-400 animate-pulse" /> Live Classrooms & Video Lectures
          </h1>
          <p className="text-sm text-white/50 mt-1">Join scheduled live video tutorials and review meeting links.</p>
        </div>

        <div className="flex items-center gap-2">
          {(user?.role === "teacher" || user?.role === "super_admin") && (
            <button
              onClick={() => navigate("/admin/schedule-manager")}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 shadow shadow-blue-500/20 transition-all"
            >
              Schedule Live Class
            </button>
          )}
          <button
            onClick={loadClasses}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="py-12 flex items-center justify-center text-white/40 gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" /> Fetching live syllabus classrooms...
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center text-white/40 space-y-3">
          <Video className="h-12 w-12 mx-auto text-white/20" />
          <p className="font-semibold text-white/60">No Live Classes Scheduled</p>
          <p className="text-xs max-w-sm mx-auto">There are no upcoming live Zoom or Google Meet classes scheduled at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const isLiveNow = new Date() >= new Date(cls.startDate) && new Date() <= new Date(cls.endDate);
            return (
              <div
                key={cls._id}
                className={`rounded-2xl border bg-black/40 p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between space-y-4 transition-all hover:translate-y-[-2px] ${
                  isLiveNow ? "border-emerald-500/35 shadow-emerald-500/5 bg-emerald-500/[0.02]" : "border-white/10"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isLiveNow
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 animate-pulse"
                        : "bg-white/5 border-white/10 text-white/40"
                    }`}>
                      {isLiveNow ? "Live Now" : "Scheduled"}
                    </span>
                    <span className="text-[10px] text-white/30 font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Class Session
                    </span>
                  </div>

                  <h3 className="font-black text-white text-sm leading-tight line-clamp-1">{cls.title}</h3>
                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{cls.description || "Join this live course to review active concepts."}</p>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-3">
                  <div className="text-[10px] text-white/40 space-y-1 font-semibold">
                    <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Start: {new Date(cls.startDate).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</p>
                    <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> End: {new Date(cls.endDate).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</p>
                  </div>

                  {cls.meetingUrl ? (
                    <a
                      href={cls.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-xs font-black text-white uppercase tracking-wider flex items-center justify-center gap-2 shadow"
                    >
                      <PlayCircle className="h-4 w-4" /> Launch Zoom class
                    </a>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold justify-center py-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      <AlertCircle className="h-4 w-4" /> No Meeting link provided
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Video, Clock, Trophy, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { getCalendarEvents } from "../../services/scheduleService";
import { getStoredUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function CalendarDashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [showEventsDrawer, setShowEventsDrawer] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await getCalendarEvents();
      if (res && res.success) {
        setEvents(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const days = [];
  // Add empty placeholders for starting padding
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  // Add actual days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toDateString();
    return events.filter(event => {
      const eDate = new Date(event.startDate);
      return eDate.toDateString() === dateStr;
    });
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const dayEvents = getEventsForDate(day);
    setSelectedDayEvents(dayEvents);
    setShowEventsDrawer(true);
  };

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const typeStyles = {
    class: "bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/35",
    assignment: "bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/35",
    quiz: "bg-purple-500/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/35",
    event: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/35"
  };

  const typeIcons = {
    class: Video,
    assignment: Clock,
    quiz: Trophy,
    event: Calendar
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Calendar & Schedules Console
          </h1>
          <p className="text-sm text-white/50 mt-1">Review live class schedules, quizzes timings, and assignment deadline notifications.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {(user?.role === "teacher" || user?.role === "super_admin") && (
            <button
              onClick={() => navigate("/admin/schedule-manager")}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 shadow-xl shadow-blue-500/20 transition-all"
            >
              <Plus className="h-4 w-4" /> Manage Schedules
            </button>
          )}
          <button
            onClick={loadEvents}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Calendar Month Header Controls */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-blue-500/25 bg-blue-500/10 p-2.5 text-blue-400">
              <Calendar className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              {monthsList[month]} {year}
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-1">
            <button
              onClick={handlePrevMonth}
              className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/5 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/5 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Calendar Month Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Weekday headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs font-bold uppercase tracking-wider text-white/30 py-2 border-b border-white/5">
              {day}
            </div>
          ))}

          {/* Days cells */}
          {days.map((day, index) => {
            const dateEvents = getEventsForDate(day);
            const isToday = day && day.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                onClick={() => day && handleDayClick(day)}
                className={`min-h-[100px] border border-white/5 p-2 flex flex-col justify-between cursor-pointer transition-all rounded-xl relative ${
                  day
                    ? isToday
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-black/20 hover:bg-white/5 hover:border-white/10"
                    : "opacity-20 cursor-default"
                }`}
              >
                {day && (
                  <span className={`text-xs font-black tracking-wide p-1.5 h-6 w-6 rounded-full flex items-center justify-center ${
                    isToday ? "bg-blue-500 text-white shadow" : "text-white/40"
                  }`}>
                    {day.getDate()}
                  </span>
                )}

                {/* Day events pills */}
                {day && dateEvents.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {dateEvents.slice(0, 2).map((e) => {
                      const Icon = typeIcons[e.type] || Calendar;
                      return (
                        <div
                          key={e._id}
                          className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[9px] font-bold uppercase tracking-wide truncate ${typeStyles[e.type]}`}
                        >
                          <Icon className="h-3 w-3 shrink-0" />
                          <span className="truncate">{e.title}</span>
                        </div>
                      );
                    })}
                    {dateEvents.length > 2 && (
                      <p className="text-[8px] text-white/30 text-center font-bold font-mono">+{dateEvents.length - 2} more</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events Drawer Modal */}
      {showEventsDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-neutral-900 p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" /> Day Event Schedule
              </h2>
              <button
                onClick={() => setShowEventsDrawer(false)}
                className="text-xs text-white/50 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {selectedDayEvents.length === 0 ? (
                <div className="text-center text-white/40 py-8 text-sm">
                  <AlertCircle className="h-8 w-8 mx-auto text-white/20 mb-2" />
                  No events or classes registered on this date.
                </div>
              ) : (
                selectedDayEvents.map((e) => {
                  const Icon = typeIcons[e.type] || Calendar;
                  return (
                    <div
                      key={e._id}
                      className="rounded-2xl border border-white/5 bg-black/40 p-5 space-y-4 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-xl border p-2 ${typeStyles[e.type]}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm leading-tight">{e.title}</h3>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/30">
                              {e.type} Schedule
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-white/60 font-medium leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                        {e.description || "No specific details provided."}
                      </p>

                      {e.meetingUrl && (
                        <div className="flex items-center justify-between border-t border-white/5 pt-3">
                          <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            Zoom Class Scheduled
                          </span>
                          <a
                            href={e.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:underline"
                          >
                            <Video className="h-4 w-4 text-blue-400 animate-pulse" /> Launch Zoom Meeting
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

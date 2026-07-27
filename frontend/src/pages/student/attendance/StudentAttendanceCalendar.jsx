import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Plane,
  ArrowLeft,
  Info,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { getMyAttendanceCalendar } from "../../../services/attendanceService";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  present: {
    label: "Present",
    color: "#10b981",
    cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckCircle,
  },
  absent: {
    label: "Absent",
    color: "#f43f5e",
    cls: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: XCircle,
  },
  late: {
    label: "Late",
    color: "#f59e0b",
    cls: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Clock,
  },
  leave: {
    label: "Leave",
    color: "#3b82f6",
    cls: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: Plane,
  },
};

export default function StudentAttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);

  const formatMonthQuery = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  };

  const loadCalendar = useCallback(async () => {
    try {
      setLoading(true);
      const monthStr = formatMonthQuery(currentDate);
      const res = await getMyAttendanceCalendar({
        month: monthStr,
        courseId: selectedCourse,
      });
      if (res.data?.success) {
        setCalendarData(res.data.data || {});
        setCourses(res.data.courses || []);
      } else {
        toast.error("Failed to load attendance calendar");
      }
    } catch {
      toast.error("Failed to load attendance calendar");
    } finally {
      setLoading(false);
    }
  }, [currentDate, selectedCourse]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCalendar();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadCalendar]);

  const handlePrevMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
    setSelectedDayDetails(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
    setSelectedDayDetails(null);
  };

  // Generate calendar days grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysGrid = [];
  // padding empty days from previous month
  for (let i = 0; i < firstDayIndex; i++) {
    daysGrid.push(null);
  }
  // current month days
  for (let day = 1; day <= totalDays; day++) {
    daysGrid.push(day);
  }

  const getDayKey = (day) => {
    if (!day) return "";
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  // Monthly stats counts based on fetched dates
  const monthlyCounts = { present: 0, absent: 0, late: 0, leave: 0 };
  Object.values(calendarData).forEach((records) => {
    records.forEach((r) => {
      if (monthlyCounts[r.status] !== undefined) {
        monthlyCounts[r.status]++;
      }
    });
  });

  const totalClassesThisMonth = Object.values(calendarData).reduce(
    (sum, list) => sum + list.length,
    0,
  );
  const presentRate =
    totalClassesThisMonth > 0
      ? Math.round(
          ((monthlyCounts.present + monthlyCounts.late) /
            totalClassesThisMonth) *
            100,
        )
      : null;

  return (
    <div
      className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8"
      id="student-attendance-calendar-view"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Link to="/student/attendance">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-full border-border"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Attendance Calendar
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monthly calendar view of your class presence
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCalendar}
            disabled={loading}
            className="gap-2 text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Control bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card border border-border p-4 rounded-xl items-center shadow-sm">
        {/* Course Filter */}
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
            Filter Course
          </label>
          <select
            className="w-full h-10 rounded-lg border border-border bg-card text-foreground px-3 text-sm focus:outline-none"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">All Enrolled Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex justify-between items-center sm:justify-end gap-3 pt-4 sm:pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-bold text-foreground min-w-[120px] text-center capitalize">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid + Details Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grid panel */}
        <Card className="lg:col-span-2 border-border shadow-md overflow-hidden bg-card">
          <div className="grid grid-cols-7 border-b border-border bg-muted/20 text-center py-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (dayName) => (
                <span
                  key={dayName}
                  className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-1"
                >
                  {dayName}
                </span>
              ),
            )}
          </div>

          <div className="grid grid-cols-7 divide-y divide-x divide-border bg-base-100">
            {loading
              ? Array.from({ length: 35 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square p-2 animate-pulse bg-muted/10 min-h-[72px]"
                  />
                ))
              : daysGrid.map((day, idx) => {
                  if (!day)
                    return (
                      <div
                        key={`empty-${idx}`}
                        className="aspect-square bg-muted/5 min-h-[72px]"
                      />
                    );

                  const dateKey = getDayKey(day);
                  const records = calendarData[dateKey] || [];
                  const hasClasses = records.length > 0;

                  // Color priority if multiple classes: absent > late > leave > present
                  let dayBg = "hover:bg-muted/30";
                  if (hasClasses) {
                    const statuses = records.map((r) => r.status);
                    if (statuses.includes("absent"))
                      dayBg =
                        "bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20";
                    else if (statuses.includes("late"))
                      dayBg =
                        "bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20";
                    else if (statuses.includes("leave"))
                      dayBg =
                        "bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20";
                    else
                      dayBg =
                        "bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20";
                  }

                  return (
                    <button
                      key={`day-${day}`}
                      onClick={() =>
                        hasClasses &&
                        setSelectedDayDetails({ dateStr: dateKey, records })
                      }
                      className={`aspect-square p-2 min-h-[72px] flex flex-col justify-between items-start transition-all ${dayBg} relative`}
                      disabled={!hasClasses}
                    >
                      <span className="text-xs font-bold text-foreground/60">
                        {day}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {records.map((r, i) => {
                          const dotColor =
                            STATUS_CONFIG[r.status]?.color || "#94a3b8";
                          return (
                            <span
                              key={i}
                              className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: dotColor }}
                              title={`${r.courseTitle}: ${r.status}`}
                            />
                          );
                        })}
                      </div>
                    </button>
                  );
                })}
          </div>
        </Card>

        {/* Sidebar stats/detail panel */}
        <div className="space-y-6">
          {/* Quick Metrics */}
          <Card className="border-border shadow-md bg-card">
            <CardHeader className="pb-3 border-b border-border bg-muted/10">
              <CardTitle className="text-sm font-bold text-foreground">
                Monthly Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="text-center pb-2 border-b border-border">
                <p className="text-3xl font-black text-indigo-500">
                  {presentRate !== null ? `${presentRate}%` : "—"}
                </p>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">
                  Compliance Rate
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <div
                    key={key}
                    className="p-3 bg-muted/10 border border-border rounded-xl"
                  >
                    <p className="text-lg font-bold text-foreground">
                      {monthlyCounts[key]}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
                      {cfg.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Day details */}
          <Card className="border-border shadow-md bg-card min-h-[160px] flex flex-col">
            <CardHeader className="pb-3 border-b border-border bg-muted/10">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Info className="h-4 w-4 text-indigo-500" />
                Session Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {selectedDayDetails ? (
                  <motion.div
                    key={selectedDayDetails.dateStr}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      {new Date(selectedDayDetails.dateStr).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </p>

                    <div className="space-y-4">
                      {selectedDayDetails.records.map((r, i) => {
                        const cfg =
                          STATUS_CONFIG[r.status] || STATUS_CONFIG.present;
                        return (
                          <div
                            key={i}
                            className="border border-border/80 bg-muted/5 p-3.5 rounded-xl space-y-2"
                          >
                            <h4 className="font-bold text-sm text-foreground leading-tight truncate">
                              {r.courseTitle}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${cfg.cls}`}
                              >
                                <cfg.icon className="h-3 w-3" />
                                {cfg.label}
                              </span>
                            </div>
                            {r.remarks && (
                              <p className="text-xs text-muted-foreground leading-relaxed italic bg-background p-2 rounded-lg border border-border">
                                Note: {r.remarks}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-muted-foreground text-xs py-8">
                    Select a marked day in the calendar grid to view session
                    notes and remarks.
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

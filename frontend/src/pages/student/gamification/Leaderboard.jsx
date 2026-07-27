import { useState, useEffect } from "react";
import { RefreshCw, BookOpen, Crown } from "lucide-react";
import { getPerformanceAnalytics } from "../../../services/adminAnalyticsService";
import { getCourses } from "../../../services/courseService";

export default function Leaderboard() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("monthly");

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await getCourses();
        if (res && res.success) {
          const list = Array.isArray(res.data)
            ? res.data
            : res.data?.courses || [];
          setCourses(list);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCourses();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await getPerformanceAnalytics({ courseId: selectedCourse });
      if (res && res.success) {
        setLeaderboard(res.data?.leaderboard || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [selectedCourse]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent flex items-center gap-2">
            <Crown className="h-8 w-8 text-amber-400" /> Global XP Leaderboard
            Rankings
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Review top performing students globally or filter rankings
            course-wise.
          </p>
        </div>

        <button
          onClick={loadLeaderboard}
          disabled={loading}
          className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white hover:bg-white/10 self-end"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Selectors and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Course select */}
        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-white/50" />
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full bg-transparent text-sm text-white focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-neutral-900 text-white">
              Global Leaderboard (All Courses)
            </option>
            {courses.map((course) => (
              <option
                key={course._id}
                value={course._id}
                className="bg-neutral-900 text-white"
              >
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {/* Weekly/Monthly selectors */}
        <div className="md:col-span-2 flex justify-end">
          <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl w-fit">
            {["weekly", "monthly", "all-time"].map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-4 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${
                  timeFilter === t
                    ? "bg-amber-500 text-neutral-950 shadow"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 Podiums Showcase */}
      {leaderboard.length >= 3 && !loading && (
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-6 items-end">
          {/* Podium 2nd */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-2 border-slate-300 bg-neutral-800 flex items-center justify-center font-black text-slate-300 text-xl shadow">
                {leaderboard[1].name.substring(0, 2).toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-slate-400 text-neutral-950 border-2 border-neutral-900 flex items-center justify-center font-bold text-xs">
                2
              </span>
            </div>
            <div className="w-full rounded-t-xl bg-slate-300/10 border border-slate-300/25 p-4 text-center space-y-1 h-28">
              <p className="text-xs font-black text-white truncate">
                {leaderboard[1].name}
              </p>
              <p className="text-[10px] text-slate-300 font-bold">
                {leaderboard[1].avgAccuracy}% Acc
              </p>
              <span className="text-[9px] text-white/40 block mt-1 font-semibold">
                {leaderboard[1].completedCourses} Finished
              </span>
            </div>
          </div>

          {/* Podium 1st (Crown) */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <Crown className="absolute -top-7 left-1/2 -translate-x-1/2 h-7 w-7 text-amber-400 animate-bounce" />
              <div className="h-20 w-20 rounded-full border-4 border-amber-500 bg-neutral-800 flex items-center justify-center font-black text-amber-500 text-2xl shadow-xl shadow-amber-500/10">
                {leaderboard[0].name.substring(0, 2).toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-amber-500 text-neutral-950 border-2 border-neutral-900 flex items-center justify-center font-black text-xs">
                1
              </span>
            </div>
            <div className="w-full rounded-t-2xl bg-amber-500/15 border border-amber-500/25 p-4 text-center space-y-1 h-36">
              <p className="text-sm font-black text-white truncate">
                {leaderboard[0].name}
              </p>
              <p className="text-xs text-amber-400 font-black">
                {leaderboard[0].avgAccuracy}% Acc
              </p>
              <span className="text-[10px] text-white/50 block mt-1 font-semibold">
                {leaderboard[0].completedCourses} Finished
              </span>
            </div>
          </div>

          {/* Podium 3rd */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-2 border-amber-700 bg-neutral-800 flex items-center justify-center font-black text-amber-700 text-lg shadow">
                {leaderboard[2].name.substring(0, 2).toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-amber-700 text-neutral-950 border-2 border-neutral-900 flex items-center justify-center font-bold text-xs">
                3
              </span>
            </div>
            <div className="w-full rounded-t-xl bg-amber-700/10 border border-amber-700/25 p-4 text-center space-y-1 h-24">
              <p className="text-xs font-black text-white truncate">
                {leaderboard[2].name}
              </p>
              <p className="text-[10px] text-amber-600 font-bold">
                {leaderboard[2].avgAccuracy}% Acc
              </p>
              <span className="text-[9px] text-white/40 block mt-1 font-semibold">
                {leaderboard[2].completedCourses} Finished
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Ranks Directory Table */}
      <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase">
            Leaderboards Leaderboards
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-xs text-white/40 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6 text-center">Rank</th>
                <th className="py-3 px-6">Student name</th>
                <th className="py-3 px-6">Student email</th>
                <th className="py-3 px-6 text-center">Average Accuracy</th>
                <th className="py-3 px-6 text-center">Quizzes Taken</th>
                <th className="py-3 px-6 text-center">Completed Courses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-white/30">
                    Loading leaderboards...
                  </td>
                </tr>
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-white/30">
                    No active student rankings recorded.
                  </td>
                </tr>
              ) : (
                leaderboard.map((student, index) => (
                  <tr
                    key={index}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs mx-auto ${
                          index === 0
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : index === 1
                              ? "bg-slate-300/20 text-slate-300 border border-slate-300/30"
                              : index === 2
                                ? "bg-amber-700/20 text-amber-600 border border-amber-700/30"
                                : "bg-white/5 text-white/60"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-white">
                      {student.name}
                    </td>
                    <td className="py-4 px-6 text-white/50">{student.email}</td>
                    <td className="py-4 px-6 text-center font-black text-emerald-400">
                      {student.avgAccuracy}%
                    </td>
                    <td className="py-4 px-6 text-center text-white/60">
                      {student.quizzesAttempted}
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-purple-400">
                      {student.completedCourses} courses
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

// components/student/StudentDashboard.tsx — Minimalist Student Dashboard in pure Tailwind CSS
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

function api(path: string, token: string) {
  return fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());
}

export default function StudentDashboard() {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api("/dashboard", token);
      if (res.success) setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && isAuthenticated && user?.role !== "student") {
      router.push(`/${user?.role === "super_admin" ? "admin" : user?.role}/dashboard`);
    }
    if (isAuthenticated && token) load();
  }, [isAuthenticated, isLoading, token, user, router, load]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = (data as { stats?: Record<string, unknown> })?.stats ?? {};
  const enrollments = ((data as { enrollments?: unknown[] })?.enrollments ?? []) as Array<Record<string, unknown>>;
  const pendingAssignments = ((data as { pendingAssignments?: unknown[] })?.pendingAssignments ?? []) as Array<Record<string, unknown>>;
  const progressRecords = ((data as { progressRecords?: Array<{ courseId: string; progress: number; totalWatchTime: number }> })?.progressRecords ?? []) as Array<{ courseId: string; progress: number; totalWatchTime: number }>;

  const chartData = enrollments.slice(0, 6).map((e) => ({
    name: (e.course as Record<string, unknown>)?.title ? String((e.course as Record<string, unknown>).title).slice(0, 14) + "…" : "Course",
    progress:
      progressRecords.find((p) => p.courseId === (e.course as Record<string, unknown>)?.id)?.progress || 0,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Here is an overview of your course progress and upcoming deadlines today.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Enrolled Courses", value: stats.totalCourses as number ?? 0, icon: "📚", color: "border-indigo-200 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40" },
          { label: "Completed", value: stats.completedCourses as number ?? 0, icon: "✅", color: "border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
          { label: "XP Earned", value: `${stats.xp as number ?? 0} XP`, icon: "⭐", color: "border-amber-200 text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
          { label: "Day Streak", value: `${stats.streak as number ?? 0} 🔥`, icon: "🎯", color: "border-rose-200 text-rose-600 bg-rose-50 dark:bg-rose-950/40" },
        ].map(({ label, value, icon, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{icon}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${color}`}>
                {label}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</div>
          </div>
        ))}
      </div>

      {/* Chart & Pending Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-base text-slate-900 dark:text-white mb-4">Course Progress Summary</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <Tooltip formatter={(v) => [`${v}%`, "Progress"]} />
                <Bar dataKey="progress" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-2">📊</p>
              <p className="text-sm">Enroll in courses to see your progress metrics</p>
            </div>
          )}
        </div>

        {/* Pending Assignments List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-base text-slate-900 dark:text-white mb-4">Pending Assignments</h2>
          {pendingAssignments.length > 0 ? (
            <div className="space-y-3">
              {pendingAssignments.map((a) => (
                <div key={a.id as string} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-lg">📝</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">{a.title as string}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Due: {new Date(a.dueDate as string).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-xs font-medium">All caught up!</p>
            </div>
          )}
        </div>
      </div>

      {/* Enrolled Courses Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base text-slate-900 dark:text-white">My Active Courses</h2>
          <Link href="/student/my-courses" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
            View All →
          </Link>
        </div>

        {enrollments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments.slice(0, 6).map((e) => {
              const course = e.course as Record<string, unknown>;
              const progress = progressRecords.find((p) => p.courseId === course?.id)?.progress || 0;

              return (
                <Link
                  key={e.id as string}
                  href={`/student/courses/${course?.id}`}
                  className="group bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 hover:border-indigo-500/50 hover:shadow-md transition-all block"
                >
                  <div className="w-full h-24 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-pink-500/10 rounded-lg mb-3 flex items-center justify-center text-3xl">
                    📚
                  </div>
                  <h3 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate">
                    {course?.title as string}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {(course?.teacher as Record<string, unknown>)?.name as string}
                  </p>

                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] font-semibold mb-1 text-slate-600 dark:text-slate-400">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <p className="text-4xl mb-2">📚</p>
            <p className="text-xs">You are not enrolled in any courses yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

// components/student/BrowseCourses.tsx — Minimalist Browse Courses UI in pure Tailwind CSS
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { API_URL } from "@/lib/api-config";

export default function BrowseCourses() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Array<Record<string, unknown>>>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    try {
      const url = `${API_URL}/courses${search ? `?search=${encodeURIComponent(search)}` : ""}`;
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      const data = await res.json();
      if (data.success) {
        setCourses(data.data.courses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, token]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
            Course Catalog 🔍
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore expert-crafted courses and enhance your skills.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            🔍
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div
              key={c.id as string}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-full h-32 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-pink-500/10 rounded-xl mb-4 flex items-center justify-center text-4xl">
                  📖
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {(c.category as string) || "General"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 capitalize">
                    {(c.difficulty as string) || "Beginner"}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                  {c.title as string}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {(c.description as string) ||
                    "No course description available."}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  By{" "}
                  {((c.teacher as Record<string, unknown>)?.name as string) ||
                    "Instructor"}
                </span>
                <Link
                  href={`/student/courses/${c.id as string}`}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-all shadow-sm shadow-indigo-600/20"
                >
                  View Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8">
          <p className="text-4xl mb-2">🔍</p>
          <p className="font-bold text-sm text-slate-900 dark:text-white">
            No courses match your query
          </p>
        </div>
      )}
    </div>
  );
}

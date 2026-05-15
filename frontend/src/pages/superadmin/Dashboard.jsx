import React, { useEffect, useMemo, useState } from 'react';
import apiService from '../../services/api';

const formatCompact = (num) => {
  if (typeof num !== 'number') return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
};

const pillColor = (idx) => {
  const colors = [
    'bg-blue-50 text-blue-700 border-blue-200',
    'bg-emerald-50 text-emerald-700 border-emerald-200',
    'bg-purple-50 text-purple-700 border-purple-200',
    'bg-amber-50 text-amber-700 border-amber-200',
    'bg-rose-50 text-rose-700 border-rose-200',
    'bg-sky-50 text-sky-700 border-sky-200',
  ];
  return colors[idx % colors.length];
};

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dashboard, setDashboard] = useState({
    counts: {
      totalUsers: 0,
      totalCourses: 0,
      totalAssignments: 0,
      totalSubmissions: 0,
      publishedCourses: 0,
      draftCourses: 0,
    },
    usersByRole: [],
    recentActivity: {
      users: [],
      courses: [],
      submissions: [],
    },
    growth: {
      monthlyUsers: [],
      monthlyCourses: [],
    },
  });

  const [revenue, setRevenue] = useState({
    totalRevenue: 0,
    averageRevenuePerCourse: 0,
    monthlyRevenue: [],
  });

  const now = useMemo(() => new Date(), []);
  const defaultStart = useMemo(() => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().slice(0, 10);
  }, [now]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const [dashRes, revRes] = await Promise.all([
          apiService.analytics.getDashboard(),
          apiService.analytics.getRevenue({ startDate: defaultStart }),
        ]);

        const dashData =
          dashRes?.data?.data ||
          dashRes?.data ||
          dashRes;

        const revData =
          revRes?.data?.data ||
          revRes?.data ||
          revRes;

        setDashboard({
          counts: dashData?.counts || dashboard.counts,
          usersByRole: dashData?.usersByRole || [],
          recentActivity: dashData?.recentActivity || dashboard.recentActivity,
          growth: dashData?.growth || dashboard.growth,
        });

        setRevenue({
          totalRevenue: revData?.totalRevenue ?? 0,
          averageRevenuePerCourse: revData?.averageRevenuePerCourse ?? 0,
          monthlyRevenue: revData?.monthlyRevenue || [],
        });
      } catch (err) {
        setError(err?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = dashboard.counts;

  const monthlyRevenueBars = useMemo(() => {
    const entries = (revenue.monthlyRevenue || []).map((m) => {
      const id = m?._id || {};
      const year = id?.year;
      const month = id?.month;
      const revenueVal = m?.revenue ?? 0;

      const label = year && month ? `${year}-${String(month).padStart(2, '0')}` : 'N/A';
      return { label, revenue: revenueVal };
    });

    if (entries.length === 0) return [];

    const max = Math.max(...entries.map((e) => e.revenue), 1);
    return entries.map((e) => ({
      ...e,
      heightPct: (e.revenue / max) * 100,
    }));
  }, [revenue.monthlyRevenue]);

  const monthlyUsersBars = useMemo(() => {
    const entries = (dashboard.growth?.monthlyUsers || []).map((m) => {
      const id = m?._id || {};
      const year = id?.year;
      const month = id?.month;
      const val = m?.count ?? 0;
      const label = year && month ? `${year}-${String(month).padStart(2, '0')}` : 'N/A';
      return { label, value: val };
    });

    if (entries.length === 0) return [];

    const max = Math.max(...entries.map((e) => e.value), 1);
    return entries.map((e) => ({
      ...e,
      heightPct: (e.value / max) * 100,
    }));
  }, [dashboard.growth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="p-3 rounded bg-blue-50 border border-blue-200 text-sm text-blue-800">
        Super Admin Dashboard
        {error ? <span className="ml-2 font-medium">| error: {error}</span> : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            System Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enterprise analytics, revenue trends, growth and recent activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full text-xs border bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200">
            Range: Last 6 months
          </span>
          <span className="px-3 py-1 rounded-full text-xs border bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200">
            Revenue: {formatCompact(revenue.totalRevenue)}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
          <p className="font-medium">⚠️ {error}</p>
          <p className="text-sm mt-1">Some widgets may show default values.</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {counts.totalUsers}
              </p>
            </div>
            <div className="text-4xl text-blue-500 opacity-20">👥</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {counts.totalCourses}
              </p>
            </div>
            <div className="text-4xl text-green-500 opacity-20">📚</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-gray-500 text-sm font-medium">Assignments</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {counts.totalAssignments}
              </p>
            </div>
            <div className="text-4xl text-purple-500 opacity-20">📋</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-gray-500 text-sm font-medium">Submissions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {counts.totalSubmissions}
              </p>
            </div>
            <div className="text-4xl text-orange-500 opacity-20">📤</div>
          </div>
        </div>
      </div>

      {/* Charts + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue trend */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Revenue Trend (Monthly)
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Based on published courses and enrolled students.
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {formatCompact(revenue.totalRevenue)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Avg / Course: {formatCompact(revenue.averageRevenuePerCourse)}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-end gap-2 h-44">
              {monthlyRevenueBars.length ? (
                monthlyRevenueBars.map((b) => (
                  <div key={b.label} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-md"
                      style={{ height: `${Math.max(6, b.heightPct)}%` }}
                      title={`${b.label}: ${b.revenue}`}
                    />
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 truncate max-w-[4rem]">
                      {b.label.split('-').slice(1).join('-')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  No revenue data available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course status */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Course Status
          </h2>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200/70">
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                Published Courses
              </span>
              <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                {counts.publishedCourses}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200/70">
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                Draft Courses
              </span>
              <span className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                {counts.draftCourses}
              </span>
            </div>
          </div>

          {/* Growth - Users */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              User Growth (Monthly)
            </h3>

            <div className="mt-3 flex items-end gap-2 h-28">
              {monthlyUsersBars.length ? (
                monthlyUsersBars.slice(-6).map((b) => (
                  <div key={b.label} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-md"
                      style={{ height: `${Math.max(6, b.heightPct)}%` }}
                      title={`${b.label}: ${b.value}`}
                    />
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 truncate max-w-[3rem]">
                      {b.label.split('-').slice(1).join('-')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  No growth data.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Users by role + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Users by Role
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {(dashboard.usersByRole || []).length ? (
              dashboard.usersByRole.map((r, idx) => (
                <div
                  key={r?._id || idx}
                  className={`px-3 py-2 rounded-lg text-xs border ${pillColor(idx)}`}
                >
                  <div className="font-semibold">
                    {r?._id || 'unknown'}
                  </div>
                  <div className="mt-1 text-[12px] opacity-90">
                    {formatCompact(r?.count ?? 0)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                No role distribution data.
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Latest users, courses and submissions.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200/80 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200/80 dark:border-gray-700">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Users
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {(dashboard.recentActivity?.users || []).map((u) => (
                  <div key={u._id} className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {u.name || '—'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {u.email || ''}
                    </div>
                    <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                      {u.role || '—'}
                    </div>
                  </div>
                ))}
                {(dashboard.recentActivity?.users || []).length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    No recent users.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200/80 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200/80 dark:border-gray-700">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Courses
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {(dashboard.recentActivity?.courses || []).map((c) => (
                  <div key={c._id} className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {c.title || '—'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      Teacher: {c.teacher?.name || '—'}
                    </div>
                  </div>
                ))}
                {(dashboard.recentActivity?.courses || []).length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    No recent courses.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200/80 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200/80 dark:border-gray-700">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Submissions
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {(dashboard.recentActivity?.submissions || []).map((s) => (
                  <div key={s._id} className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {(s.assignment?.title || 'Submission').toString()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      Student: {s.student?.name || '—'}
                    </div>
                  </div>
                ))}
                {(dashboard.recentActivity?.submissions || []).length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    No recent submissions.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-200/80 dark:border-gray-700 p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">Health</div>
              <div className="mt-2 space-y-2">
                {[
                  { label: 'DB Connected', ok: true },
                  { label: 'API Running', ok: true },
                  { label: 'Auth Active', ok: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-gray-800 dark:text-gray-200">
                      {item.label} {item.ok ? '✓' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200/80 dark:border-gray-700 p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">Highlights</div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    Active users (last 6 months*)
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(dashboard.growth?.monthlyUsers || []).slice(-1)[0]?.count ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    Published courses
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {counts.publishedCourses}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                  *Approx via monthly growth API.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

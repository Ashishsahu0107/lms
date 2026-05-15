import React, { useEffect, useMemo, useState } from 'react';
import apiService from '../../services/api';

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function formatCompactNumber(n) {
  if (n === null || n === undefined) return '—';
  const num = Number(n);
  if (Number.isNaN(num)) return '—';
  if (Math.abs(num) >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

export default function SuperAdminAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [dashboard, setDashboard] = useState(null);
  const [revenue, setRevenue] = useState(null);

  const range = useMemo(() => {
    // last 6 months window for monthly revenue chart
    return {
      startDate: isoDaysAgo(183),
      endDate: new Date().toISOString(),
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const d = await apiService.analytics.getDashboard();
        setDashboard(d?.data?.data ?? null);

        const r = await apiService.analytics.getRevenue(range);
        setRevenue(r?.data?.data ?? null);
      } catch (e) {
        setError(e?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range.endDate, range.startDate]);

  const monthly = revenue?.monthlyRevenue ?? [];
  const maxMonthly = monthly.reduce((m, x) => Math.max(m, Number(x?.revenue) || 0), 0) || 1;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Revenue trends, growth, and system activity for Super Admin.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
          <div className="font-semibold">⚠️ {error}</div>
        </div>
      )}

      {loading && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Loading analytics…
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        {[
          {
            label: 'Total Users',
            value: dashboard?.counts?.users ?? dashboard?.users ?? dashboard?.counts?.totalUsers,
            hint: 'All roles combined',
          },
          {
            label: 'Total Courses',
            value: dashboard?.counts?.courses ?? dashboard?.courses ?? dashboard?.counts?.totalCourses,
            hint: 'Published + draft',
          },
          {
            label: 'Total Assignments',
            value: dashboard?.counts?.assignments ?? dashboard?.assignments ?? dashboard?.counts?.totalAssignments,
            hint: 'Across courses',
          },
          {
            label: 'Total Submissions',
            value: dashboard?.counts?.submissions ?? dashboard?.submissions ?? dashboard?.counts?.totalSubmissions,
            hint: 'Student submissions',
          },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4"
          >
            <div className="text-xs text-gray-500 dark:text-gray-400">{k.label}</div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {formatCompactNumber(k.value)}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{k.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                Monthly Revenue
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {monthly.length ? 'Last available months' : 'No revenue data'}
              </div>
            </div>
          </div>

          <div className="mt-4 h-[220px] flex items-end gap-3">
            {monthly.length ? (
              monthly.map((m, idx) => {
                const value = Number(m?.revenue) || 0;
                const heightPct = Math.max(2, Math.round((value / maxMonthly) * 100));
                const label = m?.month || m?.name || `M${idx + 1}`;

                return (
                  <div key={`${label}-${idx}`} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full rounded-md bg-blue-600/90 hover:bg-blue-600"
                      style={{ height: `${heightPct}%`, minHeight: 12 }}
                      title={`${label}: ${formatCompactNumber(value)}`}
                    />
                    <div className="mt-2 text-[10px] text-gray-500 dark:text-gray-400 text-center truncate">
                      {String(label).slice(0, 6)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No monthly revenue to display.
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</div>
              <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {formatCompactNumber(revenue?.totalRevenue)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">Avg / Course</div>
              <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {formatCompactNumber(revenue?.averageRevenuePerCourse)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                Growth & Activity
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Users growth and recent activity (if provided by API)
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Users Growth
            </div>
            <div className="h-[160px] flex items-end gap-3">
              {(dashboard?.growth ?? []).length ? (
                dashboard.growth.map((g, idx) => {
                  const value = Number(g?.count ?? g?.value ?? 0) || 0;
                  const max = dashboard?.growth?.reduce(
                    (m, x) => Math.max(m, Number(x?.count ?? x?.value ?? 0) || 0),
                    1
                  );
                  const heightPct = Math.max(2, Math.round((value / (max || 1)) * 100));
                  const label = g?.month || g?.label || `G${idx + 1}`;

                  return (
                    <div key={`${label}-${idx}`} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full rounded-md bg-emerald-600/90 hover:bg-emerald-600"
                        style={{ height: `${heightPct}%`, minHeight: 12 }}
                        title={`${label}: ${formatCompactNumber(value)}`}
                      />
                      <div className="mt-2 text-[10px] text-gray-500 dark:text-gray-400 text-center truncate">
                        {String(label).slice(0, 6)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No growth data available.
                </div>
              )}
            </div>

            <div className="mt-5">
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Recent Activity
              </div>
              <div className="space-y-2">
                {(dashboard?.recentActivity ?? []).slice(0, 6).length ? (
                  dashboard.recentActivity.slice(0, 6).map((a, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {a?.title || a?.type || 'Activity'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {a?.detail || a?.message || a?.at || '—'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No recent activity available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Tip: Charts render inline from API fields with safe fallbacks to avoid runtime errors.
      </div>
    </div>
  );
}

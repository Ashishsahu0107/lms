import React, { useEffect, useMemo, useState } from 'react';
import apiService from '../../services/api';

function formatCompactNumber(n) {
  if (n === null || n === undefined) return '—';
  const num = Number(n);
  if (Number.isNaN(num)) return '—';
  if (Math.abs(num) >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

function formatISODateInput(value) {
  try {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    // yyyy-mm-dd
    return d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [range, setRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 5);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  });

  const [revenue, setRevenue] = useState(null);

  const revenueMonthly = revenue?.monthlyRevenue ?? [];
  const monthlyTotal = revenueMonthly.reduce((sum, m) => sum + (Number(m?.revenue) || 0), 0);

  const hasAny = useMemo(() => {
    return (
      (revenue?.totalRevenue ?? revenue?.averageRevenuePerCourse ?? monthlyTotal) !== null
    );
  }, [revenue, monthlyTotal]);

  const fetchRevenue = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.analytics.getRevenue({
        startDate: range.startDate,
        endDate: range.endDate,
      });
      setRevenue(res?.data?.data ?? null);
    } catch (e) {
      setError(e?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyNewRange = async () => {
    await fetchRevenue();
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Revenue breakdown and export-ready summaries.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
          <div className="font-semibold">⚠️ {error}</div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5 mb-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
                  Start date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formatISODateInput(range.startDate)}
                  onChange={(e) =>
                    setRange((p) => ({
                      ...p,
                      startDate: new Date(e.target.value + 'T00:00:00.000Z').toISOString(),
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
                  End date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formatISODateInput(range.endDate)}
                  onChange={(e) =>
                    setRange((p) => ({
                      ...p,
                      endDate: new Date(e.target.value + 'T23:59:59.999Z').toISOString(),
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
              disabled={loading}
              onClick={applyNewRange}
            >
              {loading ? 'Loading…' : 'Generate'}
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</div>
            <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
              {formatCompactNumber(revenue?.totalRevenue)}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Avg Revenue / Course</div>
            <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
              {formatCompactNumber(revenue?.averageRevenuePerCourse)}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Monthly Sum</div>
            <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
              {formatCompactNumber(monthlyTotal)}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              Monthly Revenue
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Bar summary from `/api/analytics/revenue` for the selected range.
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {hasAny ? `${revenueMonthly.length} month(s)` : 'No data'}
          </div>
        </div>

        <div className="h-[240px] flex items-end gap-3">
          {revenueMonthly.length ? (
            revenueMonthly.map((m, idx) => {
              const value = Number(m?.revenue) || 0;
              const label = m?.month || m?.name || `M${idx + 1}`;
              const max = Math.max(
                ...revenueMonthly.map((x) => Number(x?.revenue) || 0),
                1
              );
              const heightPct = Math.max(2, Math.round((value / max) * 100));

              return (
                <div key={`${label}-${idx}`} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-md bg-indigo-600/90 hover:bg-indigo-600"
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
              No monthly revenue available for this range.
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Export is intentionally omitted (no new dependencies). Use the API response for downstream export.
        </div>
      </div>
    </div>
  );
}

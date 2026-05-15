import React, { useEffect, useState } from 'react';
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

export default function SuperAdminSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // These settings are currently derived from backend analytics/user counts
  // since there is no dedicated settings endpoint in this repo.
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const d = await apiService.analytics.getDashboard();
        const u = await apiService.users.getUserStats();
        setSummary({
          analytics: d?.data?.data ?? null,
          users: u?.data?.data ?? null,
        });
      } catch (e) {
        setError(e?.message || 'Failed to load settings data');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const counts = summary?.analytics?.counts ?? summary?.analytics?.counts ?? {};
  const roleCounts = summary?.users?.roles ?? {};

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Super Admin configuration overview (role health, platform status, and system metrics).
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
          <div className="font-semibold">⚠️ {error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                Platform Health
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Live snapshot based on analytics + user statistics.
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {loading ? 'Updating…' : 'Up to date'}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Users</div>
              <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {formatCompactNumber(counts?.users ?? summary?.analytics?.users)}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Courses</div>
              <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {formatCompactNumber(counts?.courses ?? summary?.analytics?.courses)}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Assignments</div>
              <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {formatCompactNumber(counts?.assignments ?? summary?.analytics?.assignments)}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Submissions</div>
              <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {formatCompactNumber(counts?.submissions ?? summary?.analytics?.submissions)}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <div className="text-xs text-blue-800 dark:text-blue-200 font-semibold">
              Notes
            </div>
            <div className="text-sm text-blue-900/80 dark:text-blue-100 mt-1">
              This repo currently doesn’t expose dedicated “settings write” endpoints.
              This page uses existing read APIs to show configuration-relevant metrics.
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            Role Distribution
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Derived from /api/users/stats
          </div>

          <div className="mt-4 space-y-3">
            {[
              { label: 'Super Admins', value: roleCounts?.superAdmins },
              { label: 'Teachers', value: roleCounts?.teachers },
              { label: 'Students', value: roleCounts?.students },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                  {formatCompactNumber(item.value)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            For fine-grained policy controls, use the role management screens.
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              System Actions
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Placeholders for production settings (kept minimal without adding new endpoints).
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            className="px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 font-semibold disabled:opacity-60"
            disabled
            title="Not implemented: requires backend settings endpoints"
          >
            Manage Email Templates
          </button>

          <button
            type="button"
            className="px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 font-semibold disabled:opacity-60"
            disabled
            title="Not implemented: requires backend settings endpoints"
          >
            Configure SSO Providers
          </button>

          <button
            type="button"
            className="px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 font-semibold disabled:opacity-60"
            disabled
            title="Not implemented: requires backend settings endpoints"
          >
            Feature Flags
          </button>
        </div>
      </div>
    </div>
  );
}

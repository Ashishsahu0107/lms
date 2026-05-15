import React, { useEffect, useMemo, useState } from 'react';
import apiService from '../../services/api';

export default function ManageTeachers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const [query, setQuery] = useState({
    search: '',
    page: 1,
    limit: 10,
    sort: '-createdAt',
  });

  const [form, setForm] = useState({
    roleById: {},
    blockedById: {},
  });

  const roleOptions = useMemo(() => ['teacher'], []);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Backend only supports search via /api/users query; filter role client-side.
        const res = await apiService.users.getAll({
          page: query.page,
          limit: query.limit,
          sort: query.sort,
          search: query.search || undefined,
        });

        const list = res?.data?.data || [];
        const pag = res?.data?.pagination;

        const filtered = list.filter((u) => u.role === 'teacher');
        setTeachers(filtered);

        if (pag) {
          setPagination({
            page: pag.page ?? query.page,
            limit: pag.limit ?? query.limit,
            total: pag.total ?? filtered.length,
            pages: pag.pages ?? 1,
          });
        }
      } catch (e) {
        setError(e?.message || 'Failed to load teachers');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [query.page, query.limit, query.search, query.sort]);

  const applyBlock = async (id, nextBlocked) => {
    setLoading(true);
    setError(null);
    try {
      if (nextBlocked) {
        await apiService.users.block(id);
      } else {
        await apiService.users.unblock(id);
      }

      setTeachers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isBlocked: nextBlocked } : u))
      );
      setForm((prev) => ({
        ...prev,
        blockedById: { ...prev.blockedById, [id]: nextBlocked },
      }));
    } catch (e) {
      setError(e?.message || 'Failed to update teacher status');
    } finally {
      setLoading(false);
    }
  };

  const applyRole = async (id, role) => {
    setLoading(true);
    setError(null);
    try {
      // role options is fixed to 'teacher' but keep API integration consistent
      await apiService.users.updateRole(id, { role });
      setTeachers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
      setForm((prev) => ({
        ...prev,
        roleById: { ...prev.roleById, [id]: role },
      }));
    } catch (e) {
      setError(e?.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Teacher Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Search teachers and manage active/blocked status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-md">
              <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
                Search by name or email
              </label>
              <input
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. jane@example.com"
                value={query.search}
                onChange={(e) =>
                  setQuery((p) => ({ ...p, search: e.target.value, page: 1 }))
                }
              />
            </div>

            <div className="flex gap-3 items-end">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Page size</label>
                <select
                  className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  value={query.limit}
                  onChange={(e) =>
                    setQuery((p) => ({ ...p, limit: Number(e.target.value), page: 1 }))
                  }
                >
                  {[10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
                disabled={loading}
                onClick={() => setQuery((p) => ({ ...p, page: 1 }))}
              >
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">Results</div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {pagination.total}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Page {pagination.page} of {pagination.pages}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
          <div className="font-semibold">⚠️ {error}</div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Teachers ({teachers.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/40">
              <tr className="text-left text-sm text-gray-600 dark:text-gray-300">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {teachers.map((t) => {
                const effectiveRole = form.roleById[t._id] ?? t.role;
                const effectiveBlocked = form.blockedById[t._id] ?? t.isBlocked ?? false;

                return (
                  <tr key={t._id} className="text-sm">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {t.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                      {t.email || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
                        value={effectiveRole}
                        onChange={(e) => {
                          const nextRole = e.target.value;
                          setForm((p) => ({
                            ...p,
                            roleById: { ...p.roleById, [t._id]: nextRole },
                          }));
                        }}
                      >
                        {roleOptions.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          effectiveBlocked
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {effectiveBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
                          disabled={loading}
                          onClick={() => applyRole(t._id, effectiveRole)}
                        >
                          Save Role
                        </button>

                        <button
                          type="button"
                          className={`px-3 py-2 rounded-lg font-semibold disabled:opacity-60 ${
                            effectiveBlocked
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-rose-600 hover:bg-rose-700 text-white'
                          }`}
                          disabled={loading}
                          onClick={() => applyBlock(t._id, !effectiveBlocked)}
                        >
                          {effectiveBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && teachers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-600 dark:text-gray-400">
                    No teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Showing page <span className="font-semibold">{pagination.page}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                disabled={query.page <= 1 || loading}
                onClick={() => setQuery((p) => ({ ...p, page: p.page - 1 }))}
              >
                Prev
              </button>

              <div className="px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200">
                {pagination.page} / {pagination.pages}
              </div>

              <button
                type="button"
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                disabled={query.page >= pagination.pages || loading}
                onClick={() => setQuery((p) => ({ ...p, page: p.page + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Working...
        </div>
      )}
    </div>
  );
}

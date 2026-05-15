import React, { useEffect, useMemo, useState } from 'react';
import apiService from '../../services/api';

export default function ManageCourses() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [courses, setCourses] = useState([]);
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
    status: 'all', // all | published | draft
  });

  const [publishById, setPublishById] = useState({});

  const statusOptions = useMemo(() => ['all', 'published', 'draft'], []);
  const normalizeCourses = (list) => (Array.isArray(list) ? list : []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiService.courses.getAll({
          page: query.page,
          limit: query.limit,
          sort: query.sort,
          // Backend course controller may not implement search/sort all fields;
          // pass through what exists; UI still works.
          search: query.search || undefined,
        });

        const list = normalizeCourses(res?.data?.data);
        const pag = res?.data?.pagination;

        const filtered =
          query.status === 'all'
            ? list
            : list.filter((c) =>
                query.status === 'published' ? !!c.isPublished : !c.isPublished
              );

        setCourses(filtered);

        if (pag) {
          setPagination({
            page: pag.page ?? query.page,
            limit: pag.limit ?? query.limit,
            total: pag.total ?? filtered.length,
            pages: pag.pages ?? 1,
          });
        } else {
          setPagination((p) => ({
            ...p,
            total: filtered.length,
            pages: 1,
          }));
        }
      } catch (e) {
        setError(e?.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [query.page, query.limit, query.search, query.sort, query.status]);

  const applyPublish = async (id, nextPublished) => {
    setLoading(true);
    setError(null);
    try {
      // Use course update endpoint; backend should accept isPublished
      await apiService.courses.update(id, { isPublished: nextPublished });

      setCourses((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isPublished: nextPublished } : c))
      );

      setPublishById((prev) => ({
        ...prev,
        [id]: nextPublished,
      }));
    } catch (e) {
      setError(e?.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Course Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Publish/unpublish courses and browse course list.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end sm:justify-between">
            <div className="w-full sm:max-w-md">
              <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
                Search course title
              </label>
              <input
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. React"
                value={query.search}
                onChange={(e) => setQuery((p) => ({ ...p, search: e.target.value, page: 1 }))}
              />
            </div>

            <div className="flex gap-3 items-end">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
                  Status
                </label>
                <select
                  className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  value={query.status}
                  onChange={(e) =>
                    setQuery((p) => ({ ...p, status: e.target.value, page: 1 }))
                  }
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s === 'all' ? 'All' : s === 'published' ? 'Published' : 'Draft'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
                  Page size
                </label>
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
              Courses ({courses.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/40">
              <tr className="text-left text-sm text-gray-600 dark:text-gray-300">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Teacher</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {courses.map((c) => {
                const isPublished = publishById[c._id] ?? c.isPublished ?? false;

                return (
                  <tr key={c._id} className="text-sm">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {c.title || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                      {c.teacher?.name || c.teacherName || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                      {c.category || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          isPublished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={`px-3 py-2 rounded-lg font-semibold disabled:opacity-60 ${
                            isPublished
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                          disabled={loading}
                          onClick={() => applyPublish(c._id, !isPublished)}
                        >
                          {isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && courses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-600 dark:text-gray-400">
                    No courses found.
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

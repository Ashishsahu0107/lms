// app/(dashboard)/loading.tsx — Instant Loading Skeleton for Next.js App Router
export default function DashboardLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse p-2">
      {/* Skeleton Banner */}
      <div className="space-y-2">
        <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded-xl w-64" />
        <div className="h-4 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg w-96" />
      </div>

      {/* Skeleton Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="w-14 h-4 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Skeleton Main Section */}
      <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6" />
    </div>
  );
}

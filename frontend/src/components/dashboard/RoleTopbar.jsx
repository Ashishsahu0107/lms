

export default function RoleTopbar({ title, subtitle }) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        ) : null}
      </div>
      <div className="text-right text-xs text-slate-500">
        <div className="font-medium text-slate-700">Dashboard</div>
        <div className="mt-1">Role-based shell scaffold</div>
      </div>
    </header>
  );
}


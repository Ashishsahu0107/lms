
import { cn } from "../../utils/cn";

const defaultItems = [
  { key: "overview", label: "Overview" },
  { key: "courses", label: "Courses" },
  { key: "reports", label: "Reports" },
];

export default function SidebarShell({
  className,
  items = defaultItems,
  activeKey = "overview",
  onNavigate,
}) {
  return (
    <aside
      className={cn(
        "w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-5",
        className
      )}
    >
      <div className="text-sm font-semibold tracking-wide text-slate-800">
        LMS
      </div>
      <div className="mt-6 space-y-2">
        {items.map((it) => {
          const active = it.key === activeKey;
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => onNavigate?.(it.key)}
              className={cn(
                "w-full rounded-md px-3 py-2 text-left text-sm transition",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              {it.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg bg-slate-50 p-3">
        <div className="text-xs font-medium text-slate-600">Quick tips</div>
        <ul className="mt-2 list-disc pl-4 text-xs text-slate-600">
          <li>Swap items per role in routes/pages.</li>
          <li>Connect navigation to react-router later.</li>
        </ul>
      </div>
    </aside>
  );
}


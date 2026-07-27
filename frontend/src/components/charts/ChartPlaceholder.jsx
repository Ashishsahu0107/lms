import { BarChart3, TrendingUp } from "lucide-react";

export default function ChartPlaceholder({
  title = "Analytics Overview",
  subtitle = "Chart data visualization",
}) {
  return (
    <div className="card border border-base-300 bg-base-100 shadow-sm">
      {/* Header */}
      <div className="border-b border-base-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-base-content">{title}</h3>

            <p className="text-sm text-base-content/60">{subtitle}</p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-6">
        <div className="relative flex h-72 items-end justify-between gap-3 overflow-hidden rounded-2xl bg-base-200/60 p-6">
          {/* Decorative Grid */}
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-[linear-gradient(to_right,#94a3b820_1px,transparent_1px),linear-gradient(to_bottom,#94a3b820_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          {/* Bars */}
          {[35, 55, 45, 75, 60, 90, 70].map((height, index) => (
            <div
              key={index}
              className="relative flex flex-1 flex-col items-center"
            >
              <div
                className="w-full rounded-t-2xl bg-gradient-to-t from-primary to-secondary shadow-lg transition-all duration-500 hover:scale-105"
                style={{
                  height: `${height}%`,
                }}
              />

              <span className="mt-3 text-xs font-medium text-base-content/60">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-success/10 p-4">
          <div>
            <p className="text-sm text-base-content/60">Performance Growth</p>

            <h4 className="text-2xl font-bold text-success">+24.5%</h4>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
            <TrendingUp className="h-6 w-6 text-success" />
          </div>
        </div>
      </div>
    </div>
  );
}

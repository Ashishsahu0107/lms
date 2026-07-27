import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function AnalyticsCard({
  title,
  value,
  subtext,
  icon: Icon,
  trendValue,
  trendDirection = "up",
  color = "blue",
  loading = false,
}) {
  const colorGradients = {
    blue: "from-blue-500/20 to-indigo-500/5 border-blue-500/30 text-blue-400",
    purple:
      "from-purple-500/20 to-pink-500/5 border-purple-500/30 text-purple-400",
    emerald:
      "from-emerald-500/20 to-teal-500/5 border-emerald-500/30 text-emerald-400",
    amber:
      "from-amber-500/20 to-orange-500/5 border-amber-500/30 text-amber-400",
    rose: "from-rose-500/20 to-red-500/5 border-rose-500/30 text-rose-400",
  };

  const ringColors = {
    blue: "shadow-blue-500/10 border-blue-500/20",
    purple: "shadow-purple-500/10 border-purple-500/20",
    emerald: "shadow-emerald-500/10 border-emerald-500/20",
    amber: "shadow-amber-500/10 border-amber-500/20",
    rose: "shadow-rose-500/10 border-rose-500/20",
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-2xl border bg-black/40 backdrop-blur-xl p-6 shadow-2xl transition-all ${
        ringColors[color] || ringColors.blue
      }`}
    >
      {/* Background glow orb */}
      <div
        className={`absolute -right-12 -top-12 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl ${colorGradients[color]}`}
      />

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="h-8 w-8 rounded-lg bg-white/10" />
          </div>
          <div className="h-8 w-32 rounded bg-white/10" />
          <div className="h-3 w-48 rounded bg-white/10" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold tracking-wide text-white/50 uppercase">
              {title}
            </span>
            {Icon && (
              <div
                className={`rounded-xl border p-2.5 bg-white/5 ${colorGradients[color]}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {value}
            </span>
            {trendValue && (
              <span
                className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 border ${
                  trendDirection === "up"
                    ? "text-emerald-400 border-emerald-500/20"
                    : "text-rose-400 border-rose-500/20"
                }`}
              >
                {trendDirection === "up" ? (
                  <TrendingUp className="mr-1 h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="mr-1 h-3.5 w-3.5" />
                )}
                {trendValue}
              </span>
            )}
          </div>

          {subtext && (
            <p className="text-xs font-medium text-white/40">{subtext}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}

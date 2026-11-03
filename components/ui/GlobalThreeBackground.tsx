"use client";

import { useTheme } from "@/context/ThemeContext";

export default function GlobalThreeBackground() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-80">
      <div
        className="absolute -left-24 top-12 h-72 w-72 rounded-full blur-3xl"
        style={{
          background: isDark ? "rgba(99,102,241,0.24)" : "rgba(99,102,241,0.18)",
        }}
      />
      <div
        className="absolute -right-16 bottom-0 h-96 w-96 rounded-full blur-3xl"
        style={{
          background: isDark ? "rgba(236,72,153,0.18)" : "rgba(236,72,153,0.14)",
        }}
      />
      <div
        className="absolute left-1/3 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background: isDark ? "rgba(167,139,250,0.10)" : "rgba(167,139,250,0.12)",
        }}
      />
    </div>
  );
}

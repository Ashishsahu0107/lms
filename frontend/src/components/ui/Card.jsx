import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 bg-white border-slate-200 text-slate-800 dark:border-white/10 dark:bg-slate-900/60 dark:text-white backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`p-6 border-b border-slate-100 dark:border-white/5 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h2 className={`text-lg font-bold tracking-tight text-slate-850 dark:text-white ${className}`}>
      {children}
    </h2>
  );
}

export function CardContent({ children, className = "" }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}
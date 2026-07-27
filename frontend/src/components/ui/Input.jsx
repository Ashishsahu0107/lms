export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border px-4 py-3 outline-none transition-all duration-200 bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-black/30 dark:border-white/10 dark:text-white dark:focus:border-blue-500/50 dark:focus:ring-blue-500/50 placeholder-slate-400 dark:placeholder-slate-500 ${className}`}
    />
  );
}

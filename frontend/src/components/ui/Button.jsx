export function Button({
  children,
  className = "",
  disabled = false,
  variant = "primary",
  size = "md",
  ...props
}) {
  const baseStyles =
    "rounded-xl font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] flex items-center justify-center";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/10",
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white border border-slate-200 dark:border-white/10",
    outline:
      "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-slate-900",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-600 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/10",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-md",
  };

  return (
    <button
      disabled={disabled}
      {...props}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;

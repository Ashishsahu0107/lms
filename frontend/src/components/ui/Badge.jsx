import { cn } from "../../utils/cn";

export function Badge({ className, variant = "default", children, ...props }) {
  const variants = {
    default: "bg-primary/10 text-primary",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    destructive: "bg-destructive/10 text-destructive",
    outline: "border border-input bg-background",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;

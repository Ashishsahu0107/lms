import { cn } from "../../utils/cn";

export function ProgressBar({
  value = 0,
  max = 100,
  className,
  showLabel = false,
  size = "md",
  color = "primary",
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colors = {
    primary: "bg-primary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  };

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Progress
          </span>
          <span className="text-sm font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-muted rounded-full overflow-hidden",
          sizes[size],
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            colors[color],
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;

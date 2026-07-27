import { cn } from "../../utils/cn";
import { motion } from "framer-motion";

export function Spinner({ size = "md", className }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <motion.div
      className={cn("animate-spin", className)}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <svg
        className={cn(sizes[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2z"
        />
      </svg>
    </motion.div>
  );
}

export function LoadingSkeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-muted", className)}
      {...props}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" className="text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default Spinner;

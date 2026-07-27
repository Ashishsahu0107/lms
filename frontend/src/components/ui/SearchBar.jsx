import { cn } from "../../utils/cn";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
  onClear,
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-10 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
      />
      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => {
              onChange({ target: { value: "" } });
              onClear?.();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchBar;

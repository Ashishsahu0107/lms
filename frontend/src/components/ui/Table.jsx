import { cn } from "../../utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Table({ className, children, ...props }) {
  return (
    <div className="w-full overflow-auto">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }) {
  return (
    <thead className={cn("border-b bg-muted/50", className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }) {
  return (
    <tr
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }) {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }) {
  return (
    <td
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}

export function Pagination({
  className,
  currentPage,
  totalPages,
  onPageChange,
}) {
  const pages = [];
  const maxVisible = 5;

  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 rounded-lg border hover:bg-accent"
          >
            1
          </button>
          {start > 2 && <span className="px-2">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            "px-3 py-1 rounded-lg border transition-colors",
            currentPage === page
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent",
          )}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 rounded-lg border hover:bg-accent"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default Table;

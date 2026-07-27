import React from "react";
import { cn } from "../../utils/cn";

export function DropdownMenu({ children }) {
  return <div className="relative inline-block">{children}</div>;
}

export function DropdownMenuTrigger({ asChild, children, ...props }) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props);
  }
  return <button {...props}>{children}</button>;
}

export function DropdownMenuContent({
  children,
  align = "end",
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-lg border bg-card shadow-lg animate-in fade-in-0 zoom-in-95",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  );
}

export function DropdownMenuItem({ children, className, onClick, ...props }) {
  return (
    <button
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-muted focus:bg-muted",
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator({ className }) {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} />;
}

export default DropdownMenu;

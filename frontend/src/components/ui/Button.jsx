import React from "react";

export function Button({
  children,
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      {...props}
      className={`w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
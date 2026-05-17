import React from "react";

export default function Spinner({ className = "" }) {
  return (
    <div
      className={
        className ||
        "inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600"
      }
      role="status"
      aria-label="Loading"
    />
  );
}


"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 text-sm">
            {icon}
          </span>
        )}
        <input
          className={`w-full py-2.5 rounded-xl border border-base-300 bg-base-100 text-base-content placeholder-base-content/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
            icon ? "pl-10 pr-3.5" : "px-3.5"
          } ${error ? "border-error focus:ring-error/20" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
}

"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "outline"
    | "error"
    | "ghost"
    | "info"
    | "success"
    | "warning";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "btn font-medium rounded-xl transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/20";

  const variants = {
    primary:
      "bg-primary hover:bg-primary/90 text-primary-content border-primary shadow-sm shadow-primary/30",
    secondary:
      "bg-secondary hover:bg-secondary/90 text-secondary-content border-secondary shadow-sm shadow-secondary/30",
    accent: "bg-accent hover:bg-accent/90 text-accent-content border-accent",
    outline:
      "border border-base-300 hover:bg-base-200 text-base-content bg-transparent",
    error:
      "bg-error hover:bg-error/90 text-error-content border-error shadow-sm shadow-error/30",
    info: "bg-info hover:bg-info/90 text-info-content border-info",
    success:
      "bg-success hover:bg-success/90 text-success-content border-success",
    warning:
      "bg-warning hover:bg-warning/90 text-warning-content border-warning",
    ghost:
      "hover:bg-base-200 text-base-content border-transparent bg-transparent",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-5 py-3 text-base gap-2.5",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

"use client";

import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`card bg-base-100/85 backdrop-blur-md border border-base-300 rounded-2xl p-6 shadow-sm text-base-content transition-all ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-200">
      <div>
        <h3 className="font-bold text-base text-base-content tracking-tight font-display">{title}</h3>
        {subtitle && <p className="text-xs text-base-content/60 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

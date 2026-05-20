import React from "react";
import { ChevronRight } from "lucide-react";

export default function DashboardSection({
  title,
  description,
  children,
  action,
  className = "",
}) {
  return (
    <section
      className={`
        card
        border
        border-base-300
        bg-base-100
        shadow-sm
        transition-all
        duration-300
        hover:shadow-lg
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-base-200 p-5 md:flex-row md:items-center md:justify-between">

        <div>
          <h2 className="text-xl font-bold text-base-content">
            {title}
          </h2>

          {description ? (
            <p className="mt-1 text-sm text-base-content/60">
              {description}
            </p>
          ) : null}
        </div>

        {/* Action */}
        {action ? (
          <div>{action}</div>
        ) : (
          <button className="btn btn-ghost btn-sm gap-2 rounded-xl">
            View More
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

      </div>

      {/* Content */}
      <div className="p-5">
        {children}
      </div>
    </section>
  );
}
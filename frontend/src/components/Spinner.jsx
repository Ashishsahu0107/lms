import React from "react";

export default function Spinner({ className = "" }) {
  return (
    <div className="flex items-center justify-center">

      <span
        className={`
          loading loading-spinner loading-lg
          text-primary
          ${className}
        `}
      />

    </div>
  );
}
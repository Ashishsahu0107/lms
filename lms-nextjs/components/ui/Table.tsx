"use client";

import React from "react";

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export function Table({ headers, children, className = "" }: TableProps) {
  return (
    <div className={`overflow-x-auto w-full ${className}`}>
      <table className="table w-full text-left text-xs bg-base-100 text-base-content">
        <thead>
          <tr className="border-b border-base-300 text-base-content/60 font-semibold uppercase tracking-wider bg-base-200/50">
            {headers.map((h, i) => (
              <th key={i} className="py-3 px-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-base-200/60 font-sans">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function TableRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={`hover:bg-base-200/60 transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`py-3.5 px-4 text-base-content ${className}`}>{children}</td>;
}

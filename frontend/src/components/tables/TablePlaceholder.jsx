import React from "react";
import {
  Table2,
  Database,
  FileSpreadsheet,
} from "lucide-react";

export default function TablePlaceholder() {
  return (
    <div className="card border border-base-300 bg-base-100 shadow-sm">

      <div className="card-body">

        {/* Header */}
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Table2 className="h-6 w-6 text-primary" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-base-content">
                Table Placeholder
              </h3>

              <p className="text-sm text-base-content/60">
                Data table component will appear here
              </p>
            </div>

          </div>

          {/* Badge */}
          <div className="badge badge-primary badge-outline">
            FlyonUI
          </div>

        </div>

        {/* Fake Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-base-300">

          {/* Table Header */}
          <div className="grid grid-cols-4 border-b border-base-300 bg-base-200 px-4 py-3 text-sm font-semibold text-base-content">

            <div>ID</div>
            <div>Name</div>
            <div>Status</div>
            <div>Action</div>

          </div>

          {/* Rows */}
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="grid grid-cols-4 items-center border-b border-base-300 px-4 py-4 last:border-0"
            >

              <div className="skeleton h-4 w-10"></div>

              <div className="flex items-center gap-3">

                <div className="skeleton h-10 w-10 rounded-full"></div>

                <div className="space-y-2">
                  <div className="skeleton h-4 w-28"></div>
                  <div className="skeleton h-3 w-20"></div>
                </div>

              </div>

              <div>
                <div className="badge badge-success badge-soft">
                  Active
                </div>
              </div>

              <div>
                <button className="btn btn-sm btn-outline">
                  View
                </button>
              </div>

            </div>
          ))}

        </div>

        {/* Footer */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

          <div className="flex items-center gap-2 text-sm text-base-content/60">

            <Database className="h-4 w-4" />

            Waiting for backend API integration

          </div>

          <button className="btn btn-primary btn-sm gap-2 rounded-xl">

            <FileSpreadsheet className="h-4 w-4" />

            Export

          </button>

        </div>

      </div>

    </div>
  );
}
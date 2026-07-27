"use client";

// components/admin/AdminSettingsView.tsx — System Settings Component
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function AdminSettingsView() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);

  const handleSave = () => {
    toast.success("System Settings Saved!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-base-content font-display">
          System Settings ⚙️
        </h1>
        <p className="text-sm text-base-content/60 mt-1">
          Configure platform controls, maintenance mode, and security policies.
        </p>
      </div>

      <div className="card bg-base-100 shadow border border-base-200 p-6 space-y-4 max-w-xl">
        <div className="form-control flex-row items-center justify-between">
          <span className="label-text font-semibold text-sm">Allow Self Registration</span>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={allowRegistration}
            onChange={(e) => setAllowRegistration(e.target.checked)}
          />
        </div>

        <div className="form-control flex-row items-center justify-between border-t border-base-200 pt-4">
          <div>
            <span className="label-text font-semibold text-sm block">System Maintenance Mode</span>
            <span className="text-xs text-base-content/50">Restricts student access for maintenance</span>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-error"
            checked={maintenanceMode}
            onChange={(e) => setMaintenanceMode(e.target.checked)}
          />
        </div>

        <div className="pt-4 border-t border-base-200">
          <button onClick={handleSave} className="btn btn-primary btn-sm">
            💾 Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

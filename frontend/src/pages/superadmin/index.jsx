
import DashboardSection from "../../components/dashboard/DashboardSection";

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Users</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">—</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Roles</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">—</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">System health</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">—</div>
        </div>
      </div>

      <DashboardSection
        title="Admin Overview"
        description="Starter dashboard content for Super Admin."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-800">User Management</div>
            <p className="mt-1 text-sm text-slate-600">
              Wire APIs and add tables/forms here.
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-800">Role Settings</div>
            <p className="mt-1 text-sm text-slate-600">
              Add role/permission editor later.
            </p>
          </div>
        </div>
      </DashboardSection>
    </div>
  );
}


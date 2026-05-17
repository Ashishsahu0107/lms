
import DashboardSection from "../../components/dashboard/DashboardSection";

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Enrolled</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">—</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Assignments due</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">—</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Progress</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">—</div>
        </div>
      </div>

      <DashboardSection
        title="Student Dashboard"
        description="Starter dashboard content for Students."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-800">Enrolled Courses</div>
            <p className="mt-1 text-sm text-slate-600">
              Add course cards and last activity later.
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-800">Assignments</div>
            <p className="mt-1 text-sm text-slate-600">
              Add assignment list + submission flow later.
            </p>
          </div>
        </div>
      </DashboardSection>
    </div>
  );
}


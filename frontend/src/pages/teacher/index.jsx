import DashboardSection from "../../components/dashboard/DashboardSection";

export default function TeacherDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Courses</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">—</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Students</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">—</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Assignments</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">—</div>
        </div>
      </div>

      <DashboardSection
        title="Teacher Overview"
        description="Starter dashboard content for Teachers."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-800">
              My Courses
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Add course list + quick actions here.
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-800">Grading</div>
            <p className="mt-1 text-sm text-slate-600">
              Add grading tables and charts later.
            </p>
          </div>
        </div>
      </DashboardSection>
    </div>
  );
}

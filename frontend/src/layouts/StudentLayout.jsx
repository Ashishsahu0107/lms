import SidebarShell from "../components/dashboard/SidebarShell";
import RoleTopbar from "../components/dashboard/RoleTopbar";

export default function StudentLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <SidebarShell
          activeKey="overview"
          items={[
            { key: "overview", label: "My Dashboard" },
            { key: "courses", label: "Enrolled Courses" },
            { key: "assignments", label: "Assignments" },
            { key: "progress", label: "Progress" },
          ]}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <RoleTopbar
            title="Student"
            subtitle="Track progress and assignments (scaffold)"
          />

          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

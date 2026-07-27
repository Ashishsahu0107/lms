import SidebarShell from "../components/dashboard/SidebarShell";
import RoleTopbar from "../components/dashboard/RoleTopbar";

export default function TeacherLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <SidebarShell
          activeKey="overview"
          items={[
            { key: "overview", label: "Teacher Overview" },
            { key: "courses", label: "My Courses" },
            { key: "students", label: "Students" },
            { key: "grading", label: "Grading" },
          ]}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <RoleTopbar
            title="Teacher"
            subtitle="Plan lessons, track learners (scaffold)"
          />

          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

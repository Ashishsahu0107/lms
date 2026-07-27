import SidebarShell from "../components/dashboard/SidebarShell";
import RoleTopbar from "../components/dashboard/RoleTopbar";

export default function SuperAdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <SidebarShell
          activeKey="overview"
          items={[
            { key: "overview", label: "Admin Overview" },
            { key: "users", label: "User Management" },
            { key: "roles", label: "Role Settings" },
          ]}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <RoleTopbar
            title="Super Admin"
            subtitle="Manage tenants, users and permissions (scaffold)"
          />

          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

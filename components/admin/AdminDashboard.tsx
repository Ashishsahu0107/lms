"use client";

// components/admin/AdminDashboard.tsx — Minimalist Super Admin Dashboard in pure Tailwind CSS
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/lib/api-config";

export default function AdminDashboard() {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [usersRes, healthRes] = await Promise.all([
        fetch(`${API_URL}/admin/users?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch(`${API_URL}/health`).then((r) => r.json()),
      ]);

      if (usersRes.success) setUsers(usersRes.data.users || []);
      setHealth(healthRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
    if (!isLoading && isAuthenticated && user?.role !== "super_admin") {
      router.push(`/${user?.role}/dashboard`);
    }
    if (isAuthenticated && token) loadData();
  }, [isAuthenticated, isLoading, token, user, router, loadData]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
            System Administration ⚡
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Platform control center, system health diagnostics, and user
            management.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users">
            <Button variant="primary" size="sm">
              👥 User Roster
            </Button>
          </Link>
          <Link href="/api-docs" target="_blank">
            <Button variant="outline" size="sm">
              ⚡ Swagger Docs
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Users",
            value: users.length,
            icon: "👤",
            badge: "active",
            variant: "primary" as const,
          },
          {
            label: "Database Status",
            value: (health?.database as string) || "ONLINE",
            icon: "🗄️",
            badge: "connected",
            variant: "success" as const,
          },
          {
            label: "API Liveness",
            value: (health?.status as string) || "UP",
            icon: "🛡️",
            badge: "healthy",
            variant: "success" as const,
          },
          {
            label: "Active Mode",
            value: "Development",
            icon: "⚙️",
            badge: "Next 15",
            variant: "warning" as const,
          },
        ].map((m) => (
          <Card key={m.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{m.icon}</span>
              <Badge variant={m.variant}>{m.badge}</Badge>
            </div>
            <div className="text-xl font-bold text-base-content mt-1">
              {m.value}
            </div>
            <p className="text-[11px] font-semibold text-base-content/60 mt-1 uppercase tracking-wider">
              {m.label}
            </p>
          </Card>
        ))}
      </div>

      {/* User Roster Preview Table */}
      <Card>
        <CardHeader
          title="Recent User Registrations"
          subtitle="System user accounts overview"
          action={
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">
                View All →
              </Button>
            </Link>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs bg-base-100 text-base-content">
            <thead>
              <tr className="border-b border-base-300 text-base-content/60 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200">
              {users.map((u) => (
                <tr
                  key={u.id as string}
                  className="hover:bg-base-200/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-base-content">
                      {u.name as string}
                    </div>
                    <div className="text-base-content/60 text-[11px]">
                      {u.email as string}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        u.role === "super_admin"
                          ? "error"
                          : u.role === "teacher"
                            ? "primary"
                            : "neutral"
                      }
                    >
                      {(u.role as string).replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="success">Active</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/admin/users?edit=${u.id as string}`}>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

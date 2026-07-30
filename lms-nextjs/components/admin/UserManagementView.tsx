"use client";

// components/admin/UserManagementView.tsx — User Management UI in Unified Design System
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Table, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function UserManagementView() {
  const { token } = useAuth();
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      let url = `${API_URL}/admin/users?limit=50`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (roleFilter) url += `&role=${roleFilter}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("User account created successfully");
      setIsModalOpen(false);
      setForm({ name: "", email: "", password: "", role: "student" });
      fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
            User Account Roster 👥
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage platform users, update access roles, and provision new
            accounts.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          ➕ Add New User
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search users..."
              icon="🔍"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Access Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <Table headers={["User Details", "Role", "Status", "Joined Date"]}>
            {users.map((u) => (
              <TableRow key={u.id as string}>
                <TableCell>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {u.name as string}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {u.email as string}
                  </div>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <Badge variant="success">Active</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-slate-500 text-xs">
                    {new Date(u.createdAt as string).toLocaleDateString()}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>

      {/* Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New User Account"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Jane Doe"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="jane@lmspro.edu"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Access Role
            </label>
            <select
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

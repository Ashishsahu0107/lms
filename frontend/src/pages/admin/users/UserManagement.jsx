import { useState } from "react";
import { motion } from "framer-motion";
import {
  MoreVertical,
  UserPlus,
  Shield,
  Trash2,
  Edit,
  Ban,
  Mail,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { SearchBar } from "../../components/ui/SearchBar";
import { Modal } from "../../components/ui/Modal";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/DropdownMenu";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/Tabs";

const users = [
  {
    id: 1,
    name: "Emma Thompson",
    email: "emma.t@example.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    role: "student",
    status: "active",
    joined: "2024-01-05",
    courses: 4,
  },
  {
    id: 2,
    name: "Dr. James Wilson",
    email: "james.w@university.edu",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    role: "teacher",
    status: "active",
    joined: "2024-01-01",
    courses: 6,
  },
  {
    id: 3,
    name: "Michael Chen",
    email: "michael.c@example.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    role: "student",
    status: "active",
    joined: "2024-01-08",
    courses: 2,
  },
  {
    id: 4,
    name: "Sofia Rodriguez",
    email: "sofia.r@example.com",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    role: "teacher",
    status: "inactive",
    joined: "2024-01-03",
    courses: 3,
  },
  {
    id: 5,
    name: "David Lee",
    email: "david.l@example.com",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    role: "student",
    status: "blocked",
    joined: "2023-12-28",
    courses: 5,
  },
  {
    id: 6,
    name: "Rachel Green",
    email: "rachel.g@university.edu",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
    role: "teacher",
    status: "active",
    joined: "2024-01-02",
    courses: 8,
  },
];

const getStatusBadge = (status) => {
  switch (status) {
    case "active":
      return <Badge variant="success">Active</Badge>;
    case "inactive":
      return <Badge variant="warning">Inactive</Badge>;
    case "blocked":
      return <Badge variant="destructive">Blocked</Badge>;
    default:
      return null;
  }
};

const getRoleBadge = (role) => {
  return (
    <Badge variant={role === "teacher" ? "default" : "secondary"}>{role}</Badge>
  );
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={item}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users on the platform
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col md:flex-row gap-4">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="flex-1"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blocked">Blocked</option>
        </select>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={item}>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
            <TabsTrigger value="students">
              Students ({users.filter((u) => u.role === "student").length})
            </TabsTrigger>
            <TabsTrigger value="teachers">
              Teachers ({users.filter((u) => u.role === "teacher").length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <UsersTable users={filteredUsers} />
          </TabsContent>
          <TabsContent value="students">
            <UsersTable
              users={filteredUsers.filter((u) => u.role === "student")}
            />
          </TabsContent>
          <TabsContent value="teachers">
            <UsersTable
              users={filteredUsers.filter((u) => u.role === "teacher")}
            />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Role Change Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Change User Role"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Change role for <strong>{selectedUser.name}</strong>
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  defaultChecked={selectedUser.role === "student"}
                />
                <span>Student</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  defaultChecked={selectedUser.role === "teacher"}
                />
                <span>Teacher</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  defaultChecked={selectedUser.role === "admin"}
                />
                <span>Admin</span>
              </label>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowRoleModal(false)}>
                Cancel
              </Button>
              <Button>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
        description="This action cannot be undone."
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-sm">
              Are you sure you want to delete{" "}
              <strong>{selectedUser.name}</strong>? All their data will be
              permanently removed.
            </p>
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive">Delete User</Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}

function UsersTable({ users }) {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No users found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                User
              </th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                Role
              </th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                Joined
              </th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                Details
              </th>
              <th className="p-4 text-right text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b hover:bg-muted/50 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">{getRoleBadge(user.role)}</td>
                <td className="p-4">{getStatusBadge(user.status)}</td>
                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(user.joined).toLocaleDateString()}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {user.courses} {user.courses === 1 ? "course" : "courses"}
                </td>
                <td className="p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Shield className="h-4 w-4 mr-2" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Ban className="h-4 w-4 mr-2" />
                        Block User
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

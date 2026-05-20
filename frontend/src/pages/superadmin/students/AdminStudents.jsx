import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Filter, MoreVertical, Mail, Ban, Trash2,
  Eye, BookOpen, Award, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle2, User, TrendingUp
} from "lucide-react";
import {  Card,
  CardContent,
  CardHeader,
  CardTitle, } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Avatar } from "../../../components/ui/Avatar";
import { Modal } from "../../../components/ui/Modal";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";

const mockStudents = [
  { _id: "1", name: "Sarah Johnson", email: "sarah.j@email.com", avatar: "", isActive: true, createdAt: new Date("2024-01-20"), enrolledCourses: 5, completedCourses: 2, progress: 72 },
  { _id: "2", name: "Michael Chen", email: "mchen@email.com", avatar: "", isActive: true, createdAt: new Date("2024-02-15"), enrolledCourses: 3, completedCourses: 1, progress: 45 },
  { _id: "3", name: "Emma Davis", email: "emma.d@email.com", avatar: "", isActive: true, createdAt: new Date("2024-03-08"), enrolledCourses: 8, completedCourses: 4, progress: 88 },
  { _id: "4", name: "James Wilson", email: "jwilson@email.com", avatar: "", isActive: false, createdAt: new Date("2024-04-12"), enrolledCourses: 2, completedCourses: 0, progress: 15 },
  { _id: "5", name: "Lisa Brown", email: "lbrown@email.com", avatar: "", isActive: true, createdAt: new Date("2024-05-05"), enrolledCourses: 6, completedCourses: 3, progress: 65 },
  { _id: "6", name: "Robert Taylor", email: "rtaylor@email.com", avatar: "", isActive: true, createdAt: new Date("2024-06-18"), enrolledCourses: 4, completedCourses: 2, progress: 55 },
];

const mockProgressData = [
  { month: "Jan", completed: 120, active: 340 },
  { month: "Feb", completed: 145, active: 420 },
  { month: "Mar", completed: 180, active: 510 },
  { month: "Apr", completed: 210, active: 580 },
  { month: "May", completed: 260, active: 680 },
  { month: "Jun", completed: 320, active: 780 },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);

  const filteredStudents = mockStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "active") return matchesSearch && s.isActive;
    if (activeTab === "suspended") return matchesSearch && !s.isActive;
    return matchesSearch;
  });

  const handleAction = (student, action) => {
    setSelectedStudent(student);
    setActionType(action);
    setShowActionModal(true);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">Monitor and manage all student accounts</p>
        </div>
        <Button variant="outline" className="gap-2"><TrendingUp className="h-4 w-4" />View Analytics</Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: mockStudents.length, color: "blue" },
          { label: "Active Students", value: mockStudents.filter(s => s.isActive).length, color: "emerald" },
          { label: "Avg Progress", value: "62%", color: "purple" },
          { label: "Certificates", value: mockStudents.filter(s => s.completedCourses > 0).length, color: "amber" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                <User className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Progress Chart */}
      <motion.div variants={item}>
        <Card>
          <CardHeader><CardTitle className="text-base">Student Activity Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockProgressData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                  <Bar dataKey="completed" fill="#10b981" name="Completed Courses" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="active" fill="#3b82f6" name="Active Enrollments" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" />Filters</Button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({mockStudents.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({mockStudents.filter(s => s.isActive).length})</TabsTrigger>
            <TabsTrigger value="suspended">Suspended ({mockStudents.filter(s => !s.isActive).length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Students Table */}
      <motion.div variants={item}>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Student</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Enrolled</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Completed</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Progress</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10" src={student.avatar} fallback={student.name.charAt(0)} />
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1"><BookOpen className="h-4 w-4 text-muted-foreground" />{student.enrolledCourses}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1"><Award className="h-4 w-4 text-muted-foreground" />{student.completedCourses}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-24">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${student.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={student.isActive ? "success" : "destructive"}>{student.isActive ? "Active" : "Suspended"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedStudent(student)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAction(student, student.isActive ? "suspend" : "activate")}>
                          {student.isActive ? <Ban className="h-4 w-4 text-amber-600" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleAction(student, "delete")}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">Showing {filteredStudents.length} students</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm">1</Button>
              <Button variant="outline" size="sm"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Student Detail Modal */}
      <Modal isOpen={!!selectedStudent && !showActionModal} onClose={() => setSelectedStudent(null)} title="Student Details" size="lg">
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16 text-2xl" src={selectedStudent.avatar} fallback={selectedStudent.name.charAt(0)} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
                <Badge variant={selectedStudent.isActive ? "success" : "destructive"} className="mt-1">{selectedStudent.isActive ? "Active" : "Suspended"}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center"><p className="text-2xl font-bold">{selectedStudent.enrolledCourses}</p><p className="text-xs text-muted-foreground">Enrolled</p></div>
              <div className="text-center"><p className="text-2xl font-bold">{selectedStudent.completedCourses}</p><p className="text-xs text-muted-foreground">Completed</p></div>
              <div className="text-center"><p className="text-2xl font-bold">{selectedStudent.progress}%</p><p className="text-xs text-muted-foreground">Progress</p></div>
              <div className="text-center"><p className="text-2xl font-bold">{selectedStudent.createdAt.toLocaleDateString()}</p><p className="text-xs text-muted-foreground">Joined</p></div>
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" className="flex-1 gap-2"><Mail className="h-4 w-4" />Send Email</Button>
              <Button variant="outline" className="flex-1 gap-2"><BookOpen className="h-4 w-4" />View Courses</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal isOpen={showActionModal} onClose={() => setShowActionModal(false)} title="">
        {selectedStudent && (
          <div className="space-y-4">
            {actionType === "suspend" && (
              <div className="flex gap-3 p-4 rounded-lg bg-amber-50">
                <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                <p className="text-sm">Suspend <strong>{selectedStudent.name}</strong>? They won't be able to access their account.</p>
              </div>
            )}
            {actionType === "delete" && (
              <div className="flex gap-3 p-4 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive shrink-0" />
                <p className="text-sm">Permanently delete <strong>{selectedStudent.name}</strong>? This cannot be undone.</p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowActionModal(false)}>Cancel</Button>
              <Button variant={actionType === "delete" ? "destructive" : "default"} onClick={() => setShowActionModal(false)}>
                {actionType === "delete" ? "Delete" : "Confirm"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
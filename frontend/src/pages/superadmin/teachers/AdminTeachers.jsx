import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Filter, MoreVertical, Mail, Phone, Ban, CheckCircle2,
  Trash2, Edit, Eye, Award, DollarSign, BookOpen, Users,
  ChevronLeft, ChevronRight, X, Check, AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Avatar } from "../../../components/ui/Avatar";
import { Modal } from "../../../components/ui/Modal";
import { Table } from "../../../components/ui/Table";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/Tabs";

const mockTeachers = [
  {
    _id: "1", name: "Dr. James Wilson", email: "james.wilson@university.edu",
    avatar: "", bio: "Senior Software Engineer with 15 years of experience in web development.",
    isActive: true, createdAt: new Date("2024-01-15"),
    coursesCount: 8, studentsCount: 1245, totalRevenue: 45680,
  },
  {
    _id: "2", name: "Prof. Emily Chen", email: "emily.chen@stanford.edu",
    avatar: "", bio: "Data Science professor specializing in machine learning and AI.",
    isActive: true, createdAt: new Date("2024-02-20"),
    coursesCount: 5, studentsCount: 890, totalRevenue: 32450,
  },
  {
    _id: "3", name: "Sarah Johnson", email: "sarah.j@design.edu",
    avatar: "", bio: "Award-winning UX designer with a passion for teaching.",
    isActive: true, createdAt: new Date("2024-03-10"),
    coursesCount: 3, studentsCount: 567, totalRevenue: 18230,
  },
  {
    _id: "4", name: "Dr. Michael Brown", email: "mbrown@ait.edu",
    avatar: "", bio: "AI researcher and educator focused on practical applications.",
    isActive: false, createdAt: new Date("2024-04-05"),
    coursesCount: 4, studentsCount: 432, totalRevenue: 15670,
  },
  {
    _id: "5", name: "Alex Turner", email: "alex.t@mobile.dev",
    avatar: "", bio: "Mobile development expert with React Native specialization.",
    isActive: true, createdAt: new Date("2024-05-12"),
    coursesCount: 6, studentsCount: 789, totalRevenue: 28900,
  },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminTeachers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showActionModal, setShowActionModal] = useState(null);
  const [actionType, setActionType] = useState(null);

  const filteredTeachers = mockTeachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "active") return matchesSearch && t.isActive;
    if (activeTab === "suspended") return matchesSearch && !t.isActive;
    return matchesSearch;
  });

  const handleAction = (teacher, action) => {
    setSelectedTeacher(teacher);
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmAction = () => {
    // In production, call API
    setShowActionModal(false);
    setSelectedTeacher(null);
    setActionType(null);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Teacher Management</h1>
          <p className="text-muted-foreground">Manage and monitor all teachers on the platform</p>
        </div>
        <Button className="gap-2"><CheckCircle2 className="h-4 w-4" />Approve New Teachers</Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Teachers", value: mockTeachers.length, icon: Users, color: "blue" },
          { label: "Active Teachers", value: mockTeachers.filter(t => t.isActive).length, icon: CheckCircle2, color: "emerald" },
          { label: "Total Students", value: mockTeachers.reduce((a, t) => a + t.studentsCount, 0).toLocaleString(), icon: BookOpen, color: "purple" },
          { label: "Total Revenue", value: `$${(mockTeachers.reduce((a, t) => a + t.totalRevenue, 0) / 1000).toFixed(1)}K`, icon: DollarSign, color: "amber" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search teachers by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" />Filters</Button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({mockTeachers.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({mockTeachers.filter(t => t.isActive).length})</TabsTrigger>
            <TabsTrigger value="suspended">Suspended ({mockTeachers.filter(t => !t.isActive).length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Teachers Table */}
      <motion.div variants={item}>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Teacher</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Courses</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Students</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Revenue</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher._id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10" src={teacher.avatar} fallback={teacher.name.charAt(0)} />
                        <div>
                          <p className="font-medium">{teacher.name}</p>
                          <p className="text-xs text-muted-foreground">{teacher.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{teacher.coursesCount}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{teacher.studentsCount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">${teacher.totalRevenue.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={teacher.isActive ? "success" : "destructive"}>
                        {teacher.isActive ? "Active" : "Suspended"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedTeacher(teacher)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAction(teacher, "edit")}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${teacher.isActive ? "text-amber-600" : "text-emerald-600"}`}
                          onClick={() => handleAction(teacher, teacher.isActive ? "suspend" : "activate")}
                        >
                          {teacher.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleAction(teacher, "delete")}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">Showing {filteredTeachers.length} of {mockTeachers.length} teachers</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Teacher Detail Modal */}
      <Modal isOpen={!!selectedTeacher && !showActionModal} onClose={() => setSelectedTeacher(null)} title="Teacher Details" size="lg">
        {selectedTeacher && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16 text-2xl" src={selectedTeacher.avatar} fallback={selectedTeacher.name.charAt(0)} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{selectedTeacher.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedTeacher.email}</p>
                <Badge variant={selectedTeacher.isActive ? "success" : "destructive"} className="mt-1">
                  {selectedTeacher.isActive ? "Active" : "Suspended"}
                </Badge>
              </div>
            </div>
            <p className="text-sm">{selectedTeacher.bio}</p>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold">{selectedTeacher.coursesCount}</p>
                <p className="text-xs text-muted-foreground">Courses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{selectedTeacher.studentsCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">${selectedTeacher.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" className="flex-1 gap-2"><Mail className="h-4 w-4" />Send Email</Button>
              <Button variant="outline" className="flex-1 gap-2"><Award className="h-4 w-4" />View Earnings</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Confirmation Modal */}
      <Modal isOpen={showActionModal} onClose={() => setShowActionModal(false)} title="">
        {selectedTeacher && (
          <div className="space-y-4">
            {actionType === "suspend" && (
              <>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                  <p className="text-sm">This will suspend <strong>{selectedTeacher.name}</strong> and they won't be able to access their account.</p>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowActionModal(false)}>Cancel</Button>
                  <Button variant="destructive" className="gap-2" onClick={confirmAction}><Ban className="h-4 w-4" />Suspend Teacher</Button>
                </div>
              </>
            )}
            {actionType === "activate" && (
              <>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  <p className="text-sm">This will restore access for <strong>{selectedTeacher.name}</strong>.</p>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowActionModal(false)}>Cancel</Button>
                  <Button className="gap-2" onClick={confirmAction}><CheckCircle2 className="h-4 w-4" />Activate Teacher</Button>
                </div>
              </>
            )}
            {actionType === "delete" && (
              <>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  <p className="text-sm">This will permanently delete <strong>{selectedTeacher.name}</strong> and all their courses. This action cannot be undone.</p>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowActionModal(false)}>Cancel</Button>
                  <Button variant="destructive" className="gap-2" onClick={confirmAction}><Trash2 className="h-4 w-4" />Delete Teacher</Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
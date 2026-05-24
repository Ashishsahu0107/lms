import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, ClipboardList, CheckCircle, FileText, Edit3, Trash2, Calendar, FileCheck
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import toast from "react-hot-toast";

const initialAssignments = [
  { id: "A1", title: "Asynchronous API Integration Project", course: "Advanced JavaScript", submissionsCount: 18, totalStudents: 24, dueDate: "2026-05-30", totalPoints: 100, status: "published" },
  { id: "A2", title: "OOP Banking System CLI Application", course: "Python Fundamentals", submissionsCount: 14, totalStudents: 20, dueDate: "2026-06-05", totalPoints: 100, status: "published" },
  { id: "A3", title: "High-fidelity Mobile Dashboard Design", course: "UI/UX Design", submissionsCount: 0, totalStudents: 15, dueDate: "2026-06-15", totalPoints: 100, status: "draft" },
];

export default function TeacherAssignmentManagement() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("Advanced JavaScript");
  const [dueDate, setDueDate] = useState("");
  const [totalPoints, setTotalPoints] = useState(100);

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const newAssignment = {
      id: `A${Date.now()}`,
      title,
      course,
      submissionsCount: 0,
      totalStudents: course === "Advanced JavaScript" ? 24 : course === "Python Fundamentals" ? 20 : 15,
      dueDate,
      totalPoints: Number(totalPoints),
      status: "draft",
    };

    setAssignments([newAssignment, ...assignments]);
    setTitle("");
    setDueDate("");
    setShowAddModal(false);
    toast.success("Assignment created successfully as draft!");
  };

  const handleDeleteAssignment = (id) => {
    setAssignments(assignments.filter(a => a.id !== id));
    toast.success("Assignment deleted successfully!");
  };

  const filteredAssignments = assignments.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      id="teacher-assignment-module-container"
    >
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assignment Management</h1>
          <p className="text-sm text-muted-foreground">Deliver briefs and grade student submissions.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2" id="create-assignment-trigger">
          <Plus className="h-4 w-4" /> Create Assignment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-muted shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl"><ClipboardList className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Projects</p>
              <h3 className="text-xl font-bold">{assignments.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl"><FileCheck className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Active Briefs</p>
              <h3 className="text-xl font-bold">{assignments.filter(a => a.status === "published").length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl"><FileText className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Average Submissions Rate</p>
              <h3 className="text-xl font-bold">76%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center gap-4 bg-card border border-muted p-4 rounded-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 h-10 border-muted"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Assignments Table Card */}
      <Card className="border-muted shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="border-b border-muted">
                <th>Brief ID</th>
                <th>Title</th>
                <th>Course</th>
                <th>Submissions</th>
                <th>Points Value</th>
                <th>Due Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-sm text-muted-foreground">
                    No assignments found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((ass) => (
                  <tr key={ass.id} className="border-b border-muted/50 hover:bg-primary/5 transition-colors">
                    <td><span className="font-semibold text-primary">{ass.id}</span></td>
                    <td><span className="font-medium text-foreground">{ass.title}</span></td>
                    <td><span className="text-sm text-muted-foreground">{ass.course}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{ass.submissionsCount}</span>
                        <span className="text-xs text-muted-foreground">/ {ass.totalStudents}</span>
                      </div>
                    </td>
                    <td><Badge variant="ghost" className="border-muted">{ass.totalPoints} Points</Badge></td>
                    <td>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {ass.dueDate}
                      </span>
                    </td>
                    <td>
                      <Badge variant={ass.status === "published" ? "success" : "secondary"}>
                        {ass.status}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" className="hover:text-primary rounded-full"><Edit3 className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="hover:text-error rounded-full" onClick={() => handleDeleteAssignment(ass.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal overlay */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-2xl border border-muted p-6 shadow-2xl flex flex-col max-h-[85vh]"
            >
              <h3 className="font-bold text-lg mb-4">Create New Project Brief</h3>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="label text-sm font-semibold mb-1">Assignment Title</label>
                  <Input
                    className="border-muted h-10"
                    placeholder="Enter project title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label text-sm font-semibold mb-1">Target Course</label>
                  <select
                    className="select select-bordered border-muted w-full h-10 rounded-xl px-3 bg-card"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  >
                    <option value="Advanced JavaScript">Advanced JavaScript</option>
                    <option value="Python Fundamentals">Python Fundamentals</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-sm font-semibold mb-1">Points Value</label>
                    <Input
                      type="number"
                      className="border-muted h-10"
                      value={totalPoints}
                      onChange={(e) => setTotalPoints(e.target.value)}
                      min={10}
                    />
                  </div>
                  <div>
                    <label className="label text-sm font-semibold mb-1">Due Date</label>
                    <Input
                      type="date"
                      className="border-muted h-10"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t mt-4">
                  <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button type="submit">Create Draft</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

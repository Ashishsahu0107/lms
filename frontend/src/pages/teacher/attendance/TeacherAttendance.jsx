import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Check, X, Search, CheckCircle, AlertTriangle, Users
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/Avatar";
import toast from "react-hot-toast";

const initialStudents = [
  { id: "S101", name: "Emma Thompson", email: "emma.t@example.com", attendance: true },
  { id: "S102", name: "Michael Chen", email: "michael.c@example.com", attendance: true },
  { id: "S103", name: "Sofia Rodriguez", email: "sofia.r@example.com", attendance: true },
  { id: "S104", name: "James Wilson", email: "james.w@example.com", attendance: false },
  { id: "S105", name: "Alex Kim", email: "alex.k@example.com", attendance: true },
];

export default function TeacherAttendance() {
  const [students, setStudents] = useState(initialStudents);
  const [course, setCourse] = useState("Advanced JavaScript");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleToggleAttendance = (id) => {
    setStudents(students.map(s =>
      s.id === id ? { ...s, attendance: !s.attendance } : s
    ));
  };

  const handleSaveAttendance = () => {
    toast.success("Attendance register saved successfully!");
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = students.filter(s => s.attendance).length;
  const absentCount = students.length - presentCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      id="teacher-attendance-module-container"
    >
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance Register</h1>
          <p className="text-sm text-muted-foreground">Log student daily attendance, view analytics, and export registers.</p>
        </div>
        <Button onClick={handleSaveAttendance} className="flex items-center gap-2" id="save-attendance-btn">
          <Check className="h-4 w-4" /> Save Attendance
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-muted shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl"><Users className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Enrolled</p>
              <h3 className="text-xl font-bold">{students.length} Students</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl"><CheckCircle className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Present Today</p>
              <h3 className="text-xl font-bold text-emerald-600">{presentCount} Learners</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-error/10 text-error rounded-xl"><AlertTriangle className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Absent Today</p>
              <h3 className="text-xl font-bold text-error">{absentCount} Learners</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card border border-muted p-4 rounded-xl items-center">
        <div>
          <label className="label text-xs font-semibold mb-1">Target Class / Course</label>
          <select
            className="select select-bordered border-muted w-full h-10 rounded-xl px-3 bg-card text-sm"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          >
            <option value="Advanced JavaScript">Advanced JavaScript</option>
            <option value="Python Fundamentals">Python Fundamentals</option>
            <option value="UI/UX Design">UI/UX Design</option>
          </select>
        </div>
        <div>
          <label className="label text-xs font-semibold mb-1">Date</label>
          <Input
            type="date"
            className="border-muted h-10 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label text-xs font-semibold mb-1">Search Student Name</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 h-10 border-muted text-sm"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Attendance Register Grid */}
      <Card className="border-muted shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="border-b border-muted">
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status Today</th>
                <th className="text-right">Mark Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                    No students matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-muted/50 hover:bg-primary/5 transition-colors">
                    <td><span className="font-semibold text-primary">{student.id}</span></td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 border">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-foreground text-sm">{student.name}</span>
                      </div>
                    </td>
                    <td><span className="text-sm text-muted-foreground">{student.email}</span></td>
                    <td>
                      <Badge variant={student.attendance ? "success" : "error"}>
                        {student.attendance ? "Present" : "Absent"}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant={student.attendance ? "default" : "outline"}
                          className={`rounded-xl px-3 py-1 flex items-center gap-1.5 h-8 text-xs ${student.attendance ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border-emerald-600 text-emerald-600 hover:bg-emerald-50"}`}
                          onClick={() => handleToggleAttendance(student.id)}
                        >
                          <Check className="h-3.5 w-3.5" /> Present
                        </Button>
                        <Button
                          size="sm"
                          variant={!student.attendance ? "default" : "outline"}
                          className={`rounded-xl px-3 py-1 flex items-center gap-1.5 h-8 text-xs ${!student.attendance ? "bg-error text-white hover:bg-error/90" : "border-error text-error hover:bg-error/10"}`}
                          onClick={() => handleToggleAttendance(student.id)}
                        >
                          <X className="h-3.5 w-3.5" /> Absent
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}

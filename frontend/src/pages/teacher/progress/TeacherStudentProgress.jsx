import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Award, Clock, GraduationCap, Percent, BookOpen
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/Avatar";

const initialStudents = [
  { id: "S101", name: "Emma Thompson", email: "emma.t@example.com", coursesCount: 3, avgProgress: 88, lastActive: "2 hours ago", avatar: "" },
  { id: "S102", name: "Michael Chen", email: "michael.c@example.com", coursesCount: 2, avgProgress: 75, lastActive: "4 hours ago", avatar: "" },
  { id: "S103", name: "Sofia Rodriguez", email: "sofia.r@example.com", coursesCount: 4, avgProgress: 92, lastActive: "5 hours ago", avatar: "" },
  { id: "S104", name: "James Wilson", email: "james.w@example.com", coursesCount: 1, avgProgress: 45, lastActive: "1 day ago", avatar: "" },
  { id: "S105", name: "Alex Kim", email: "alex.k@example.com", coursesCount: 3, avgProgress: 95, lastActive: "2 days ago", avatar: "" },
];

export default function TeacherStudentProgress() {
  const [students] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      id="teacher-student-progress-container"
    >
      {/* Header Panel */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Student Progress</h1>
        <p className="text-sm text-muted-foreground">Monitor learning rates, course completion percentages, and student activity logs.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-muted shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl"><GraduationCap className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Active Learners</p>
              <h3 className="text-xl font-bold">{students.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl"><Percent className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Avg. Progress Rate</p>
              <h3 className="text-xl font-bold">79%</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl"><Award className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Certifications Earned</p>
              <h3 className="text-xl font-bold">8</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl"><BookOpen className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Completed Courses</p>
              <h3 className="text-xl font-bold">12</h3>
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
            placeholder="Search student progress..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Progress Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredStudents.map(student => (
          <Card key={student.id} className="border-muted shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-[240px]">
                <Avatar className="w-12 h-12 border">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h4 className="font-semibold text-foreground text-sm truncate">{student.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                </div>
              </div>

              {/* Course Enrolled Counts */}
              <div className="shrink-0 flex items-center gap-2">
                <Badge variant="secondary">{student.coursesCount} Enrolled Courses</Badge>
              </div>

              {/* Progress Bar Widget */}
              <div className="flex-1 max-w-md w-full">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-muted-foreground">Completion Progress</span>
                  <span className="text-primary">{student.avgProgress}%</span>
                </div>
                <ProgressBar value={student.avgProgress} size="md" className="bg-primary/10" />
              </div>

              {/* Last Activity */}
              <div className="text-right shrink-0">
                <span className="text-xs text-muted-foreground flex items-center justify-end gap-1 select-none">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Active {student.lastActive}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

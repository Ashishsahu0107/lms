import React from "react";
import {
  ChevronLeft, Mail, Phone, Award, BookOpen, Users,
  ClipboardList, Calendar, Bookmark, Briefcase, Sparkles
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Avatar } from "../../../components/ui/Avatar";

export default function TeacherDetails({
  data = {},
  onBack,
  onSendEmail,
}) {
  const { teacher = {}, courses = [], stats = {} } = data;

  return (
    <div className="space-y-6" id="teacher-details-root">
      {/* Header back button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back to Educators List
        </Button>
        <Badge variant={teacher.status === "active" ? "success" : "destructive"} className="capitalize font-semibold text-xs border-0 px-3 py-1">
          {teacher.status || "active"}
        </Badge>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Avatar and bio metadata */}
        <Card className="lg:col-span-1 p-6 flex flex-col items-center justify-between space-y-6 bg-gradient-to-b from-card to-muted/20 border hover:shadow-md transition-all">
          <div className="flex flex-col items-center text-center space-y-4 w-full">
            <Avatar className="w-24 h-24 text-3xl" src={teacher.avatar} fallback={teacher.name?.charAt(0)} />
            <div>
              <h2 className="text-xl font-bold text-foreground">{teacher.name}</h2>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Instructor Profile</p>
            </div>
            <div className="w-full pt-4 border-t border-border space-y-3 text-left text-sm">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Mail className="h-4.5 w-4.5 text-blue-600" />
                <span className="truncate text-foreground font-medium">{teacher.email}</span>
              </div>
              {teacher.phone && (
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Phone className="h-4.5 w-4.5 text-emerald-600" />
                  <span className="text-foreground font-medium">{teacher.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Calendar className="h-4.5 w-4.5 text-amber-500" />
                <span className="text-foreground font-medium">Joined {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</span>
              </div>
            </div>
          </div>
          <div className="w-full pt-4 border-t border-border">
            <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={() => onSendEmail(teacher.email)}>
              <Mail className="h-4 w-4" /> Message Educator
            </Button>
          </div>
        </Card>

        {/* Right Side: Professional background and statistics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biography & Qualifications */}
          <Card className="p-6 hover:shadow-md transition-all">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" /> Academic & Professional Standing
            </h3>
            <div className="space-y-4">
              {teacher.bio && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Biography</p>
                  <p className="text-sm leading-relaxed">{teacher.bio}</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-muted/30 border p-3.5 rounded-xl space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Qualification</span>
                  <span className="text-sm font-bold text-foreground capitalize">{teacher.qualification || "Ph.D. Computer Science"}</span>
                </div>
                <div className="bg-muted/30 border p-3.5 rounded-xl space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Specialization</span>
                  <span className="text-sm font-bold text-foreground capitalize">{teacher.specialization || "Advanced React & AI"}</span>
                </div>
                <div className="bg-muted/30 border p-3.5 rounded-xl space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Teaching Experience</span>
                  <span className="text-sm font-bold text-foreground">{teacher.experience || 8} Years</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Dynamic Statistics metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-card text-center hover:shadow-md transition-all">
              <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{courses.length}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Total Courses</p>
            </div>
            <div className="p-4 rounded-xl border bg-card text-center hover:shadow-md transition-all">
              <Users className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalStudents || 0}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Active Students</p>
            </div>
            <div className="p-4 rounded-xl border bg-card text-center hover:shadow-md transition-all">
              <ClipboardList className="h-6 w-6 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.pendingReviews || 0}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Review Queue</p>
            </div>
            <div className="p-4 rounded-xl border bg-card text-center hover:shadow-md transition-all">
              <Award className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.quizzesCount || 0}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Quizzes Created</p>
            </div>
          </div>

          {/* Assigned Courses Table */}
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" /> Syllabus Assigned Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {courses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  This educator is not currently assigned to instruct active courses.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/20 text-xs font-semibold text-muted-foreground uppercase border-b">
                        <th className="py-2.5 px-4">Title</th>
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-4">Difficulty</th>
                        <th className="py-2.5 px-4 text-center">Enrollment</th>
                        <th className="py-2.5 px-4 text-right">Pricing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course._id} className="border-b hover:bg-muted/10 transition-colors text-sm last:border-0">
                          <td className="py-3 px-4 font-bold text-foreground truncate max-w-xs">{course.title}</td>
                          <td className="py-3 px-4 capitalize"><Badge variant="secondary" className="border-0 font-medium text-xs">{course.category}</Badge></td>
                          <td className="py-3 px-4 capitalize font-medium text-muted-foreground">{course.difficulty}</td>
                          <td className="py-3 px-4 text-center font-semibold text-foreground">{course.students?.length || 0}</td>
                          <td className="py-3 px-4 text-right font-bold text-blue-600">${course.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

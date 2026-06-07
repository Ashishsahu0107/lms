import React from "react";
import {
  ChevronLeft, Mail, Phone, Award, BookOpen, Clock,
  Calendar, CheckCircle, Trophy, BarChart3, AlertCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Avatar } from "../../../components/ui/Avatar";
import { ProgressBar } from "../../../components/ui/ProgressBar";

export default function StudentDetails({
  data = {},
  onBack,
  onSendEmail,
}) {
  const { student = {}, enrollments = [], attempts = [], attendanceRate = 95 } = data;

  const progressSum = enrollments.reduce((acc, e) => acc + e.progress, 0);
  const averageProgress = enrollments.length > 0 ? Math.round(progressSum / enrollments.length) : 0;
  const completedCount = enrollments.filter((e) => e.progress === 100).length;

  return (
    <div className="space-y-6" id="student-details-root">
      {/* Header back button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back to Students List
        </Button>
        <Badge variant={student.status === "active" ? "success" : "destructive"} className="capitalize font-semibold text-xs border-0 px-3 py-1">
          {student.status || "active"}
        </Badge>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Avatar and bio metadata */}
        <Card className="lg:col-span-1 p-6 flex flex-col items-center justify-between space-y-6 bg-gradient-to-b from-card to-muted/20 border hover:shadow-md transition-all">
          <div className="flex flex-col items-center text-center space-y-4 w-full">
            <Avatar className="w-24 h-24 text-3xl" src={student.avatar} fallback={student.name?.charAt(0)} />
            <div>
              <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Student Account</p>
            </div>
            <div className="w-full pt-4 border-t border-border space-y-3 text-left text-sm">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Mail className="h-4.5 w-4.5 text-blue-600" />
                <span className="truncate text-foreground font-medium">{student.email}</span>
              </div>
              {student.phone && (
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Phone className="h-4.5 w-4.5 text-emerald-600" />
                  <span className="text-foreground font-medium">{student.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Calendar className="h-4.5 w-4.5 text-amber-500" />
                <span className="text-foreground font-medium">Registered {student.createdAt ? new Date(student.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</span>
              </div>
            </div>
          </div>
          {student.bio && (
            <div className="w-full text-sm text-muted-foreground p-3 border rounded-xl bg-card">
              <p className="text-xs font-semibold uppercase text-muted-foreground/80 tracking-wider mb-1">Student Bio</p>
              <p className="text-foreground text-xs leading-relaxed">{student.bio}</p>
            </div>
          )}
          <div className="w-full pt-2">
            <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={() => onSendEmail(student.email)}>
              <Mail className="h-4 w-4" /> Email Student
            </Button>
          </div>
        </Card>

        {/* Right Side: Professional background and statistics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dynamic Statistics metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-card text-center hover:shadow-md transition-all">
              <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{enrollments.length}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Enrolled Classes</p>
            </div>
            <div className="p-4 rounded-xl border bg-card text-center hover:shadow-md transition-all">
              <CheckCircle className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Paths Finished</p>
            </div>
            <div className="p-4 rounded-xl border bg-card text-center hover:shadow-md transition-all">
              <Clock className="h-6 w-6 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{averageProgress}%</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Avg Progress</p>
            </div>
            <div className="p-4 rounded-xl border bg-card text-center hover:shadow-md transition-all">
              <BarChart3 className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{attendanceRate}%</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Attendance Rate</p>
            </div>
          </div>

          {/* Enrolled Courses Table */}
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" /> Syllabus Course Progress Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {enrollments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  This student is not enrolled in active syllabus paths.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/20 text-xs font-semibold text-muted-foreground uppercase border-b">
                        <th className="py-2.5 px-4">Title</th>
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-4">Difficulty</th>
                        <th className="py-2.5 px-4">Study Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((enrollment) => {
                        const course = enrollment.courseId ?? {};
                        return (
                          <tr key={enrollment._id} className="border-b hover:bg-muted/10 transition-colors text-sm last:border-0">
                            <td className="py-3 px-4 font-bold text-foreground truncate max-w-xs">{course.title || "Untitled Course"}</td>
                            <td className="py-3 px-4 capitalize"><Badge variant="secondary" className="border-0 font-medium text-xs">{course.category || "General"}</Badge></td>
                            <td className="py-3 px-4 capitalize font-medium text-muted-foreground">{course.difficulty || "beginner"}</td>
                            <td className="py-3 px-4">
                              <div className="w-32 space-y-1">
                                <ProgressBar value={enrollment.progress || 0} size="xs" />
                                <span className="text-[10px] text-muted-foreground font-bold">{enrollment.progress || 0}% Complete</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quiz Performance Attempts */}
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" /> Quiz Performance Attempts Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {attempts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  This student has not attempted quizzes on the platform.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/20 text-xs font-semibold text-muted-foreground uppercase border-b">
                        <th className="py-2.5 px-4">Exam Quiz Title</th>
                        <th className="py-2.5 px-4 text-center">Score</th>
                        <th className="py-2.5 px-4 text-center">Accuracy (%)</th>
                        <th className="py-2.5 px-4 text-right">Date Finished</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.map((attempt) => (
                        <tr key={attempt._id} className="border-b hover:bg-muted/10 transition-colors text-sm last:border-0">
                          <td className="py-3 px-4 font-semibold text-foreground truncate max-w-xs">{attempt.quizId?.title || "Class Quiz"}</td>
                          <td className="py-3 px-4 text-center font-bold text-muted-foreground">{attempt.score} Points</td>
                          <td className="py-3 px-4 text-center font-bold text-indigo-600">{attempt.accuracy}%</td>
                          <td className="py-3 px-4 text-right text-xs text-muted-foreground">
                            {new Date(attempt.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </td>
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

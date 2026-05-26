import React from "react";
import { ChevronLeft, Download, BookOpen } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { REPORTS_COURSES_URL } from "../../../services/adminModulesService";

export default function CourseReports({
  onBack,
}) {
  return (
    <div className="space-y-6" id="course-reports-root">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back to Reports Dashboard
        </Button>
        <h2 className="text-lg font-bold text-foreground">Course & Curriculum Audits</h2>
      </div>

      <Card className="p-6 space-y-4 max-w-2xl mx-auto hover:shadow-md transition-all">
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base">Course Catalogs & Difficulty Analytics</h3>
            <p className="text-xs text-muted-foreground">Comprehensive academic audits of modules, lessons, and content revenue.</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This report exports a complete CSV ledger listing all courses, their creators/instructors, categorizations, difficulty rankings, total active enrollments, and total revenue earned per course.
        </p>
        <div className="pt-4 border-t border-border flex justify-end">
          <a href={REPORTS_COURSES_URL} target="_blank" rel="noopener noreferrer">
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
              <Download className="h-4 w-4" /> Download Course CSV
            </Button>
          </a>
        </div>
      </Card>
    </div>
  );
}

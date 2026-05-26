import React from "react";
import { FileText, Download, Users, DollarSign, BookOpen, FileSpreadsheet } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import {
  REPORTS_STUDENTS_URL,
  REPORTS_TEACHERS_URL,
  REPORTS_REVENUE_URL,
  REPORTS_COURSES_URL
} from "../../../services/adminModulesService";

export default function ReportsDashboard({
  onNavigateToView,
}) {
  const reportsList = [
    {
      id: "students",
      title: "Student Telemetry Report",
      description: "Comprehensive spreadsheet mapping student enrollment counts, course completion milestones, and average quiz accuracies.",
      icon: Users,
      color: "blue",
      columns: ["Name", "Email", "Enrolled Count", "Completions", "Quiz Average"],
      downloadUrl: REPORTS_STUDENTS_URL,
    },
    {
      id: "teachers",
      title: "Instructor Evaluation Report",
      description: "Tabular overview auditing active educator profiles, subject specializations, taught courses count, and student ratings.",
      icon: FileText,
      color: "emerald",
      columns: ["Name", "Email", "Specialization", "Courses Taught", "Students Enrolled"],
      downloadUrl: REPORTS_TEACHERS_URL,
    },
    {
      id: "revenue",
      title: "Financial Billing Ledger",
      description: "Platform billing logs accounting for student payments, platform commission rates, and calculated teacher payouts.",
      icon: DollarSign,
      color: "amber",
      columns: ["Transaction ID", "Student", "Amount Paid", "Commission", "Teacher Earning", "Date"],
      downloadUrl: REPORTS_REVENUE_URL,
    },
    {
      id: "courses",
      title: "Curriculum Deployment Audits",
      description: "Summary lists analyzing course catalogs, difficulty tags, category indices, active enrollment counts, and accumulated course revenue.",
      icon: BookOpen,
      color: "indigo",
      columns: ["Title", "Instructor", "Category", "Difficulty", "Total Students", "Revenue"],
      downloadUrl: REPORTS_COURSES_URL,
    },
  ];

  return (
    <div className="space-y-6" id="reports-dashboard-root">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="p-6 hover:shadow-lg transition-all border hover:border-blue-500/20 bg-card flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-${report.color}-500/10 text-${report.color}-600`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">{report.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Report Schema Columns:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {report.columns.map((c, idx) => (
                      <span key={idx} className="bg-muted px-2 py-0.5 rounded text-[10px] font-semibold text-muted-foreground">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-6 border-t border-border mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => onNavigateToView(report.id)}
                >
                  Configure Details
                </Button>
                <a href={report.downloadUrl} className="flex-1 block" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">
                    <Download className="h-4 w-4" /> Export CSV
                  </Button>
                </a>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

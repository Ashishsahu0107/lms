import React from "react";
import { ChevronLeft, Download, Users, FileSpreadsheet } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { REPORTS_STUDENTS_URL } from "../../../services/adminModulesService";

export default function StudentReports({
  onBack,
}) {
  return (
    <div className="space-y-6" id="student-reports-root">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back to Reports Dashboard
        </Button>
        <h2 className="text-lg font-bold text-foreground">Student Telemetry Parameters</h2>
      </div>

      <Card className="p-6 space-y-4 max-w-2xl mx-auto hover:shadow-md transition-all">
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base">Student Progress & Quiz Accuracy Telemetry</h3>
            <p className="text-xs text-muted-foreground">Detailed auditing of student learning metrics.</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This report exports a complete CSV sheet of all registered students, mapping their enrolled course counts, actual finished courses, and calculated quiz score average percentages.
        </p>
        <div className="pt-4 border-t border-border flex justify-end">
          <a href={REPORTS_STUDENTS_URL} target="_blank" rel="noopener noreferrer">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">
              <Download className="h-4 w-4" /> Download Student CSV
            </Button>
          </a>
        </div>
      </Card>
    </div>
  );
}

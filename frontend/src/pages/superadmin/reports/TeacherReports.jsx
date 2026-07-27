import { ChevronLeft, Download, FileText } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { REPORTS_TEACHERS_URL } from "../../../services/adminModulesService";

export default function TeacherReports({ onBack }) {
  return (
    <div className="space-y-6" id="teacher-reports-root">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4" /> Back to Reports Dashboard
        </Button>
        <h2 className="text-lg font-bold text-foreground">
          Teacher Telemetry Parameters
        </h2>
      </div>

      <Card className="p-6 space-y-4 max-w-2xl mx-auto hover:shadow-md transition-all">
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base">
              Teacher Syllabus Deployments & Engagement
            </h3>
            <p className="text-xs text-muted-foreground">
              Detailed auditing of educator lessons metrics.
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This report exports a complete CSV sheet of all active teachers,
          mapping their academic specializations, taught courses counts, and
          accumulated student enrollments.
        </p>
        <div className="pt-4 border-t border-border flex justify-end">
          <a
            href={REPORTS_TEACHERS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm">
              <Download className="h-4 w-4" /> Download Educator CSV
            </Button>
          </a>
        </div>
      </Card>
    </div>
  );
}

import { ChevronLeft, Shield, Check, Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

export default function Permissions({ onBack }) {
  const roles = [
    {
      role: "Super Admin",
      desc: "Full administrative mastery across course catalogs, transactions, accounts, settings, and direct database schemas seeding.",
      caps: [
        "Create, edit, delete any course, modules, topics, and assignments",
        "Generate assignments automatically from PDF documents",
        "Approve and reject refund requests and process subscriptions plans",
        "Broadcasting platform notifications targeting specific roles",
        "Update commissions rates and toggle platform maintenance modes",
        "Monitor live active sessions and security telemetry access logs",
      ],
      color: "red",
    },
    {
      role: "Teacher / Instructor",
      desc: "Instructional access context to curriculum design, student answers grading, and evaluation analytics dashboarding.",
      caps: [
        "Create courses, modules, topics, and quizzes for their assigned syllabus",
        "Upload learning materials and PDF files",
        "Automatically generate questions and assignments via documents",
        "Grade assignments, post feedback, and monitor progress charts",
        "Track individual student score performance indices",
      ],
      color: "emerald",
    },
    {
      role: "Student / Learner",
      desc: "Interactive educational access to study materials, lessons consumption, and quiz completions.",
      caps: [
        "View and consume assigned courses and modules",
        "Attempt quizzes, submit answers, and check score results",
        "Upload files and document attachments for homework assignments",
        "Receive global notifications and security changes logs",
      ],
      color: "blue",
    },
  ];

  return (
    <div className="space-y-6" id="permissions-root">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <h2 className="text-lg font-bold text-foreground">
          Role Permissions Configuration
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {roles.map((r, idx) => (
          <Card
            key={idx}
            className="hover:shadow-md border border-border flex flex-col justify-between bg-card"
          >
            <div>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base flex items-center gap-2 text-foreground font-bold">
                  <Shield className={`h-5 w-5 text-${r.color}-500`} /> {r.role}
                </CardTitle>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  {r.desc}
                </p>
              </CardHeader>
              <CardContent className="pt-5">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Authorized Capabilities:
                </h4>
                <ul className="space-y-3">
                  {r.caps.map((cap, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                    >
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />{" "}
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </div>
            <div className="p-4 border-t border-border mt-6 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-semibold"
                disabled
              >
                <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Read-Only
                Role
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { ChevronLeft, Download, DollarSign } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { REPORTS_REVENUE_URL } from "../../../services/adminModulesService";

export default function RevenueReports({ onBack }) {
  return (
    <div className="space-y-6" id="revenue-reports-root">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4" /> Back to Reports Dashboard
        </Button>
        <h2 className="text-lg font-bold text-foreground">
          Revenue & Financial Telemetry
        </h2>
      </div>

      <Card className="p-6 space-y-4 max-w-2xl mx-auto hover:shadow-md transition-all">
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base">
              Financial Billing & Transaction Logs
            </h3>
            <p className="text-xs text-muted-foreground">
              Comprehensive platform-wide financial accounting audits.
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This report exports a detailed CSV sheet mapping all transactions,
          invoice payments, subscription billing cycles, calculated teacher
          commissions, and accumulated platform net earnings.
        </p>
        <div className="pt-4 border-t border-border flex justify-end">
          <a
            href={REPORTS_REVENUE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm">
              <Download className="h-4 w-4" /> Download Revenue CSV
            </Button>
          </a>
        </div>
      </Card>
    </div>
  );
}

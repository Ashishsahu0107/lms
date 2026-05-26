import React from "react";
import { ChevronLeft, ArrowUpRight, HelpCircle } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";

export default function RefundRequests({
  payments = [],
  onBack,
  onApproveRefund,
  onRejectRefund,
}) {
  const refunds = payments.filter((p) => p.status === "refunded" || p.status === "pending");

  return (
    <div className="space-y-6" id="refund-requests-root">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <h2 className="text-lg font-bold text-foreground">Refund Queue</h2>
      </div>

      <Card className="overflow-hidden hover:shadow-md transition-all">
        {refunds.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <HelpCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/60" />
            <p className="font-semibold text-foreground">Refund queue is empty</p>
            <p className="text-sm">There are no outstanding refund requests to moderate.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 text-xs font-semibold text-muted-foreground uppercase border-b">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course Title</th>
                  <th className="py-3 px-4 text-center">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((p) => (
                  <tr key={p._id} className="border-b hover:bg-muted/10 transition-colors text-sm last:border-0">
                    <td className="py-3.5 px-4 font-bold text-foreground">{p.studentId?.name || "Enrolled Learner"}</td>
                    <td className="py-3.5 px-4 font-medium text-muted-foreground truncate max-w-xs">{p.courseId?.title || "Syllabus Course"}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-foreground">${p.amount}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="warning" className="capitalize border-0 font-semibold text-[10px]">
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="xs"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          onClick={() => onApproveRefund(p._id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                          onClick={() => onRejectRefund(p._id)}
                        >
                          Deny
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

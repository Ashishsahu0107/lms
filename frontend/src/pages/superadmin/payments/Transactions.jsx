import React, { useState } from "react";
import { Search, ChevronLeft, Calendar, User, BookOpen } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export default function Transactions({
  payments = [],
  onBack,
}) {
  const [search, setSearch] = useState("");

  const filtered = payments.filter((p) => {
    const studentName = p.studentId?.name || "";
    const courseTitle = p.courseId?.title || "";
    return (
      studentName.toLowerCase().includes(search.toLowerCase()) ||
      courseTitle.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6" id="transactions-root">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <h2 className="text-lg font-bold text-foreground">Transaction Logs</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search transactional records by student name or course title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="overflow-hidden hover:shadow-md transition-all">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 text-xs font-semibold text-muted-foreground uppercase border-b">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course Title</th>
                  <th className="py-3 px-4 text-center">Amount</th>
                  <th className="py-3 px-4 text-center">Method</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} className="border-b hover:bg-muted/10 transition-colors text-sm last:border-0">
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{p.studentId?.name || "Enrolled Learner"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-muted-foreground truncate max-w-xs">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{p.courseId?.title || "Syllabus Course"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-foreground">${p.amount}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-muted-foreground">{p.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={p.status === "completed" ? "success" : p.status === "pending" ? "warning" : "destructive"}
                        className="capitalize font-semibold border-0 text-[10px]"
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-muted-foreground">
                      <div className="flex items-center justify-end gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
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

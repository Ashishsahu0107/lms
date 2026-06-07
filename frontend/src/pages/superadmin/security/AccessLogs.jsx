import React, { useState } from "react";
import { ChevronLeft, ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";

export default function AccessLogs({
  onBack,
  logs,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter((log) => {
    const term = searchQuery.toLowerCase();
    const action = log.action?.toLowerCase() || "";
    const details = log.details?.toLowerCase() || "";
    const userName = log.userId?.name?.toLowerCase() || "guest";
    const userEmail = log.userId?.email?.toLowerCase() || "";
    return action.includes(term) || details.includes(term) || userName.includes(term) || userEmail.includes(term);
  });

  return (
    <div className="space-y-6" id="access-logs-root">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <h2 className="text-lg font-bold text-foreground">Access & Audit Telemetry</h2>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Filter security events by Action, details, or user name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Card className="hover:shadow-md border border-border bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Action</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Event description</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Account User</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Severity</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">IP / Client Details</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm font-semibold">
                      No security audit logs match the filter query.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-muted/10">
                      <td className="px-4 py-3 text-xs font-bold text-foreground">
                        <Badge
                          variant={
                            log.action === "USER_LOGIN" || log.action === "PASSWORD_CHANGE" ? "default" : "secondary"
                          }
                          className="font-mono text-[9px] uppercase tracking-wider"
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{log.details}</td>
                      <td className="px-4 py-3 text-sm">
                        {log.userId ? (
                          <div>
                            <p className="font-semibold text-foreground">{log.userId.name}</p>
                            <p className="text-[10px] text-muted-foreground">{log.userId.email}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground font-semibold text-xs">Guest / System</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge
                          className={`font-semibold uppercase tracking-wider text-[9px] ${
                            log.severity === "high" || log.severity === "critical"
                              ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                              : log.severity === "medium"
                              ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                          }`}
                        >
                          {log.severity || "low"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <p className="font-mono font-semibold text-foreground text-xs">{log.ip || "127.0.0.1"}</p>
                          <p className="text-[10px] text-muted-foreground max-w-xs truncate">{log.device || "Browser Client"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

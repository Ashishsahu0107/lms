import React from "react";
import { Send, Users } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";

export default function NotificationHistory({
  broadcasts,
}) {
  return (
    <div className="space-y-6" id="notification-history-root">
      <Card className="hover:shadow-md transition-all border border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Broadcast Subject</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Recipient target</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Alert level</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Dispatched at</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Delivery status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {broadcasts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-muted-foreground text-sm font-semibold">
                      No broadcast histories found.
                    </td>
                  </tr>
                ) : (
                  broadcasts.map((b) => (
                    <tr key={b._id} className="hover:bg-muted/10">
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <p className="font-semibold text-foreground">{b.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{b.message}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <Badge variant="secondary" className="gap-1 font-semibold uppercase tracking-wider text-[9px]">
                          <Users className="h-3 w-3" /> {b.target || "All"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <Badge
                          className={`font-semibold uppercase tracking-wider text-[9px] ${
                            b.type === "critical" || b.type === "danger"
                              ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                              : b.type === "warning"
                              ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                              : b.type === "success"
                              ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                              : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                          }`}
                        >
                          {b.type || "info"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(b.createdAt || b.sentAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="success" className="gap-1 font-semibold uppercase tracking-wider text-[9px]">
                          <Send className="h-2.5 w-2.5" /> Dispatched
                        </Badge>
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

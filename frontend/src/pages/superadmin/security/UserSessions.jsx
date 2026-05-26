import React from "react";
import { ChevronLeft, Monitor, Trash2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";

export default function UserSessions({
  onBack,
  sessions,
  onRevokeSession,
  onRevokeAll,
}) {
  return (
    <div className="space-y-6" id="user-sessions-root">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <h2 className="text-lg font-bold text-foreground">Live Active Sessions</h2>
      </div>

      <Card className="hover:shadow-md border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
          <div>
            <CardTitle className="text-base text-foreground font-bold">Active Platform Sessions</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Live logged-in devices across all roles.</p>
          </div>
          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:bg-red-500/10 border-red-500/20 text-xs font-semibold"
              onClick={onRevokeAll}
            >
              Terminate All Other Sessions
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {sessions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm font-semibold">
              No active online sessions discovered.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sessions.map((session, idx) => (
                <div key={session._id || idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-muted text-muted-foreground shrink-0">
                      <Monitor className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-foreground">{session.name || "Active Session User"}</p>
                        <Badge
                          className={`font-semibold uppercase tracking-wider text-[9px] ${
                            session.role === "admin" || session.role === "superadmin"
                              ? "bg-red-500/10 text-red-500"
                              : session.role === "teacher"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-blue-500/10 text-blue-500"
                          }`}
                        >
                          {session.role || "student"}
                        </Badge>
                        {idx === 0 && <Badge variant="success" className="text-[9px] uppercase tracking-wider">Your Device</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        IP: <span className="font-mono text-foreground font-semibold">{session.ip || "127.0.0.1"}</span> • Browser: <span className="text-foreground font-semibold">{session.device || "Chrome / MacOS"}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Last Active: {new Date(session.lastSeen || session.createdAt || Date.now()).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {idx > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-500/10 gap-1.5 self-end sm:self-center text-xs font-semibold"
                      onClick={() => onRevokeSession(session._id)}
                    >
                      <Trash2 className="h-4 w-4" /> Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

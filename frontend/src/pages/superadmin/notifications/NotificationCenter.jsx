import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Check,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

export default function NotificationCenter({
  notifications,
  onMarkAsRead,
  onDelete,
  onMarkAllRead,
}) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6" id="notification-center-root">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border">
        <p className="text-sm font-semibold text-foreground">
          {unreadCount === 0
            ? "You're all caught up! No unread notifications."
            : `${unreadCount} unread system notifications`}
        </p>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs font-semibold"
            onClick={onMarkAllRead}
          >
            <CheckCircle className="h-4 w-4 text-emerald-500" /> Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-40 text-muted-foreground" />
            <p className="font-semibold text-sm">No notifications available</p>
            <p className="text-xs">
              Any system alerts or announcements will appear here.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <Card
              key={n._id}
              className={`hover:shadow-sm transition-all border ${n.read ? "opacity-60 bg-card/60" : "border-blue-500/20 bg-card"}`}
            >
              <CardContent className="flex items-start gap-4 p-5">
                <div
                  className={`p-2.5 rounded-xl ${
                    n.type === "warning"
                      ? "bg-amber-500/10 text-amber-500"
                      : n.type === "danger" || n.type === "critical"
                        ? "bg-red-500/10 text-red-500"
                        : n.type === "success"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-blue-500/10 text-blue-500"
                  }`}
                >
                  {n.type === "warning" ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : n.type === "danger" || n.type === "critical" ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : n.type === "success" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Bell className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h4 className="font-bold text-sm text-foreground truncate">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                      {new Date(n.createdAt || n.time).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {n.message}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-4">
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-emerald-500/10 hover:text-emerald-500 text-muted-foreground"
                      onClick={() => onMarkAsRead(n._id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground"
                    onClick={() => onDelete(n._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

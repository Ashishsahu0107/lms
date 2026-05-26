import React, { useState } from "react";
import { Send, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export default function CreateNotification({
  onSend,
}) {
  const [target, setTarget] = useState("all");
  const [type, setType] = useState("info");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError("Please fill in both the notification title and message body.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await onSend({ target, type, title, message });
      setSuccess("Your broadcast has been successfully dispatched across the platform!");
      setTitle("");
      setMessage("");
    } catch (err) {
      setError(err?.message || "Failed to dispatch notification broadcast.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto hover:shadow-md transition-all border border-border" id="create-notification-root">
      <CardHeader>
        <CardTitle className="text-lg text-foreground font-bold">Dispatch Targeted System Broadcast</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-lg flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" /> {success}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Recipient Audience</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option value="all">All Platform Users</option>
                <option value="teachers">Verified Teachers Only</option>
                <option value="students">Registered Students Only</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Alert Level Type</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="info">Information (Blue Alert)</option>
                <option value="success">Success / Release (Green Alert)</option>
                <option value="warning">Warning / Notice (Amber Alert)</option>
                <option value="critical">Critical / Outage (Red Alert)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Notification Title</label>
            <Input
              placeholder="e.g. Summer Break Extended Announcement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Broadcast Message Content</label>
            <textarea
              className="w-full h-32 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Type your official platform announcement message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
            >
              <Send className="h-4 w-4" /> {submitting ? "Dispatching..." : "Send Broadcast"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

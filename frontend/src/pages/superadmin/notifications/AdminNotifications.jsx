import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell, Send, Mail, MessageSquare, Users, AlertTriangle, Check,
  CheckCircle2, Clock, Trash2, Eye, EyeOff, Megaphone, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Avatar } from "../../../components/ui/Avatar";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import { Modal } from "../../../components/ui/Modal";

const mockNotifications = [
  { id: 1, type: "warning", title: "Pending Course Reviews", message: "3 courses are awaiting your approval", read: false, time: new Date("2024-06-15T10:00:00") },
  { id: 2, type: "info", title: "New Teacher Applications", message: "2 new teachers have applied for approval", read: false, time: new Date("2024-06-15T08:00:00") },
  { id: 3, type: "success", title: "System Performance", message: "All servers operating normally", read: true, time: new Date("2024-06-14T18:00:00") },
  { id: 4, type: "warning", title: "High Server Load", message: "Server load exceeded 80% threshold", read: true, time: new Date("2024-06-14T12:00:00") },
  { id: 5, type: "info", title: "Weekly Report Ready", message: "Platform analytics report is ready to view", read: true, time: new Date("2024-06-13T09:00:00") },
];

const broadcastHistory = [
  { id: 1, title: "Summer Sale Announcement", recipients: "All Users", sentAt: new Date("2024-06-10"), status: "sent" },
  { id: 2, title: "New Course Feature", recipients: "Teachers", sentAt: new Date("2024-06-05"), status: "sent" },
  { id: 3, title: "Maintenance Notice", recipients: "All Users", sentAt: new Date("2024-06-01"), status: "sent" },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState("alerts");
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastType, setBroadcastType] = useState("all");

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Manage alerts and send broadcasts</p>
        </div>
        <Button className="gap-2" onClick={() => setShowBroadcastModal(true)}>
          <Megaphone className="h-4 w-4" />Send Broadcast
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Alerts", value: mockNotifications.length, icon: Bell, color: "blue" },
          { label: "Unread", value: mockNotifications.filter(n => !n.read).length, icon: AlertTriangle, color: "amber" },
          { label: "Broadcasts Sent", value: broadcastHistory.length, icon: Send, color: "emerald" },
          { label: "Active Users", value: 342, icon: Users, color: "purple" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs defaultValue="alerts" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="alerts">Alerts ({notifications.filter(n => !n.read).length})</TabsTrigger>
            <TabsTrigger value="broadcasts">Broadcast History</TabsTrigger>
            <TabsTrigger value="settings">Notification Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Alerts */}
      {activeTab === "alerts" && (
        <motion.div variants={item} className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{notifications.filter(n => !n.read).length} unread alerts</p>
            <Button variant="ghost" size="sm" className="gap-2" onClick={markAllRead}>
              <CheckCircle2 className="h-4 w-4" />Mark all as read
            </Button>
          </div>

          {notifications.map((notification) => (
            <Card key={notification._id} className={notification.read ? "opacity-60" : "border-primary/50"}>
              <CardContent className="flex items-start gap-4 p-4">
                <div className={`p-2 rounded-full ${
                  notification.type === "warning" ? "bg-amber-100" :
                  notification.type === "success" ? "bg-emerald-100" : "bg-blue-100"
                }`}>
                  {notification.type === "warning" ? (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  ) : notification.type === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Bell className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && <Badge variant="default" className="text-xs">New</Badge>}
                      <span className="text-xs text-muted-foreground">{notification.time.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!notification.read && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markAsRead(notification._id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteNotification(notification._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Broadcast History */}
      {activeTab === "broadcasts" && (
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Broadcast</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Recipients</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Sent At</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {broadcastHistory.map((broadcast) => (
                    <tr key={broadcast.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3"><p className="font-medium">{broadcast.title}</p></td>
                      <td className="px-4 py-3"><Badge variant="secondary">{broadcast.recipients}</Badge></td>
                      <td className="px-4 py-3"><span className="text-sm text-muted-foreground">{broadcast.sentAt.toLocaleDateString()}</span></td>
                      <td className="px-4 py-3"><Badge variant="success">Sent</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Notification Settings */}
      {activeTab === "settings" && (
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Alert Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Course Review Requests", enabled: true },
                { label: "Teacher Applications", enabled: true },
                { label: "System Alerts", enabled: true },
                { label: "Payment Notifications", enabled: true },
              ].map((setting, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">{setting.label}</span>
                  <Button variant="ghost" size="sm" className="text-primary">
                    {setting.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Email Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Daily Digest", enabled: true },
                { label: "Weekly Report", enabled: true },
                { label: "Security Alerts", enabled: true },
                { label: "Marketing Emails", enabled: false },
              ].map((setting, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">{setting.label}</span>
                  <Button variant="ghost" size="sm" className="text-primary">
                    {setting.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Broadcast Modal */}
      <Modal isOpen={showBroadcastModal} onClose={() => setShowBroadcastModal(false)} title="Send Broadcast" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Recipients</label>
            <select className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm" value={broadcastType} onChange={(e) => setBroadcastType(e.target.value)}>
              <option value="all">All Users</option>
              <option value="teachers">Teachers Only</option>
              <option value="students">Students Only</option>
              <option value="active">Active Users</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Subject</label>
            <Input placeholder="Enter broadcast subject..." />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Message</label>
            <textarea className="w-full h-32 px-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="Enter your message..." />
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowBroadcastModal(false)}>Cancel</Button>
            <Button className="gap-2"><Send className="h-4 w-4" />Send Broadcast</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
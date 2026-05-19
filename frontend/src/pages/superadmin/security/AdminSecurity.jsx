import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Lock, Key, Eye, EyeOff, AlertTriangle, Check, Clock,
  MapPin, Monitor, Smartphone, Trash2, Ban, CheckCircle2, RefreshCw,
  LogIn, FileText, Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Avatar } from "../../../components/ui/Avatar";
import { Modal } from "../../../components/ui/Modal";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/Tabs";

const mockSessions = [
  { id: 1, device: "Chrome on MacOS", ip: "192.168.1.100", location: "San Francisco, CA", lastActive: new Date("2024-06-15T10:30:00"), current: true },
  { id: 2, device: "Safari on iPhone", ip: "192.168.1.101", location: "San Francisco, CA", lastActive: new Date("2024-06-14T15:20:00"), current: false },
  { id: 3, device: "Firefox on Windows", ip: "10.0.0.50", location: "New York, NY", lastActive: new Date("2024-06-10T09:15:00"), current: false },
];

const mockAuditLogs = [
  { id: 1, user: "Admin User", action: "LOGIN", details: "Successful login from Chrome on MacOS", ip: "192.168.1.100", timestamp: new Date("2024-06-15T10:00:00") },
  { id: 2, user: "Admin User", action: "UPDATE_SETTINGS", details: "Changed platform commission to 20%", ip: "192.168.1.100", timestamp: new Date("2024-06-15T10:05:00") },
  { id: 3, user: "Admin User", action: "DELETE_TEACHER", details: "Deleted teacher account: Dr. Michael Brown", ip: "192.168.1.100", timestamp: new Date("2024-06-14T16:30:00") },
  { id: 4, user: "Admin User", action: "APPROVE_COURSE", details: "Approved course: Machine Learning Advanced", ip: "192.168.1.100", timestamp: new Date("2024-06-14T14:20:00") },
  { id: 5, user: "Admin User", action: "LOGOUT", details: "User logged out", ip: "192.168.1.100", timestamp: new Date("2024-06-13T18:00:00") },
];

const mockBlockedIPs = [
  { ip: "45.33.32.156", reason: "Brute force attempts detected", blockedAt: new Date("2024-06-12"), attempts: 127 },
  { ip: "104.236.167.82", reason: "Suspicious login activity", blockedAt: new Date("2024-06-08"), attempts: 45 },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminSecurity() {
  const [activeTab, setActiveTab] = useState("sessions");
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showBlockIPModal, setShowBlockIPModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleRevokeSession = (session) => {
    setSelectedSession(session);
    setShowRevokeModal(true);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Security Center</h1>
          <p className="text-muted-foreground">Monitor and manage platform security</p>
        </div>
        <Button variant="outline" className="gap-2"><FileText className="h-4 w-4" />Export Security Report</Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Sessions", value: mockSessions.filter(s => s.current).length, icon: Monitor, color: "blue" },
          { label: "Failed Logins (24h)", value: 3, icon: AlertTriangle, color: "amber" },
          { label: "Blocked IPs", value: mockBlockedIPs.length, icon: Ban, color: "red" },
          { label: "Security Score", value: "95%", icon: Shield, color: "emerald" },
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
        <Tabs defaultValue="sessions" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="blocked">Blocked IPs</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Sessions */}
      {activeTab === "sessions" && (
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Active Sessions</CardTitle>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowRevokeModal(true)}>
                <LogIn className="h-4 w-4" />Revoke All Other Sessions
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Monitor className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{session.device}</p>
                          {session.current && <Badge variant="success" className="text-xs">Current</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 inline mr-1" />{session.location} • {session.ip}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />Last active: {session.lastActive.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!session.current && (
                      <Button variant="ghost" size="sm" className="text-destructive gap-1" onClick={() => handleRevokeSession(session)}>
                        <Trash2 className="h-4 w-4" />Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Audit Logs */}
      {activeTab === "audit" && (
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Action</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Details</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">IP Address</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAuditLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Badge variant={log.action.includes("LOGIN") ? "default" : log.action.includes("DELETE") ? "destructive" : "secondary"}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3"><span className="text-sm">{log.details}</span></td>
                      <td className="px-4 py-3"><span className="text-sm font-mono text-muted-foreground">{log.ip}</span></td>
                      <td className="px-4 py-3"><span className="text-sm text-muted-foreground">{log.timestamp.toLocaleString()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Blocked IPs */}
      {activeTab === "blocked" && (
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Blocked IP Addresses</CardTitle>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowBlockIPModal(true)}>
                <Ban className="h-4 w-4" />Block New IP
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockBlockedIPs.map((blocked, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-destructive/10">
                        <Ban className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-mono font-medium">{blocked.ip}</p>
                        <p className="text-sm text-muted-foreground">{blocked.reason}</p>
                        <p className="text-xs text-muted-foreground">Blocked on {blocked.blockedAt.toLocaleDateString()} • {blocked.attempts} attempts</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1">Unblock</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Password */}
      {activeTab === "password" && (
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" />Change Password</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Current Password</label>
                <div className="relative">
                  <Input type={showPasswordModal ? "text" : "password"} defaultValue="••••••••••••" />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPasswordModal(!showPasswordModal)}>
                    {showPasswordModal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">New Password</label>
                <div className="relative">
                  <Input type={showNewPassword ? "text" : "password"} placeholder="Minimum 8 characters" />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Confirm New Password</label>
                <Input type="password" placeholder="Repeat new password" />
              </div>
              <Button className="gap-2"><Key className="h-4 w-4" />Update Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Password Requirements</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Minimum 8 characters", met: true },
                { label: "Contains uppercase letter", met: true },
                { label: "Contains lowercase letter", met: true },
                { label: "Contains a number", met: true },
                { label: "Contains special character", met: false },
              ].map((req, i) => (
                <div key={i} className="flex items-center gap-2">
                  {req.met ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="text-sm">{req.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Revoke Session Modal */}
      <Modal isOpen={showRevokeModal} onClose={() => setShowRevokeModal(false)} title="Revoke Session">
        <div className="space-y-4">
          <div className="flex gap-3 p-4 rounded-lg bg-amber-50">
            <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
            <p className="text-sm">Are you sure you want to revoke this session? The user will be forced to log in again.</p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowRevokeModal(false)}>Cancel</Button>
            <Button variant="destructive" className="gap-2" onClick={() => setShowRevokeModal(false)}>
              <Trash2 className="h-4 w-4" />Revoke Session
            </Button>
          </div>
        </div>
      </Modal>

      {/* Block IP Modal */}
      <Modal isOpen={showBlockIPModal} onClose={() => setShowBlockIPModal(false)} title="Block IP Address">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">IP Address</label>
            <Input placeholder="e.g., 192.168.1.1" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Reason</label>
            <textarea className="w-full h-20 px-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="Reason for blocking..." />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowBlockIPModal(false)}>Cancel</Button>
            <Button variant="destructive" className="gap-2"><Ban className="h-4 w-4" />Block IP</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Lock, Bell, Palette, Globe, Shield, Smartphone,
  Mail, Key, Eye, EyeOff, ToggleLeft, ToggleRight, Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Avatar } from "../../../components/ui/Avatar";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    emailCourseUpdates: true,
    emailDeadlines: true,
    emailMessages: false,
    pushAssignments: true,
    pushQuizzes: true,
    pushAnnouncements: false,
  });

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "privacy", label: "Privacy", icon: Shield },
  ];

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and settings</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <motion.div variants={item} className="lg:w-64 shrink-0">
          <Card>
            <div className="p-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "account" && (
            <motion.div variants={item} className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20 text-2xl" fallback="SJ" />
                    <div>
                      <Button variant="outline" size="sm">Change Photo</Button>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Full Name</label>
                      <Input defaultValue="Sarah Johnson" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Username</label>
                      <Input defaultValue="sarahjohnson" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email</label>
                      <Input defaultValue="sarah.johnson@university.edu" type="email" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Phone</label>
                      <Input defaultValue="+1 (555) 123-4567" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button className="gap-2"><Save className="h-4 w-4" /> Save Changes</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Connected Accounts</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Google", email: "sarah.j@gmail.com", connected: true },
                    { name: "GitHub", email: "sarahjohnson", connected: false },
                    { name: "LinkedIn", email: "Not connected", connected: false },
                  ].map(account => (
                    <div key={account.name} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                          <span className="text-sm font-bold">{account.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{account.name}</p>
                          <p className="text-xs text-muted-foreground">{account.email}</p>
                        </div>
                      </div>
                      <Button variant={account.connected ? "outline" : "default"} size="sm">
                        {account.connected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div variants={item} className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Current Password</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} defaultValue="********" className="pr-10" />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">New Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Confirm New Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="flex justify-end">
                    <Button className="gap-2"><Lock className="h-4 w-4" /> Update Password</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Two-Factor Authentication</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Authenticator App</p>
                        <p className="text-xs text-muted-foreground">Use Google Authenticator or similar</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Not Enabled</Badge>
                  </div>
                  <Button variant="outline" size="sm">Enable 2FA</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div variants={item}>
              <Card>
                <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="font-medium text-sm mb-3">Email Notifications</p>
                    <div className="space-y-4">
                      {[
                        { key: "emailCourseUpdates", label: "Course Updates", desc: "Receive emails about new course content" },
                        { key: "emailDeadlines", label: "Assignment Deadlines", desc: "Get reminded before assignments are due" },
                        { key: "emailMessages", label: "Messages", desc: "Receive notifications for new messages" },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                          <button onClick={() => toggleNotification(item.key)} className="text-primary">
                            {notifications[item.key] ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-6">
                    <p className="font-medium text-sm mb-3">Push Notifications</p>
                    <div className="space-y-4">
                      {[
                        { key: "pushAssignments", label: "Assignment Reminders", desc: "Get push notifications for upcoming deadlines" },
                        { key: "pushQuizzes", label: "Quiz Results", desc: "Be notified when quiz results are available" },
                        { key: "pushAnnouncements", label: "Announcements", desc: "Receive course announcements" },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                          <button onClick={() => toggleNotification(item.key)} className="text-primary">
                            {notifications[item.key] ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "appearance" && (
            <motion.div variants={item}>
              <Card>
                <CardHeader><CardTitle>Appearance Settings</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="font-medium text-sm mb-3">Theme</p>
                    <div className="flex gap-4">
                      {["Light", "Dark", "System"].map(theme => (
                        <button key={theme} className={`flex-1 p-4 rounded-xl border-2 transition-colors ${theme === "System" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                          <div className="w-10 h-10 rounded-full bg-muted mx-auto mb-2" />
                          <p className="text-sm font-medium">{theme}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-3">Language & Region</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Language</label>
                        <select className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm">
                          <option>English (US)</option>
                          <option>Spanish</option>
                          <option>French</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Timezone</label>
                        <select className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm">
                          <option>UTC-8 Pacific Time</option>
                          <option>UTC-5 Eastern Time</option>
                          <option>UTC+0 GMT</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "privacy" && (
            <motion.div variants={item}>
              <Card>
                <CardHeader><CardTitle>Privacy & Data</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Profile Visibility</p>
                        <p className="text-xs text-muted-foreground">Control who can see your profile</p>
                      </div>
                      <select className="h-9 px-3 rounded-lg border border-input bg-background text-sm">
                        <option>Public</option>
                        <option>Private</option>
                        <option>Only Enrolled Students</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Show Progress</p>
                        <p className="text-xs text-muted-foreground">Allow others to see your learning progress</p>
                      </div>
                      <ToggleRight className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Activity Status</p>
                        <p className="text-xs text-muted-foreground">Let instructors see when you're online</p>
                      </div>
                      <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="border-t pt-6">
                    <p className="font-medium text-sm text-destructive mb-3">Danger Zone</p>
                    <div className="flex gap-3">
                      <Button variant="outline">Export My Data</Button>
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
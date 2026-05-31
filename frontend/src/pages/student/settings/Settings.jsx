import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Shield, Bell, Palette, Lock, CheckCircle2, RefreshCw, Eye
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { useAuth } from "../../../context/AuthContext";
import { getProfile, updateProfile, updatePassword, updatePreferences } from "../../../services/settingsService";
import toast from "react-hot-toast";

export default function Settings() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // Profile Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Preferences States
  const [theme, setTheme] = useState("light");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    quizAlerts: true,
    assignmentAlerts: true,
    courseNotifications: true,
  });
  const [privacy, setPrivacy] = useState({
    accountVisibility: "public",
    activityVisibility: "public",
  });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setBio(user.bio || "");
      setAvatar(user.avatar || "");

      // Setup Preferences Safely
      const prefs = user.preferences || {};
      setTheme(prefs.theme || "light");
      setTwoFactorEnabled(prefs.twoFactorEnabled || false);

      const notifs = prefs.notifications || {};
      setNotifications({
        email: notifs.email !== false,
        quizAlerts: notifs.quizAlerts !== false,
        assignmentAlerts: notifs.assignmentAlerts !== false,
        courseNotifications: notifs.courseNotifications !== false,
      });

      const priv = prefs.privacy || {};
      setPrivacy({
        accountVisibility: priv.accountVisibility || "public",
        activityVisibility: priv.activityVisibility || "public",
      });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await updateProfile({ name, email, phone, avatar, bio });
      if (res.data?.success) {
        toast.success("Profile saved successfully!");
        if (setUser) setUser(res.data.data);
      }
    } catch (err) {
      // The interceptor displays errors automatically
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    try {
      setLoading(true);
      const res = await updatePassword({ currentPassword, newPassword });
      if (res.data?.success) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSave = async () => {
    try {
      setLoading(true);
      const res = await updatePreferences({ theme, notifications, privacy, twoFactorEnabled });
      if (res.data?.success) {
        toast.success("Preferences updated successfully!");
        if (setUser) setUser(res.data.data);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "preferences", label: "Preferences & Privacy", icon: Palette },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="student-settings-page">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account profile, preferences, and notifications matrix</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === t.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Pane */}
        <div className="md:col-span-3">
          {activeTab === "profile" && (
            <Card className="border-border shadow-sm">
              <CardContent className="p-6">
                <form onSubmit={handleProfileSave} className="space-y-5">
                  <h3 className="text-lg font-bold text-foreground">Profile Information</h3>

                  {/* Avatar Preview */}
                  <div className="flex items-center gap-4">
                    <img
                      src={avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                      alt="Avatar Preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/20"
                    />
                    <div className="space-y-1 flex-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Avatar Image URL</label>
                      <Input
                        type="text"
                        placeholder="Paste image link here…"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                      <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                    <Input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Short Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full p-3 rounded-lg border border-border bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="Write a few lines about yourself…"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold gap-2">
                    {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                    Save Profile Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "password" && (
            <Card className="border-border shadow-sm">
              <CardContent className="p-6">
                <form onSubmit={handlePasswordSave} className="space-y-5">
                  <h3 className="text-lg font-bold text-foreground">Change Password</h3>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Password</label>
                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Password</label>
                      <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirm New Password</label>
                      <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold gap-2">
                    {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "preferences" && (
            <Card className="border-border shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Preferences</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Customize your look, visibility and real-time security alerts</p>
                </div>

                {/* Theme Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Theme Preference</label>
                  <div className="flex gap-4">
                    {["light", "dark"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 text-xs font-bold capitalize transition-all ${
                          theme === t ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-border text-muted-foreground"
                        }`}
                      >
                        {t} Mode
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-border" />

                {/* Notifications Matrix */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Notifications Matrix</label>
                  <div className="space-y-2">
                    {Object.entries(notifications).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600 border-border focus:ring-indigo-500/20"
                        />
                        <span className="text-xs font-medium text-slate-700 capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <hr className="border-border" />

                {/* Privacy Visibility */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Privacy Settings</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-xs font-medium text-slate-700">Account Visibility</span>
                      <select
                        value={privacy.accountVisibility}
                        onChange={(e) => setPrivacy({ ...privacy, accountVisibility: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-base-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs font-medium text-slate-700">Activity Visibility</span>
                      <select
                        value={privacy.activityVisibility}
                        onChange={(e) => setPrivacy({ ...privacy, activityVisibility: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-base-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="border-border" />

                {/* Security (2FA) */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-700">Two-Factor Authentication</span>
                    <p className="text-[10px] text-muted-foreground">Add an extra layer of protection to your credentials.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    className="w-10 h-5 rounded-full text-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Active Sessions */}
                <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Active Browser Sessions</span>
                    <Badge className="bg-emerald-600 text-white border-0 py-0.5 text-[9px]">Current Device</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono">Chrome on Windows (IPv4: 192.168.1.1)</p>
                </div>

                <Button onClick={handlePreferencesSave} disabled={loading} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-semibold gap-2">
                  {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                  Save Preferences & Security Settings
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
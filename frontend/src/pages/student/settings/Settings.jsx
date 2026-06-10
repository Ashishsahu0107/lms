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
import { useTheme } from "../../../hooks/useTheme";
import ThemeToggle from "../../../components/common/ThemeToggle";

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
  const { theme, setTheme } = useTheme();
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
      <div className="border-b border-base-300 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-sm text-base-content/60 mt-1">Manage your account profile, preferences, and notifications matrix</p>
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
                  ? "bg-primary text-primary-content shadow-md"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-200/50"
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
            <Card className="border-base-300 shadow-sm">
              <CardContent className="p-6">
                <form onSubmit={handleProfileSave} className="space-y-5">
                  <h3 className="text-lg font-bold text-base-content">Profile Information</h3>

                  {/* Avatar Preview */}
                  <div className="flex items-center gap-4">
                    <img
                      src={avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                      alt="Avatar Preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div className="space-y-1 flex-1">
                      <label className="text-xs font-bold text-base-content/60 uppercase tracking-wider block">Avatar Image URL</label>
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
                      <label className="text-xs font-bold text-base-content/60 uppercase tracking-wider">Full Name</label>
                      <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-base-content/60 uppercase tracking-wider">Email Address</label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-base-content/60 uppercase tracking-wider">Phone Number</label>
                    <Input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-base-content/60 uppercase tracking-wider">Short Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full p-3 rounded-lg border border-base-300 bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base-content"
                      placeholder="Write a few lines about yourself…"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="bg-primary text-primary-content hover:bg-primary/90 font-semibold gap-2">
                    {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                    Save Profile Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "password" && (
            <Card className="border-base-300 shadow-sm">
              <CardContent className="p-6">
                <form onSubmit={handlePasswordSave} className="space-y-5">
                  <h3 className="text-lg font-bold text-base-content">Change Password</h3>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-base-content/60 uppercase tracking-wider">Current Password</label>
                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-base-content/60 uppercase tracking-wider">New Password</label>
                      <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-base-content/60 uppercase tracking-wider">Confirm New Password</label>
                      <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="bg-primary text-primary-content hover:bg-primary/90 font-semibold gap-2">
                    {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "preferences" && (
            <Card className="border-base-300 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-base-content">Preferences</h3>
                  <p className="text-xs text-base-content/60 mt-0.5">Customize your look, visibility and real-time security alerts</p>
                </div>

                {/* Theme Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-base-content/60 uppercase tracking-wider">Theme Preference</label>
                  <ThemeToggle variant="settings" />
                </div>

                <hr className="border-base-300" />

                {/* Notifications Matrix */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-base-content/60 uppercase tracking-wider">Notifications Matrix</label>
                  <div className="space-y-3">
                    {Object.entries(notifications).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                          className="checkbox checkbox-primary checkbox-sm"
                        />
                        <span className="text-xs font-medium text-base-content/80 capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <hr className="border-base-300" />

                {/* Privacy Visibility */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-base-content/60 uppercase tracking-wider">Privacy Settings</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-xs font-medium text-base-content/80">Account Visibility</span>
                      <select
                        value={privacy.accountVisibility}
                        onChange={(e) => setPrivacy({ ...privacy, accountVisibility: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-base-300 bg-base-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base-content"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs font-medium text-base-content/80">Activity Visibility</span>
                      <select
                        value={privacy.activityVisibility}
                        onChange={(e) => setPrivacy({ ...privacy, activityVisibility: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-base-300 bg-base-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base-content"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="border-base-300" />

                {/* Security (2FA) */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-base-content/80">Two-Factor Authentication</span>
                    <p className="text-[10px] text-base-content/60">Add an extra layer of protection to your credentials.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    className="switch switch-primary"
                  />
                </div>

                {/* Active Sessions */}
                <div className="p-4 bg-base-200 border border-base-300 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-base-content/80">Active Browser Sessions</span>
                    <Badge className="bg-success text-success-content border-0 py-0.5 text-[9px]">Current Device</Badge>
                  </div>
                  <p className="text-[10px] text-base-content/60 font-mono">Chrome on Windows (IPv4: 192.168.1.1)</p>
                </div>

                <Button onClick={handlePreferencesSave} disabled={loading} className="w-full bg-primary text-primary-content hover:bg-primary/90 font-semibold gap-2">
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
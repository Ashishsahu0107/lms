import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon, Globe, Mail, CreditCard, Shield, Palette,
  Save, RefreshCw, Building, Server, ToggleLeft, ToggleRight, Check, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/Tabs";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [toggles, setToggles] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    sslEnabled: true,
  });

  const toggleSetting = (key) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure your platform settings</p>
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="general" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="smtp">Email (SMTP)</TabsTrigger>
            <TabsTrigger value="payment">Payment Gateway</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {activeTab === "general" && (
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building className="h-4 w-4" />Platform Branding</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Platform Name</label>
                <Input defaultValue="LMS Pro" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Logo URL</label>
                <Input defaultValue="https://lmspro.edu/logo.png" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tagline</label>
                <Input defaultValue="Transforming Education, One Course at a Time" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Contact Email</label>
                <Input defaultValue="support@lmspro.edu" type="email" />
              </div>
              <Button className="gap-2"><Save className="h-4 w-4" />Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" />Platform Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">Put the platform in maintenance mode</p>
                </div>
                <button onClick={() => toggleSetting("maintenanceMode")} className="text-primary">
                  {toggles.maintenanceMode ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-muted-foreground" />}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">User Registration</p>
                  <p className="text-sm text-muted-foreground">Allow new users to register</p>
                </div>
                <button onClick={() => toggleSetting("registrationEnabled")} className="text-primary">
                  {toggles.registrationEnabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-muted-foreground" />}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Platform Commission</p>
                  <p className="text-sm text-muted-foreground">Take 20% from each transaction</p>
                </div>
                <Badge variant="default">20%</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === "smtp" && (
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4" />SMTP Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">SMTP Host</label>
                <Input defaultValue="smtp.gmail.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">SMTP Port</label>
                <Input defaultValue="587" type="number" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">SMTP Username</label>
                <Input defaultValue="notifications@lmspro.edu" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">SMTP Password</label>
                <Input type="password" defaultValue="••••••••••••" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">From Name</label>
                <Input defaultValue="LMS Pro" />
              </div>
              <Button className="gap-2"><Save className="h-4 w-4" />Save SMTP Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Test Email</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Send a test email to verify your SMTP configuration.</p>
              <div>
                <label className="text-sm font-medium mb-1 block">Recipient Email</label>
                <Input placeholder="test@example.com" type="email" />
              </div>
              <Button variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" />Send Test Email</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === "payment" && (
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" />Stripe Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Stripe Publishable Key</label>
                <Input defaultValue="pk_test_••••••••••••" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Stripe Secret Key</label>
                <Input type="password" defaultValue="••••••••••••" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Webhook Secret</label>
                <Input type="password" defaultValue="whsec_••••••••••••" />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50">
                <Check className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-emerald-700">Stripe connected successfully</span>
              </div>
              <Button className="gap-2"><Save className="h-4 w-4" />Save Stripe Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">PayPal Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">PayPal Client ID</label>
                <Input defaultValue="••••••••••••" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">PayPal Secret</label>
                <Input type="password" defaultValue="••••••••••••" />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="text-sm text-amber-700">PayPal not configured</span>
              </div>
              <Button variant="outline" className="gap-2"><Save className="h-4 w-4" />Save PayPal Settings</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === "security" && (
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />Security Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">SSL/HTTPS</p>
                  <p className="text-sm text-muted-foreground">Force HTTPS on all connections</p>
                </div>
                <button onClick={() => toggleSetting("sslEnabled")} className="text-primary">
                  {toggles.sslEnabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-muted-foreground" />}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Send security alerts via email</p>
                </div>
                <button onClick={() => toggleSetting("emailNotifications")} className="text-primary">
                  {toggles.emailNotifications ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-muted-foreground" />}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Session Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">JWT Expiry</label>
                <select className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm">
                  <option>7 days</option>
                  <option>30 days</option>
                  <option>90 days</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Max Login Attempts</label>
                <Input defaultValue="5" type="number" />
              </div>
              <Button className="gap-2"><Save className="h-4 w-4" />Save Security Settings</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === "advanced" && (
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Server className="h-4 w-4" />Server Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Max Upload Size (MB)</label>
                <Input defaultValue="100" type="number" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Allowed File Types</label>
                <Input defaultValue=".pdf, .docx, .mp4, .jpg, .png" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Rate Limiting (requests/minute)</label>
                <Input defaultValue="60" type="number" />
              </div>
              <Button className="gap-2"><Save className="h-4 w-4" />Save Advanced Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base text-destructive">Danger Zone</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="font-medium">Clear Cache</p>
                <p className="text-sm text-muted-foreground mb-3">Remove all cached data and temporary files.</p>
                <Button variant="destructive" className="gap-2"><RefreshCw className="h-4 w-4" />Clear Cache</Button>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="font-medium">Reset Database</p>
                <p className="text-sm text-muted-foreground mb-3">Warning: This will delete all data and cannot be undone.</p>
                <Button variant="destructive">Reset Database</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
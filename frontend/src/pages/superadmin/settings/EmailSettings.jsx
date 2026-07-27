import { useState } from "react";
import { Save, Mail, RefreshCw, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export default function EmailSettings() {
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState("notifications@lmspro.edu");
  const [fromName, setFromName] = useState("LMS Pro Notifications");
  const [testEmail, setTestEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setMessage("SMTP mailer properties saved successfully!");
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testEmail) return;
    try {
      setSendingTest(true);
      // Mock network sleep
      await new Promise((res) => setTimeout(res, 800));
      setMessage(`Test email dispatched successfully to ${testEmail}!`);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      id="email-settings-root"
    >
      <Card className="hover:shadow-md border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground font-bold flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-500" /> SMTP Mailer Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            {message && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs rounded-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {message}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                SMTP Server Host
              </label>
              <Input
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                SMTP Port
              </label>
              <Input
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                SMTP Username / Email
              </label>
              <Input
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                From Name Header
              </label>
              <Input
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <Button
                type="submit"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm text-xs"
              >
                <Save className="h-4 w-4" /> Save SMTP SMTP
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base text-foreground font-bold">
            SMTP Connection Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Validate that your SMTP credentials connect successfully to
            Gmail/AWS SES by sending a quick test email text.
          </p>
          <form onSubmit={handleSendTest} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Recipient Verification Email
              </label>
              <Input
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              disabled={sendingTest}
              className="gap-2 text-xs font-semibold"
            >
              <RefreshCw
                className={`h-4 w-4 ${sendingTest ? "animate-spin" : ""}`}
              />{" "}
              Verify Mail Connection
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

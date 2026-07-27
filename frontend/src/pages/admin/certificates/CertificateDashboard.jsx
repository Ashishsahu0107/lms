import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Shield,
  FileText,
  Settings,
  ArrowRight,
  UserPlus,
  FileSignature,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { getAllCertificates } from "../../../services/certificateService";
import toast from "react-hot-toast";

export default function CertificateDashboard() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getAllCertificates();
        if (res.data?.success) {
          setCerts(res.data.data || []);
        }
      } catch (err) {
        toast.error("Failed to load certificates");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div
      className="space-y-6 max-w-6xl mx-auto"
      id="admin-certificates-dashboard"
    >
      <div className="border-b border-border pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Certificate Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Issue, approve, revoke and manage student templates and credentials
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-600">
              <Award className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">
                {loading ? "…" : certs.length}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                Total Certificates Issued
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-600">
              <FileSignature className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">3 Available</p>
              <p className="text-sm font-medium text-muted-foreground">
                Active Templates
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">100%</p>
              <p className="text-sm font-medium text-muted-foreground">
                Verified Integrity
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <Card className="border-border shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
                <UserPlus className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full">
                New Credential
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Issue New Certificate
            </h3>
            <p className="text-sm text-muted-foreground">
              Select an enrolled student, choose a course, validate completion
              requirements, and grant credentials.
            </p>
            <Link to="/admin/certificates/issue" className="block pt-2">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2">
                Launch Issuing Wizard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-2.5 py-1 rounded-full">
                Archive Logs
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Certificate History
            </h3>
            <p className="text-sm text-muted-foreground">
              View comprehensive records of all issued certificates. Download
              PDFs, track completion metrics, or revoke/delete records.
            </p>
            <Link to="/admin/certificates/history" className="block pt-2">
              <Button
                variant="outline"
                className="w-full font-semibold flex items-center justify-center gap-2"
              >
                Browse Registry Logs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Templates Card */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <BookOpen className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-bold text-foreground">
                Manage Certificate Templates
              </h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              Configure layout designs, borders, signatures, and backgrounds.
              Switch styles dynamically to wow students.
            </p>
          </div>
          <Link
            to="/admin/certificates/templates"
            className="w-full md:w-auto shrink-0"
          >
            <Button
              variant="outline"
              className="w-full md:w-auto font-semibold gap-2"
            >
              <Settings className="h-4 w-4" /> Customize Styles
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

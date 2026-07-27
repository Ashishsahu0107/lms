import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Download,
  Search,
  RefreshCw,
  FileText,
  Plus,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { getAllCertificates } from "../../../services/certificateService";
import toast from "react-hot-toast";

export default function StudentCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCert, setSelectedCert] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAllCertificates();
      if (res.data?.success) {
        setCerts(res.data.data || []);
      }
    } catch (err) {
      toast.error("Failed to load issued certificates list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCerts = certs.filter((c) => {
    const studentName = c.student?.name?.toLowerCase() || "";
    const courseTitle = c.course?.title?.toLowerCase() || "";
    const certId = c.certificateId?.toLowerCase() || "";
    const query = search.toLowerCase();
    return (
      studentName.includes(query) ||
      courseTitle.includes(query) ||
      certId.includes(query)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto" id="teacher-certificates-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Issued Certificates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registry of completion credentials issued for your courses
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/teacher/certificates/issue">
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 text-xs"
            >
              <Plus className="h-4 w-4" /> Issue Certificate
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-2 text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search student name, course title, or certificate code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table List */}
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  "Certificate ID",
                  "Student Name",
                  "Course Title",
                  "Issued On",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-muted/30 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredCerts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-14 text-muted-foreground text-sm"
                  >
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No issued certificates found.
                  </td>
                </tr>
              ) : (
                filteredCerts.map((record) => (
                  <tr
                    key={record._id}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="text-xs font-bold font-mono text-slate-800 bg-amber-50 px-2.5 py-1 border border-amber-200/50 rounded">
                          {record.certificateId}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold text-foreground">
                        {record.student?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {record.student?.email}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground font-medium">
                      {record.course?.title}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {new Date(record.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        size="xs"
                        variant="outline"
                        className="text-[10px] font-bold"
                        onClick={() => setSelectedCert(record)}
                      >
                        View Preview
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Preview Modal */}
      <Modal
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        title=""
        size="lg"
      >
        {selectedCert && (
          <div className="rounded-xl overflow-hidden border border-border bg-white text-slate-800 shadow-2xl relative">
            <div className="p-4 bg-muted/20 border-b border-border flex justify-between items-center print:hidden">
              <div className="flex items-center gap-2 text-indigo-600">
                <Shield className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Secured Credentials
                </span>
              </div>
              <Button
                size="sm"
                className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
                onClick={() => window.print()}
              >
                <Download className="h-4 w-4" /> Download / Print PDF
              </Button>
            </div>

            <div className="p-12 text-center space-y-8 relative border-[12px] border-amber-500/20 m-4 rounded bg-amber-50/10">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <Award className="w-[300px] h-[300px] text-amber-600" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-amber-600">
                  <Award className="h-16 w-16 drop-shadow" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight font-serif text-slate-900 uppercase">
                  Certificate of Completion
                </h2>
                <div className="w-24 h-0.5 bg-amber-500 mx-auto" />
                <p className="text-sm text-slate-500 font-medium">
                  This is officially presented to
                </p>
                <p className="text-4xl font-extrabold text-slate-900 tracking-tight font-serif underline decoration-amber-500/40 underline-offset-8">
                  {selectedCert.student?.name}
                </p>
                <p className="text-sm text-slate-500 font-medium pt-2">
                  for successfully completing all syllabus requirements of
                </p>
                <p className="text-2xl font-bold text-slate-800 font-serif">
                  {selectedCert.course?.title}
                </p>
              </div>

              <div className="flex justify-between items-end pt-12 border-t border-slate-200">
                <div className="text-left space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    Authorized By
                  </p>
                  <p className="font-bold text-sm text-slate-700 font-serif">
                    {selectedCert.issuedBy?.name}
                  </p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    Verified Code
                  </p>
                  <p className="font-mono text-xs text-slate-800 font-bold">
                    {selectedCert.certificateId}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    Date of Issue
                  </p>
                  <p className="font-bold text-sm text-slate-700">
                    {new Date(selectedCert.issueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

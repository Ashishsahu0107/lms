import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  Award,
  Calendar,
  ArrowLeft,
  Printer,
  ShieldAlert,
  BadgeCheck,
} from "lucide-react";
import { apiGet } from "../../services/apiClient";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export default function VerifyCertificate() {
  const { certificateId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCertificate() {
      try {
        setLoading(true);
        setError(null);
        // Direct call to public endpoint
        const res = await apiGet(`/certificates/verify/${certificateId}`);
        if (res.data?.success) {
          setCert(res.data.data);
        } else {
          setError("This certificate record could not be found or verified.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Invalid certificate ID. Please check the URL link or QR code.",
        );
      } finally {
        setLoading(false);
      }
    }
    if (certificateId) {
      loadCertificate();
    }
  }, [certificateId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-white space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium animate-pulse text-slate-300">
          Consulting cryptographic registrar registry...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md w-full bg-slate-900/60 border-rose-500/30 text-white shadow-2xl backdrop-blur-xl mx-auto">
        <CardContent className="p-8 text-center space-y-6">
          <ShieldAlert className="h-16 w-16 text-rose-500 mx-auto drop-shadow-lg animate-pulse" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-100">
              Verification Failure
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
          </div>
          <div className="border-t border-slate-800 pt-6 flex justify-center">
            <Link to="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2 font-semibold">
                <ArrowLeft className="h-4 w-4" /> Go to LMS Pro Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.href)}&color=0f172a&bgcolor=f8fafc`;

  return (
    <div className="max-w-xl w-full mx-auto" id="public-certificate-verifier">
      <Card className="bg-slate-950/80 border-amber-500/20 text-white shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        <CardContent className="p-8 space-y-6">
          {/* Top Verified Header */}
          <div className="text-center space-y-2 border-b border-slate-800 pb-5">
            <div className="inline-flex items-center justify-center p-3.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow shadow-emerald-500/10 mb-2">
              <ShieldCheck className="h-10 w-10 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-emerald-400 uppercase">
              Verifiable Credential
            </h1>
            <p className="text-xs text-slate-400 font-medium font-mono uppercase tracking-widest">
              LMS Cryptographic Record Registry Verified
            </p>
          </div>

          {/* Certificate Main info */}
          <div className="space-y-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  Recipient Student
                </span>
                <p className="text-lg font-bold text-slate-100">
                  {cert.student?.name}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {cert.student?.email}
                </p>
              </div>
              <div className="w-16 h-16 bg-white p-1 rounded-lg shrink-0 border border-slate-200 shadow-sm flex items-center justify-center">
                <img
                  src={qrCodeUrl}
                  alt="Verification QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-4 space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                Course Conquered
              </span>
              <p className="text-base font-bold text-amber-400 leading-tight">
                {cert.course?.title}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-medium">
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-amber-500" /> 100%
                  Completion
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-blue-400" /> Issued{" "}
                  {new Date(cert.issueDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  Authorized Issuer
                </span>
                <p className="text-xs font-bold text-slate-200 mt-0.5">
                  {cert.issuedBy?.name}
                </p>
                <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">
                  {cert.issuedBy?.role?.replace("_", " ")}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  Certificate Serial
                </span>
                <p className="text-xs font-mono font-bold text-slate-200 mt-1 uppercase tracking-tight">
                  {cert.certificateId}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Statement */}
          <div className="flex items-start gap-2.5 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 text-xs text-emerald-300 leading-relaxed">
            <BadgeCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              This digital badge confirms that the student listed above
              completed all syllabus components, quiz examinations, and
              assignment tasks for the course. LMS Pro validates the
              authenticity of this certificate serial.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex-1 gap-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-semibold"
            >
              <Printer className="h-4 w-4" /> Print / Save PDF
            </Button>
            <Link to="/login" className="flex-1">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/15">
                Go to login Portal
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

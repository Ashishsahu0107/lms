import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, Download, Calendar, CheckCircle2, ExternalLink, BookOpen,
  Star, Clock, Share2, Shield, RefreshCw
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { useAuth } from "../../../context/AuthContext";
import { getStudentCertificates } from "../../../services/certificateService";
import toast from "react-hot-toast";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Certificates() {
  const { user } = useAuth();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await getStudentCertificates(user._id || user.id);
      if (res.data?.success) {
        setCerts(res.data.data || []);
      }
    } catch (err) {
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto" id="student-certificates-dashboard">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            My Certificates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Your verified course achievements and credentials</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCertificates} disabled={loading} className="gap-2 text-sm">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500"><Award className="h-6 w-6" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{loading ? "…" : certs.length}</p>
              <p className="text-xs text-muted-foreground">Certificates Earned</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><BookOpen className="h-6 w-6" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{user?.enrolledCourses?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Courses Enrolled</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="h-6 w-6" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">Verified</p>
              <p className="text-xs text-muted-foreground">Security Protection</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Certificates Grid */}
      <motion.div variants={item}>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-muted/20 border border-border rounded-2xl h-72" />
            ))}
          </div>
        ) : certs.length === 0 ? (
          <div className="text-center py-20 bg-muted/10 border border-border border-dashed rounded-3xl space-y-3">
            <Award className="h-14 w-14 text-muted-foreground/40 mx-auto" />
            <h3 className="text-lg font-bold text-foreground">No Certificates Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Complete your course materials up to 90% and ask your instructor to issue your official certificate.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certs.map((cert) => (
              <Card key={cert._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-border group relative">
                <div className="relative h-40 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-6 text-center text-white">
                  <div className="absolute inset-0 bg-black/10 opacity-60 backdrop-blur-[1px]" />
                  <div className="relative z-10 space-y-2">
                    <Award className="h-10 w-10 text-amber-400 mx-auto drop-shadow-md" />
                    <h4 className="font-bold text-xs uppercase tracking-widest text-amber-200">Completion Certificate</h4>
                    <p className="font-semibold text-xs line-clamp-2 max-w-xs">{cert.course?.title}</p>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-emerald-600 text-white border-0 py-0.5 px-2.5 rounded-full flex items-center gap-1 text-[9px] font-bold uppercase">
                      <Shield className="h-2.5 w-2.5" /> Verified
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3 bg-card">
                  <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {cert.course?.title}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                    Earned on {new Date(cert.issueDate).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground/80 font-mono tracking-tight bg-muted/40 p-1.5 rounded border border-border">
                    ID: {cert.certificateId}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1 gap-1 text-xs bg-indigo-600 text-white hover:bg-indigo-700 font-semibold" onClick={() => setSelectedCert(cert)}>
                      <ExternalLink className="h-3 w-3" /> View Certificate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {/* Premium Visual Certificate Preview Modal */}
      <Modal isOpen={!!selectedCert} onClose={() => setSelectedCert(null)} title="" size="lg">
        {selectedCert && (
          <div className="rounded-xl overflow-hidden border border-border bg-white text-slate-800 shadow-2xl relative" id="printable-certificate">
            {/* Action Bar (Not shown in print) */}
            <div className="p-4 bg-muted/20 border-b border-border flex justify-between items-center print:hidden">
              <div className="flex items-center gap-2 text-indigo-600">
                <Shield className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Secured Credentials</span>
              </div>
              <Button size="sm" className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold" onClick={handlePrint}>
                <Download className="h-4 w-4" /> Download / Print PDF
              </Button>
            </div>

            {/* Frame Body */}
            <div className="p-12 text-center space-y-8 relative border-[12px] border-amber-500/20 m-4 rounded bg-amber-50/10">
              {/* Certificate Seal Background */}
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
                <p className="text-sm text-slate-500 font-medium">This is officially presented to</p>
                <p className="text-4xl font-extrabold text-slate-900 tracking-tight font-serif underline decoration-amber-500/40 underline-offset-8">
                  {selectedCert.student?.name}
                </p>
                <p className="text-sm text-slate-500 font-medium pt-2">for successfully completing all syllabus requirements of</p>
                <p className="text-2xl font-bold text-slate-800 font-serif">
                  {selectedCert.course?.title}
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  A comprehensive professional course validation, confirming full mastery of core subjects and outstanding overall syllabus participation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-end pt-12 gap-6 border-t border-slate-200">
                <div className="text-left space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Authorized By</p>
                  <p className="font-bold text-sm text-slate-700 font-serif">{selectedCert.issuedBy?.name || "LMS Platform Team"}</p>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{selectedCert.issuedBy?.role?.replace("_", " ")}</p>
                </div>
                <div className="text-center space-y-1 bg-amber-500/5 px-4 py-2 rounded-lg border border-amber-500/10 flex flex-col items-center justify-center gap-1.5 shrink-0">
                  <div className="w-14 h-14 bg-white p-0.5 rounded border border-amber-500/15 flex items-center justify-center shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(window.location.origin + "/verify-certificate/" + selectedCert.certificateId)}&color=0f172a&bgcolor=f8fafc`}
                      alt="Verify QR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[8px] text-slate-400 uppercase tracking-widest font-semibold">Verify Code</p>
                  <p className="font-mono text-[9px] text-slate-800 font-bold">{selectedCert.certificateId}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Date of Issue</p>
                  <p className="font-bold text-sm text-slate-700">{new Date(selectedCert.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">Progress: {selectedCert.completionPercentage}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
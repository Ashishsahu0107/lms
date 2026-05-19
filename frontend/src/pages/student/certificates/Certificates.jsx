import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Award, Download, Calendar, CheckCircle2, ExternalLink, BookOpen,
  Star, Clock, Share2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { Modal } from "../../../components/ui/Modal";

const certificates = [
  {
    id: 1,
    courseTitle: "Digital Marketing Mastery",
    instructor: "Rachel Green",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
    completedDate: "Dec 15, 2025",
    certificateId: "CERT-DM-2025-001",
    progress: 100,
    downloadUrl: "#"
  },
  {
    id: 2,
    courseTitle: "UI/UX Design Fundamentals",
    instructor: "Sarah Johnson",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
    completedDate: null,
    certificateId: null,
    progress: 78,
    downloadUrl: null
  },
  {
    id: 3,
    courseTitle: "Advanced JavaScript",
    instructor: "Dr. James Wilson",
    thumbnail: "https://images.unsplash.com/photo-1627392662291-4c2ac9c424e9?w=400",
    completedDate: null,
    certificateId: null,
    progress: 45,
    downloadUrl: null
  }
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Certificates() {
  const [selectedCert, setSelectedCert] = useState(null);

  const earnedCount = certificates.filter(c => c.downloadUrl).length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Certificates</h1>
          <p className="text-muted-foreground">Your achievements and earned certificates</p>
        </div>
        <Button variant="outline" className="gap-2"><Share2 className="h-4 w-4" /> Share All</Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-amber-100"><Award className="h-6 w-6 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-bold">{earnedCount}</p>
              <p className="text-sm text-muted-foreground">Certificates Earned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-blue-100"><BookOpen className="h-6 w-6 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold">{certificates.length}</p>
              <p className="text-sm text-muted-foreground">Courses Enrolled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-emerald-100"><CheckCircle2 className="h-6 w-6 text-emerald-600" /></div>
            <div>
              <p className="text-2xl font-bold">{Math.round(certificates.reduce((a, c) => a + c.progress, 0) / certificates.length)}%</p>
              <p className="text-sm text-muted-foreground">Average Progress</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Certificates Grid */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map(cert => (
            <Card key={cert.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative h-40">
                <img src={cert.thumbnail} alt={cert.courseTitle} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {cert.downloadUrl ? (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-emerald-600 text-white border-0">Certified</Badge>
                  </div>
                ) : (
                  <div className="absolute top-3 right-3">
                    <Badge variant="warning">In Progress</Badge>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold line-clamp-1">{cert.courseTitle}</h3>
                <p className="text-sm text-muted-foreground">{cert.instructor}</p>

                {cert.downloadUrl ? (
                  <>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Earned on {cert.completedDate}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{cert.certificateId}</p>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1 gap-1" onClick={() => setSelectedCert(cert)}>
                        <ExternalLink className="h-3 w-3" /> View
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Download className="h-3 w-3" /> PDF
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <ProgressBar value={cert.progress} size="sm" showLabel className="pt-1" />
                    <p className="text-xs text-muted-foreground">{cert.progress}% complete</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Certificate Preview Modal */}
      <Modal isOpen={!!selectedCert} onClose={() => setSelectedCert(null)} title="" size="lg">
        {selectedCert && (
          <div className="relative rounded-xl overflow-hidden border-4 border-amber-200 bg-white p-8 text-center space-y-4">
            <div className="absolute top-4 right-4">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
                <Download className="h-4 w-4" /> Download
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-amber-600">
                <Award className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Certificate of Completion</h2>
              <p className="text-slate-500">This is to certify that</p>
              <p className="text-3xl font-bold text-slate-800">Sarah Johnson</p>
              <p className="text-slate-500">has successfully completed</p>
              <p className="text-xl font-semibold text-slate-700">{selectedCert.courseTitle}</p>
              <p className="text-sm text-slate-400">with dedication and excellence</p>
            </div>
            <div className="flex justify-between items-end pt-8">
              <div className="text-left">
                <p className="text-xs text-slate-400">Instructor</p>
                <p className="font-medium text-slate-600">{selectedCert.instructor}</p>
              </div>
              <div className="border-t-2 border-amber-300 px-8">
                <p className="text-xs text-slate-400">Date</p>
                <p className="font-medium text-slate-600">{selectedCert.completedDate}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Certificate ID</p>
                <p className="font-mono text-sm text-slate-600">{selectedCert.certificateId}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
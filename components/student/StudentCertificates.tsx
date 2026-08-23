"use client";

// components/student/StudentCertificates.tsx — Student certificates gallery & printable certificate preview
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { API_URL } from "@/lib/api-config";

export default function StudentCertificates() {
  const { token } = useAuth();
  const [certs, setCerts] = useState<Array<Record<string, unknown>>>([]);
  const [selectedCert, setSelectedCert] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCertificates = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/certificates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCerts(data.data.certificates || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-base-content font-display">
          Earned Certificates 📜
        </h1>
        <p className="text-sm text-base-content/60 mt-1">
          Download, share, and verify your official course completion
          credentials.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : certs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certs.map((c) => (
            <div
              key={c.id as string}
              className="card bg-base-100 shadow-md border border-base-200 hover:shadow-xl transition-all"
            >
              <div className="card-body p-6">
                <div className="w-full h-32 bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-primary/10 rounded-xl mb-4 flex flex-col items-center justify-center border border-amber-500/20">
                  <span className="text-4xl mb-1">📜</span>
                  <span className="text-[11px] font-mono text-amber-700 font-bold uppercase">
                    {c.certificateId as string}
                  </span>
                </div>

                <h3 className="font-bold text-base line-clamp-1">
                  {((c.course as Record<string, unknown>)?.title as string) ||
                    "Course Completion"}
                </h3>
                <p className="text-xs text-base-content/50 mt-1">
                  Issued on:{" "}
                  {new Date(
                    (c.issueDate as string) || Date.now(),
                  ).toLocaleDateString()}
                </p>

                <div className="card-actions justify-between items-center mt-6 pt-3 border-t border-base-200">
                  <span className="badge badge-success badge-sm">
                    Verified Official
                  </span>
                  <button
                    onClick={() => setSelectedCert(c)}
                    className="btn btn-primary btn-xs gap-1"
                  >
                    👁️ View Certificate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-base-content/40 bg-base-100 rounded-2xl border border-base-200 p-8">
          <p className="text-5xl mb-3">📜</p>
          <h3 className="font-bold text-lg text-base-content">
            No Certificates Earned Yet
          </h3>
          <p className="text-sm mt-1 mb-6">
            Complete 100% of any course module requirements to receive your
            official certificate.
          </p>
          <Link href="/student/my-courses" className="btn btn-primary btn-md">
            Go to My Courses
          </Link>
        </div>
      )}

      {/* Printable Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card bg-white text-slate-800 max-w-2xl w-full shadow-2xl animate-fade-in border-4 border-amber-500/30 p-8 relative">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 btn btn-ghost btn-circle btn-sm text-slate-500"
            >
              ✕
            </button>

            {/* Certificate Header */}
            <div className="text-center mb-6">
              <span className="text-4xl">🎓</span>
              <h2 className="text-2xl font-bold font-serif uppercase tracking-widest text-amber-800 mt-2">
                Certificate of Completion
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                LMS PRO OFFICIAL CREDENTIAL
              </p>
            </div>

            {/* Content */}
            <div className="text-center my-6 space-y-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                This is to certify that
              </p>
              <p className="text-2xl font-bold text-slate-900 border-b border-amber-500/30 pb-2 inline-block px-8">
                {((selectedCert.student as Record<string, unknown>)
                  ?.name as string) || "Student"}
              </p>
              <p className="text-xs text-slate-500 uppercase tracking-wider pt-2">
                has successfully completed the course
              </p>
              <p className="text-lg font-bold text-amber-900">
                {
                  (selectedCert.course as Record<string, unknown>)
                    ?.title as string
                }
              </p>
            </div>

            {/* Certificate Footer */}
            <div className="flex justify-between items-end mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500">
              <div>
                <p className="font-semibold text-slate-800">
                  {((selectedCert.issuedBy as Record<string, unknown>)
                    ?.name as string) || "Course Director"}
                </p>
                <p className="text-[10px] text-slate-400">
                  Authorized Signatory
                </p>
              </div>

              <div className="text-center">
                <p className="font-mono text-[11px] font-bold text-amber-800">
                  {selectedCert.certificateId as string}
                </p>
                <p className="text-[10px] text-slate-400">Credential ID</p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-slate-800">
                  {new Date(
                    (selectedCert.issueDate as string) || Date.now(),
                  ).toLocaleDateString()}
                </p>
                <p className="text-[10px] text-slate-400">Issue Date</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="btn btn-primary btn-sm"
              >
                🖨️ Print / Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

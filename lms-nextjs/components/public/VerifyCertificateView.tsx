"use client";

// components/public/VerifyCertificateView.tsx — Public Certificate Verification View
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function VerifyCertificateView({
  certificateId,
}: {
  certificateId: string;
}) {
  const [cert, setCert] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificate = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_URL}/certificates/verify/${certificateId}`,
      );
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Certificate verification failed");
      }
      setCert(data.data.certificate);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Certificate not found");
    } finally {
      setLoading(false);
    }
  }, [certificateId]);

  useEffect(() => {
    fetchCertificate();
  }, [fetchCertificate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
        <div className="card bg-base-100 max-w-md w-full shadow-xl text-center p-8 border border-base-300">
          <p className="text-5xl mb-3">❌</p>
          <h2 className="text-xl font-bold text-error">Invalid Certificate</h2>
          <p className="text-xs text-base-content/60 mt-2 mb-6">
            The certificate ID <strong>{certificateId}</strong> could not be
            verified in our official registry.
          </p>
          <Link href="/" className="btn btn-primary btn-sm">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const student = (cert.student || {}) as Record<string, unknown>;
  const course = (cert.course || {}) as Record<string, unknown>;
  const issuer = (cert.issuedBy || {}) as Record<string, unknown>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 p-4">
      <div className="card bg-white text-slate-800 max-w-2xl w-full shadow-2xl border-4 border-amber-500/30 p-8 relative animate-fade-in">
        <div className="text-center mb-6">
          <span className="text-5xl">📜</span>
          <div className="badge badge-success badge-lg py-3 px-4 font-bold mt-2">
            ✓ OFFICIAL VERIFIED CREDENTIAL
          </div>
          <h2 className="text-2xl font-bold font-serif uppercase tracking-widest text-amber-900 mt-3">
            Certificate of Completion
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            REGISTRY VERIFICATION SUCCESSFUL
          </p>
        </div>

        <div className="text-center my-6 space-y-3">
          <p className="text-xs text-slate-500 uppercase tracking-wider">
            This is to officially verify that
          </p>
          <p className="text-2xl font-bold text-slate-900 border-b border-amber-500/30 pb-2 inline-block px-8">
            {(student.name as string) || "Student"}
          </p>
          <p className="text-xs text-slate-500 uppercase tracking-wider pt-2">
            has completed the certified course
          </p>
          <p className="text-lg font-bold text-amber-900">
            {course.title as string}
          </p>
        </div>

        <div className="flex justify-between items-end mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-800">
              {(issuer.name as string) || "Course Director"}
            </p>
            <p className="text-[10px] text-slate-400">Authorized Signatory</p>
          </div>

          <div className="text-center">
            <p className="font-mono text-[11px] font-bold text-amber-800">
              {cert.certificateId as string}
            </p>
            <p className="text-[10px] text-slate-400">Public Credential ID</p>
          </div>

          <div className="text-right">
            <p className="font-semibold text-slate-800">
              {new Date(
                (cert.issueDate as string) || Date.now(),
              ).toLocaleDateString()}
            </p>
            <p className="text-[10px] text-slate-400">Issue Date</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// app/verify-certificate/[certificateId]/page.tsx
import type { Metadata } from "next";
import VerifyCertificateView from "@/components/public/VerifyCertificateView";

export const metadata: Metadata = { title: "Verify Certificate Credential" };

export default async function Page({ params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = await params;
  return <VerifyCertificateView certificateId={certificateId} />;
}

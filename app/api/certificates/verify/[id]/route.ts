// app/api/certificates/verify/[id]/route.ts — Public certificate verification
/**
 * @swagger
 * /certificates/verify/{id}:
 *   get:
 *     tags: [Certificates]
 *     summary: Verify a certificate by its public certificate ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Public certificate ID (e.g. CERT-ABC12345)
 *     responses:
 *       200:
 *         description: Certificate verified
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
import { NextRequest, NextResponse } from "next/server";
import mongo from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const cert = await mongo.certificate.findOne({
      filter: { certificateId: id },
      populate: {
        student: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } },
        issuedBy: { select: { id: true, name: true } },
      },
    });

    if (!cert) {
      return NextResponse.json(
        { success: false, message: "Certificate not found or invalid" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Certificate verified successfully",
      data: { certificate: cert },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Verification failed" },
      { status: 500 },
    );
  }
}

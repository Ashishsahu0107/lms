// app/api/contact/route.ts — Public Contact Support Form Submission Endpoint
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Full Name is required." },
        { status: 400 },
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "A valid Email Address is required." },
        { status: 400 },
      );
    }

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json(
        { success: false, message: "Subject is required." },
        { status: 400 },
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "Message is required." },
        { status: 400 },
      );
    }

    // Save to Database
    const contactRequest = await prisma.contactRequest.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        subject: subject.trim(),
        message: message.trim(),
        status: "NEW",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been submitted successfully.",
        data: contactRequest,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error submitting contact request:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit your request.",
      },
      { status: 500 },
    );
  }
}

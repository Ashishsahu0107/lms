// app/api/quizzes/[id]/route.ts — Get, Update, Delete single quiz
import { NextRequest, NextResponse } from "next/server";
import mongo from "@/lib/db";
import { authenticate, authorize } from "@/lib/middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quiz = await mongo.quiz.findOne({
      filter: { id },
      populate: {
        questions: true,
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { success: false, message: "Quiz not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { quiz } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch quiz";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const { id } = await params;
    const body = await req.json();
    const {
      title,
      description,
      instructions,
      duration,
      totalMarks,
      passingMarks,
      status,
      questions,
    } = body;

    const quiz = await mongo.quiz.findOneAndUpdate({
      filter: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(instructions !== undefined && { instructions }),
        ...(duration !== undefined && { duration: Number(duration) }),
        ...(totalMarks !== undefined && { totalMarks: Number(totalMarks) }),
        ...(passingMarks !== undefined && { passingMarks: Number(passingMarks) }),
        ...(status && { status }),
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { success: false, message: "Quiz not found" },
        { status: 404 }
      );
    }

    // If questions array is sent, sync questions
    if (Array.isArray(questions)) {
      await mongo.question.deleteMany({ filter: { quizId: id } });
      for (const q of questions) {
        if (q.question?.trim()) {
          await mongo.question.create({
            data: {
              quizId: id,
              type: q.type || "mcq",
              question: q.question.trim(),
              options: Array.isArray(q.options) ? q.options : [],
              correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer : [String(q.correctAnswer || "")],
              explanation: q.explanation || "",
              marks: Number(q.marks) || 5,
              difficulty: q.difficulty || "medium",
            },
          });
        }
      }
    }

    const updatedQuiz = await mongo.quiz.findOne({
      filter: { id },
      populate: { questions: true },
    });

    return NextResponse.json({
      success: true,
      message: "Quiz updated successfully",
      data: { quiz: updatedQuiz },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update quiz";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const { id } = await params;

    await mongo.question.deleteMany({ filter: { quizId: id } });
    await mongo.quizAttempt.deleteMany({ filter: { quizId: id } });
    await mongo.quiz.findOneAndDelete({ filter: { id } });

    return NextResponse.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete quiz";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

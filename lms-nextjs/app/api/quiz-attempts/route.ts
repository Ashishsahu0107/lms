// app/api/quiz-attempts/route.ts — Quiz Attempts API
/**
 * @swagger
 * /quiz-attempts:
 *   get:
 *     tags: [Quiz Attempts]
 *     summary: Get quiz attempts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: quizId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Attempts list
 *   post:
 *     tags: [Quiz Attempts]
 *     summary: Start or Submit quiz attempt
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quizId]
 *             properties:
 *               quizId: { type: string }
 *               answers: { type: array, items: { type: object } }
 *     responses:
 *       201:
 *         description: Attempt processed
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");
    const studentId = searchParams.get("studentId");

    const where: Record<string, string> = {};
    if (quizId) where.quizId = quizId;
    if (studentId) where.studentId = studentId;
    if (user!.role === "student") where.studentId = user!.id;

    const attempts = await prisma.quizAttempt.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true } },
        quiz: { select: { id: true, title: true, totalMarks: true, passingMarks: true } },
        answers: { include: { question: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { attempts } });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch quiz attempts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    const { quizId, answers, timeSpent } = await req.json();
    if (!quizId) {
      return NextResponse.json({ success: false, message: "quizId is required" }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });
    if (!quiz) {
      return NextResponse.json({ success: false, message: "Quiz not found" }, { status: 404 });
    }

    // Auto-grade attempt
    let totalScore = 0;
    const answerData: Array<{ questionId: string; selectedAnswers: string[]; isFlagged?: boolean }> = [];

    if (answers && Array.isArray(answers)) {
      for (const ans of answers) {
        const question = quiz.questions.find((q) => q.id === ans.questionId);
        if (question) {
          const isCorrect =
            JSON.stringify(question.correctAnswer.sort()) ===
            JSON.stringify((ans.selectedAnswers || []).sort());
          if (isCorrect) totalScore += question.marks;
        }
        answerData.push({
          questionId: ans.questionId,
          selectedAnswers: ans.selectedAnswers || [],
          isFlagged: ans.isFlagged || false,
        });
      }
    }

    const accuracy = quiz.totalMarks > 0 ? (totalScore / quiz.totalMarks) * 100 : 0;

    const attempt = await prisma.quizAttempt.create({
      data: {
        studentId: user!.id,
        quizId,
        score: totalScore,
        status: "completed",
        accuracy,
        timeSpent: timeSpent || 0,
        submittedAt: new Date(),
        answers: { create: answerData },
      },
      include: { quiz: true, answers: true },
    });

    // Award XP to student
    if (totalScore > 0) {
      await prisma.user.update({
        where: { id: user!.id },
        data: { xp: { increment: totalScore } },
      });
    }

    return NextResponse.json({ success: true, message: "Quiz submitted and graded", data: { attempt } }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Submission failed";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}

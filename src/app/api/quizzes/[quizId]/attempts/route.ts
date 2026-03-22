import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { notifyQuizAttempted } from "@/lib/community-notifications";

const submitAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionIds: z.array(z.string()).optional(),
      textAnswer: z.string().optional(),
    })
  ),
});

async function getAuthorizedSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) return null;
  if (!["STUDENT", "INSTRUCTOR"].includes(session.user.role)) return null;
  return session;
}

interface RouteContext {
  params: Promise<{ quizId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await getAuthorizedSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quizId } = await context.params;

  try {
    const body = await request.json();
    const data = submitAttemptSchema.parse(body);

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 });
    }

    if (!quiz.isPublished && quiz.createdById !== session.user.id) {
      return NextResponse.json({ success: false, error: "Quiz is not available" }, { status: 403 });
    }

    const answersByQuestion = new Map(data.answers.map((answer) => [answer.questionId, answer]));

    let total = quiz.questions.length;
    let score = 0;

    const answerRows = quiz.questions.map((question) => {
      const provided = answersByQuestion.get(question.id);
      let isCorrect = false;

      if (question.type === "SHORT_ANSWER") {
        const textAnswer = (provided?.textAnswer || "").trim();
        isCorrect = textAnswer.length > 0;
      } else {
        const selected = new Set(provided?.selectedOptionIds || []);
        const correctOptionIds = new Set(
          question.options.filter((option) => option.isCorrect).map((option) => option.id)
        );

        isCorrect =
          selected.size === correctOptionIds.size &&
          Array.from(correctOptionIds).every((id) => selected.has(id));
      }

      if (isCorrect) score += 1;

      return {
        questionId: question.id,
        selectedOptionId: provided?.selectedOptionIds?.[0] || null,
        textAnswer: provided?.textAnswer || null,
        isCorrect,
      };
    });

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        studentId: session.user.id,
        score,
        total,
        submittedAt: new Date(),
        answers: {
          create: answerRows,
        },
      },
      select: {
        id: true,
        score: true,
        total: true,
        submittedAt: true,
      },
    });

    await notifyQuizAttempted({
      actorId: session.user.id,
      recipientId: quiz.createdById,
      title: "A learner submitted your quiz",
      description: `${quiz.title} - Score ${attempt.score}/${attempt.total}`,
      href: "/quizzes",
    });

    return NextResponse.json({ success: true, attempt });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Invalid attempt data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to submit quiz attempt" },
      { status: 500 }
    );
  }
}

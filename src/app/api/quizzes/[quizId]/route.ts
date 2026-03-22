import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

const questionSchema = z.object({
  text: z.string().min(2, "Question text is required"),
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
  options: z.array(
    z.object({
      text: z.string().min(1, "Option text is required"),
      isCorrect: z.boolean().default(false),
    })
  ),
});

const updateQuizSchema = z.object({
  title: z.string().trim().min(3, "Quiz title must be at least 3 characters").optional(),
  description: z.string().trim().optional(),
  isPublished: z.boolean().optional(),
  questions: z.array(questionSchema).min(1, "At least one question is required").optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ quizId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { quizId } = await context.params;

  try {
    const parsed = updateQuizSchema.parse(await request.json());

    if (
      parsed.title === undefined &&
      parsed.description === undefined &&
      parsed.isPublished === undefined &&
      parsed.questions === undefined
    ) {
      return NextResponse.json(
        { success: false, error: "No quiz changes were provided" },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, createdById: true },
    });

    if (!quiz) {
      return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 });
    }

    if (quiz.createdById !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You can only edit quizzes you created" },
        { status: 403 }
      );
    }

    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        ...(parsed.title !== undefined ? { title: parsed.title } : {}),
        ...(parsed.description !== undefined
          ? { description: parsed.description.length ? parsed.description : null }
          : {}),
        ...(parsed.isPublished !== undefined ? { isPublished: parsed.isPublished } : {}),
        ...(parsed.questions !== undefined
          ? {
              questions: {
                deleteMany: {},
                create: parsed.questions.map((question, questionIndex) => ({
                  text: question.text,
                  type: question.type,
                  order: questionIndex,
                  options: {
                    create: question.options.map((option, optionIndex) => ({
                      text: option.text,
                      isCorrect: option.isCorrect,
                      order: optionIndex,
                    })),
                  },
                })),
              },
            }
          : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        isPublished: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, quiz: updatedQuiz });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Invalid quiz data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update quiz" },
      { status: 500 }
    );
  }
}

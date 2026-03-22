import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { notifyQuizPublished } from "@/lib/community-notifications";

const createQuizSchema = z.object({
  title: z.string().min(3, "Quiz title is required"),
  description: z.string().optional(),
  courseId: z.string().optional(),
  isPublished: z.boolean().default(true),
  questions: z
    .array(
      z.object({
        text: z.string().min(2, "Question text is required"),
        type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
        options: z.array(
          z.object({
            text: z.string().min(1, "Option text is required"),
            isCorrect: z.boolean().default(false),
          })
        ),
      })
    )
    .min(1, "At least one question is required"),
});

async function getAuthorizedSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) return null;
  if (!["STUDENT", "INSTRUCTOR"].includes(session.user.role)) return null;
  return session;
}

export async function GET() {
  try {
    const session = await getAuthorizedSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const whereClause =
      session.user.role === "INSTRUCTOR"
        ? {
            OR: [
              { isPublished: true },
              { createdById: session.user.id },
            ],
          }
        : {
            isPublished: true,
          };

    const quizzes = await prisma.quiz.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
          },
        },
        questions: {
          orderBy: { order: "asc" },
          include: {
            options: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                text: true,
                isCorrect: true,
              },
            },
          },
        },
        attempts: {
          where: {
            studentId: session.user.id,
          },
          orderBy: { startedAt: "desc" },
          take: 1,
          select: {
            id: true,
            score: true,
            total: true,
            submittedAt: true,
          },
        },
      },
    });

    const sanitizedQuizzes =
      session.user.role === "INSTRUCTOR"
        ? quizzes
        : quizzes.map((quiz) => ({
            ...quiz,
            questions: quiz.questions.map((question) => ({
              ...question,
              options: question.options.map((option) => ({
                ...option,
                isCorrect: false,
              })),
            })),
          }));

    return NextResponse.json({ success: true, quizzes: sanitizedQuizzes });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to load quizzes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getAuthorizedSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "INSTRUCTOR") {
    return NextResponse.json(
      { success: false, error: "Only instructors can create quizzes" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const data = createQuizSchema.parse(body);

    if (data.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: data.courseId },
        select: { id: true, instructorId: true },
      });

      if (!course || course.instructorId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: "You can only attach quizzes to your own courses" },
          { status: 403 }
        );
      }
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: data.title,
        description: data.description || null,
        courseId: data.courseId || null,
        isPublished: data.isPublished,
        createdById: session.user.id,
        questions: {
          create: data.questions.map((question, questionIndex) => ({
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
      },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    if (quiz.isPublished) {
      await notifyQuizPublished({
        actorId: session.user.id,
        title: "New quiz published",
        description: quiz.title,
        href: "/quizzes",
      });
    }

    return NextResponse.json({ success: true, quiz });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Invalid quiz data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}

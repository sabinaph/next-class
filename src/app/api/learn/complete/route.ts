import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const makeCertificateNumber = () =>
  `CERT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const makeVerificationCode = () =>
  `${Math.random().toString(36).slice(2, 8)}${Date.now()
    .toString(36)
    .slice(-6)}`.toUpperCase();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      courseId?: string;
      lessonId?: string;
    };

    const courseId = body.courseId?.trim();
    const lessonId = body.lessonId?.trim();

    if (!courseId || !lessonId) {
      return NextResponse.json(
        { error: "courseId and lessonId are required." },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        courseId,
        isPublished: true,
      },
      select: {
        id: true,
        courseId: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
    }

    const [purchasedOrder, course] = await Promise.all([
      prisma.order.findFirst({
        where: {
          userId: session.user.id,
          status: "COMPLETED",
          items: {
            some: {
              courseId,
            },
          },
        },
        select: { id: true },
      }),
      prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, instructorId: true, title: true },
      }),
    ]);

    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    const isInstructor = course.instructorId === session.user.id;
    if (!purchasedOrder && !isInstructor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId,
        },
      },
      create: {
        userId: session.user.id,
        courseId,
        lessonId,
      },
      update: {
        completedAt: new Date(),
      },
    });

    const [totalPublishedLessons, completedLessons] = await Promise.all([
      prisma.lesson.count({
        where: {
          courseId,
          isPublished: true,
        },
      }),
      prisma.lessonProgress.count({
        where: {
          courseId,
          userId: session.user.id,
          lesson: {
            isPublished: true,
          },
        },
      }),
    ]);

    let courseCompleted = false;
    let certificateId: string | null = null;

    if (totalPublishedLessons > 0 && completedLessons >= totalPublishedLessons) {
      courseCompleted = true;

      const certificate = await prisma.certificate.upsert({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId,
          },
        },
        create: {
          studentId: session.user.id,
          courseId,
          certificateNumber: makeCertificateNumber(),
          verificationCode: makeVerificationCode(),
          isValid: true,
        },
        update: {
          isValid: true,
        },
        select: {
          id: true,
        },
      });

      certificateId = certificate.id;

      await prisma.certificate.update({
        where: { id: certificate.id },
        data: {
          certificateUrl: `/api/certificates/${certificate.id}/download`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      courseCompleted,
      certificateId,
      completedLessons,
      totalLessons: totalPublishedLessons,
    });
  } catch (error) {
    console.error("Failed to complete lesson", error);
    return NextResponse.json(
      { error: "Failed to mark lesson as complete." },
      { status: 500 }
    );
  }
}

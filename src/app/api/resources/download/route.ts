import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { signDownloadToken } from "@/lib/download-token";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const lessonId = url.searchParams.get("lessonId");

    if (!lessonId) {
      return new NextResponse("lessonId is required", { status: 400 });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            id: true,
            instructorId: true,
          },
        },
      },
    });

    if (!lesson || !lesson.content) {
      return new NextResponse("Resource not found", { status: 404 });
    }

    const isOwnerInstructor = lesson.course.instructorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    let hasAccess = isOwnerInstructor || isAdmin;

    if (!hasAccess) {
      const enrollment = await prisma.order.findFirst({
        where: {
          userId: session.user.id,
          status: "COMPLETED",
          items: {
            some: {
              courseId: lesson.course.id,
            },
          },
        },
        select: { id: true },
      });

      hasAccess = !!enrollment;
    }

    if (!hasAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await prisma.downloadLog.create({
      data: {
        userId: session.user.id,
        courseId: lesson.course.id,
        lessonId: lesson.id,
        fileUrl: lesson.content,
      },
    });

    const token = signDownloadToken({
      userId: session.user.id,
      lessonId: lesson.id,
      fileUrl: lesson.content,
      exp: Date.now() + 1000 * 60 * 5,
    });

    const serveUrl = new URL(`/api/resources/serve?token=${encodeURIComponent(token)}`, req.url);
    return NextResponse.redirect(serveUrl);
  } catch (error) {
    console.error("[RESOURCE_DOWNLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

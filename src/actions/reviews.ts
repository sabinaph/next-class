"use server";

import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function createOrUpdateReview(
  courseId: string,
  rating: number,
  comment: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const hasEnrollment = await prisma.order.findFirst({
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
  });

  if (!hasEnrollment) {
    throw new Error("You can review only purchased resources");
  }

  await prisma.review.upsert({
    where: {
      studentId_courseId: {
        studentId: session.user.id,
        courseId,
      },
    },
    update: {
      rating,
      comment,
    },
    create: {
      courseId,
      studentId: session.user.id,
      rating,
      comment,
    },
  });

  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/instructor/courses/${courseId}`);
}

export async function replyToReview(reviewId: string, reply: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "INSTRUCTOR") {
    throw new Error("Unauthorized");
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      course: {
        select: {
          id: true,
          instructorId: true,
        },
      },
    },
  });

  if (!review || review.course.instructorId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: {
      instructorReply: reply.trim() || null,
      repliedAt: reply.trim() ? new Date() : null,
    },
  });

  revalidatePath(`/courses/${review.course.id}`);
  revalidatePath(`/instructor/courses/${review.course.id}`);
}


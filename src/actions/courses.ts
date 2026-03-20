"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function getPublicCourse(id: string) {
  const course = await prisma.course.findUnique({
    where: {
      id,
      isPublished: true, // Only published courses
    },
    include: {
      instructor: {
        select: {
          name: true,
          firstName: true,
          lastName: true,
          image: true,
        },
      },
      lessons: {
        where: { isPublished: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          type: true,
          duration: true,
          isFree: true, // For preview
        },
      },
      reviews: {
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      waitlists: {
        select: {
          id: true,
          studentId: true,
        },
      },
      _count: {
        select: {
          reviews: true,
          bookings: true,
          lessons: true,
        },
      },
    },
  });

  if (!course) return null;

  // Check if current user has wishlisted
  let isWishlisted = false;
  let isWaitlisted = false;
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    const count = await prisma.wishlist.count({
      where: {
        userId: session.user.id,
        courseId: id,
      },
    });
    isWishlisted = count > 0;

    const waitCount = await prisma.waitlist.count({
      where: {
        studentId: session.user.id,
        courseId: id,
      },
    });
    isWaitlisted = waitCount > 0;
  }

  const isFull = course._count.bookings >= course.maxStudents;

  return { ...course, isWishlisted, isWaitlisted, isFull };
}

export async function toggleWishlist(courseId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (existing) {
    await prisma.wishlist.delete({
      where: { id: existing.id },
    });
    revalidatePath(`/courses/${courseId}`);
    return false; // Removed
  } else {
    await prisma.wishlist.create({
      data: {
        userId,
        courseId,
      },
    });
    revalidatePath(`/courses/${courseId}`);
    return true; // Added
  }
}

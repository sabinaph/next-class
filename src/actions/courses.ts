"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function getPublicCourse(id: string) {
  const prismaAny = prisma as unknown as {
    order?: {
      count: (args: unknown) => Promise<number>;
    };
  };

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
      },
      waitlists: {
        select: {
          id: true,
          studentId: true,
        },
      },
      announcements: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
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
  let canReview = false;
  let userReview: {
    id: string;
    rating: number;
    comment: string | null;
  } | null = null;
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

    if (session.user.role === "STUDENT") {
      const confirmed = prismaAny.order?.count
        ? await prismaAny.order.count({
            where: {
              userId: session.user.id,
              status: "COMPLETED",
              items: {
                some: {
                  courseId: id,
                },
              },
            },
          })
        : await prisma.booking.count({
            where: {
              studentId: session.user.id,
              courseId: id,
              status: "CONFIRMED",
            },
          });
      canReview = confirmed > 0;

      userReview = await prisma.review.findUnique({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId: id,
          },
        },
        select: {
          id: true,
          rating: true,
          comment: true,
        },
      });
    }
  }

  const isFull = course._count.bookings >= course.maxStudents;
  const canViewAnnouncements = !!session?.user?.id;
  const visibleAnnouncements = canViewAnnouncements ? course.announcements : [];

  return {
    ...course,
    announcements: visibleAnnouncements,
    canViewAnnouncements,
    canReview,
    userReview,
    isWishlisted,
    isWaitlisted,
    isFull,
  };
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

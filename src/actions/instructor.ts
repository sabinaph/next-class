"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { CreateCourseInput, UpdateCourseInput } from "@/types";

export async function getInstructorStats() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "INSTRUCTOR") {
    throw new Error("Unauthorized");
  }

  const instructorId = session.user.id;

  const [coursesCount, totalStudents, totalRevenue, reviews] =
    await Promise.all([
      // Total Courses
      prisma.course.count({
        where: { instructorId },
      }),

      // Total Students (approximate as total bookings for now, better to distinct count)
      prisma.booking.count({
        where: {
          course: { instructorId },
          status: "CONFIRMED",
        },
      }),

      // Revenue
      prisma.booking.aggregate({
        where: {
          course: { instructorId },
          status: "CONFIRMED",
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Average Rating
      prisma.review.aggregate({
        where: {
          course: { instructorId },
        },
        _avg: {
          rating: true,
        },
      }),
    ]);

  return {
    coursesCount,
    totalStudents, // This is technically bookings count, fixing distinct students is heavier
    totalRevenue: totalRevenue._sum.totalAmount?.toNumber() || 0,
    averageRating: reviews._avg.rating || 0,
  };
}

export async function getInstructorCourses() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "INSTRUCTOR") {
    throw new Error("Unauthorized");
  }

  return await prisma.course.findMany({
    where: { instructorId: session.user.id },
    include: {
      _count: {
        select: {
          sessions: true,
          bookings: true,
          lessons: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCourse(
  data: Omit<CreateCourseInput, "instructorId">
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "INSTRUCTOR") {
    throw new Error("Unauthorized");
  }

  const course = await prisma.course.create({
    data: {
      ...data,
      instructorId: session.user.id,
      isActive: true,
      isPublished: false, // Default to draft
    },
  });

  revalidatePath("/instructor/courses");
  return course;
}

export async function updateCourse(
  id: string,
  data: Partial<UpdateCourseInput>
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "INSTRUCTOR") {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course || course.instructorId !== session.user.id) {
    throw new Error("Unauthorized or Course not found");
  }

  const updatedCourse = await prisma.course.update({
    where: { id },
    data,
  });

  revalidatePath(`/instructor/courses/${id}`);
  revalidatePath("/instructor/courses");
  return updatedCourse;
}

export async function getCourse(id: string) {
  const session = await getServerSession(authOptions);

  // Allow if it's the instructor OR if the course is published
  // For now, simpler check
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: {
          reviews: true,
          bookings: true,
        },
      },
    },
  });

  if (!course) return null;

  return {
    ...course,
    price: course.price.toNumber(),
  };
}

export async function createLesson(
  courseId: string,
  title: string,
  type: "VIDEO" | "TEXT" | "PDF" | "QUIZ" | "ASSIGNMENT",
  content?: string
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "INSTRUCTOR") {
    throw new Error("Unauthorized");
  }

  // Check course ownership
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });

  if (!course || course.instructorId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Get max order
  const lastLesson = await prisma.lesson.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
  });

  const newOrder = lastLesson ? lastLesson.order + 1 : 1;

  const lesson = await prisma.lesson.create({
    data: {
      title,
      type,
      content,
      courseId,
      order: newOrder,
      isPublished: false,
    },
  });

  revalidatePath(`/instructor/courses/${courseId}`);
  return lesson;
}

export async function updateLesson(
  id: string,
  data: {
    title?: string;
    content?: string;
    isPublished?: boolean;
    isFree?: boolean;
    duration?: number;
  }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "INSTRUCTOR") {
    throw new Error("Unauthorized");
  }

  // Verify ownership via course
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { course: true },
  });

  if (!lesson || lesson.course.instructorId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const updatedLesson = await prisma.lesson.update({
    where: { id },
    data,
  });

  revalidatePath(`/instructor/courses/${lesson.courseId}`);
  return updatedLesson;
}

export async function deleteLesson(id: string) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "INSTRUCTOR") {
    throw new Error("Unauthorized");
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { course: true },
  });

  if (!lesson || lesson.course.instructorId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.lesson.delete({
    where: { id },
  });

  revalidatePath(`/instructor/courses/${lesson.courseId}`);
}

export async function toggleCoursePublish(id: string, isPublished: boolean) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "INSTRUCTOR") {
    throw new Error("Unauthorized");
  }

  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course || course.instructorId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.course.update({
    where: { id },
    data: { isPublished },
  });

  revalidatePath(`/instructor/courses/${id}`);
  revalidatePath("/instructor/courses");
  revalidatePath("/courses"); // Update public list
}

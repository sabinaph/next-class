"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

type AnnouncementPayload = {
  courseId: string;
  title: string;
  content: string;
};

async function getInstructorId() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "INSTRUCTOR") {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function getInstructorAnnouncements() {
  const instructorId = await getInstructorId();

  const announcements = await prisma.announcement.findMany({
    where: { instructorId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return announcements;
}

export async function createInstructorAnnouncement(payload: AnnouncementPayload) {
  const instructorId = await getInstructorId();

  const title = payload.title.trim();
  const content = payload.content.trim();

  if (!payload.courseId || !title || !content) {
    throw new Error("Course, title, and content are required.");
  }

  const course = await prisma.course.findFirst({
    where: {
      id: payload.courseId,
      instructorId,
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!course) {
    throw new Error("Invalid course selection.");
  }

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      courseId: course.id,
      instructorId,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  revalidatePath("/instructor/announcements");

  return announcement;
}

export async function deleteInstructorAnnouncement(id: string) {
  const instructorId = await getInstructorId();

  const existing = await prisma.announcement.findFirst({
    where: {
      id,
      instructorId,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw new Error("Announcement not found.");
  }

  await prisma.announcement.delete({
    where: { id },
  });

  revalidatePath("/instructor/announcements");
}

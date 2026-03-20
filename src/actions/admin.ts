"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createInstructorSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export type CreateInstructorInput = z.infer<typeof createInstructorSchema>;

export async function createInstructor(data: CreateInstructorInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const validated = createInstructorSchema.parse(data);

    // Check existing
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: validated.email }, { username: validated.username }],
      },
    });

    if (existing) {
      throw new Error("User with this email or username already exists");
    }

    const passwordHash = await bcrypt.hash(validated.password, 12);

    const user = await prisma.user.create({
      data: {
        username: validated.username,
        email: validated.email,
        passwordHash,
        firstName: validated.firstName,
        lastName: validated.lastName,
        name: `${validated.firstName} ${validated.lastName}`,
        role: "INSTRUCTOR",
        emailVerified: new Date(), // Verified immediately
        isActive: true,
        createdBy: session.user.id,
      },
    });

    // Create audit log
    await prisma.audit.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entityType: "User",
        entityId: user.id,
        metadata: {
          role: "INSTRUCTOR",
          createdUserEmail: user.email,
        },
      },
    });

    revalidatePath("/admin/instructors");
    return { success: true };
  } catch (error) {
    console.error("Failed to create instructor:", error);
    throw error;
  }
}

export async function setCoursePublishState(courseId: string, isPublished: boolean) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { isPublished },
  });

  await prisma.audit.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      entityType: "Course",
      entityId: courseId,
      metadata: { isPublished },
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

function makeCertificateNumber() {
  return `CERT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function makeVerificationCode() {
  return `${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-6)}`.toUpperCase();
}

export async function generateMissingCertificates() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const confirmedBookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
    },
    select: {
      studentId: true,
      courseId: true,
    },
  });

  let generated = 0;

  for (const booking of confirmedBookings) {
    const existing = await prisma.certificate.findUnique({
      where: {
        studentId_courseId: {
          studentId: booking.studentId,
          courseId: booking.courseId,
        },
      },
    });

    if (!existing) {
      await prisma.certificate.create({
        data: {
          studentId: booking.studentId,
          courseId: booking.courseId,
          certificateNumber: makeCertificateNumber(),
          verificationCode: makeVerificationCode(),
          isValid: true,
        },
      });
      generated += 1;
    }
  }

  revalidatePath("/admin/certificates");
  return { generated };
}

export async function toggleCertificateValidity(certificateId: string, isValid: boolean) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.certificate.update({
    where: { id: certificateId },
    data: { isValid },
  });

  await prisma.audit.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      entityType: "Certificate",
      entityId: certificateId,
      metadata: { isValid },
    },
  });

  revalidatePath("/admin/certificates");
}

export async function setUserActiveState(userId: string, isActive: boolean) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });

  await prisma.audit.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      entityType: "User",
      entityId: userId,
      metadata: { isActive },
    },
  });

  revalidatePath("/admin/students");
  revalidatePath("/admin/instructors");
}

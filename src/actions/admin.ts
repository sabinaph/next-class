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

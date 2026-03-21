import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

const instructorApplicationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().optional(),
  studyBackground: z.string().min(5, "Study background is required"),
  hobbies: z.string().min(2, "Hobbies are required"),
  expertise: z.string().optional(),
  bio: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = instructorApplicationSchema.parse(body);

    const existingPending = await prisma.instructorApplication.findFirst({
      where: {
        email: data.email,
        status: "PENDING",
      },
      select: { id: true },
    });

    if (existingPending) {
      return NextResponse.json(
        { success: false, error: "You already have a pending application." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, role: true },
    });

    if (existingUser?.role === "INSTRUCTOR") {
      return NextResponse.json(
        { success: false, error: "This email is already an instructor account." },
        { status: 400 }
      );
    }

    const application = await prisma.instructorApplication.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber || null,
        studyBackground: data.studyBackground,
        hobbies: data.hobbies,
        expertise: data.expertise || null,
        bio: data.bio || null,
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully.",
      data: application,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0]?.message || "Invalid form data",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit application",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

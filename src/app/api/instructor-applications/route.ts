import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

const instructorApplicationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().min(5, "Phone number is required"),
  countryLocation: z.string().min(2, "Country / Location is required"),

  currentJob: z.string().min(2, "Current job is required"),
  yearsOfExperience: z.number().int().min(0, "Years of experience is required"),
  areaOfExpertise: z.string().min(2, "Area of expertise is required"),
  shortBio: z.string().min(10, "Short bio is required"),

  courseTitle: z
    .string()
    .trim()
    .min(2, "Course title must be at least 2 characters")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
  courseCategory: z
    .string()
    .trim()
    .min(2, "Course category must be at least 2 characters")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
  courseLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  courseDescription: z
    .string()
    .trim()
    .min(10, "Course description must be at least 10 characters")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),

  hasTaughtBefore: z.boolean(),
  teachingExperienceDetails: z.string().optional(),
  previousCourseLinks: z.string().optional(),
  portfolioLinks: z.string().optional(),

  sampleVideoFileUrl: z.string().optional(),
  sampleVideoLink: z.string().optional(),

  hasRecordingEquipment: z.boolean(),
  willCreateVideoCourses: z.boolean(),
  canPromoteCourse: z.boolean(),
  socialMediaLinks: z.string().optional(),

  agreedToTerms: z.literal(true),
  agreedToRevenueShare: z.literal(true),

  studyBackground: z.string().min(5, "Study background is required"),
  hobbies: z.string().min(2, "Hobbies are required"),
}).superRefine((data, ctx) => {
  if (!data.sampleVideoFileUrl && !data.sampleVideoLink) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide sample course upload or course link",
      path: ["sampleVideoLink"],
    });
  }

  if (data.hasTaughtBefore && !data.teachingExperienceDetails) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Teaching experience details are required",
      path: ["teachingExperienceDetails"],
    });
  }
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
        phoneNumber: data.phoneNumber,
        countryLocation: data.countryLocation,

        currentJob: data.currentJob,
        yearsOfExperience: data.yearsOfExperience,
        areaOfExpertise: data.areaOfExpertise,
        shortBio: data.shortBio,

        courseTitle: data.courseTitle,
        courseCategory: data.courseCategory,
        courseLevel: data.courseLevel,
        courseDescription: data.courseDescription,

        hasTaughtBefore: data.hasTaughtBefore,
        teachingExperienceDetails: data.teachingExperienceDetails || null,
        previousCourseLinks: data.previousCourseLinks || null,
        portfolioLinks: data.portfolioLinks || null,

        sampleVideoFileUrl: data.sampleVideoFileUrl || null,
        sampleVideoLink: data.sampleVideoLink || null,

        hasRecordingEquipment: data.hasRecordingEquipment,
        willCreateVideoCourses: data.willCreateVideoCourses,
        canPromoteCourse: data.canPromoteCourse,
        socialMediaLinks: data.socialMediaLinks || null,

        agreedToTerms: data.agreedToTerms,
        agreedToRevenueShare: data.agreedToRevenueShare,

        studyBackground: data.studyBackground,
        hobbies: data.hobbies,
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

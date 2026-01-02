import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { ApiResponse } from "@/types";
import { sendOTP } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, username, gender } = body;

    // Validation
    if (!firstName || !lastName || !email || !password || !username) {
      const response: ApiResponse = {
        success: false,
        error: "All fields are required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (password.length < 8) {
      const response: ApiResponse = {
        success: false,
        error: "Password must be at least 8 characters long",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        error: "An account with this email/username already exists",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        gender,
        passwordHash,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        role: "STUDENT",
        isActive: true,
        emailVerified: null,
        otp,
        otpExpires,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Send OTP Email
    const emailSent = await sendOTP(email, otp);

    if (!emailSent) {
      // Rollback: delete the created user so they can try again
      await prisma.user.delete({
        where: { id: user.id },
      });

      return NextResponse.json(
        {
          success: false,
          error: "Failed to send verification email. Please try again later.",
        },
        { status: 500 }
      );
    }

    // Create audit log
    await prisma.audit.create({
      data: {
        userId: user.id,
        action: "CREATE",
        entityType: "User",
        entityId: user.id,
        metadata: {
          email: user.email,
          role: user.role,
        },
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip"),
        userAgent: request.headers.get("user-agent"),
      },
    });

    const response: ApiResponse = {
      success: true,
      data: user,
      message: "Account created successfully. Please verify your email.",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);

    const response: ApiResponse = {
      success: false,
      error: "Failed to create account",
      message: error instanceof Error ? error.message : "Unknown error",
    };

    return NextResponse.json(response, { status: 500 });
  }
}

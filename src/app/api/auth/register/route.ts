import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      const response: ApiResponse = {
        success: false,
        error: 'All fields are required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (password.length < 8) {
      const response: ApiResponse = {
        success: false,
        error: 'Password must be at least 8 characters long',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        error: 'An account with this email already exists',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        role: 'STUDENT',
        isActive: true,
        emailVerified: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Create audit log
    await prisma.audit.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        entityType: 'User',
        entityId: user.id,
        metadata: {
          email: user.email,
          role: user.role,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'Account created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);

    const response: ApiResponse = {
      success: false,
      error: 'Failed to create account',
      message: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export async function updateAdminProfile(input: UpdateProfileInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  // Verify user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, passwordHash: true, email: true },
  });

  if (!user || user.role !== "ADMIN") {
    throw new Error("Admin access required");
  }

  // Validate input
  const updates: any = {};

  // Update basic info
  if (input.firstName) {
    if (input.firstName.length < 2) {
      throw new Error("First name must be at least 2 characters");
    }
    updates.firstName = input.firstName;
  }

  if (input.lastName) {
    if (input.lastName.length < 2) {
      throw new Error("Last name must be at least 2 characters");
    }
    updates.lastName = input.lastName;
  }

  if (input.phoneNumber) {
    if (!/^\+?[\d\s\-()]{7,}$/.test(input.phoneNumber)) {
      throw new Error("Invalid phone number format");
    }
    updates.phoneNumber = input.phoneNumber;
  }

  // Handle email change
  if (input.email && input.email !== user.email) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error("This email is already in use");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      throw new Error("Invalid email format");
    }

    updates.email = input.email;
  }

  // Handle password change
  if (input.newPassword) {
    if (!input.currentPassword) {
      throw new Error("Current password is required to change password");
    }

    // Verify current password
    if (!user.passwordHash) {
      throw new Error("Current password verification failed");
    }

    const isPasswordValid = await bcrypt.compare(
      input.currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Validate new password
    if (input.newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    if (input.newPassword !== input.confirmPassword) {
      throw new Error("New password and confirmation do not match");
    }

    if (input.newPassword === input.currentPassword) {
      throw new Error("New password must be different from current password");
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10);
    updates.passwordHash = hashedPassword;
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: updates,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      image: true,
      name: true,
    },
  });

  return {
    success: true,
    message: "Profile updated successfully",
    user: updatedUser,
  };
}

export async function getAdminProfile() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      image: true,
      role: true,
      createdAt: true,
      emailVerified: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    throw new Error("Admin access required");
  }

  return user;
}


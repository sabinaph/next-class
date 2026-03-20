"use server";

import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

async function requireStudent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function addToCart(courseId: string) {
  const userId = await requireStudent();

  const existingBooking = await prisma.booking.findFirst({
    where: {
      studentId: userId,
      courseId,
      status: "CONFIRMED",
    },
    select: { id: true },
  });

  if (existingBooking) {
    throw new Error("Resource already purchased");
  }

  await prisma.cartItem.upsert({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    update: {},
    create: {
      userId,
      courseId,
    },
  });

  revalidatePath("/cart");
  revalidatePath(`/courses/${courseId}`);
}

export async function removeFromCart(courseId: string) {
  const userId = await requireStudent();

  await prisma.cartItem.deleteMany({
    where: {
      userId,
      courseId,
    },
  });

  revalidatePath("/cart");
  revalidatePath(`/courses/${courseId}`);
}

export async function getCart() {
  const userId = await requireStudent();

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          price: true,
          thumbnail: true,
          instructor: {
            select: {
              firstName: true,
              lastName: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const total = items.reduce((sum, item) => sum + item.course.price.toNumber(), 0);

  return {
    items,
    total,
  };
}

export async function createOrderFromCart() {
  const userId = await requireStudent();

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          price: true,
        },
      },
    },
  });

  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.course.price.toNumber(),
    0
  );

  await prisma.order.create({
    data: {
      userId,
      status: "PENDING",
      totalAmount,
      items: {
        create: cartItems.map((item) => ({
          courseId: item.course.id,
          priceAtPurchase: item.course.price,
        })),
      },
    },
  });

  await prisma.cartItem.deleteMany({
    where: { userId },
  });

  revalidatePath("/cart");
  revalidatePath("/profile");
  revalidatePath("/profile/orders");
}

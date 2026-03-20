import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = (await req.json()) as { courseId?: string };

    if (!courseId) {
      return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
    }

    const [course, alreadyPurchased] = await Promise.all([
      prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, price: true },
      }),
      prisma.orderItem.findFirst({
        where: {
          courseId,
          order: {
            userId: session.user.id,
            status: "COMPLETED",
          },
        },
        select: { id: true },
      }),
    ]);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (alreadyPurchased) {
      return NextResponse.json({ error: "Course already purchased" }, { status: 400 });
    }

    const existingPendingOrder = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "PENDING",
        items: {
          some: {
            courseId,
          },
        },
      },
      select: { id: true },
    });

    if (existingPendingOrder) {
      return NextResponse.json({ orderId: existingPendingOrder.id });
    }

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount: course.price,
        status: "PENDING",
        items: {
          create: {
            courseId,
            priceAtPurchase: course.price,
          },
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

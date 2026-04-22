import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/app/lib/prisma";

const KHALTI_INITIATE_URL =
  process.env.KHALTI_INITIATE_URL ||
  "https://dev.khalti.com/api/v2/epayment/initiate/";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId } = body as { orderId?: string };

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "COMPLETED") {
      return NextResponse.json({ error: "Order already paid" }, { status: 400 });
    }

    const khaltiPayload = {
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?method=khalti&paymentId=${order.id}`,
      website_url: process.env.NEXT_PUBLIC_BASE_URL,
      amount: Math.round(Number(order.totalAmount) * 100),
      purchase_order_id: order.id,
      purchase_order_name: `NextClass Order ${order.id.slice(0, 8)}`,
      customer_info: {
        name: `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() || "Student",
        email: order.user.email,
        phone: "9800000000",
      },
    };

    const response = await fetch(KHALTI_INITIATE_URL, {
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(khaltiPayload),
    });

    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Khalti initiation failed", details },
        { status: 400 }
      );
    }

    const data = (await response.json()) as {
      pidx: string;
      payment_url: string;
    };

    await prisma.order.update({
      where: { id: order.id },
      data: {
        khaltiPidx: data.pidx,
      },
    });

    return NextResponse.json({
      payment_url: data.payment_url,
      pidx: data.pidx,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


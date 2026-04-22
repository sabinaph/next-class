import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { stripe } from "@/lib/stripe";

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
        items: {
          include: {
            course: {
              select: {
                title: true,
                description: true,
                thumbnail: true,
              },
            },
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

    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: "npr",
        product_data: {
          name: item.course.title,
          description: item.course.description?.slice(0, 200),
          images: item.course.thumbnail ? [item.course.thumbnail] : [],
        },
        unit_amount: Math.round(item.priceAtPurchase.toNumber() * 100),
      },
      quantity: 1,
    }));

    const checkoutSession = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?method=stripe&paymentId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?orderId=${order.id}`,
      metadata: {
        orderId: order.id,
        userId: session.user.id,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripeSessionId: checkoutSession.id,
      },
    });

    return NextResponse.json({ payment_url: checkoutSession.url });
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


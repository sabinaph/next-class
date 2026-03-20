import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { stripe } from "@/lib/stripe";
import { ensureInvoiceForOrder, emailInvoice } from "@/actions/invoices";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("paymentId");
    const sessionId = searchParams.get("session_id");

    if (!paymentId || !sessionId) {
      return NextResponse.json({ status: "error", message: "Missing payment details" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: paymentId } });
    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ status: "error", message: "Order not found" }, { status: 404 });
    }

    if (order.status === "COMPLETED") {
      return NextResponse.json({ status: "error", message: "Payment already processed" }, { status: 400 });
    }

    if (order.stripeSessionId && order.stripeSessionId !== sessionId) {
      return NextResponse.json({ status: "error", message: "Session mismatch" }, { status: 400 });
    }

    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.metadata?.orderId && stripeSession.metadata.orderId !== paymentId) {
      return NextResponse.json({ status: "error", message: "Order mismatch" }, { status: 400 });
    }

    const amountTotal = stripeSession.amount_total || 0;
    const expected = Math.round(Number(order.totalAmount) * 100);
    if (Math.abs(amountTotal - expected) > 1) {
      return NextResponse.json({ status: "error", message: "Amount mismatch" }, { status: 400 });
    }

    if (stripeSession.payment_status !== "paid") {
      return NextResponse.json({ status: "error", message: "Payment not completed" }, { status: 400 });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "COMPLETED",
        paidAt: new Date(),
        paymentGateway: "STRIPE",
        stripeSessionId: sessionId,
      },
    });

    const invoice = await ensureInvoiceForOrder(order.id);
    await emailInvoice(order.id);

    return NextResponse.json({
      status: "success",
      message: "Stripe payment verified",
      invoiceId: invoice.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Stripe verification failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

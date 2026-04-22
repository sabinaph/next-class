import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { emailInvoice, ensureInvoiceForOrder } from "@/actions/invoices";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const KHALTI_VERIFY_URL =
  process.env.KHALTI_VERIFY_URL ||
  "https://dev.khalti.com/api/v2/epayment/lookup/";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const pidx = searchParams.get("pidx");
    const paymentId = searchParams.get("paymentId");

    if (!pidx || !paymentId) {
      return NextResponse.json(
        { status: "error", message: "Missing payment details" },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: paymentId },
    });

    if (!existingOrder || existingOrder.userId !== session.user.id) {
      return NextResponse.json(
        { status: "error", message: "Payment not found" },
        { status: 404 }
      );
    }

    if (existingOrder.status === "COMPLETED") {
      return NextResponse.json(
        { status: "error", message: "Payment already processed" },
        { status: 400 }
      );
    }

    if (existingOrder.khaltiPidx && existingOrder.khaltiPidx !== pidx) {
      return NextResponse.json(
        { status: "error", message: "Payment token mismatch" },
        { status: 400 }
      );
    }

    const reused = await prisma.order.findFirst({
      where: {
        khaltiPidx: pidx,
        NOT: { id: paymentId },
      },
      select: { id: true },
    });

    if (reused) {
      return NextResponse.json(
        { status: "error", message: "Transaction already used" },
        { status: 400 }
      );
    }

    const verifyResponse = await fetch(KHALTI_VERIFY_URL, {
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    });

    if (!verifyResponse.ok) {
      return NextResponse.json(
        { status: "error", message: "Verification failed with Khalti" },
        { status: 400 }
      );
    }

    const result = (await verifyResponse.json()) as {
      purchase_order_id?: string;
      total_amount?: number;
      status?: string;
      state?: { name?: string };
    };

    if (result.purchase_order_id && result.purchase_order_id !== paymentId) {
      return NextResponse.json(
        { status: "error", message: "Payment ID mismatch" },
        { status: 400 }
      );
    }

    if (result.total_amount) {
      const expected = Math.round(Number(existingOrder.totalAmount) * 100);
      if (Math.abs(result.total_amount - expected) > 1) {
        return NextResponse.json(
          { status: "error", message: "Amount mismatch" },
          { status: 400 }
        );
      }
    }

    const completed =
      result.status === "Completed" || result.state?.name === "Completed";

    if (!completed) {
      return NextResponse.json(
        { status: "error", message: "Payment not completed" },
        { status: 400 }
      );
    }

    await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        status: "COMPLETED",
        khaltiPidx: pidx,
        paidAt: new Date(),
        paymentGateway: "KHALTI",
      },
    });

    const invoice = await ensureInvoiceForOrder(existingOrder.id);
    await emailInvoice(existingOrder.id);

    return NextResponse.json({
      status: "success",
      message: "Payment verified successfully",
      invoiceId: invoice.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Payment verification failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


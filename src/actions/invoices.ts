"use server";

import { prisma } from "@/app/lib/prisma";
import { sendInvoiceEmail } from "@/lib/email";

function createInvoiceNumber() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INV-${y}${m}${d}-${rand}`;
}

export async function ensureInvoiceForOrder(orderId: string) {
  const existing = await prisma.invoice.findUnique({
    where: { orderId },
  });

  if (existing) return existing;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!order) throw new Error("Order not found");

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: createInvoiceNumber(),
      orderId: order.id,
      recipientEmail: order.user.email,
      subtotal: order.totalAmount,
      taxAmount: 0,
      totalAmount: order.totalAmount,
      currency: "NPR",
    },
  });

  return invoice;
}

export async function emailInvoice(orderId: string) {
  const invoice = await ensureInvoiceForOrder(orderId);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const invoiceUrl = `${appUrl}/invoices/${invoice.id}`;

  const sent = await sendInvoiceEmail({
    to: invoice.recipientEmail,
    invoiceNumber: invoice.invoiceNumber,
    totalAmount: new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 2,
    }).format(Number(invoice.totalAmount)),
    invoiceUrl,
  });

  if (sent) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { sentAt: new Date() },
    });
  }

  return sent;
}

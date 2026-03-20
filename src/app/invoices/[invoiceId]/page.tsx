import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ invoiceId: string }>;
}

export default async function InvoicePage({ params }: Props) {
  const { invoiceId } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      order: {
        include: {
          items: {
            include: {
              course: {
                select: { title: true },
              },
            },
          },
        },
      },
    },
  });

  if (!invoice) return notFound();

  const format = (amount: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="rounded-xl border p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Invoice</h1>
            <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Issued: {new Date(invoice.issuedAt).toLocaleString()}
          </p>
        </div>

        <div className="space-y-2">
          {invoice.order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span>{item.course.title}</span>
              <span>{format(item.priceAtPurchase.toNumber())}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{format(invoice.subtotal.toNumber())}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{format(invoice.taxAmount.toNumber())}</span>
          </div>
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>{format(invoice.totalAmount.toNumber())}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

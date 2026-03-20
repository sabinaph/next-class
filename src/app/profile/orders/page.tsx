import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
          sentAt: true,
        },
      },
      items: {
        include: {
          course: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground">Track orders, payment status, and invoices.</p>
        </div>
        <Link href="/profile">
          <Button variant="outline">Back to Profile</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl border p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-medium">{order.id}</p>
                <p className="text-xs text-muted-foreground">
                  Gateway: {order.paymentGateway || "KHALTI"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{order.status}</p>
              </div>
            </div>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span>{item.course.title}</span>
                  <span>
                    {new Intl.NumberFormat("en-NP", {
                      style: "currency",
                      currency: "NPR",
                      maximumFractionDigits: 2,
                    }).format(item.priceAtPurchase.toNumber())}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleString()}
              </span>
              <span className="font-semibold">
                {new Intl.NumberFormat("en-NP", {
                  style: "currency",
                  currency: "NPR",
                  maximumFractionDigits: 2,
                }).format(order.totalAmount.toNumber())}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3 text-sm">
              {order.invoice ? (
                <>
                  <Link href={`/invoices/${order.invoice.id}`} className="underline">
                    View Invoice ({order.invoice.invoiceNumber})
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {order.invoice.sentAt ? "Invoice sent by email" : "Invoice email pending"}
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Invoice will be available after payment verification.</span>
              )}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
}

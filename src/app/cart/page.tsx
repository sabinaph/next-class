import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getCart, removeFromCart, createOrderFromCart } from "@/actions/cart";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CartPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { items, total } = await getCart();

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground">Review selected resources.</p>
        </div>
        <Link href="/courses">
          <Button variant="outline">Continue Browsing</Button>
        </Link>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Instructor</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3 font-medium">{item.course.title}</td>
                <td className="px-4 py-3">
                  {item.course.instructor.name ||
                    `${item.course.instructor.firstName || ""} ${item.course.instructor.lastName || ""}`}
                </td>
                <td className="px-4 py-3">
                  {new Intl.NumberFormat("en-NP", {
                    style: "currency",
                    currency: "NPR",
                    maximumFractionDigits: 2,
                  }).format(item.course.price.toNumber())}
                </td>
                <td className="px-4 py-3">
                  <form action={removeFromCart.bind(null, item.course.id)}>
                    <Button variant="outline" size="sm" type="submit">
                      Remove
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Your cart is empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between rounded-xl border p-4">
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat("en-NP", {
              style: "currency",
              currency: "NPR",
              maximumFractionDigits: 2,
            }).format(total)}
          </p>
        </div>
        <form action={createOrderFromCart}>
          <Button type="submit" disabled={items.length === 0}>
            Create Order
          </Button>
        </form>
      </div>
    </div>
  );
}

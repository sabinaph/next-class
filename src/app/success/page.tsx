"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Verifying payment...");
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const method = searchParams.get("method") || "khalti";
      const pidx = searchParams.get("pidx");
      const paymentId = searchParams.get("paymentId");
      const stripeSessionId = searchParams.get("session_id");

      if (!paymentId) {
        setMessage("Missing payment details");
        return;
      }

      try {
        let response: Response;

        if (method === "stripe") {
          if (!stripeSessionId) {
            setMessage("Missing Stripe session details");
            return;
          }
          response = await fetch(
            `/api/verify-stripe?paymentId=${encodeURIComponent(paymentId)}&session_id=${encodeURIComponent(stripeSessionId)}`
          );
        } else {
          if (!pidx) {
            setMessage("Missing Khalti payment token");
            return;
          }
          response = await fetch(
            `/api/verify-khalti?pidx=${encodeURIComponent(pidx)}&paymentId=${encodeURIComponent(paymentId)}`
          );
        }

        const data = await response.json();

        if (data.status === "success") {
          setMessage("Payment successful");
          if (data.invoiceId) setInvoiceId(data.invoiceId);
        } else {
          setMessage(data.message || "Payment verification failed");
        }
      } catch {
        setMessage("Something went wrong during verification");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
      <h1 className="text-2xl font-bold">{message}</h1>
      <div className="flex items-center justify-center gap-3">
        <Link href="/profile/orders" className="underline">
          Go to Payment History
        </Link>
        {invoiceId && (
          <Link href={`/invoices/${invoiceId}`} className="underline">
            View Invoice
          </Link>
        )}
      </div>
    </div>
  );
}

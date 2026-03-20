"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function KhaltiPaymentPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment initiation failed");
      }

      window.location.href = data.payment_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <div className="rounded-xl border p-6 space-y-4">
        <h1 className="text-2xl font-bold">Khalti Payment</h1>
        <p className="text-muted-foreground text-sm">Order ID: {orderId}</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <form onSubmit={handlePayment}>
          <button
            type="submit"
            disabled={!orderId || loading}
            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Pay with Khalti"}
          </button>
        </form>
      </div>
    </div>
  );
}

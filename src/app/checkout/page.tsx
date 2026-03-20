"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function CheckoutChoicePage() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || "";
  const [loading, setLoading] = useState<"khalti" | "stripe" | null>(null);
  const [error, setError] = useState("");

  const startKhalti = async () => {
    setLoading("khalti");
    setError("");
    try {
      const response = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Khalti initiation failed");
      window.location.href = data.payment_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start Khalti");
    } finally {
      setLoading(null);
    }
  };

  const startStripe = async () => {
    setLoading("stripe");
    setError("");
    try {
      const response = await fetch("/api/checkout-session/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Stripe initiation failed");
      window.location.href = data.payment_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start Stripe");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <div className="rounded-xl border p-6 space-y-4">
        <h1 className="text-2xl font-bold">Choose Payment Method</h1>
        <p className="text-sm text-muted-foreground">Order ID: {orderId}</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            onClick={startKhalti}
            disabled={!orderId || loading !== null}
            className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading === "khalti" ? "Processing..." : "Pay with Khalti"}
          </button>
          <button
            onClick={startStripe}
            disabled={!orderId || loading !== null}
            className="rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {loading === "stripe" ? "Processing..." : "Pay with Stripe"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EnrollButtonProps {
  courseId: string;
  price: number;
}

export function EnrollButton({ courseId, price }: EnrollButtonProps) {
  const [loadingGateway, setLoadingGateway] = useState<"khalti" | "stripe" | null>(null);
  const [error, setError] = useState("");

  const formattedPrice = new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 2,
  }).format(price);

  const handleCheckout = async (gateway: "khalti" | "stripe") => {
    setLoadingGateway(gateway);
    setError("");

    try {
      const orderResponse = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.orderId) {
        throw new Error(orderData.error || "Unable to create order");
      }

      const sessionEndpoint =
        gateway === "stripe"
          ? "/api/checkout-session/stripe"
          : "/api/checkout-session";

      const paymentResponse = await fetch(sessionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderData.orderId,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentData.payment_url) {
        throw new Error(paymentData.error || `Unable to start ${gateway} payment`);
      }

      window.location.href = paymentData.payment_url;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoadingGateway(null);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          className="w-full text-base"
          size="lg"
          onClick={() => handleCheckout("khalti")}
          disabled={loadingGateway !== null}
        >
          {loadingGateway === "khalti" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Khalti - {formattedPrice}
        </Button>
        <Button
          className="w-full text-base"
          size="lg"
          variant="outline"
          onClick={() => handleCheckout("stripe")}
          disabled={loadingGateway !== null}
        >
          {loadingGateway === "stripe" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Stripe - {formattedPrice}
        </Button>
      </div>
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/actions/cart";

export function AddToCartButton({ courseId }: { courseId: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const handleAdd = () => {
    setMessage("");
    startTransition(async () => {
      try {
        await addToCart(courseId);
        setMessage("Added to cart");
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Unable to add");
      }
    });
  };

  return (
    <div className="space-y-2">
      <Button variant="outline" onClick={handleAdd} disabled={pending}>
        {pending ? "Adding..." : "Add to Cart"}
      </Button>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}

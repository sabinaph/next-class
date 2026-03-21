"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/actions/courses";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; // Assuming utils exists

interface WishlistButtonProps {
  courseId: string;
  initialIsWishlisted: boolean;
}

export function WishlistButton({
  courseId,
  initialIsWishlisted,
}: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const newState = await toggleWishlist(courseId);
      setIsWishlisted(newState);
      router.refresh();
    } catch (error) {
      console.error(error);
      // Maybe redirect to login if 401
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "transition-colors",
        isWishlisted &&
          "border-pink-200 bg-pink-50 text-pink-600 hover:bg-pink-100 hover:text-pink-700 dark:border-pink-900/70 dark:bg-pink-900/20 dark:text-pink-300 dark:hover:bg-pink-900/35 dark:hover:text-pink-200"
      )}
    >
      <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
    </Button>
  );
}

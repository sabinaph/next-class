"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createOrUpdateReview } from "@/actions/reviews";
import { Star } from "lucide-react";

interface ReviewFormProps {
  courseId: string;
  initialRating?: number;
  initialComment?: string | null;
}

export function ReviewForm({
  courseId,
  initialRating = 5,
  initialComment = "",
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment || "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        await createOrUpdateReview(courseId, rating, comment);
        setMessage("Your review has been saved.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to submit review");
      }
    });
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="font-semibold">Rate This Resource</h3>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className="p-1"
            aria-label={`Rate ${value} stars`}
          >
            <Star
              className={`h-5 w-5 ${
                value <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your feedback..."
        className="min-h-[120px]"
      />
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      )}
      <Button onClick={handleSubmit} disabled={pending}>
        {pending ? "Saving..." : "Save Review"}
      </Button>
    </div>
  );
}

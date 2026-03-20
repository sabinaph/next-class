"use client";

import { useState, useTransition } from "react";
import { replyToReview } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  instructorReply: string | null;
  student: {
    firstName: string | null;
    lastName: string | null;
  };
  createdAt: Date | string;
}

export function CourseReviewManager({ reviews }: { reviews: ReviewItem[] }) {
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      reviews.map((review) => [review.id, review.instructorReply || ""])
    )
  );
  const [status, setStatus] = useState<string>("");
  const [pending, startTransition] = useTransition();

  const handleSave = (reviewId: string) => {
    setStatus("");
    startTransition(async () => {
      try {
        await replyToReview(reviewId, replyDrafts[reviewId] || "");
        setStatus("Reply updated.");
      } catch (e) {
        setStatus(e instanceof Error ? e.message : "Failed to update reply");
      }
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        No student reviews yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {status && (
        <p className="rounded-md border px-3 py-2 text-sm text-muted-foreground">{status}</p>
      )}
      {reviews.map((review) => (
        <div key={review.id} className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-sm">
                {(review.student.firstName || "") + " " + (review.student.lastName || "")}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`h-4 w-4 ${
                    index < review.rating
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {review.comment || "No comment provided."}
          </p>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Instructor Reply</p>
            <Textarea
              value={replyDrafts[review.id] || ""}
              onChange={(e) =>
                setReplyDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))
              }
              placeholder="Write your response to this review..."
              className="min-h-[90px]"
            />
            <Button size="sm" disabled={pending} onClick={() => handleSave(review.id)}>
              {pending ? "Saving..." : "Save Reply"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

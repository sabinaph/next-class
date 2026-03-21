"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";

interface CompleteLessonButtonProps {
  courseId: string;
  lessonId: string;
  initialCompleted: boolean;
}

export function CompleteLessonButton({
  courseId,
  lessonId,
  initialCompleted,
}: CompleteLessonButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(initialCompleted);

  const handleComplete = async () => {
    if (completed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/learn/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId, lessonId }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            success?: boolean;
            courseCompleted?: boolean;
            certificateId?: string;
            error?: string;
          }
        | null;

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "Failed to mark lesson as complete.");
      }

      setCompleted(true);

      if (payload.courseCompleted) {
        showToast({
          type: "success",
          title: "Course Completed",
          message:
            "Congratulations! You completed this course and your certificate is ready in your profile.",
        });
      }

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to mark lesson as complete.";
      showToast({
        type: "error",
        title: "Could Not Complete Lesson",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      size="lg"
      className="w-full md:w-auto gap-2"
      onClick={handleComplete}
      disabled={completed || isSubmitting}
    >
      {isSubmitting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CheckCircle className="w-4 h-4" />
      )}
      {completed ? "Completed" : "Mark as Complete"}
    </Button>
  );
}

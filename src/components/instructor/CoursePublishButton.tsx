"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toggleCoursePublish } from "@/actions/instructor";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
// import { useToast } from "@/components/ui/use-toast"; // unavailable

interface CoursePublishButtonProps {
  courseId: string;
  isPublished: boolean;
  disabled?: boolean;
}

export function CoursePublishButton({
  courseId,
  isPublished,
  disabled,
}: CoursePublishButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // const { toast } = useToast();

  const onClick = async () => {
    try {
      setIsLoading(true);
      await toggleCoursePublish(courseId, !isPublished);
      // toast({
      //   title: !isPublished ? "Course Published" : "Course Unpublished",
      //   description: !isPublished
      //     ? "Your course is now live and visible to students."
      //     : "Your course has been hidden from students.",
      // });
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      disabled={disabled || isLoading}
      onClick={onClick}
      variant={isPublished ? "outline" : "default"}
      className="w-full"
    >
      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      {isPublished ? "Unpublish Course" : "Publish Course"}
    </Button>
  );
}

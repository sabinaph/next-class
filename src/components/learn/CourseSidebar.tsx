"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, PlayCircle, Lock, Video, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CourseSidebarProps {
  course: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      type: string;
      duration: number | null;
    }[];
  };
  completedLessonIds?: string[];
}

export const CourseSidebar = ({
  course,
  completedLessonIds = [],
}: CourseSidebarProps) => {
  const pathname = usePathname();

  const total = course.lessons.length || 1;
  const completed = completedLessonIds.length;
  const percent = Math.min(100, Math.round((completed / total) * 100));

  return (
    <div className="h-full w-80 flex flex-col overflow-y-auto border-r border-border bg-card">
      <div className="flex flex-col border-b border-border p-8">
        <h1 className="mb-2 font-semibold text-foreground">{course.title}</h1>
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-green-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{percent}% Completed</p>
        </div>
      </div>
      <div className="flex flex-col w-full">
        {course.lessons.map((lesson) => {
          const isActive = pathname?.includes(lesson.id);
          const isCompleted = completedLessonIds.includes(lesson.id);
          const isLocked = false; // In this view, if enrolled, nothing is locked usually

          const Icon = lesson.type === "VIDEO" ? Video : FileText;

          return (
            <Link
              key={lesson.id}
              href={`/learn/${course.id}/lesson/${lesson.id}`}
              className={cn(
                "flex items-center gap-x-2 pl-6 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground",
                isActive &&
                  "border-r-4 border-green-600/80 bg-muted/80 text-foreground hover:bg-muted/80",
                isCompleted && "text-emerald-700 hover:text-emerald-700 dark:text-emerald-400"
              )}
            >
              <div className="flex items-center gap-x-2 py-4">
                <Icon
                  size={22}
                  className={cn(
                    "text-muted-foreground",
                    isActive && "text-foreground",
                    isCompleted && "text-emerald-700 dark:text-emerald-400"
                  )}
                />
                {lesson.title}
              </div>
              <div className="ml-auto pr-2 flex items-center gap-x-2">
                {isCompleted && (
                  <CheckCircle size={22} className="text-emerald-700 dark:text-emerald-400" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

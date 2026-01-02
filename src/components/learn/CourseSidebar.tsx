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
  progressCount?: number; // TODO: Implement progress
}

export const CourseSidebar = ({
  course,
  progressCount = 0,
}: CourseSidebarProps) => {
  const pathname = usePathname();

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto bg-white dark:bg-gray-950 w-80">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold mb-2">{course.title}</h1>
        {/* Progress Bar Placeholder */}
        <div className="mt-4">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-[10%]" />
          </div>
          <p className="text-xs text-gray-500 mt-2">10% Completed</p>
        </div>
      </div>
      <div className="flex flex-col w-full">
        {course.lessons.map((lesson) => {
          const isActive = pathname?.includes(lesson.id);
          const isCompleted = false; // TODO: Check real completion
          const isLocked = false; // In this view, if enrolled, nothing is locked usually

          const Icon = lesson.type === "VIDEO" ? Video : FileText;

          return (
            <Link
              key={lesson.id}
              href={`/learn/${course.id}/lesson/${lesson.id}`}
              className={cn(
                "flex items-center gap-x-2 text-slate-500 text-sm font-medium pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
                isActive &&
                  "text-slate-700 bg-slate-200/20 hover:bg-slate-200/20 border-r-4 border-green-700",
                isCompleted && "text-emerald-700 hover:text-emerald-700"
              )}
            >
              <div className="flex items-center gap-x-2 py-4">
                <Icon
                  size={22}
                  className={cn(
                    "text-slate-500",
                    isActive && "text-slate-700",
                    isCompleted && "text-emerald-700"
                  )}
                />
                {lesson.title}
              </div>
              <div className="ml-auto pr-2 flex items-center gap-x-2">
                {isCompleted && (
                  <CheckCircle size={22} className="text-emerald-700" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

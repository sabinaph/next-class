import { getCourse } from "@/actions/instructor";
import { CourseLessonManager } from "@/components/instructor/CourseLessonManager";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: {
    courseId: string;
  };
}

import { CoursePublishButton } from "@/components/instructor/CoursePublishButton";

// ... existing imports

export default async function CourseManagePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* ... prev header content ... */}
      <div className="flex items-center gap-4">
        <Link href="/instructor/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {course.title}
            </h1>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                course.isPublished
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {course.isPublished ? "Published" : "Draft"}
            </span>
          </div>
          <p className="text-muted-foreground">
            {course.category} • {course.level}
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <section>
            <CourseLessonManager
              courseId={course.id}
              initialLessons={course.lessons as any[]}
            />
          </section>
        </div>

        <div className="space-y-6">
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="font-semibold mb-4">Course Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Students</span>
                <span className="font-medium">{course._count.bookings}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reviews</span>
                <span className="font-medium">{course._count.reviews}</span>
              </div>
              <div className="pt-4 border-t">
                <CoursePublishButton
                  courseId={course.id}
                  isPublished={course.isPublished}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

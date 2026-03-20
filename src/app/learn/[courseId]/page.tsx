import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CourseLearnPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      lessons: {
        where: {
          isPublished: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!course) {
    return redirect("/");
  }

  if (course.lessons.length > 0) {
    return redirect(`/learn/${course.id}/lesson/${course.lessons[0].id}`);
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-2xl border bg-card p-8 text-center">
        <h1 className="text-2xl font-bold">Welcome to {course.title}</h1>
        <p className="text-muted-foreground mt-3">
          There are no lessons available yet.
        </p>
        <div className="mt-6">
          <Link href={`/courses/${course.id}`}>
            <Button variant="outline">Back to Course</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

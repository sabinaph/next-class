import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

export default async function CourseLearnPage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = await prisma.course.findUnique({
    where: {
      id: params.courseId,
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
    <div className="flex flex-col items-center justify-center h-full p-6">
      <h1 className="text-2xl font-bold">Welcome to {course.title}</h1>
      <p className="text-muted-foreground mt-2">
        There are no lessons available yet.
      </p>
    </div>
  );
}

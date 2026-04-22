import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma"; // Adjust path if needed
import { authOptions } from "@/lib/auth";
import { CourseSidebar } from "@/components/learn/CourseSidebar";
import Navbar from "@/components/Navbar";

export default async function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { courseId } = await params;

  if (!session) {
    return redirect("/auth/signin");
  }

  // Check completed order ownership
  const purchasedOrder = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
      items: {
        some: {
          courseId,
        },
      },
    },
  });

  const courseRaw = await prisma.course.findUnique({
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

  if (!courseRaw) {
    return redirect("/");
  }

  // Allow access if user is the instructor
  const isInstructor = courseRaw.instructorId === session.user.id;

  if (!purchasedOrder && !isInstructor) {
    return redirect(`/courses/${courseId}`);
  }

  // Serialize course for client component
  const course = {
    ...courseRaw,
    price: courseRaw.price.toNumber(),
  };

  const progress = await prisma.lessonProgress.findMany({
    where: {
      courseId,
      userId: session.user.id,
    },
    select: { lessonId: true },
  });
  const completedLessonIds = progress.map((p) => p.lessonId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar className="md:left-80" />
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-80 flex-col z-40">
        <CourseSidebar course={course} completedLessonIds={completedLessonIds} />
      </div>
      <main className="md:pl-80 pt-16 min-h-screen">{children}</main>
    </div>
  );
}

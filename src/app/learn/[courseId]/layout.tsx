import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma"; // Adjust path if needed
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
    <div className="h-full">
      <div className="h-20 md:pl-80 fixed inset-y-0 w-full z-50">
        <Navbar />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50 mt-20">
        <CourseSidebar course={course} completedLessonIds={completedLessonIds} />
      </div>
      <main className="md:pl-80 pt-20 h-full">{children}</main>
    </div>
  );
}

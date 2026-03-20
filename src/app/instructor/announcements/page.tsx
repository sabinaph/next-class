import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getInstructorAnnouncements } from "@/actions/instructor-announcements";
import AnnouncementManager from "@/components/instructor/AnnouncementManager";

export default async function InstructorCommunicationPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "INSTRUCTOR") {
    redirect("/");
  }

  const [courses, announcements] = await Promise.all([
    prisma.course.findMany({
      where: {
        instructorId: session.user.id,
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        title: "asc",
      },
    }),
    getInstructorAnnouncements(),
  ]);

  const preparedAnnouncements = announcements.map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    courseId: item.courseId,
    courseTitle: item.course.title,
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Communication</h1>
      <AnnouncementManager
        courses={courses}
        initialAnnouncements={preparedAnnouncements}
      />
    </div>
  );
}

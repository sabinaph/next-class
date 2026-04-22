import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

export default async function InstructorDownloadsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "INSTRUCTOR") {
    redirect("/");
  }

  const resources = await prisma.lesson.findMany({
    where: {
      course: {
        instructorId: session.user.id,
      },
      content: {
        not: null,
      },
    },
    select: {
      id: true,
      title: true,
      type: true,
      course: {
        select: {
          title: true,
        },
      },
      _count: {
        select: {
          downloadLogs: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Downloadable Content</h1>
        <p className="text-muted-foreground">Track downloads of your uploaded resources.</p>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Downloads</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3 font-medium">{item.title}</td>
                <td className="px-4 py-3">{item.course.title}</td>
                <td className="px-4 py-3">{item.type}</td>
                <td className="px-4 py-3">{item._count.downloadLogs}</td>
              </tr>
            ))}
            {resources.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No downloadable resources found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DownloadHistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const logs = await prisma.downloadLog.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      course: {
        select: {
          title: true,
        },
      },
      lesson: {
        select: {
          title: true,
          type: true,
        },
      },
    },
    orderBy: {
      downloadedAt: "desc",
    },
  });

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Download History</h1>
          <p className="text-muted-foreground">All your downloaded resources.</p>
        </div>
        <Link href="/profile">
          <Button variant="outline">Back to Profile</Button>
        </Link>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Downloaded At</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="px-4 py-3 font-medium">{log.lesson.title}</td>
                <td className="px-4 py-3">{log.course.title}</td>
                <td className="px-4 py-3">{log.lesson.type}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(log.downloadedAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No downloads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


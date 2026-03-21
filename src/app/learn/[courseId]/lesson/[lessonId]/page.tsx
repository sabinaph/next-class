import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CompleteLessonButton } from "@/components/learn/CompleteLessonButton";
// Note: ReactMarkdown handling might need a client component, but let's try a simple server render or client wrapper if needed.
// Actually, I'll stick to simple text display if no markdown renderer is installed.
// The user hasn't asked for Markdown specifically, but "Text" implies it.
// I'll create a VideoPlayer component and a TextRenderer component, or just inline.

export default async function LessonIdPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect("/auth/signin");
  }

  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      courseId,
    },
  });

  if (!lesson) {
    return redirect(`/learn/${courseId}`);
  }

  const progress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId: lesson.id,
      },
    },
    select: {
      id: true,
    },
  });

  const isCompleted = Boolean(progress);

  return (
    <div className="flex flex-col max-w-4xl mx-auto pb-20">
      <div className="p-4 w-full">
        {/* Media Player */}
        {lesson.type === "VIDEO" && lesson.content && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted shadow-lg">
            {/* Basic iframe support for now; in production use a robust player */}
            <iframe
              src={lesson.content}
              title={`${lesson.title} video`}
              className="absolute top-0 left-0 w-full h-full"
              allowFullScreen
            />
          </div>
        )}

        {/* Basic Text Content */}
        {lesson.type === "TEXT" && lesson.content && (
          <div className="prose dark:prose-invert max-w-none p-6 border rounded-xl bg-card shadow-sm mt-4">
            {/*  Ideally use a Markdown component here */}
            <div className="whitespace-pre-wrap">{lesson.content}</div>
          </div>
        )}

        {lesson.type === "PDF" && lesson.content && (
          <div className="space-y-3 mt-4">
            <div className="h-[80vh] w-full border rounded-xl">
              <iframe src={lesson.content} title={`${lesson.title} PDF`} className="w-full h-full" />
            </div>
            <Link href={`/api/resources/download?lessonId=${lesson.id}`}>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download Resource
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
          {/* Description or others if available */}
        </div>
        <CompleteLessonButton
          courseId={courseId}
          lessonId={lesson.id}
          initialCompleted={isCompleted}
        />
      </div>
      <Separator />
    </div>
  );
}

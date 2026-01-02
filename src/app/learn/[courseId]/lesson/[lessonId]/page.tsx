import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play } from "lucide-react";
// Note: ReactMarkdown handling might need a client component, but let's try a simple server render or client wrapper if needed.
// Actually, I'll stick to simple text display if no markdown renderer is installed.
// The user hasn't asked for Markdown specifically, but "Text" implies it.
// I'll create a VideoPlayer component and a TextRenderer component, or just inline.

export default async function LessonIdPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: params.lessonId,
      courseId: params.courseId,
    },
  });

  if (!lesson) {
    return redirect(`/learn/${params.courseId}`);
  }

  return (
    <div className="flex flex-col max-w-4xl mx-auto pb-20">
      <div className="p-4 w-full">
        {/* Media Player */}
        {lesson.type === "VIDEO" && lesson.content && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
            {/* Basic iframe support for now; in production use a robust player */}
            <iframe
              src={lesson.content}
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
          <div className="h-[80vh] w-full border rounded-xl mt-4">
            <iframe src={lesson.content} className="w-full h-full" />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
          {/* Description or others if available */}
        </div>
        <Button size="lg" className="w-full md:w-auto gap-2">
          <CheckCircle className="w-4 h-4" />
          Mark as Complete
        </Button>
      </div>
      <Separator />
    </div>
  );
}

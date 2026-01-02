import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function EnrollSuccessPage({
  params,
}: {
  params: { courseId: string };
}) {
  // In a real app, you might verify the session_id here server-side before showing success

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Enrollment Successful!</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Thank you for your purchase. You now have full access to the course
        content.
      </p>

      <div className="flex gap-4">
        <Link href={`/courses/${params.courseId}`}>
          <Button size="lg">Start Learning</Button>
        </Link>
        <Link href="/profile">
          <Button variant="outline" size="lg">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

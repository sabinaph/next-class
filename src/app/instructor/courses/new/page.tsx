import { CreateCourseForm } from "@/components/instructor/CreateCourseForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateCoursePage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/instructor/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create New Course
          </h1>
          <p className="text-muted-foreground">
            Start by detailing your course information.
          </p>
        </div>
      </div>

      <CreateCourseForm />
    </div>
  );
}

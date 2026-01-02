import { getPublicCourse } from "@/actions/courses";
import { notFound } from "next/navigation";
import { EnrollButton } from "@/components/courses/EnrollButton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface Props {
  params: {
    courseId: string;
  };
}

export default async function EnrollPage({ params }: Props) {
  const course = await getPublicCourse(params.courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="container max-w-lg mx-auto py-20 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Confirm Enrollment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-lg">{course.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {course.instructor.name || "Instructor"}
            </p>
          </div>

          <div className="flex justify-between items-center py-4 border-t border-b">
            <span className="font-medium">Total</span>
            <span className="text-2xl font-bold">${course.price}</span>
          </div>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" /> Full lifetime
              access
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" /> Access on
              mobile and TV
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" /> Certificate of
              completion
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <EnrollButton courseId={course.id} price={Number(course.price)} />
        </CardFooter>
      </Card>
    </div>
  );
}

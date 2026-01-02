import { getInstructorCourses } from "@/actions/instructor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MoreVertical, Pencil, Trash } from "lucide-react";
import Link from "next/link";

export default async function CoursesPage() {
  const courses = await getInstructorCourses();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-2">
            Manage your courses, lessons, and students.
          </p>
        </div>
        <Link href="/instructor/courses/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {courses.map((course) => (
          <Card
            key={course.id}
            className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6 hover:shadow-md transition-shadow"
          >
            <div className="h-32 w-full md:w-48 bg-muted rounded-lg shrink-0 relative overflow-hidden">
              {/* Placeholder for thumbnail if not present */}
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary">
                  No Image
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                    <Link href={`/instructor/courses/${course.id}`}>
                      {course.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {course.description}
                  </p>
                </div>
                {/* Status Badge */}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.isPublished
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {course.isPublished ? "Published" : "Draft"}
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
                <div>
                  <span className="font-medium text-foreground">
                    {course._count.lessons}
                  </span>{" "}
                  Lessons
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    {course._count.bookings}
                  </span>{" "}
                  Students
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    ${course.price}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
              <Link href={`/instructor/courses/${course.id}`}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          </Card>
        ))}

        {courses.length === 0 && (
          <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
            <h3 className="text-lg font-medium">No courses found</h3>
            <p className="text-muted-foreground mt-1">
              Get started by creating your first course.
            </p>
            <Link href="/instructor/courses/new" className="mt-4 inline-block">
              <Button>Create Course</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

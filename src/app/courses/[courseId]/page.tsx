import { getPublicCourse } from "@/actions/courses";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/courses/WishlistButton";
import {
  BookOpen,
  Clock,
  Star,
  User,
  Video,
  FileText,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface Props {
  params: {
    courseId: string;
  };
}

export default async function CourseSubPage({ params }: Props) {
  const course = await getPublicCourse(params.courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <span>{course.category}</span>
              <span>•</span>
              <span>{course.level}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {course.title}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  Created by{" "}
                  {course.instructor.name ||
                    course.instructor.firstName ||
                    "Instructor"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{course.duration} Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span>4.8 ({course._count.reviews} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Link href={`/courses/${course.id}/enroll`}>
                <Button size="lg" className="text-lg px-8">
                  Enroll Now - ${course.price}
                </Button>
              </Link>
              <WishlistButton
                courseId={course.id}
                initialIsWishlisted={course.isWishlisted}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-[1fr_300px] gap-12 max-w-6xl">
        <div className="space-y-12">
          {/* Lessons */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Course Content</h2>
            <div className="border rounded-xl divide-y">
              {course.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="p-4 bg-card flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground w-6 text-center">
                      {index + 1}
                    </span>
                    <div className="p-2 bg-muted rounded-full">
                      {lesson.type === "VIDEO" ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{lesson.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {lesson.isFree ? "Free Preview" : "Locked"}
                      </div>
                    </div>
                  </div>
                  {lesson.isFree ? (
                    <Button variant="ghost" size="sm" className="text-primary">
                      Preview
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      Locked
                    </span>
                  )}
                </div>
              ))}
              {course.lessons.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No content available yet.
                </div>
              )}
            </div>
          </section>

          {/* Instructor */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Instructor</h2>
            <div className="flex items-start gap-4 p-6 border rounded-xl bg-card">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                {course.instructor.image ? (
                  <img src={course.instructor.image} alt="Instructor" />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="font-bold text-lg">
                  {course.instructor.name || course.instructor.firstName}
                </div>
                <p className="text-muted-foreground text-sm">Instructor</p>
                <p className="mt-4 text-sm leading-relaxed">
                  An experienced instructor passionate about teaching... (Bio
                  coming soon)
                </p>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Student Feedback</h2>
            <div className="grid gap-6">
              {course.reviews.map((review) => (
                <div key={review.id} className="p-6 border rounded-xl bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-muted rounded-full flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm">
                          {review.student.firstName} {review.student.lastName}
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))}
              {course.reviews.length === 0 && (
                <p className="text-muted-foreground">No reviews yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="p-6 border rounded-xl bg-card sticky top-24 shadow-sm">
            <div className="text-3xl font-bold mb-2">${course.price}</div>
            <Link href={`/courses/${course.id}/enroll`}>
              <Button className="w-full mb-4" size="lg">
                Enroll Now
              </Button>
            </Link>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Video className="h-4 w-4" /> {course._count.lessons} Lessons
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" /> Full Lifetime Access
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-4 w-4" /> Certificate of Completion
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

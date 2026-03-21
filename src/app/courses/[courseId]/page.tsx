import { getPublicCourse } from "@/actions/courses";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/courses/WishlistButton";
import { WaitlistButton } from "@/components/courses/WaitlistButton";
import {
  BookOpen,
  Clock,
  Star,
  User,
  Megaphone,
  Video,
  FileText,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { ReviewForm } from "@/components/courses/ReviewForm";
import { AddToCartButton } from "@/components/courses/AddToCartButton";

interface Props {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CourseSubPage({ params }: Props) {
  const { courseId } = await params;
  const course = await getPublicCourse(courseId);
  const price = new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 2,
  }).format(Number(course?.price ?? 0));

  if (!course) {
    notFound();
  }

  const fallbackThumbnail = "/default-coures.jpg";

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="border-b bg-linear-to-b from-primary/8 via-background to-background">
        <div className="container mx-auto px-4 py-10 md:py-16 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full border px-3 py-1 bg-background/80 font-medium">
                  {course.category}
                </span>
                <span className="rounded-full border px-3 py-1 bg-background/80 font-medium">
                  {course.level}
                </span>
                <span className="rounded-full border px-3 py-1 bg-background/80 font-medium">
                  {course._count.lessons} lessons
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                {course.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border bg-card/70 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Instructor</p>
                  <p className="font-semibold">
                    {course.instructor.name ||
                      course.instructor.firstName ||
                      "Instructor"}
                  </p>
                </div>
                <div className="rounded-xl border bg-card/70 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Duration</p>
                  <p className="font-semibold">{course.duration} hours</p>
                </div>
                <div className="rounded-xl border bg-card/70 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Reviews</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    4.8 ({course._count.reviews})
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {course.canReview ? (
                  <Link href={`/learn/${course.id}`}>
                    <Button size="lg" className="px-7">
                      Start Learning
                    </Button>
                  </Link>
                ) : course.isFull ? (
                  <div className="max-w-sm rounded-lg border bg-card p-3">
                    <p className="text-sm text-muted-foreground mb-2">
                      Course is full. Join the waitlist to get notified.
                    </p>
                    <WaitlistButton
                      courseId={course.id}
                      isWaitlisted={course.isWaitlisted}
                    />
                  </div>
                ) : (
                  <Link href={`/courses/${course.id}/enroll`}>
                    <Button size="lg" className="px-7">
                      Enroll Now - {price}
                    </Button>
                  </Link>
                )}
                {!course.canReview && <AddToCartButton courseId={course.id} />}
                <WishlistButton
                  courseId={course.id}
                  initialIsWishlisted={course.isWishlisted}
                />
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-3 shadow-md">
              <div className="aspect-video overflow-hidden rounded-xl bg-muted">
                <img
                  src={course.thumbnail || fallbackThumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border p-3 bg-background/70">
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-bold text-base">{price}</p>
                </div>
                <div className="rounded-lg border p-3 bg-background/70">
                  <p className="text-xs text-muted-foreground">Access</p>
                  <p className="font-bold text-base">Lifetime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-12 max-w-6xl">
        <div className="space-y-12">
          {/* Lessons */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Course Content</h2>
            <div className="border rounded-xl divide-y overflow-hidden bg-card">
              {course.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground w-6 text-center font-medium">
                      {index + 1}
                    </span>
                    <div className="p-2 bg-muted rounded-full shrink-0">
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
                    <Button variant="ghost" size="sm" className="text-primary border">
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
            <div className="flex items-start gap-4 p-6 border rounded-xl bg-card shadow-xs">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                {course.instructor.image ? (
                  <img
                    src={course.instructor.image}
                    alt="Instructor"
                    className="h-full w-full object-cover"
                  />
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

          {/* Announcements */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Published Announcements</h2>
            {!course.canViewAnnouncements ? (
              <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
                Sign in to view instructor announcements for this course.
              </div>
            ) : course.announcements.length === 0 ? (
              <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
                No announcements published yet.
              </div>
            ) : (
              <div className="space-y-4">
                {course.announcements.map((announcement) => (
                  <div key={announcement.id} className="rounded-xl border bg-card p-5">
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                      <Megaphone className="h-4 w-4" />
                      <span className="text-xs">
                        {new Date(announcement.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold mb-2">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Reviews */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Student Feedback</h2>
            {course.canReview && (
              <div className="mb-6">
                <ReviewForm
                  courseId={course.id}
                  initialRating={course.userReview?.rating || 5}
                  initialComment={course.userReview?.comment || ""}
                />
              </div>
            )}
            <div className="grid gap-6">
              {course.reviews.map((review) => (
                <div key={review.id} className="p-6 border rounded-xl bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-muted rounded-full shrink-0" />
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
                  {review.instructorReply && (
                    <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Instructor response
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{review.instructorReply}</p>
                    </div>
                  )}
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
            <div className="text-sm uppercase tracking-wide text-muted-foreground mb-1">
              Course Price
            </div>
            <div className="text-3xl font-bold mb-4">{price}</div>
            {course.canReview ? (
              <Link href={`/learn/${course.id}`}>
                <Button className="w-full mb-4" size="lg">
                  Start Learning
                </Button>
              </Link>
            ) : (
              <Link href={`/courses/${course.id}/enroll`}>
                <Button className="w-full mb-4" size="lg">
                  Enroll Now
                </Button>
              </Link>
            )}
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Video className="h-4 w-4" /> {course._count.lessons} Lessons
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-4 w-4" /> Structured beginner-friendly path
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

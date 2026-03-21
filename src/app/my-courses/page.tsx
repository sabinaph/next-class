import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

export default async function MyCoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const completedOrders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
    },
    orderBy: {
      paidAt: "desc",
    },
    include: {
      items: {
        include: {
          course: {
            include: {
              instructor: {
                select: {
                  name: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const seen = new Set<string>();
  const purchasedCourses = completedOrders
    .flatMap((order) =>
      order.items.map((item) => ({
        course: item.course,
        paidAt: order.paidAt || order.updatedAt,
      }))
    )
    .filter(({ course }) => {
      if (seen.has(course.id)) return false;
      seen.add(course.id);
      return true;
    });

  const fallbackThumbnail = "/default-coures.jpg";

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Access all courses you have purchased.
            </p>
          </div>
          <Link href="/courses" className="text-sm underline font-medium">
            Browse more courses
          </Link>
        </div>

        {purchasedCourses.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="mb-2 text-xl font-semibold text-foreground">No purchased courses yet</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Once you complete payment, your course will appear here.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {purchasedCourses.map(({ course, paidAt }) => {
              const instructorName =
                course.instructor.name ||
                `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim() ||
                "Instructor";

              return (
                <article
                  key={course.id}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <div className="aspect-video bg-muted">
                    <img
                      src={course.thumbnail || fallbackThumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {course.shortDescription || course.description}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Instructor: {instructorName}</p>
                      <p>Purchased: {new Date(paidAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href={`/learn/${course.id}`}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                      >
                        Start Learning
                      </Link>
                      <Link
                        href={`/courses/${course.id}`}
                        className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                      >
                        View Course
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

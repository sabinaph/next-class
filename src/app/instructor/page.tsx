import { getInstructorStats, getInstructorCourses } from "@/actions/instructor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, DollarSign, Star, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Helper for currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
  }).format(amount);
};

export default async function InstructorDashboardPage() {
  // Fetch data
  const stats = await getInstructorStats();
  const recentCourses = await getInstructorCourses();

  const topCourses = recentCourses
    .slice()
    .sort((a, b) => (b._count?.bookings || 0) - (a._count?.bookings || 0))
    .slice(0, 5);

  const maxBookings = Math.max(1, ...topCourses.map((c) => c._count?.bookings || 0));

  const totalEnrollments = recentCourses.reduce(
    (sum, course) => sum + (course._count?.bookings || 0),
    0
  );

  const sparklinePoints = topCourses
    .map((course, index) => {
      const x = topCourses.length <= 1 ? 0 : (index / (topCourses.length - 1)) * 100;
      const normalized = (course._count?.bookings || 0) / maxBookings;
      const y = 100 - normalized * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-emerald-200/70 bg-linear-to-br from-emerald-50 via-white to-cyan-50 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">Instructor Dashboard</p>
            <h1 className="text-3xl font-bold tracking-tight">Teach Better, Grow Faster</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track enrollments, monitor revenue, and optimize your courses.
            </p>
          </div>
          <Link href="/instructor/courses/new">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Create New Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-100/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesCount}</div>
          </CardContent>
        </Card>

        <Card className="border-cyan-100/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card className="border-violet-100/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Revenue (60%)</CardTitle>
            <DollarSign className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(stats.totalRevenue))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-100/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating ? stats.averageRating.toFixed(1) : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-emerald-100/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Enrollment Trend (Top Courses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCourses.length > 0 ? (
              <div className="space-y-4">
                <div className="h-40 w-full rounded-xl bg-linear-to-b from-emerald-50 to-transparent p-4">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                    <polyline
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-emerald-600"
                      points={sparklinePoints}
                    />
                  </svg>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {topCourses.map((course) => (
                    <div key={course.id} className="rounded-lg border bg-background p-3">
                      <p className="truncate text-sm font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course._count?.bookings || 0} enrollments
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Create courses to see trend data.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-cyan-100/70">
          <CardHeader>
            <CardTitle className="text-lg">Performance Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Enrollments</p>
              <p className="text-3xl font-bold">{totalEnrollments}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Published Courses</p>
              <p className="text-3xl font-bold">
                {recentCourses.filter((c) => c.isPublished).length}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Draft Courses</p>
              <p className="text-3xl font-bold">
                {recentCourses.filter((c) => !c.isPublished).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Courses</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentCourses.slice(0, 3).map((course) => (
            <Link key={course.id} href={`/instructor/courses/${course.id}`}>
              <Card className="h-full border-0 bg-linear-to-br from-white to-emerald-50/40 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="line-clamp-1 text-lg">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course._count?.bookings || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {/* We'd need to fetch per-course rating specifically, skipping for overview simplicity */}
                      -
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {recentCourses.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No courses yet. Create your first one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

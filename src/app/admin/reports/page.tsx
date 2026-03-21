import { prisma } from "@/app/lib/prisma";
import { getPlatformShare } from "@/lib/revenue-share";

export default async function AdminReportsPage() {
  const [grossRevenue, completedOrders, pendingOrders, topCourses] = await Promise.all([
    prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.orderItem.groupBy({
      by: ["courseId"],
      _count: { courseId: true },
      orderBy: { _count: { courseId: "desc" } },
      take: 5,
    }),
  ]);

  const courseIds = topCourses.map((row) => row.courseId);
  const courses = courseIds.length
    ? await prisma.course.findMany({
        where: { id: { in: courseIds } },
        select: { id: true, title: true },
      })
    : [];

  const courseMap = new Map(courses.map((course) => [course.id, course.title]));

  const formatNPR = (value: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced Reports</h1>
        <p className="text-muted-foreground">Sales and performance analytics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Platform Revenue (40%)</p>
          <p className="text-2xl font-bold">
            {formatNPR(getPlatformShare(Number(grossRevenue._sum.totalAmount || 0)))}
          </p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Completed Orders</p>
          <p className="text-2xl font-bold">{completedOrders}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Pending Orders</p>
          <p className="text-2xl font-bold">{pendingOrders}</p>
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <h2 className="font-semibold mb-3">Top Selling Resources</h2>
        <div className="space-y-2 text-sm">
          {topCourses.map((row) => (
            <div key={row.courseId} className="flex items-center justify-between">
              <span>{courseMap.get(row.courseId) || row.courseId}</span>
              <span className="font-medium">{row._count.courseId} sold</span>
            </div>
          ))}
          {topCourses.length === 0 && (
            <p className="text-muted-foreground">No sales data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

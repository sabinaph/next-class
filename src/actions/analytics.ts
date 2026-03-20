"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";

export async function getAnalyticsData() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error("Authentication required. Please sign in.");
  }

  // Verify user has admin role in database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    throw new Error("Admin access required. Your account does not have admin privileges.");
  }

  const [
    totalOrders,
    completedOrders,
    pendingOrders,
    totalRevenue,
    userStats,
    courseStats,
    paymentGatewayStats,
    monthlyRevenueData,
    topCoursesData,
    userGrowthData,
    bookingStats,
    wishlistStats,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: "COMPLETED" },
    }),
    Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "INSTRUCTOR" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
    ]),
    Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
    ]),
    getPaymentGatewayBreakdown(),
    getMonthlyRevenueData(),
    getTopCoursesData(),
    getUserGrowthData(),
    Promise.all([
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.count({ where: { status: "PENDING" } }),
    ]),
    prisma.wishlist.count(),
  ]);

  const [studentCount, instructorCount, adminCount] = userStats;
  const [totalCourses, publishedCourses] = courseStats;
  const [confirmedBookings, pendingBookings] = bookingStats;

  return {
    summary: {
      totalOrders,
      completedOrders,
      pendingOrders,
      totalRevenue:
        totalRevenue._sum?.totalAmount?.toFixed(2) || "0.00",
      totalStudents: studentCount,
      totalInstructors: instructorCount,
      totalAdmins: adminCount,
      totalCourses,
      publishedCourses,
      confirmedBookings,
      pendingBookings,
      wishlistCount: wishlistStats,
    },
    charts: {
      paymentGateway: paymentGatewayStats,
      monthlyRevenue: monthlyRevenueData,
      topCourses: topCoursesData,
      userGrowth: userGrowthData,
    },
  };
}

export async function getPaymentGatewayBreakdown() {
  const result = await prisma.order.groupBy({
    by: ["paymentGateway"],
    _count: true,
    _sum: {
      totalAmount: true,
    },
    where: { status: "COMPLETED" },
  });

  return result.map((item) => ({
    name: item.paymentGateway || "Unknown",
    value: item._count,
    revenue: Number(item._sum?.totalAmount || 0),
  }));
}

export async function getMonthlyRevenueData() {
  const orders = await prisma.order.findMany({
    where: { status: "COMPLETED" },
    select: {
      totalAmount: true,
      paidAt: true,
    },
    orderBy: {
      paidAt: "asc",
    },
  });

  // Group by month
  const monthlyData: Record<string, number> = {};

  orders.forEach((order) => {
    if (!order.paidAt) return;
    const date = new Date(order.paidAt);
    const monthKey = date.toISOString().split("T")[0].slice(0, 7); // YYYY-MM

    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(order.totalAmount);
  });

  return Object.entries(monthlyData)
    .map(([month, revenue]) => ({
      month,
      revenue: parseFloat(revenue.toFixed(2)),
    }))
    .slice(-12); // Last 12 months
}

export async function getTopCoursesData() {
  const topCourses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          orderItems: true,
          bookings: true,
        },
      },
      price: true,
    },
    orderBy: {
      orderItems: {
        _count: "desc",
      },
    },
    take: 5,
  });

  return topCourses.map((course) => ({
    name: course.title,
    enrollments: course._count.orderItems + course._count.bookings,
    price: Number(course.price),
  }));
}

export async function getUserGrowthData() {
  const users = await prisma.user.findMany({
    select: {
      createdAt: true,
      role: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Group by month
  const monthlyUsers: Record<string, { students: number; instructors: number }> = {};

  users.forEach((user) => {
    const monthKey = user.createdAt.toISOString().split("T")[0].slice(0, 7);

    if (!monthlyUsers[monthKey]) {
      monthlyUsers[monthKey] = { students: 0, instructors: 0 };
    }

    if (user.role === "STUDENT") {
      monthlyUsers[monthKey].students++;
    } else if (user.role === "INSTRUCTOR") {
      monthlyUsers[monthKey].instructors++;
    }
  });

  return Object.entries(monthlyUsers)
    .map(([month, data]) => ({
      month,
      students: data.students,
      instructors: data.instructors,
    }))
    .slice(-12); // Last 12 months
}

export async function getCourseCompletionStats() {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          bookings: {
            where: { status: "COMPLETED" },
          },
          orderItems: true,
        },
      },
    },
    take: 10,
  });

  return courses.map((course) => {
    const totalEnrollments = course._count.orderItems;
    const completions = course._count.bookings;
    const completionRate =
      totalEnrollments > 0
        ? Math.round((completions / totalEnrollments) * 100)
        : 0;

    return {
      name: course.title,
      completions,
      totalEnrollments,
      completionRate,
    };
  });
}

export async function getRevenueByCategory() {
  const result = await prisma.course.groupBy({
    by: ["category"],
    _count: true,
    _sum: {
      price: true,
    },
  });

  return result.map((item) => {
    const totalPrice = item._sum.price ? Number(item._sum.price) : 0;
    return {
      name: item.category || "Uncategorized",
      courses: item._count,
      avgPrice: totalPrice > 0 ? totalPrice / item._count : 0,
    };
  });
}

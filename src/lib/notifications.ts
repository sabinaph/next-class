import { prisma } from "@/app/lib/prisma";

export type NotificationType = "ANNOUNCEMENT" | "NEW_LESSON" | "NEW_COURSE";
export type ExtendedNotificationType =
  | NotificationType
  | "COMMUNITY_POST"
  | "COMMUNITY_COMMENT"
  | "COMMUNITY_REPLY"
  | "COMMUNITY_REACTION"
  | "QUIZ_PUBLISHED"
  | "QUIZ_ATTEMPTED";

export interface NotificationItem {
  id: string;
  type: ExtendedNotificationType;
  title: string;
  description: string;
  href: string;
  createdAt: string;
}

export async function buildNotificationItemsForUser(
  userId: string
): Promise<NotificationItem[]> {
  const userNotifications = await prisma.userNotification.findMany({
    where: {
      userId,
      isRead: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
  });

  const completedOrders = await prisma.order.findMany({
    where: {
      userId,
      status: "COMPLETED",
    },
    orderBy: {
      paidAt: "desc",
    },
    include: {
      items: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              instructorId: true,
            },
          },
        },
      },
    },
  });

  const purchaseDateByCourseId = new Map<string, Date>();
  const firstPurchaseDateByInstructorId = new Map<string, Date>();

  for (const order of completedOrders) {
    const purchaseDate = order.paidAt || order.createdAt;

    for (const item of order.items) {
      const currentCourseDate = purchaseDateByCourseId.get(item.course.id);
      if (!currentCourseDate || purchaseDate < currentCourseDate) {
        purchaseDateByCourseId.set(item.course.id, purchaseDate);
      }

      const currentInstructorDate = firstPurchaseDateByInstructorId.get(
        item.course.instructorId
      );
      if (!currentInstructorDate || purchaseDate < currentInstructorDate) {
        firstPurchaseDateByInstructorId.set(item.course.instructorId, purchaseDate);
      }
    }
  }

  const purchasedCourseIds = Array.from(purchaseDateByCourseId.keys());
  const purchasedCourseIdSet = new Set(purchasedCourseIds);
  const instructorIds = Array.from(firstPurchaseDateByInstructorId.keys());

  const [announcements, lessons, newInstructorCourses] =
    purchasedCourseIds.length === 0
      ? [[], [], []]
      : await Promise.all([
          prisma.announcement.findMany({
            where: {
              courseId: { in: purchasedCourseIds },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          }),
          prisma.lesson.findMany({
            where: {
              courseId: { in: purchasedCourseIds },
              isPublished: true,
            },
            orderBy: { createdAt: "desc" },
            take: 20,
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          }),
          prisma.course.findMany({
            where: {
              instructorId: { in: instructorIds },
              isPublished: true,
              isActive: true,
            },
            orderBy: { createdAt: "desc" },
            take: 20,
            include: {
              instructor: {
                select: {
                  firstName: true,
                  lastName: true,
                  name: true,
                },
              },
            },
          }),
        ]);

  const notifications: NotificationItem[] = [];

  for (const announcement of announcements) {
    const purchaseDate = purchaseDateByCourseId.get(announcement.courseId);
    if (!purchaseDate || announcement.createdAt < purchaseDate) continue;

    notifications.push({
      id: `announcement:${announcement.id}`,
      type: "ANNOUNCEMENT",
      title: `New announcement in ${announcement.course.title}`,
      description: announcement.title,
      href: `/courses/${announcement.course.id}`,
      createdAt: announcement.createdAt.toISOString(),
    });
  }

  for (const lesson of lessons) {
    const purchaseDate = purchaseDateByCourseId.get(lesson.courseId);
    if (!purchaseDate || lesson.createdAt < purchaseDate) continue;

    notifications.push({
      id: `lesson:${lesson.id}`,
      type: "NEW_LESSON",
      title: `New lesson added in ${lesson.course.title}`,
      description: lesson.title,
      href: `/learn/${lesson.course.id}`,
      createdAt: lesson.createdAt.toISOString(),
    });
  }

  for (const course of newInstructorCourses) {
    if (purchasedCourseIdSet.has(course.id)) continue;

    const purchaseDate = firstPurchaseDateByInstructorId.get(course.instructorId);
    if (!purchaseDate || course.createdAt < purchaseDate) continue;

    const instructorName =
      `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim() ||
      course.instructor.name ||
      "Your instructor";

    notifications.push({
      id: `course:${course.id}`,
      type: "NEW_COURSE",
      title: `${instructorName} published a new course`,
      description: course.title,
      href: `/courses/${course.id}`,
      createdAt: course.createdAt.toISOString(),
    });
  }

  const activityNotifications: NotificationItem[] = userNotifications.map(
    (notification) => ({
      id: `user:${notification.id}`,
      type: notification.type,
      title: notification.title,
      description: notification.description,
      href: notification.href,
      createdAt: notification.createdAt.toISOString(),
    })
  );

  const mergedNotifications = [...activityNotifications, ...notifications];

  mergedNotifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return mergedNotifications.slice(0, 25);
}

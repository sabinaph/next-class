import { prisma } from "@/app/lib/prisma";
import { isBlockedRecipientEmail, sendAutomatedStudentNotificationEmail } from "@/lib/email";

interface Recipient {
  email: string;
  userName: string;
}

function resolveUserName(user: {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
}) {
  return (
    user.name ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "Learner"
  );
}

function normalizeRecipients(recipients: Recipient[]) {
  const unique = new Map<string, Recipient>();

  for (const recipient of recipients) {
    const email = recipient.email.trim().toLowerCase();
    if (!email || isBlockedRecipientEmail(email)) continue;
    if (!unique.has(email)) {
      unique.set(email, { ...recipient, email });
    }
  }

  return Array.from(unique.values());
}

async function getCoursePurchaserRecipients(courseId: string) {
  const orders = await prisma.order.findMany({
    where: {
      status: "COMPLETED",
      items: {
        some: {
          courseId,
        },
      },
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          isActive: true,
          deletedAt: true,
        },
      },
    },
  });

  const recipients = orders
    .filter((order) => order.user.isActive && !order.user.deletedAt && !!order.user.email)
    .map((order) => ({
      email: order.user.email,
      userName: resolveUserName(order.user),
    }));

  return normalizeRecipients(recipients);
}

async function getInstructorAudienceRecipients(instructorId: string, excludeCourseId?: string) {
  const orders = await prisma.order.findMany({
    where: {
      status: "COMPLETED",
      items: {
        some: {
          course: {
            instructorId,
          },
        },
      },
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          isActive: true,
          deletedAt: true,
        },
      },
      items: {
        select: {
          courseId: true,
        },
      },
    },
  });

  const recipients = orders
    .filter((order) => {
      if (!order.user.isActive || order.user.deletedAt || !order.user.email) {
        return false;
      }

      if (!excludeCourseId) {
        return true;
      }

      return !order.items.some((item) => item.courseId === excludeCourseId);
    })
    .map((order) => ({
      email: order.user.email,
      userName: resolveUserName(order.user),
    }));

  return normalizeRecipients(recipients);
}

async function sendToRecipients(
  recipients: Recipient[],
  payload: {
    eventTitle: string;
    eventDescription: string;
    actionUrl: string;
    actionLabel: string;
  }
) {
  if (recipients.length === 0) return;

  await Promise.allSettled(
    recipients.map((recipient) =>
      sendAutomatedStudentNotificationEmail({
        to: recipient.email,
        userName: recipient.userName,
        eventTitle: payload.eventTitle,
        eventDescription: payload.eventDescription,
        actionUrl: payload.actionUrl,
        actionLabel: payload.actionLabel,
      })
    )
  );
}

export async function notifyStudentsAboutAnnouncement(data: {
  courseId: string;
  courseTitle: string;
  announcementTitle: string;
}) {
  const recipients = await getCoursePurchaserRecipients(data.courseId);
  const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || "http://localhost:3000";

  await sendToRecipients(recipients, {
    eventTitle: `New announcement in ${data.courseTitle}`,
    eventDescription: data.announcementTitle,
    actionUrl: `${appUrl}/courses/${data.courseId}`,
    actionLabel: "View Announcement",
  });
}

export async function notifyStudentsAboutNewLesson(data: {
  courseId: string;
  courseTitle: string;
  lessonTitle: string;
}) {
  const recipients = await getCoursePurchaserRecipients(data.courseId);
  const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || "http://localhost:3000";

  await sendToRecipients(recipients, {
    eventTitle: `New lesson added in ${data.courseTitle}`,
    eventDescription: data.lessonTitle,
    actionUrl: `${appUrl}/learn/${data.courseId}`,
    actionLabel: "Start Learning",
  });
}

export async function notifyStudentsAboutNewCourse(data: {
  instructorId: string;
  courseId: string;
  courseTitle: string;
}) {
  const recipients = await getInstructorAudienceRecipients(
    data.instructorId,
    data.courseId
  );

  const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || "http://localhost:3000";

  await sendToRecipients(recipients, {
    eventTitle: "Your instructor published a new course",
    eventDescription: data.courseTitle,
    actionUrl: `${appUrl}/courses/${data.courseId}`,
    actionLabel: "View Course",
  });
}

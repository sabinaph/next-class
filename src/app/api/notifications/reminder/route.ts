import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import {
  isBlockedRecipientEmail,
  sendNotificationsDigestEmail,
} from "@/lib/email";
import { buildNotificationItemsForUser } from "@/lib/notifications";

function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const value = (type: string) => parts.find((p) => p.type === type)?.value || "00";

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: Number(value("hour")),
  };
}

function getReminderSlot(hour: number) {
  if (hour < 12) return "MORNING";
  if (hour < 18) return "AFTERNOON";
  return "EVENING";
}

export async function POST(request: Request) {
  const expectedSecret =
    process.env.NOTIFICATION_CRON_SECRET || process.env.CRON_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "NOTIFICATION_CRON_SECRET is not configured." },
      { status: 500 }
    );
  }

  const receivedSecret = request.headers.get("x-reminder-secret");
  if (receivedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timeZone = process.env.NOTIFICATION_TIMEZONE || "Asia/Kathmandu";
  const now = new Date();
  const parts = getDatePartsInTimeZone(now, timeZone);
  const slot = getReminderSlot(parts.hour);
  const dateKey = `${parts.year}-${parts.month}-${parts.day}`;
  const slotKey = `${dateKey}-${slot}`;

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      isActive: true,
      deletedAt: null,
      orders: {
        some: {
          status: "COMPLETED",
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
    },
  });

  let sentCount = 0;
  let skippedCount = 0;

  for (const student of students) {
    if (!student.email || isBlockedRecipientEmail(student.email)) {
      skippedCount += 1;
      continue;
    }

    const alreadySent = await prisma.audit.findFirst({
      where: {
        userId: student.id,
        entityType: "NotificationReminder",
        entityId: slotKey,
      },
      select: { id: true },
    });

    if (alreadySent) {
      skippedCount += 1;
      continue;
    }

    const notifications = await buildNotificationItemsForUser(student.id);
    if (notifications.length === 0) {
      skippedCount += 1;
      continue;
    }

    const appUrl =
      process.env.NEXTAUTH_URL || process.env.APP_URL || "http://localhost:3000";

    const sent = await sendNotificationsDigestEmail({
      to: student.email,
      userName:
        student.name ||
        `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
        "Learner",
      appUrl,
      notifications,
    });

    if (!sent) {
      skippedCount += 1;
      continue;
    }

    await prisma.audit.create({
      data: {
        userId: student.id,
        action: "UPDATE",
        entityType: "NotificationReminder",
        entityId: slotKey,
        metadata: {
          slot,
          timeZone,
          notificationsCount: notifications.length,
        },
      },
    });

    sentCount += 1;
  }

  return NextResponse.json({
    message: "Reminder job completed.",
    slot,
    slotKey,
    timeZone,
    sentCount,
    skippedCount,
    totalStudents: students.length,
  });
}

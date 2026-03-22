import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { isBlockedRecipientEmail, sendNotificationsDigestEmail } from "@/lib/email";
import { buildNotificationItemsForUser } from "@/lib/notifications";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await buildNotificationItemsForUser(session.user.id);

  return NextResponse.json({
    count: notifications.length,
    notifications,
  });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isBlockedRecipientEmail(session.user.email)) {
    return NextResponse.json(
      {
        error:
          "Your account email is a demo/test address. Please update your profile email to a real inbox before sending notifications.",
      },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || "http://localhost:3000";

  const pendingEmailNotifications = await prisma.userNotification.findMany({
    where: {
      userId: session.user.id,
      isRead: false,
      emailedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 25,
  });

  const notifications = pendingEmailNotifications.map((notification) => ({
    title: notification.title,
    description: notification.description,
    href: notification.href,
    createdAt: notification.createdAt.toISOString(),
  }));

  const sent = await sendNotificationsDigestEmail({
    to: session.user.email,
    userName: session.user.name || "Learner",
    appUrl,
    notifications,
  });

  if (!sent) {
    return NextResponse.json(
      { error: "Failed to send notifications email." },
      { status: 500 }
    );
  }

  if (pendingEmailNotifications.length > 0) {
    await prisma.userNotification.updateMany({
      where: {
        id: {
          in: pendingEmailNotifications.map((item) => item.id),
        },
      },
      data: {
        emailedAt: new Date(),
      },
    });
  }

  return NextResponse.json({
    message: "Notifications sent to your email.",
    count: notifications.length,
  });
}

export async function PATCH() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.userNotification.updateMany({
    where: {
      userId: session.user.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return NextResponse.json({
    success: true,
  });
}

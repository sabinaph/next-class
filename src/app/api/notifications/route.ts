import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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

  const notifications = await buildNotificationItemsForUser(session.user.id);

  const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || "http://localhost:3000";

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

  return NextResponse.json({
    message: "Notifications sent to your email.",
    count: notifications.length,
  });
}

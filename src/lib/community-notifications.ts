import { prisma } from "@/app/lib/prisma";
import { isBlockedRecipientEmail, sendAutomatedStudentNotificationEmail } from "@/lib/email";

type NotificationType =
  | "COMMUNITY_POST"
  | "COMMUNITY_COMMENT"
  | "COMMUNITY_REPLY"
  | "COMMUNITY_REACTION"
  | "QUIZ_PUBLISHED"
  | "QUIZ_ATTEMPTED";

function resolveUserName(user: {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
}) {
  return user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Learner";
}

async function createAndSendNotifications(params: {
  recipientIds: string[];
  actorId?: string;
  type: NotificationType;
  title: string;
  description: string;
  href: string;
  emailActionLabel?: string;
}) {
  const recipientIds = Array.from(new Set(params.recipientIds.filter(Boolean)));
  if (recipientIds.length === 0) return;

  const notifications = recipientIds.map((userId) => ({
    userId,
    actorId: params.actorId || null,
    type: params.type,
    title: params.title,
    description: params.description,
    href: params.href,
  }));

  await prisma.userNotification.createMany({
    data: notifications,
    skipDuplicates: false,
  });

  const recipients = await prisma.user.findMany({
    where: {
      id: { in: recipientIds },
      isActive: true,
      deletedAt: null,
    },
    select: {
      email: true,
      name: true,
      firstName: true,
      lastName: true,
    },
  });

  const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || "http://localhost:3000";

  await Promise.allSettled(
    recipients
      .filter((recipient) => !!recipient.email && !isBlockedRecipientEmail(recipient.email!))
      .map((recipient) =>
        sendAutomatedStudentNotificationEmail({
          to: recipient.email!,
          userName: resolveUserName(recipient),
          eventTitle: params.title,
          eventDescription: params.description,
          actionUrl: `${appUrl}${params.href}`,
          actionLabel: params.emailActionLabel || "Open",
        })
      )
  );
}

async function getCommunityAudience(excludeUserId?: string) {
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["STUDENT", "INSTRUCTOR"] },
      isActive: true,
      deletedAt: null,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: { id: true },
  });

  return users.map((user) => user.id);
}

export async function notifyCommunityPostCreated(data: {
  actorId: string;
  title: string;
  description: string;
  href: string;
}) {
  const recipientIds = await getCommunityAudience(data.actorId);

  await createAndSendNotifications({
    recipientIds,
    actorId: data.actorId,
    type: "COMMUNITY_POST",
    title: data.title,
    description: data.description,
    href: data.href,
    emailActionLabel: "View Discussion",
  });
}

export async function notifyCommunityCommentCreated(data: {
  actorId: string;
  recipientId: string;
  title: string;
  description: string;
  href: string;
}) {
  if (data.actorId === data.recipientId) return;

  await createAndSendNotifications({
    recipientIds: [data.recipientId],
    actorId: data.actorId,
    type: "COMMUNITY_COMMENT",
    title: data.title,
    description: data.description,
    href: data.href,
    emailActionLabel: "View Comment",
  });
}

export async function notifyCommunityReplyCreated(data: {
  actorId: string;
  recipientId: string;
  title: string;
  description: string;
  href: string;
}) {
  if (data.actorId === data.recipientId) return;

  await createAndSendNotifications({
    recipientIds: [data.recipientId],
    actorId: data.actorId,
    type: "COMMUNITY_REPLY",
    title: data.title,
    description: data.description,
    href: data.href,
    emailActionLabel: "View Reply",
  });
}

export async function notifyCommunityReactionCreated(data: {
  actorId: string;
  recipientId: string;
  title: string;
  description: string;
  href: string;
}) {
  if (data.actorId === data.recipientId) return;

  await createAndSendNotifications({
    recipientIds: [data.recipientId],
    actorId: data.actorId,
    type: "COMMUNITY_REACTION",
    title: data.title,
    description: data.description,
    href: data.href,
    emailActionLabel: "View Activity",
  });
}

export async function notifyQuizPublished(data: {
  actorId: string;
  title: string;
  description: string;
  href: string;
}) {
  const recipientIds = await getCommunityAudience(data.actorId);

  await createAndSendNotifications({
    recipientIds,
    actorId: data.actorId,
    type: "QUIZ_PUBLISHED",
    title: data.title,
    description: data.description,
    href: data.href,
    emailActionLabel: "Take Quiz",
  });
}

export async function notifyQuizAttempted(data: {
  actorId: string;
  recipientId: string;
  title: string;
  description: string;
  href: string;
}) {
  if (data.actorId === data.recipientId) return;

  await createAndSendNotifications({
    recipientIds: [data.recipientId],
    actorId: data.actorId,
    type: "QUIZ_ATTEMPTED",
    title: data.title,
    description: data.description,
    href: data.href,
    emailActionLabel: "Review Attempt",
  });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { notifyCommunityReactionCreated } from "@/lib/community-notifications";

const reactionSchema = z.object({
  commentId: z.string().optional(),
});

async function getAuthorizedSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) return null;
  if (!["STUDENT", "INSTRUCTOR"].includes(session.user.role)) return null;
  return session;
}

interface RouteContext {
  params: Promise<{ postId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await getAuthorizedSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await context.params;

  try {
    const body = await request.json();
    const data = reactionSchema.parse(body);

    if (data.commentId) {
      const comment = await prisma.communityComment.findUnique({
        where: { id: data.commentId },
        select: {
          id: true,
          postId: true,
          authorId: true,
          post: { select: { title: true } },
        },
      });

      if (!comment || comment.postId !== postId) {
        return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 });
      }

      const existing = await prisma.communityReaction.findFirst({
        where: {
          userId: session.user.id,
          commentId: comment.id,
        },
        select: { id: true },
      });

      if (existing) {
        await prisma.communityReaction.delete({ where: { id: existing.id } });
        return NextResponse.json({ success: true, action: "removed" });
      }

      await prisma.communityReaction.create({
        data: {
          userId: session.user.id,
          commentId: comment.id,
        },
      });

      await notifyCommunityReactionCreated({
        actorId: session.user.id,
        recipientId: comment.authorId,
        title: "Someone reacted to your comment",
        description: comment.post.title,
        href: "/community",
      });

      return NextResponse.json({ success: true, action: "added" });
    }

    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true, title: true },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    const existing = await prisma.communityReaction.findFirst({
      where: {
        userId: session.user.id,
        postId: post.id,
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.communityReaction.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, action: "removed" });
    }

    await prisma.communityReaction.create({
      data: {
        userId: session.user.id,
        postId: post.id,
      },
    });

    await notifyCommunityReactionCreated({
      actorId: session.user.id,
      recipientId: post.authorId,
      title: "Someone reacted to your post",
      description: post.title,
      href: "/community",
    });

    return NextResponse.json({ success: true, action: "added" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update reaction" },
      { status: 500 }
    );
  }
}

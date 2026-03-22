import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import {
  notifyCommunityCommentCreated,
  notifyCommunityReplyCreated,
} from "@/lib/community-notifications";

const addCommentSchema = z.object({
  body: z.string().min(2, "Comment is required"),
  parentId: z.string().optional(),
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
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        authorId: true,
      },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = addCommentSchema.parse(body);

    if (data.parentId) {
      const parentComment = await prisma.communityComment.findUnique({
        where: { id: data.parentId },
        select: { id: true, postId: true, authorId: true },
      });

      if (!parentComment || parentComment.postId !== post.id) {
        return NextResponse.json(
          { success: false, error: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    const comment = await prisma.communityComment.create({
      data: {
        postId: post.id,
        authorId: session.user.id,
        parentId: data.parentId || null,
        body: data.body,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (data.parentId) {
      const parentComment = await prisma.communityComment.findUnique({
        where: { id: data.parentId },
        select: { authorId: true },
      });

      if (parentComment) {
        await notifyCommunityReplyCreated({
          actorId: session.user.id,
          recipientId: parentComment.authorId,
          title: "Someone replied to your comment",
          description: post.title,
          href: "/community",
        });
      }
    } else {
      await notifyCommunityCommentCreated({
        actorId: session.user.id,
        recipientId: post.authorId,
        title: "New comment on your post",
        description: post.title,
        href: "/community",
      });
    }

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to add comment" },
      { status: 500 }
    );
  }
}

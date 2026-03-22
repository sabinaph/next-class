import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { notifyCommunityPostCreated } from "@/lib/community-notifications";

const createPostSchema = z.object({
  title: z.string().min(5, "Title is required"),
  body: z.string().min(10, "Post details are required"),
  type: z.enum(["QUESTION", "DISCUSSION"]).default("QUESTION"),
  courseId: z.string().optional(),
});

async function getAuthorizedSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) return null;
  if (!["STUDENT", "INSTRUCTOR"].includes(session.user.role)) return null;
  return session;
}

export async function GET() {
  const session = await getAuthorizedSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.communityPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
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
      course: {
        select: {
          id: true,
          title: true,
        },
      },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "asc" },
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
          replies: {
            orderBy: { createdAt: "asc" },
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
              reactions: {
                select: {
                  id: true,
                  userId: true,
                },
              },
            },
          },
          reactions: {
            select: {
              id: true,
              userId: true,
            },
          },
        },
      },
      reactions: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    posts,
    viewerId: session.user.id,
  });
}

export async function POST(request: NextRequest) {
  const session = await getAuthorizedSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createPostSchema.parse(body);

    const createdPost = await prisma.communityPost.create({
      data: {
        title: data.title,
        body: data.body,
        type: data.type,
        courseId: data.courseId || null,
        authorId: session.user.id,
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

    await notifyCommunityPostCreated({
      actorId: session.user.id,
      title: "New community post",
      description: createdPost.title,
      href: "/community",
    });

    return NextResponse.json({ success: true, post: createdPost });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create post" },
      { status: 500 }
    );
  }
}

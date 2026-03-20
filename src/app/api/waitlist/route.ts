import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { UserRole } from "@/types";

// Join waitlist
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId, isActive: true },
      include: { _count: { select: { bookings: true } } },
    });
    if (!course || !course.isPublished) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Already enrolled?
    const existingBooking = await prisma.booking.findFirst({
      where: {
        courseId,
        studentId: session.user.id,
        status: { in: ["CONFIRMED", "PENDING", "COMPLETED"] },
      },
    });
    if (existingBooking) {
      return NextResponse.json({ error: "You are already enrolled or pending" }, { status: 400 });
    }

    const existingWait = await prisma.waitlist.findUnique({
      where: {
        studentId_courseId: { studentId: session.user.id, courseId },
      },
    });
    if (existingWait) {
      return NextResponse.json({ success: true, message: "Already on waitlist" });
    }

    const position = (await prisma.waitlist.count({ where: { courseId } })) + 1;

    const entry = await prisma.waitlist.create({
      data: {
        studentId: session.user.id,
        courseId,
        position,
      },
    });

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error("[WAITLIST_POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Leave waitlist
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    await prisma.waitlist.deleteMany({
      where: {
        courseId,
        studentId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WAITLIST_DELETE]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Promote next student (admin/instructor)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    const canPromote = role === UserRole.ADMIN || role === UserRole.INSTRUCTOR;
    if (!session?.user?.id || !canPromote) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const next = await prisma.waitlist.findFirst({
      where: { courseId, status: "ACTIVE" },
      orderBy: { position: "asc" },
    });

    if (!next) {
      return NextResponse.json({ error: "No waitlisted students" }, { status: 404 });
    }

    const updated = await prisma.waitlist.update({
      where: { id: next.id },
      data: { status: "NOTIFIED", notifiedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[WAITLIST_PATCH]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

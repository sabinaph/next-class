import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProfileDashboard from "@/components/profile/ProfileDashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/auth/signin");
  }

  // Fetch fresh user data including username, bookings, and wishlist
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      bookings: {
        include: {
          course: {
            include: {
              instructor: {
                select: {
                  name: true,
                  firstName: true,
                },
              },
            },
          },
          session: true,
        },
        orderBy: { createdAt: "desc" },
      },
      wishlist: {
        include: {
          course: true,
        },
      },
      certificates: {
        include: {
          course: {
            include: {
              instructor: {
                select: {
                  name: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { issueDate: "desc" },
      },
    },
  });

  if (!user) {
    // Handle edge case where session exists but user deleted
    redirect("/auth/signin");
  }

  // Sanitize data for client and convert Dates to strings
  const userData = {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email,
    username: user.username || "",
    bookings: user.bookings.map((booking) => ({
      id: booking.id,
      bookingReference: booking.bookingReference,
      studentId: booking.studentId,
      courseId: booking.courseId,
      sessionId: booking.sessionId,
      status: booking.status,
      numberOfSeats: booking.numberOfSeats,
      totalAmount: booking.totalAmount.toString(),
      cancellationDate: booking.cancellationDate
        ? booking.cancellationDate.toISOString()
        : null,
      cancellationReason: booking.cancellationReason,
      attended: booking.attended,
      attendanceMarkedAt: booking.attendanceMarkedAt
        ? booking.attendanceMarkedAt.toISOString()
        : null,
      deletedAt: booking.deletedAt ? booking.deletedAt.toISOString() : null,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      session: {
        ...booking.session,
        sessionDate: booking.session.sessionDate.toISOString(),
        startTime: booking.session.startTime.toISOString(),
        endTime: booking.session.endTime.toISOString(),
        deletedAt: booking.session.deletedAt
          ? booking.session.deletedAt.toISOString()
          : null,
        createdAt: booking.session.createdAt.toISOString(),
        updatedAt: booking.session.updatedAt.toISOString(),
      },
      course: {
        ...booking.course,
        price: booking.course.price.toString(), // Decimal to string
        createdAt: booking.course.createdAt.toISOString(),
        updatedAt: booking.course.updatedAt.toISOString(),
      },
    })),
    wishlist: user.wishlist.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      course: {
        ...item.course,
        price: item.course.price.toString(), // Decimal to string
        createdAt: item.course.createdAt.toISOString(),
        updatedAt: item.course.updatedAt.toISOString(),
      },
    })),
    certificates: user.certificates.map((certificate) => ({
      ...certificate,
      issueDate: certificate.issueDate.toISOString(),
      expiryDate: certificate.expiryDate
        ? certificate.expiryDate.toISOString()
        : null,
      createdAt: certificate.createdAt.toISOString(),
      updatedAt: certificate.updatedAt.toISOString(),
      certificateUrl:
        certificate.certificateUrl ||
        `/api/certificates/${certificate.id}/download`,
      course: {
        ...certificate.course,
        price: certificate.course.price.toString(),
        createdAt: certificate.course.createdAt.toISOString(),
        updatedAt: certificate.course.updatedAt.toISOString(),
      },
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="outline">Cart</Button>
            </Link>
            <Link href="/profile/orders">
              <Button variant="outline">Payment History</Button>
            </Link>
            <Link href="/profile/downloads">
              <Button variant="outline">Download History</Button>
            </Link>
          </div>
        </div>
        <ProfileDashboard initialData={userData} />
      </div>
    </div>
  );
}

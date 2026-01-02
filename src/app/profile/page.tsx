import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProfileDashboard from "@/components/profile/ProfileDashboard";

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
      ...booking,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      session: {
        ...booking.session,
        sessionDate: booking.session.sessionDate.toISOString(),
        startTime: booking.session.startTime.toISOString(),
        endTime: booking.session.endTime.toISOString(),
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
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          My Profile
        </h1>
        <ProfileDashboard initialData={userData} />
      </div>
    </div>
  );
}

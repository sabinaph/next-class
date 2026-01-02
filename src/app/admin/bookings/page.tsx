import { prisma } from "@/app/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      student: { select: { name: true, email: true } },
      course: { select: { title: true } },
      session: { select: { sessionDate: true, startTime: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            View and manage all course bookings.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">Reference</th>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Course / Session</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 font-medium">
                      #{booking.bookingReference}
                    </td>
                    <td className="px-6 py-4">
                      {booking.student.name}
                      <div className="text-xs text-muted-foreground">
                        {booking.student.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{booking.course.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(
                          booking.session.sessionDate
                        ).toLocaleDateString()}{" "}
                        @{" "}
                        {new Date(booking.session.startTime).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      ${Number(booking.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full 
                         ${
                           booking.status === "CONFIRMED"
                             ? "bg-green-100 text-green-700"
                             : booking.status === "PENDING"
                             ? "bg-yellow-100 text-yellow-700"
                             : booking.status === "CANCELLED"
                             ? "bg-red-100 text-red-700"
                             : "bg-gray-100 text-gray-700"
                         }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

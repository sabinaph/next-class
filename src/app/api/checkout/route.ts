import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId } = await req.json();

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Check if user already booked/enrolled (simplistic check)
    // In a real app, you'd check Booking status 'CONFIRMED' or 'COMPLETED'
    const existingBooking = await prisma.booking.findFirst({
      where: {
        studentId: session.user.id,
        courseId: course.id,
        status: "CONFIRMED",
      },
    });

    if (existingBooking) {
      return new NextResponse("Already enrolled", { status: 400 });
    }

    // Create a checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.description?.substring(0, 100), // Truncate details
              images: course.thumbnail ? [course.thumbnail] : [],
            },
            unit_amount: Math.round(Number(course.price) * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}/enroll/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}`,
      metadata: {
        courseId: course.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

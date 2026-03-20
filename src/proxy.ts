import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function getRoleHome(role?: string | null) {
  if (role === "ADMIN") return "/admin";
  if (role === "INSTRUCTOR") return "/instructor";
  return "/";
}

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isInstructorRoute = pathname.startsWith("/instructor");
  const isAuthRoute = pathname.startsWith("/auth");
  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/courses") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/bookings") ||
    pathname.startsWith("/sessions") ||
    isAdminRoute ||
    isInstructorRoute;

  if (!token && isProtectedRoute) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (token && isAdminRoute && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL(getRoleHome(token.role as string), req.url));
  }

  if (token && isInstructorRoute && token.role !== "INSTRUCTOR") {
    return NextResponse.redirect(new URL(getRoleHome(token.role as string), req.url));
  }

  // Keep staff users on their own area only.
  if (token?.role === "ADMIN" && !isAdminRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (token?.role === "INSTRUCTOR" && !isInstructorRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL("/instructor", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/instructor/:path*",
    "/courses/:path*",
    "/profile/:path*",
    "/dashboard/:path*",
    "/bookings/:path*",
    "/sessions/:path*",
  ],
};

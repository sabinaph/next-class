import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { verifyDownloadToken } from "@/lib/download-token";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new NextResponse("Missing token", { status: 400 });
  }

  const payload = verifyDownloadToken(token);
  if (!payload) {
    return new NextResponse("Invalid or expired token", { status: 400 });
  }

  if (payload.userId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.redirect(payload.fileUrl);
}

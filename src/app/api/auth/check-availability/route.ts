import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const { field, value } = await req.json();

    if (!field || !value) {
      return NextResponse.json(
        { error: "Field and value are required" },
        { status: 400 }
      );
    }

    if (field !== "username" && field !== "email") {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        [field]: value,
      },
    });

    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    console.error("Check availability error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_VIDEO_BYTES = 300 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file." }, { status: 400 });
    }

    if (file.size > MAX_VIDEO_BYTES) {
      return NextResponse.json(
        { error: "Video file is too large. Max 300MB allowed." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Only video files are allowed." },
        { status: 400 }
      );
    }

    const extension = path.extname(file.name || "").toLowerCase().replace(/[^a-z0-9.]/g, "");
    const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;

    const uploadsRoot = path.join(process.cwd(), "public", "uploads", "application-videos");
    await mkdir(uploadsRoot, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsRoot, fileName), buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/application-videos/${fileName}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Upload failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

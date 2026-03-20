import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type UploadKind = "thumbnail" | "video" | "pdf" | "file";

const kindConfig: Record<
  UploadKind,
  { folder: string; maxBytes: number; accepts: string[] }
> = {
  thumbnail: {
    folder: "thumbnails",
    maxBytes: 8 * 1024 * 1024,
    accepts: ["image/"],
  },
  video: {
    folder: "videos",
    maxBytes: 512 * 1024 * 1024,
    accepts: ["video/"],
  },
  pdf: {
    folder: "pdfs",
    maxBytes: 32 * 1024 * 1024,
    accepts: ["application/pdf"],
  },
  file: {
    folder: "files",
    maxBytes: 64 * 1024 * 1024,
    accepts: [""],
  },
};

const isAllowedType = (mimeType: string, kind: UploadKind) => {
  const allowed = kindConfig[kind].accepts;
  if (allowed.includes("")) return true;
  return allowed.some((item) => mimeType.startsWith(item));
};

const safeExtension = (fileName: string) => {
  const extension = path.extname(fileName || "").toLowerCase();
  if (!extension || extension.length > 10) return "";
  return extension.replace(/[^a-z0-9.]/g, "");
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const kindRaw = formData.get("kind");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const kind: UploadKind =
      kindRaw === "thumbnail" ||
      kindRaw === "video" ||
      kindRaw === "pdf" ||
      kindRaw === "file"
        ? kindRaw
        : "file";

    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file." }, { status: 400 });
    }

    if (file.size > kindConfig[kind].maxBytes) {
      return NextResponse.json(
        { error: "File is too large for this upload type." },
        { status: 400 }
      );
    }

    if (!isAllowedType(file.type || "", kind)) {
      return NextResponse.json(
        { error: "File type is not allowed for this upload." },
        { status: 400 }
      );
    }

    const extension = safeExtension(file.name);
    const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;

    const uploadsRoot = path.join(process.cwd(), "public", "uploads");
    const folder = kindConfig[kind].folder;
    const targetDir = path.join(uploadsRoot, folder);
    await mkdir(targetDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(targetDir, fileName), buffer);

    return NextResponse.json({
      url: `/uploads/${folder}/${fileName}`,
    });
  } catch (error) {
    console.error("Failed local upload", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}

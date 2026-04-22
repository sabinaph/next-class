import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const f = createUploadthing();

const handleAuth = async () => {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'INSTRUCTOR') throw new Error("Unauthorized");
  return { userId: session.user.id };
};

const getFolderForFile = (fileType?: string) => {
  if (fileType?.startsWith("image/")) return "thumbnails";
  if (fileType === "application/pdf") return "pdfs";
  if (fileType?.startsWith("video/")) return "videos";
  return "files";
};

const handleUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: { userId: string };
  file: { url: string; name?: string; type?: string };
}) => {
  console.log("Upload complete for userId:", metadata.userId);
  console.log("file url", file.url);

  try {
    const response = await fetch(file.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch uploaded file: ${response.status}`);
    }

    const fileBuffer = Buffer.from(await response.arrayBuffer());
    const folderName = getFolderForFile(file.type || response.headers.get("content-type") || undefined);
    const extFromName = file.name ? path.extname(file.name) : "";
    const extFromType = file.type === "application/pdf"
      ? ".pdf"
      : file.type?.startsWith("image/")
      ? ".jpg"
      : file.type?.startsWith("video/")
      ? ".mp4"
      : "";
    const extension = extFromName || extFromType;
    const generatedName = `${Date.now()}-${crypto.randomUUID()}${extension}`;

    const uploadsRoot = path.join(process.cwd(), "public", "uploads");
    const targetDir = path.join(uploadsRoot, folderName);
    await mkdir(targetDir, { recursive: true });

    const targetPath = path.join(targetDir, generatedName);
    await writeFile(targetPath, fileBuffer);

    const localUrl = `/uploads/${folderName}/${generatedName}`;

    return {
      uploadedBy: metadata.userId,
      localUrl,
      originalUrl: file.url,
    };
  } catch (error) {
    console.error("Failed to persist upload in local folder", error);
    return {
      uploadedBy: metadata.userId,
      originalUrl: file.url,
    };
  }
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  courseAttachment: f({ 
      image: { maxFileSize: "4MB", maxFileCount: 1 },
      video: { maxFileSize: "256MB", maxFileCount: 1 }, 
      pdf: { maxFileSize: "16MB", maxFileCount: 1 } 
  })
    .middleware(handleAuth)
    .onUploadComplete(handleUploadComplete),
  
  video: f({ 
      video: { maxFileSize: "512MB", maxFileCount: 1 } 
  })
    .middleware(handleAuth)
    .onUploadComplete(handleUploadComplete),
  
  pdf: f({ 
      pdf: { maxFileSize: "32MB", maxFileCount: 1 } 
  })
    .middleware(handleAuth)
    .onUploadComplete(handleUploadComplete),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;


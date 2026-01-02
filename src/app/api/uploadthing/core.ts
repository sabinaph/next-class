import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const f = createUploadthing();

const handleAuth = async () => {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'INSTRUCTOR') throw new Error("Unauthorized");
  return { userId: session.user.id };
};

const handleUploadComplete = async ({ metadata, file }: { metadata: { userId: string }, file: { url: string } }) => {
  console.log("Upload complete for userId:", metadata.userId);
  console.log("file url", file.url);
  return { uploadedBy: metadata.userId };
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

import { NextResponse } from "next/server";

const missingTokenResponse = () =>
  NextResponse.json(
    {
      error:
        "UploadThing is disabled because UPLOADTHING_TOKEN is not configured.",
    },
    { status: 503 }
  );

const getUploadthingHandler = async () => {
  if (!process.env.UPLOADTHING_TOKEN) return null;

  const [{ createRouteHandler }, { ourFileRouter }] = await Promise.all([
    import("uploadthing/next"),
    import("./core"),
  ]);

  return createRouteHandler({
    router: ourFileRouter,
  });
};

export async function GET(request: Request) {
  const handler = await getUploadthingHandler();
  if (!handler) return missingTokenResponse();
  return handler.GET(request);
}

export async function POST(request: Request) {
  const handler = await getUploadthingHandler();
  if (!handler) return missingTokenResponse();
  return handler.POST(request);
}

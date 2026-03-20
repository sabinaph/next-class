import crypto from "crypto";

const SECRET = process.env.DOWNLOAD_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || "dev-download-secret";

function base64url(input: string) {
  return Buffer.from(input).toString("base64url");
}

export function signDownloadToken(payload: {
  userId: string;
  lessonId: string;
  fileUrl: string;
  exp: number;
}) {
  const body = base64url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

export function verifyDownloadToken(token: string) {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(body)
    .digest("base64url");

  if (expected !== signature) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      userId: string;
      lessonId: string;
      fileUrl: string;
      exp: number;
    };

    if (Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

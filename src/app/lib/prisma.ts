import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    adapter,
    log: ["query"], // Optional: Logs the database queries to the console for debugging
  });
}

const hasRequiredDelegates = (client: PrismaClient | undefined) => {
  if (!client) return false;
  const typed = client as unknown as Record<string, unknown>;
  const instructorApplicationDelegate = typed.instructorApplication as
    | { findMany?: unknown; findFirst?: unknown; create?: unknown }
    | undefined;
  const communityPostDelegate = typed.communityPost as
    | { findMany?: unknown; findUnique?: unknown; create?: unknown }
    | undefined;
  const communityCommentDelegate = typed.communityComment as
    | { findUnique?: unknown; create?: unknown }
    | undefined;
  const communityReactionDelegate = typed.communityReaction as
    | { findFirst?: unknown; create?: unknown; delete?: unknown }
    | undefined;
  const quizDelegate = typed.quiz as
    | { findMany?: unknown; findUnique?: unknown; create?: unknown }
    | undefined;
  const quizAttemptDelegate = typed.quizAttempt as
    | { create?: unknown }
    | undefined;
  const userNotificationDelegate = typed.userNotification as
    | { findMany?: unknown; createMany?: unknown }
    | undefined;
  // Guard against stale dev singleton after schema changes (e.g., newly added models)
  return Boolean(
    typed.order &&
      typed.invoice &&
      typed.category &&
      instructorApplicationDelegate &&
      communityPostDelegate &&
      communityCommentDelegate &&
      communityReactionDelegate &&
      quizDelegate &&
      quizAttemptDelegate &&
      userNotificationDelegate &&
      typeof instructorApplicationDelegate.findMany === "function" &&
      typeof instructorApplicationDelegate.findFirst === "function" &&
      typeof instructorApplicationDelegate.create === "function" &&
      typeof communityPostDelegate.findMany === "function" &&
      typeof communityPostDelegate.create === "function" &&
      typeof communityCommentDelegate.findUnique === "function" &&
      typeof communityCommentDelegate.create === "function" &&
      typeof communityReactionDelegate.findFirst === "function" &&
      typeof communityReactionDelegate.create === "function" &&
      typeof communityReactionDelegate.delete === "function" &&
      typeof quizDelegate.findMany === "function" &&
      typeof quizDelegate.findUnique === "function" &&
      typeof quizDelegate.create === "function" &&
      typeof quizAttemptDelegate.create === "function" &&
      typeof userNotificationDelegate.findMany === "function" &&
      typeof userNotificationDelegate.createMany === "function"
  );
};

export const prisma = hasRequiredDelegates(globalForPrisma.prisma)
  ? globalForPrisma.prisma!
  : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Add a connection test to handle errors
(async () => {
  try {
    await prisma.$connect();
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection error:", error);
  }
})();

export const db = prisma;

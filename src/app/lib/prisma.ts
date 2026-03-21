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
  // Guard against stale dev singleton after schema changes (e.g., newly added models)
  return Boolean(typed.order && typed.invoice && typed.category && typed.instructorApplication);
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

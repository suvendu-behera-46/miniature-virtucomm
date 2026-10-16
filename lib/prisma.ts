import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Shared hosting often blocks outgoing connections to Postgres' port 5432.
// With NEON_OVER_HTTPS=true, Prisma talks to Neon through its WebSocket proxy on
// port 443 instead (uses the global WebSocket, so Node.js 22+ is required).
function createPrismaClient() {
  if (process.env.NEON_OVER_HTTPS === "true" && process.env.DATABASE_URL) {
    const adapter = new PrismaNeon(new Pool({ connectionString: process.env.DATABASE_URL }));
    return new PrismaClient({ adapter, log: ["error", "warn"] });
  }
  return new PrismaClient({ log: ["error", "warn"] });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

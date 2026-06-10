import { PrismaClient } from "@prisma/client";

// Augment globalThis for the Prisma singleton (avoids creating too many clients in dev)
declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma;

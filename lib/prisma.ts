import { PrismaClient } from "@prisma/client";

/**
 * Next.js dev modunda hot-reload her seferinde yeni bir PrismaClient
 * oluşturup bağlantı havuzunu tüketmesin diye global'de tekil örnek tutulur.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

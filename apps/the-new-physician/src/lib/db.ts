import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

const connectionString = process.env.DATABASE_URL;

// Safely detect Edge environment or production mode
const isEdge = typeof globalThis !== 'undefined' && ('EdgeRuntime' in globalThis);
const isProd = process.env.NODE_ENV === 'production';

if (isEdge || isProd) {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool as any);
  prismaInstance = new PrismaClient({ adapter });
} else {
  prismaInstance = globalForPrisma.prisma || new PrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
}

export const db = prismaInstance;

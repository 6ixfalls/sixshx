import { PrismaClient } from "@prisma/client";
import cuid2Extension from 'prisma-extension-cuid2';

import { env } from "~/env";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends(cuid2Extension({ fields: ['Resource:id', 'Resource:deleteToken', 'Account:id', 'Session:id', 'User:id', 'User:apiKey'] }));

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

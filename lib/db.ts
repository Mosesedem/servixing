import { PrismaClient } from "@prisma/client";

declare global {
  var prismaInstance: PrismaClient | undefined;
}

export const prisma =
  global.prismaInstance ||
  new PrismaClient({
    // log:
    //   process.env.NODE_ENV === "development"
    //     ? ["query", "error", "warn"]
    //     : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prismaInstance = prisma;
}

// Export as 'db' for consistency
export const db = prisma;

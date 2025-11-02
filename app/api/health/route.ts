import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Checks the status of critical services
 */
export async function GET() {
  const healthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {
      database: "unknown",
      api: "healthy",
    },
  };

  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;
    healthStatus.checks.database = "healthy";
    logger.info("Health check passed");

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    logger.error(
      "Health check failed:",
      error instanceof Error ? error : new Error(String(error))
    );
    healthStatus.status = "unhealthy";
    healthStatus.checks.database = "unhealthy";

    return NextResponse.json(healthStatus, { status: 503 });
  }
}

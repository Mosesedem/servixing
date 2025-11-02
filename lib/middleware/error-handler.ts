import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { BaseError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * Global error handler for API routes
 * Converts errors to standardized JSON responses
 */
export function handleError(error: unknown): NextResponse {
  // Log the error
  logger.error("API Error:", error instanceof Error ? error : { error });

  // Handle custom application errors
  if (error instanceof BaseError) {
    return NextResponse.json(error.serializeError(), {
      status: error.statusCode,
    });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        },
      },
      { status: 400 }
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_VALIDATION_ERROR",
          message: "Invalid data format",
        },
      },
      { status: 400 }
    );
  }

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message:
            process.env.NODE_ENV === "production"
              ? "An unexpected error occurred"
              : error.message,
        },
      },
      { status: 500 }
    );
  }

  // Fallback for unknown errors
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 }
  );
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError
): NextResponse {
  switch (error.code) {
    case "P2002":
      // Unique constraint violation
      const target = (error.meta?.target as string[]) || [];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_ENTRY",
            message: `A record with this ${target.join(", ")} already exists`,
          },
        },
        { status: 409 }
      );

    case "P2025":
      // Record not found
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "The requested resource was not found",
          },
        },
        { status: 404 }
      );

    case "P2003":
      // Foreign key constraint failed
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FOREIGN_KEY_CONSTRAINT",
            message: "Related record not found",
          },
        },
        { status: 400 }
      );

    case "P2014":
      // Invalid ID
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Invalid resource identifier",
          },
        },
        { status: 400 }
      );

    default:
      logger.error("Unhandled Prisma error:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message:
              process.env.NODE_ENV === "production"
                ? "A database error occurred"
                : error.message,
          },
        },
        { status: 500 }
      );
  }
}

/**
 * Async error wrapper for API route handlers
 * Catches errors and passes them to handleError
 */
export function asyncHandler<T>(
  handler: (req: Request, context?: any) => Promise<T>
) {
  return async (req: Request, context?: any): Promise<NextResponse> => {
    try {
      const result = await handler(req, context);
      return result as unknown as NextResponse;
    } catch (error) {
      return handleError(error);
    }
  };
}

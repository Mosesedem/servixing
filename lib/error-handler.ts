export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode = 500,
    public code?: string,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    console.error("[v0] Unhandled error:", error.message)
    return {
      error: "An unexpected error occurred",
      statusCode: 500,
    }
  }

  console.error("[v0] Unknown error:", error)
  return {
    error: "An unexpected error occurred",
    statusCode: 500,
  }
}

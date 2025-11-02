import { NextResponse } from "next/server";

/**
 * Standardized API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  metadata?: ApiResponse["metadata"]
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  });
}

/**
 * Created response (201)
 */
export function createdResponse<T>(
  data: T,
  metadata?: ApiResponse["metadata"]
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    },
    { status: 201 }
  );
}

/**
 * No content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Error response helper
 */
export function errorResponse(
  code: string,
  message: string,
  statusCode: number = 400,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: statusCode }
  );
}

/**
 * Paginated response helper
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
): NextResponse<ApiResponse<T[]>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return NextResponse.json({
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      pagination: {
        ...pagination,
        totalPages,
      },
    },
  });
}

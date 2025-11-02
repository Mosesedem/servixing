import { BaseError } from "./base-error";

/**
 * 400 - Bad Request
 * Generic validation error
 */
export class ValidationError extends BaseError {
  statusCode = 400;
  code = "VALIDATION_ERROR";

  constructor(message: string = "Invalid request data") {
    super(message);
  }
}

/**
 * 401 - Unauthorized
 * User not authenticated
 */
export class AuthenticationError extends BaseError {
  statusCode = 401;
  code = "AUTHENTICATION_ERROR";

  constructor(
    message: string = "You must be logged in to access this resource"
  ) {
    super(message);
  }
}

/**
 * 403 - Forbidden
 * User authenticated but not authorized
 */
export class AuthorizationError extends BaseError {
  statusCode = 403;
  code = "AUTHORIZATION_ERROR";

  constructor(
    message: string = "You don't have permission to access this resource"
  ) {
    super(message);
  }
}

/**
 * 404 - Not Found
 */
export class NotFoundError extends BaseError {
  statusCode = 404;
  code = "NOT_FOUND_ERROR";

  constructor(resource: string = "Resource") {
    super(`${resource} not found`);
  }
}

/**
 * 409 - Conflict
 * Duplicate resource, state conflict
 */
export class ConflictError extends BaseError {
  statusCode = 409;
  code = "CONFLICT_ERROR";

  constructor(message: string = "Resource conflict") {
    super(message);
  }
}

/**
 * 422 - Unprocessable Entity
 * Semantic errors
 */
export class UnprocessableEntityError extends BaseError {
  statusCode = 422;
  code = "UNPROCESSABLE_ENTITY";

  constructor(message: string = "Unable to process the request") {
    super(message);
  }
}

/**
 * 429 - Too Many Requests
 */
export class RateLimitError extends BaseError {
  statusCode = 429;
  code = "RATE_LIMIT_ERROR";

  constructor(message: string = "Too many requests, please try again later") {
    super(message);
  }
}

/**
 * 500 - Internal Server Error
 */
export class InternalServerError extends BaseError {
  statusCode = 500;
  code = "INTERNAL_SERVER_ERROR";

  constructor(message: string = "An unexpected error occurred") {
    super(message);
  }
}

/**
 * 502 - Bad Gateway
 * External service error
 */
export class ExternalServiceError extends BaseError {
  statusCode = 502;
  code = "EXTERNAL_SERVICE_ERROR";

  constructor(service: string, message?: string) {
    super(message || `${service} service is currently unavailable`);
  }
}

/**
 * 503 - Service Unavailable
 */
export class ServiceUnavailableError extends BaseError {
  statusCode = 503;
  code = "SERVICE_UNAVAILABLE";

  constructor(message: string = "Service temporarily unavailable") {
    super(message);
  }
}

/**
 * Payment specific errors
 */
export class PaymentError extends BaseError {
  statusCode = 402;
  code = "PAYMENT_ERROR";

  constructor(message: string = "Payment processing failed") {
    super(message);
  }
}

/**
 * Database specific errors
 */
export class DatabaseError extends BaseError {
  statusCode = 500;
  code = "DATABASE_ERROR";

  constructor(message: string = "Database operation failed") {
    super(message);
  }
}

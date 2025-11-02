/**
 * Base Error Class
 * All custom errors extend from this
 */
export abstract class BaseError extends Error {
  abstract statusCode: number;
  abstract code: string;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BaseError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  serializeError() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }
}

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "STOCK_UNAVAILABLE"
  | "PRODUCT_INACTIVE"
  | "INVALID_TRANSITION"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    status: number,
    details?: unknown,
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }

  toClient() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details !== undefined ? { details: this.details } : {}),
      },
    };
  }
}

export const errors = {
  validation: (message = "Invalid input", details?: unknown) =>
    new AppError("VALIDATION_ERROR", message, 400, details),
  unauthorized: (message = "Authentication required") =>
    new AppError("UNAUTHORIZED", message, 401),
  forbidden: (message = "You don't have permission to perform this action") =>
    new AppError("FORBIDDEN", message, 403),
  notFound: (message = "Not found") => new AppError("NOT_FOUND", message, 404),
  conflict: (message: string) => new AppError("CONFLICT", message, 409),
  stockUnavailable: (productName: string, available: number) =>
    new AppError(
      "STOCK_UNAVAILABLE",
      `Only ${available} unit(s) of "${productName}" available`,
      409,
      { productName, available },
    ),
  productInactive: (productName: string) =>
    new AppError(
      "PRODUCT_INACTIVE",
      `"${productName}" is no longer available`,
      409,
    ),
  invalidTransition: (from: string, to: string) =>
    new AppError(
      "INVALID_TRANSITION",
      `Cannot transition from ${from} to ${to}`,
      409,
    ),
  rateLimited: (message = "Too many requests, please slow down") =>
    new AppError("RATE_LIMITED", message, 429),
  internal: (message = "Something went wrong") =>
    new AppError("INTERNAL_ERROR", message, 500),
};

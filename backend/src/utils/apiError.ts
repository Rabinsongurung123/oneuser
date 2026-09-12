export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RESOURCE_NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE_ENTITY"
  | "RATE_LIMITED"
  | "INTERNAL_SERVER_ERROR";

const CODE_STATUS_MAP: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  RESOURCE_NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  RATE_LIMITED: 429,
  INTERNAL_SERVER_ERROR: 500,
};

export class ApiError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown[];

  constructor(code: ErrorCode, message: string, details?: unknown[]) {
    super(message);
    this.code = code;
    this.statusCode = CODE_STATUS_MAP[code];
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static notFound(message: string, details?: unknown[]) {
    return new ApiError("RESOURCE_NOT_FOUND", message, details);
  }
  static validation(message: string, details?: unknown[]) {
    return new ApiError("VALIDATION_ERROR", message, details);
  }
  static unauthorized(message = "Unauthorized") {
    return new ApiError("UNAUTHORIZED", message);
  }
  static forbidden(message = "Forbidden") {
    return new ApiError("FORBIDDEN", message);
  }
  static conflict(message: string, details?: unknown[]) {
    return new ApiError("CONFLICT", message, details);
  }
  static unprocessable(message: string, details?: unknown[]) {
    return new ApiError("UNPROCESSABLE_ENTITY", message, details);
  }
}
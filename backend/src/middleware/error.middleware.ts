import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { MulterError } from "multer";
import { ApiError } from "../utils/apiError";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      code: "RESOURCE_NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
  }

  if (err instanceof MulterError) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: err.message },
    });
  }
  if (err.message?.includes("Only JPEG")) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: err.message },
    });
  }

  // Prisma: unique constraint violation
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      error: {
        code: "CONFLICT",
        message: `A record with this ${err.meta?.target?.join(", ") || "value"} already exists`,
      },
    });
  }
  // Prisma: record not found on update/delete
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      error: { code: "RESOURCE_NOT_FOUND", message: "Record not found" },
    });
  }
  // Prisma: foreign key constraint violation (referenced ID doesn't exist)
  if (err.code === "P2003") {
    const field = err.meta?.field_name || "a referenced field";
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_REFERENCE",
        message: `Invalid reference: ${field} does not point to an existing record`,
      },
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" },
  });
}
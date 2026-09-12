import { Response } from "express";

interface Meta {
  page?: number;
  per_page?: number;
  total?: number;
  total_pages?: number;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: Meta) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function sendNoContent(res: Response) {
  return res.status(204).send();
}
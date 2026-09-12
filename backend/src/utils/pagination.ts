import { Request } from "express";

export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
  perPage: number;
}

export function getPagination(req: Request, defaultPerPage = 20, maxPerPage = 100): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const perPage = Math.min(maxPerPage, Math.max(1, parseInt(req.query.per_page as string) || defaultPerPage));
  return { skip: (page - 1) * perPage, take: perPage, page, perPage };
}

export function buildMeta(page: number, perPage: number, total: number) {
  return {
    page,
    per_page: perPage,
    total,
    total_pages: Math.max(1, Math.ceil(total / perPage)),
  };
}
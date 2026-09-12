import { Request, Response } from "express";
import { createBookSchema, updateBookSchema } from "./books.validation";
import * as booksService from "./books.services";
import { uploadBookCover } from "../../utils/uploadImage";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendNoContent } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";
import { ApiError } from "../../utils/apiError";

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    search: req.query.search as string | undefined,
    authorId: req.query.authorId as string | undefined,
    publisherId: req.query.publisherId as string | undefined,
    categoryId: req.query.categoryId as string | undefined,
  };
  const { skip, take, page, perPage } = getPagination(req);

  const { books, total } = await booksService.getAllBooks(filters, skip, take);
  sendSuccess(res, books, 200, buildMeta(page, perPage, total));
});
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const book = await booksService.getBookById(req.params.id as string);
  sendSuccess(res, book);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createBookSchema.parse(req.body);

  let coverImage = input.coverImage;
  if (req.file) {
    coverImage = await uploadBookCover(req.file);
  }

  const book = await booksService.createBook({ ...input, coverImage });
  sendSuccess(res, book, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = updateBookSchema.parse(req.body);
  const book = await booksService.updateBook(req.params.id as string, input);
  sendSuccess(res, book);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await booksService.deleteBook(req.params.id as string);
  sendNoContent(res);
});

export const uploadCover = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.validation("No image file provided under the 'cover' field");

  const coverUrl = await uploadBookCover(req.file);
  const book = await booksService.updateBook(req.params.id as string, { coverImage: coverUrl });
  sendSuccess(res, book);
});

export const search = asyncHandler(async (req: Request, res: Response) => {
  const q = (req.query.q as string)?.trim();
  if (!q) throw ApiError.validation("Search query 'q' is required");

  const { skip, take, page, perPage } = getPagination(req);
  const { books, total } = await booksService.searchBooks(q, skip, take);
  sendSuccess(res, books, 200, buildMeta(page, perPage, total));
});

export const getByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page, perPage } = getPagination(req);
  const { books, total } = await booksService.getBooksByCategory(req.params.category as string, skip, take);
  sendSuccess(res, books, 200, buildMeta(page, perPage, total));
});
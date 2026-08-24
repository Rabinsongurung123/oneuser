import { Request, Response } from "express";
import { createAuthorSchema, updateAuthorSchema } from "./author.validation";
import * as authorService from "./author.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendNoContent } from "../../utils/apiResponse";

import { getPagination, buildMeta } from "../../utils/pagination";

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const { skip, take, page, perPage } = getPagination(req);

  const [authors, total] = await authorService.getAllAuthors(search, skip, take);
  sendSuccess(res, authors, 200, buildMeta(page, perPage, total));
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const author = await authorService.getAuthorById(req.params.id as string);
  sendSuccess(res, author);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createAuthorSchema.parse(req.body);
  const author = await authorService.createAuthor(input);
  sendSuccess(res, author, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = updateAuthorSchema.parse(req.body);
  const author = await authorService.updateAuthor(req.params.id as string, input);
  sendSuccess(res, author);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await authorService.deleteAuthor(req.params.id as string);
  sendNoContent(res);
});
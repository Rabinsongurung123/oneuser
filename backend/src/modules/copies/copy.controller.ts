import { Request, Response } from "express";
import { createCopySchema, updateCopySchema } from "./copy.validation";
import * as copyService from "./copy.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendNoContent } from "../../utils/apiResponse";

export const getForBook = asyncHandler(async (req: Request, res: Response) => {
  const copies = await copyService.getCopiesForBook(req.params.bookId as string);
  sendSuccess(res, copies);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const copy = await copyService.getCopyById(req.params.id as string);
  sendSuccess(res, copy);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createCopySchema.parse(req.body);
  const copy = await copyService.createCopy(input);
  sendSuccess(res, copy, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = updateCopySchema.parse(req.body);
  const copy = await copyService.updateCopy(req.params.id as string, input);
  sendSuccess(res, copy);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await copyService.deleteCopy(req.params.id as string);
  sendNoContent(res);
});
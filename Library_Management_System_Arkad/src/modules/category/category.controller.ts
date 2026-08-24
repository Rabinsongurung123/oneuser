import { Request, Response } from "express";
import { createCategorySchema, updateCategorySchema } from "./category.validation";
import * as categoryService from "./category.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendNoContent } from "../../utils/apiResponse";

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  sendSuccess(res, categories);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryById(req.params.id as string);
  sendSuccess(res, category);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createCategorySchema.parse(req.body);
  const category = await categoryService.createCategory(input);
  sendSuccess(res, category, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = updateCategorySchema.parse(req.body);
  const category = await categoryService.updateCategory(req.params.id as string, input);
  sendSuccess(res, category);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.params.id as string);
  sendNoContent(res);
});
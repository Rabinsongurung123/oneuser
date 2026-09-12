import { Request, Response } from "express";
import { createPublisherSchema, updatePublisherSchema } from "./publisher.validation";
import * as publisherService from "./publisher.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendNoContent } from "../../utils/apiResponse";

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const publishers = await publisherService.getAllPublishers(search);
  sendSuccess(res, publishers);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const publisher = await publisherService.getPublisherById(req.params.id as string);
  sendSuccess(res, publisher);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createPublisherSchema.parse(req.body);
  const publisher = await publisherService.createPublisher(input);
  sendSuccess(res, publisher, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = updatePublisherSchema.parse(req.body);
  const publisher = await publisherService.updatePublisher(req.params.id as string, input);
  sendSuccess(res, publisher);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await publisherService.deletePublisher(req.params.id as string);
  sendNoContent(res);
});
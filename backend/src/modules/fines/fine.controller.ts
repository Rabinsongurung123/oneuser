import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as fineService from "./fine.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { skip, take, page, perPage } = getPagination(req);
  const status = req.query.status as string | undefined;
  const [records, total] = await fineService.getAllFines(skip, take, status);
  sendSuccess(res, records, 200, buildMeta(page, perPage, total));
});

export const getMine = asyncHandler(async (req: AuthRequest, res: Response) => {
  const records = await fineService.getFinesForUser(req.user!.userId);
  sendSuccess(res, records);
});

export const pay = asyncHandler(async (req: AuthRequest, res: Response) => {
  const fine = await fineService.payFine(req.params.id as string);
  sendSuccess(res, fine);
});

export const waive = asyncHandler(async (req: AuthRequest, res: Response) => {
  const fine = await fineService.waiveFine(req.params.id as string);
  sendSuccess(res, fine);
});
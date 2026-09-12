import { Request, Response } from "express";
import * as dashboardService from "./dashboard.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await dashboardService.getDashboardStats();
  sendSuccess(res, stats);
});
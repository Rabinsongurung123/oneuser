import { Request, Response } from "express";
import { updateSettingsSchema } from "./settings.validation";
import * as settingsService from "./settings.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await settingsService.getSettings();
  sendSuccess(res, settings);
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const input = updateSettingsSchema.parse(req.body);
  const settings = await settingsService.updateSettings(input);
  sendSuccess(res, settings);
});
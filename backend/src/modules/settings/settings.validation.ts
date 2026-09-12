import { z } from "zod";

export const updateSettingsSchema = z.object({
  dailyFineRate: z.coerce.number().nonnegative().optional(),
  gracePeriodDays: z.coerce.number().int().nonnegative().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
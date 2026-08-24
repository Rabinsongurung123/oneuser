import { z } from "zod";

const conditionEnum = z.enum(["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"]);
const statusEnum = z.enum(["AVAILABLE", "CHECKED_OUT", "RESERVED", "IN_TRANSIT", "WITHDRAWN"]);

export const createCopySchema = z.object({
  bookId: z.string(),
  barcode: z.string().min(1),
  condition: conditionEnum.optional(),
  shelfLocation: z.string().optional(),
});

export const updateCopySchema = z.object({
  condition: conditionEnum.optional(),
  shelfLocation: z.string().optional(),
  status: statusEnum.optional(),
});

export type CreateCopyInput = z.infer<typeof createCopySchema>;
export type UpdateCopyInput = z.infer<typeof updateCopySchema>;
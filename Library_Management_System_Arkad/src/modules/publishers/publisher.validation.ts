import { z } from "zod";

export const createPublisherSchema = z.object({
  name: z.string().min(1),
});

export const updatePublisherSchema = createPublisherSchema.partial();

export type CreatePublisherInput = z.infer<typeof createPublisherSchema>;
export type UpdatePublisherInput = z.infer<typeof updatePublisherSchema>;
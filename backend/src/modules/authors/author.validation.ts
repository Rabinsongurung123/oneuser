import { z } from "zod";

export const createAuthorSchema = z.object({
  name: z.string().min(1),
});

export const updateAuthorSchema = createAuthorSchema.partial();

export type CreateAuthorInput = z.infer<typeof createAuthorSchema>;
export type UpdateAuthorInput = z.infer<typeof updateAuthorSchema>;
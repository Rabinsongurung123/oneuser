import { z } from "zod";

export const createBookSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  isbn: z.string().min(5),
  categoryId: z.string().cuid("categoryId must be a valid ID"),
  authorIds: z.array(z.string().cuid()).optional(),
  publisherId: z.string().cuid().optional(),
  coverImage: z.string().url().optional(),
});

export const updateBookSchema = createBookSchema.partial();

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
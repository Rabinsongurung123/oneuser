import { z } from "zod";

export const borrowBookSchema = z
  .object({
    bookId: z.string().optional(),
    copyId: z.string().optional(),
    userId: z.string().optional(),
    dueDate: z.string().datetime().optional(),
  })
  .refine((data) => data.bookId || data.copyId, { message: "Either bookId or copyId is required" });

export const returnBookSchema = z.object({
  borrowId: z.string(),
});

export type BorrowBookInput = z.infer<typeof borrowBookSchema>;
export type ReturnBookInput = z.infer<typeof returnBookSchema>;
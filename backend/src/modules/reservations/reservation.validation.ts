import { z } from "zod";

export const createReservationSchema = z.object({
  bookId: z.string(),
  // Admins may reserve on behalf of a member (same pattern as borrow)
  userId: z.string().optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
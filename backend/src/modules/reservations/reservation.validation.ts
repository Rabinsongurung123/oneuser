import { z } from "zod";

export const createReservationSchema = z.object({
  bookId: z.string(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
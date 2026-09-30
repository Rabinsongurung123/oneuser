import { z } from "zod";

export const sendTestEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export type SendTestEmailInput = z.infer<typeof sendTestEmailSchema>;

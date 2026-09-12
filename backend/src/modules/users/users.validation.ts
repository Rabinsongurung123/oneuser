import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  studentId: z.string().min(1),
});

export const updateStudentSchema = createStudentSchema.partial().omit({ password: true });

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
import { z } from "zod";

export const createUserWorkLogSchema = z.object({
  work_id: z.number().int().positive(),
  status: z.enum(["want_to_read", "read"]).optional(),
  read_at: z.iso
    .date()
    .transform((s) => new Date(s))
    .nullable()
    .optional(),
  review: z.string().max(1000).nullable().optional(),
  mood_ids: z.array(z.number().int().positive()).max(20).optional(),
  language_ids: z.array(z.number().int().positive()).max(20).optional(),
});

export type CreateUserWorkLogInput = z.infer<typeof createUserWorkLogSchema>;

export const updateUserWorkLogSchema = z.object({
  status: z.enum(["want_to_read", "read"]).optional(),
  read_at: z.iso
    .date()
    .transform((s) => new Date(s))
    .nullable()
    .optional(),
  review: z.string().max(1000).nullable().optional(),
  mood_ids: z.array(z.number().int().positive()).max(20).optional(),
  language_ids: z.array(z.number().int().positive()).max(20).optional(),
});

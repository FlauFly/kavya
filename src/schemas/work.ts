import { z } from "zod";

export const createWorkSchema = z.object({
  title: z.string().min(1).max(500),
  form: z.enum(["short_story", "poetry"]),
  author: z.number().int().positive(),
  original_language_id: z.number().int().positive().nullable().optional(),
  synopsis: z.string().max(5000).nullable().optional(),
  word_count: z.number().int().positive().nullable().optional(),
  source_ids: z.array(z.number().int().positive()).max(20).optional(),
  genre_ids: z.array(z.number().int().positive()).max(20).optional(),
});

export type CreateWorkInput = z.infer<typeof createWorkSchema>;

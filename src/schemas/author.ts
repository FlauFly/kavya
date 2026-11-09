import { z } from "zod";

export const createAuthorSchema = z.object({
  name: z.string().min(1).max(200),
  bio: z.string().max(5000).nullable().optional(),
});

export type CreateAuthorInput = z.infer<typeof createAuthorSchema>;

import { z } from "zod";
import { source_type } from "../generated/prisma/enums";

export const createSourceSchema = z.object({
  name: z.string().min(1).max(300),
  source_type: z.enum(["magazine", "anthology", "website", "other"]),
  cover_url: z.string().url().max(2000).nullable().optional(),
});

export type CreateSourceInput = z.infer<typeof createSourceSchema>;

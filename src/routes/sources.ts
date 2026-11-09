import { Router } from "express";
import { prisma } from "../db";
import { createSourceSchema } from "../schemas/source";
import z from "zod";

const router = Router();

// GET /sources?search=<string>
router.get("/", async (req, res, next) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const sources = await prisma.sources.findMany({
      where: search
        ? { name: { contains: search, mode: "insensitive" } }
        : undefined,
      orderBy: { name: "asc" },
      take: 20,
    });
    res.json(sources);
  } catch (error) {
    next(error);
  }
});

// POST /sources
router.post("/", async (req, res, next) => {
  const parsed = createSourceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: z.flattenError(parsed.error) });
  }

  try {
    const source = await prisma.sources.create({ data: parsed.data });
    res.status(201).json(source);
  } catch (error) {
    next(error);
  }
});

export { router as sourcesRouter };

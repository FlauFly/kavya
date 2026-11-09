import { Router } from "express";
import { prisma } from "../db";
import { createAuthorSchema } from "../schemas/author";
import z from "zod";

const router = Router();

// GET /authors?search=<string>
router.get("/", async (req, res, next) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const authors = await prisma.authors.findMany({
      where: search
        ? { name: { contains: search, mode: "insensitive" } }
        : undefined,
      orderBy: { name: "asc" },
      take: 20,
    });
    res.json(authors);
  } catch (error) {
    next(error);
  }
});

// POST /authors
router.post("/", async (req, res, next) => {
  const parsed = createAuthorSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: z.flattenError(parsed.error) });
  }

  try {
    const author = await prisma.authors.create({ data: parsed.data });
    res.status(201).json(author);
  } catch (error) {
    next(error);
  }
});

export { router as authorsRouter };

import { Router } from "express";
import { prisma } from "../db";
import { createWorkSchema } from "../schemas/work";
import z from "zod";

const router = Router();

// GET /works
router.get("/", async (req, res, next) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const limitParam =
      typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : NaN;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
        ? limitParam
        : 50;

    let matchingSourceIds: number[] = [];
    if (search) {
      const sources = await prisma.sources.findMany({
        where: { name: { contains: search, mode: "insensitive" } },
        select: { id: true },
      });
      matchingSourceIds = sources.map((s) => s.id);
    }

    const works = await prisma.works.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { authors: { name: { contains: search, mode: "insensitive" } } },
              ...(matchingSourceIds.length > 0
                ? [
                    {
                      work_sources: {
                        some: { source_id: { in: matchingSourceIds } },
                      },
                    },
                  ]
                : []),
            ],
          }
        : undefined,
      include: { authors: true },
      orderBy: { title: "asc" },
      take: limit,
    });
    res.json(works);
  } catch (error) {
    next(error);
  }
});

// GET /works/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: { message: "Invalid id" } });
    }

    const work = await prisma.works.findUnique({
      where: { id },
      include: {
        authors: true,
        work_genres: true,
        work_sources: true,
      },
    });

    if (!work) {
      return res.status(404).json({ error: { message: "Work not found" } });
    }

    const sourceIds = work.work_sources.map((ws) => ws.source_id);
    const genreIds = work.work_genres.map((wg) => wg.genre_id);

    const [sources, genres] = await Promise.all([
      sourceIds.length > 0
        ? prisma.sources.findMany({ where: { id: { in: sourceIds } } })
        : [],
      genreIds.length > 0
        ? prisma.genres.findMany({ where: { id: { in: genreIds } } })
        : [],
    ]);

    const logs = await prisma.user_work_logs.findMany({
      where: { work_id: id },
      select: { id: true },
    });
    const logIds = logs.map((l) => l.id);

    let moods: { id: number; name: string; readers: number }[] = [];
    if (logIds.length > 0) {
      const counts = await prisma.log_moods.groupBy({
        by: ["mood_id"],
        where: { log_id: { in: logIds } },
        _count: { mood_id: true },
      });
      const moodIds = counts.map((c) => c.mood_id);
      const moodRows = await prisma.moods.findMany({
        where: { id: { in: moodIds } },
      });
      const nameById = new Map(moodRows.map((m) => [m.id, m.name]));
      moods = counts.map((c) => ({
        id: c.mood_id,
        name: nameById.get(c.mood_id) ?? "",
        readers: c._count.mood_id,
      }));
    }

    res.json({ ...work, sources, genres, moods });
  } catch (error) {
    next(error);
  }
});

// POST /works
router.post("/", async (req, res, next) => {
  const parsed = createWorkSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: z.flattenError(parsed.error) });
  }

  const { source_ids = [], genre_ids = [], ...workData } = parsed.data;

  try {
    const work = await prisma.$transaction(async (tx) => {
      const created = await tx.works.create({
        data: workData,
        include: { authors: true },
      });

      if (source_ids.length > 0) {
        await tx.work_sources.createMany({
          data: source_ids.map((source_id) => ({
            work_id: created.id,
            source_id,
          })),
        });
      }

      if (genre_ids.length > 0) {
        await tx.work_genres.createMany({
          data: genre_ids.map((genre_id) => ({
            work_id: created.id,
            genre_id,
          })),
        });
      }

      return created;
    });
    res.status(201).json(work);
  } catch (error) {
    next(error);
  }
});

export { router as worksRouter };

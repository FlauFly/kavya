import { Router } from "express";
import { prisma } from "../db";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const moods = await prisma.moods.findMany({
      orderBy: { name: "asc" },
    });
    res.json(moods);
  } catch (error) {
    next(error);
  }
});

export { router as moodsRouter };

import { Router } from "express";
import { prisma } from "../db";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const genres = await prisma.genres.findMany();
    res.json(genres);
  } catch (error) {
    next(error);
  }
});

export { router as genresRouter };

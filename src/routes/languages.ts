import { Router } from "express";
import { prisma } from "../db";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const languages = await prisma.languages.findMany({
      orderBy: { name: "asc" },
    });
    res.json(languages);
  } catch (error) {
    next(error);
  }
});

export { router as languagesRouter };

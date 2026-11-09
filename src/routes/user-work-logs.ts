import { Router } from "express";
import { prisma } from "../db";
import {
  createUserWorkLogSchema,
  updateUserWorkLogSchema,
} from "../schemas/user-work-log";
import z from "zod";
import { CURRENT_USER_ID } from "../current-user";
import { error } from "node:console";
import { Prisma } from "../generated/prisma/client";

const router = Router();

// POST /user-work-logs
router.post("/", async (req, res, next) => {
  const parsed = createUserWorkLogSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: z.flattenError(parsed.error) });
  }

  const { mood_ids = [], language_ids = [], ...logData } = parsed.data;

  try {
    const log = await prisma.$transaction(async (tx) => {
      const created = await tx.user_work_logs.create({
        data: { ...logData, user_id: CURRENT_USER_ID },
      });

      if (mood_ids.length > 0) {
        await tx.log_moods.createMany({
          data: mood_ids.map((mood_id) => ({ log_id: created.id, mood_id })),
        });
      }

      if (language_ids.length > 0) {
        await tx.log_languages.createMany({
          data: language_ids.map((language_id) => ({
            log_id: created.id,
            language_id,
          })),
        });
      }

      return created;
    });

    res.status(201).json(log);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res
        .status(409)
        .json({ error: { message: "Log already exists for this work" } });
    }
    next(error);
  }
});

// PATCH /user-work-logs
router.patch("/:id", async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: { message: "Invalid id" } });
  }

  const parsed = updateUserWorkLogSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: z.flattenError(parsed.error) });
  }

  const { mood_ids, language_ids, ...logData } = parsed.data;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.user_work_logs.findUnique({ where: { id } });
      if (!existing || existing.user_id !== CURRENT_USER_ID) {
        return null;
      }

      const log = await tx.user_work_logs.update({
        where: { id },
        data: logData,
      });

      if (mood_ids !== undefined) {
        await tx.log_moods.deleteMany({ where: { log_id: id } });
        if (mood_ids.length > 0) {
          await tx.log_moods.createMany({
            data: mood_ids.map((mood_id) => ({ log_id: id, mood_id })),
          });
        }
      }

      if (language_ids !== undefined) {
        await tx.log_languages.deleteMany({ where: { log_id: id } });
        if (language_ids.length > 0) {
          await tx.log_languages.createMany({
            data: language_ids.map((language_id) => ({
              log_id: id,
              language_id,
            })),
          });
        }
      }

      return log;
    });

    if (!updated) {
      return res.status(404).json({ error: { message: "Log not found" } });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export { router as userWorkLogsRouter };

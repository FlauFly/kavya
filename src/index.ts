import express from "express";
import { prisma } from "./db";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Short story and poetry tracker");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/genres", async (req, res, next) => {
  try {
    const genres = await prisma.genres.findMany();
    res.json(genres);
  } catch (error) {
    next(error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});

import express from "express";
import { genresRouter } from "./routes/genres";
import { worksRouter } from "./routes/works";
import { authorsRouter } from "./routes/authors";
import { sourcesRouter } from "./routes/sources";
import { moodsRouter } from "./routes/moods";
import { languagesRouter } from "./routes/languages";
import { userWorkLogsRouter } from "./routes/user-work-logs";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.send("Kavya API");
});

app.use("/genres", genresRouter);
app.use("/works", worksRouter);
app.use("/authors", authorsRouter);
app.use("/sources", sourcesRouter);
app.use("/moods", moodsRouter);
app.use("/languages", languagesRouter);
app.use("/user-work-logs", userWorkLogsRouter);

// 404 handler, no routes find
app.use((req, res) => {
  res.status(404).json({ error: { message: "Not found" } });
});

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: { message: "Internal Server error" } });
  },
);

export { app };

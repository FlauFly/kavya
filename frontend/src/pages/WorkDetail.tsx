import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router";
import { apiGet } from "../lib/api";
import type { Work } from "../types";
import { ShelfButton } from "../components/ShelfButton";

export function WorkDetail() {
  const { id } = useParams();
  const [work, setWork] = useState<Work | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiGet<Work>(`/works/${id}`)
      .then(setWork)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  type LogRef = { id: number; status: "want_to_read" | "read" };
  const [log, setLog] = useState<LogRef | null>(null);

  const fetchLog = useCallback(() => {
    if (!id) return;
    apiGet<LogRef | null>(`/user-work-logs?work_id=${id}`)
      .then(setLog)
      .catch(() => setLog(null));
  }, [id]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!work) return <p>Work not found</p>;

  return (
    <div>
      <Link to="/">← Back to works</Link>
      <h1>{work.title}</h1>
      <p>
        by <strong>{work.authors.name}</strong>
        {" · "}
        {work.form === "poetry" ? "Poetry" : "Short story"}
      </p>

      {work.synopsis && <p>{work.synopsis}</p>}

      {work.genres.length > 0 && (
        <p>Genres: {work.genres.map((g) => g.name).join(", ")}</p>
      )}

      {work.sources.length > 0 && (
        <p>Published in: {work.sources.map((s) => s.name).join(", ")}</p>
      )}

      {work.moods.length > 0 && (
        <div>
          <h3>Moods</h3>
          <ul>
            {work.moods.map((m) => (
              <li key={m.id}>
                {m.name} ({m.readers} {m.readers === 1 ? "reader" : "readers"})
              </li>
            ))}
          </ul>
        </div>
      )}

      {work.word_count && <p>Word count: {work.word_count}</p>}
      <ShelfButton workId={work.id} log={log} onChanged={fetchLog} />
    </div>
  );
}

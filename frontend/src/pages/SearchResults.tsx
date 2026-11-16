import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { apiGet } from "../lib/api";
import type { Work } from "../types";

export function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const [works, setWorks] = useState<Work[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    apiGet<Work[]>(`/works?search=${encodeURIComponent(q)}&limit=50`)
      .then(setWorks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q]);

  if (!q) return <p>Enter a search term</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Results for "{q}"</h1>
      {works.length === 0 ? (
        <p>No works found</p>
      ) : (
        <ul>
          {works.map((work) => (
            <li key={work.id}>
              <Link to={`/works/${work.id}`}>{work.title}</Link> -{" "}
              {work.authors.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

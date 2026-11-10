import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiGet } from "../lib/api";

type Work = {
  id: number;
  title: string;
  form: "short_story" | "poetry";
  authors: { name: string };
};

export function WorksList() {
  const [works, setWorks] = useState<Work[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Work[]>("/works")
      .then(setWorks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Works</h1>
      <ul>
        {works.map((w) => (
          <li key={w.id}>
            <Link to={`/works/${w.id}`}>{w.title}</Link> - {w.authors.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

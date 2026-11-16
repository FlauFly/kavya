import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiGet } from "../lib/api";
import type { Work } from "../types";

type Props = { form?: "short_story" | "poetry" };

export function WorksList({ form }: Props) {
  const [works, setWorks] = useState<Work[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qs = form ? `?form=${form}` : "";
    setLoading(true);
    apiGet<Work[]>(`/works${qs}`)
      .then(setWorks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [form]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>
        {form === "poetry"
          ? "Poetry"
          : form === "short_story"
            ? "Short stories"
            : "All works"}
      </h1>
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

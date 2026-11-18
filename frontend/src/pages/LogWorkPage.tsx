import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { apiGet } from "../lib/api";
import type { Work } from "../types";
import { LogForm } from "../components/LogForm";

export function LogWorkPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!work) return <p>Work not found</p>;

  return (
    <div>
      <Link to={`/works/${work.id}`}>← Back to work</Link>
      <h1>Log: {work.title}</h1>
      <p>by {work.authors.name}</p>

      <LogForm workId={work.id} onSaved={() => navigate(`/works/${work.id}`)} />
    </div>
  );
}

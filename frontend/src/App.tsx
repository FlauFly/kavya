import { useEffect, useState } from "react";

export default function App() {
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/genres")
      .then((res) => res.json())
      .then(setGenres)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Genres</h1>
      <ul>
        {genres.map((g) => (
          <li key={g.id}>{g.name}</li>
        ))}
      </ul>
    </div>
  );
}

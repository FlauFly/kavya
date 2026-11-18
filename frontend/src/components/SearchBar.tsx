import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiGet } from "../lib/api";
import { useClickOutside } from "../hooks/useClickOutside";

type SearchResult = {
  id: number;
  title: string;
  form: "short_story" | "poetry";
  authors: { name: string };
};

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const handle = setTimeout(() => {
      apiGet<SearchResult[]>(
        `/works?search=${encodeURIComponent(trimmed)}&limit=5`,
      )
        .then((r) => {
          setResults(r);
          setOpen(true);
        })
        .catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  // Close suggestion box when clicking outside
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(rootRef, close);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search works, authors, sources..."
        />
      </form>
      {open && results.length > 0 && (
        <ul
          style={{
            position: "absolute",
            background: "white",
            listStyle: "none",
            padding: 0,
            margin: 0,
            border: "1px solid #ccc",
            width: "100%",
          }}
        >
          {results.map((result) => (
            <li key={result.id} style={{ padding: "4px 8px" }}>
              <Link to={`/works/${result.id}`} onClick={() => setOpen(false)}>
                {result.title} - {result.authors.name}{" "}
                <em>({result.form === "poetry" ? "poetry" : "story"})</em>
              </Link>
            </li>
          ))}
          <li style={{ padding: "4px 8px", borderTop: "1px solid #eee" }}>
            <Link
              to={`/search?q=${encodeURIComponent(query.trim())}`}
              onClick={() => setOpen(false)}
            >
              View all results...
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiGet, apiPost } from "../lib/api";
import { SearchOrCreate, type Selection } from "../components/SearchOrCreate";

type Genre = { id: number; name: string };
type Language = { id: number; code: string; name: string };

export function AddWorkPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [form, setForm] = useState<"short_story" | "poetry">("short_story");
  const [author, setAuthor] = useState<Selection>(null);
  const [source, setSource] = useState<Selection>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<number | "">("");
  const [synopsis, setSynopsis] = useState("");
  const [wordCount, setWordCount] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([apiGet<Genre[]>("/genres"), apiGet<Language[]>("/languages")])
      .then(([g, l]) => {
        setGenres(g);
        setLanguages(l);
      })
      .catch((e) => setError(e.message));
  }, []);

  async function resolveSelection(
    sel: Selection,
    endpoint: string,
    extra?: object,
  ): Promise<number | null> {
    if (sel === null) return null;
    if ("id" in sel) return sel.id;
    const created = await apiPost<{ id: number }>(endpoint, {
      name: sel.newName,
      ...extra,
    });
    return created.id;
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!author) {
      setError("Please choose or create an author");
      return;
    }
    if (!title.trim()) {
      setError("Title is requred");
      return;
    }

    setSaving(true);
    try {
      const authorId = await resolveSelection(author, "/authors");
      const sourceId = await resolveSelection(source, "/sources", {
        source_type: "other",
      });

      const work = await apiPost<{ id: number }>("/works", {
        title: title.trim(),
        form,
        author: authorId,
        original_language_id:
          selectedLanguageId === "" ? null : selectedLanguageId,
        synopsis: synopsis.trim() || null,
        word_count: wordCount === "" ? null : Number(wordCount),
        source_ids: sourceId ? [sourceId] : [],
        genre_ids: selectedGenreIds,
      });
      navigate(`/works/${work.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Add a work</h1>
      <label style={{ display: "block", marginBottom: 12 }}>
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: 6 }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 12 }}>
        Form
        <select
          value={form}
          onChange={(e) => setForm(e.target.value as "short_story" | "poetry")}
        >
          <option value="short_story">Short story</option>
          <option value="poetry">Poetry</option>
        </select>
      </label>

      <SearchOrCreate
        label="Author"
        endpoint="/authors"
        value={author}
        onChange={setAuthor}
      />

      <SearchOrCreate
        label="Source (optional)"
        endpoint="/sources"
        value={source}
        onChange={setSource}
      />

      <label style={{ display: "block", marginBottom: 12 }}>
        Synopsis (optional)
        <textarea
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          rows={3}
          style={{ width: "100%" }}
        />
      </label>

      <fieldset style={{ marginBottom: 12 }}>
        <legend>Genres</legend>
        {genres.map((g) => (
          <label key={g.id} style={{ marginRight: 8 }}>
            <input
              type="checkbox"
              checked={selectedGenreIds.includes(g.id)}
              onChange={() =>
                setSelectedGenreIds(
                  selectedGenreIds.includes(g.id)
                    ? selectedGenreIds.filter((x) => x !== g.id)
                    : [...selectedGenreIds, g.id],
                )
              }
            />
            {g.name}
          </label>
        ))}
      </fieldset>

      <label style={{ display: "block", marginBottom: 12 }}>
        Original language (optional)
        <select
          value={selectedLanguageId}
          onChange={(e) =>
            setSelectedLanguageId(
              e.target.value === "" ? "" : Number(e.target.value),
            )
          }
        >
          <option value="">-</option>
          {languages.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: "block", marginBottom: 12 }}>
        Word count (optional)
        <input
          type="number"
          value={wordCount}
          onChange={(e) => setWordCount(e.target.value)}
        />
      </label>

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Add work"}
      </button>
      {error && <p style={{ color: "red" }}></p>}
    </form>
  );
}

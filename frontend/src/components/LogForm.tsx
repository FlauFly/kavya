import { useState, useEffect } from "react";
import { apiGet, apiPatch, apiPost } from "../lib/api";

type Mood = { id: number; name: string };
type Language = { id: number; code: string; name: string };
type Log = {
  id: number;
  status: "want_to_read" | "read";
  read_at: string | null;
  review: string | null;
  moods: Mood[];
  languages: Language[];
};

type Props = { workId: number; onSaved?: () => void };

export function LogForm({ workId, onSaved }: Props) {
  const [existing, setExisting] = useState<Log | null>(null);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<"want_to_read" | "read">("want_to_read");
  const [review, setReview] = useState("");
  const [selectedMoodIds, setSelectedMoodIds] = useState<number[]>([]);
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiGet<Mood[]>("/moods"),
      apiGet<Language[]>("/languages"),
      apiGet<Log | null>(`/user-work-logs?work_id=${workId}`),
    ])
      .then(([m, l, log]) => {
        setMoods(m);
        setLanguages(l);
        setExisting(log);
        if (log) {
          setStatus(log.status);
          setReview(log.review ?? "");
          setSelectedMoodIds(log.moods.map((x) => x.id));
          setSelectedLanguageIds(log.languages.map((x) => x.id));
        }
      })
      .catch((e) => setMessage(e.message))
      .finally(() => setLoading(false));
  }, [workId]);

  function toggle(id: number, list: number[], setList: (v: number[]) => void) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const body = {
      status,
      review: review.trim() || null,
      mood_ids: selectedMoodIds,
      language_ids: selectedLanguageIds,
    };

    try {
      if (existing) {
        await apiPatch(`/user-work-logs/${existing.id}`, body);
        setMessage("Saved");
        onSaved?.();
      } else {
        await apiPost("/user-work-logs", { ...body, work_id: workId });
        setMessage("Logged");
        onSaved?.();
        // refetch to get the new id for future edits
        const log = await apiGet<Log | null>(
          `/user-work-logs?work_id=${workId}`,
        );
        setExisting(log);
      }
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading log...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h3>{existing ? "Edit your log" : "Log this work"}</h3>

      <label>
        Status:{" "}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "want_to_read" | "read")}
        >
          <option value="want_to_read">Want to read</option>
          <option value="read">Read</option>
        </select>
      </label>

      <label>
        Review:
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          maxLength={1000}
          rows={3}
        />
      </label>

      <fieldset>
        <legend>Moods</legend>
        {moods.map((m) => (
          <label key={m.id} style={{ marginRight: 8 }}>
            <input
              type="checkbox"
              checked={selectedMoodIds.includes(m.id)}
              onChange={() => toggle(m.id, selectedMoodIds, setSelectedMoodIds)}
            />
            {m.name}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Read in</legend>
        {languages.map((l) => (
          <label key={l.id} style={{ marginRight: 8 }}>
            <input
              type="checkbox"
              checked={selectedLanguageIds.includes(l.id)}
              onChange={() =>
                toggle(l.id, selectedLanguageIds, setSelectedLanguageIds)
              }
            />
            {l.name}
          </label>
        ))}
      </fieldset>

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : existing ? "Save changes" : "Log work"}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}

export type Work = {
  id: number;
  title: string;
  form: "short_story" | "poetry";
  synopsis: string | null;
  word_count: number | null;
  authors: { id: number; name: string; bio: string | null };
  sources: {
    id: number;
    name: string;
    source_type: string;
    cover_url: string | null;
  }[];
  genres: { id: number; name: string }[];
  moods: { id: number; name: string; readers: number }[];
};

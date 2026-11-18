import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet } from "../lib/api";
import { useClickOutside } from "../hooks/useClickOutside";

type Option = { id: number; name: string };

export type Selection = { id: number } | { newName: string } | null;

type Props = {
  label: string;
  endpoint: string; // e.g. '/authors'
  value: Selection;
  onChange: (v: Selection) => void;
  placeholder?: string;
};

export function SearchOrCreate({
  label,
  endpoint,
  value,
  onChange,
  placeholder,
}: Props) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (value !== null) {
      setOpen(false);
      return;
    }
    if (trimmed.length < 2) {
      setOptions([]);
      setOpen(false);
      return;
    }
    const handle = setTimeout(() => {
      apiGet<Option[]>(`${endpoint}?search=${encodeURIComponent(trimmed)}`)
        .then((r) => {
          setOptions(r);
          setOpen(true);
        })
        .catch(() => setOptions([]));
    }, 300);
    return () => clearTimeout(handle);
  }, [query, endpoint]);

  // Click outside closes suggestions
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(rootRef, close);

  function pickExisting(o: Option) {
    onChange({ id: o.id });
    setQuery(o.name);
    setOpen(false);
  }

  function pickNew() {
    const name = query.trim();
    if (!name) return;
    onChange({ newName: name });
    setOpen(false);
  }

  return (
    <div ref={rootRef} style={{ position: "relative", marginBottom: 12 }}>
      <label style={{ display: "block", marginBottom: 4 }}>
        {label}
        {value && "id" in value && (
          <span style={{ color: "green", marginLeft: 8 }}>✓ selected</span>
        )}
        {value && "newName" in value && (
          <span style={{ color: "orange", marginLeft: 8 }}>
            will create "{value.newName}"
          </span>
        )}
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(null);
        }}
        placeholder={placeholder ?? "Type to search..."}
        style={{ width: "100%", padding: "6px" }}
      />
      {open && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "white",
            border: "1px solid #ccc",
            listStyle: "none",
            padding: 0,
            margin: "4px 0 0",
            zIndex: 10,
            maxHeight: 200,
            overflow: "auto",
          }}
        >
          {options.length === 0 ? (
            <li style={{ padding: "6px 10px", color: "#000" }}>No matches</li>
          ) : (
            options.map((o) => (
              <li key={o.id}>
                <button
                  onClick={() => pickExisting(o)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "6px 10px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#000",
                  }}
                >
                  {o.name}
                </button>
              </li>
            ))
          )}
          {query.trim().length >= 2 && (
            <li style={{ borderTop: "1px solid #eee" }}>
              <button
                onClick={pickNew}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "6px 10px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#2563eb",
                }}
              >
                + Add "{query.trim()}"
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";
import { apiPost, apiPatch, apiDelete } from "../lib/api";

type Log = { id: number; status: "want_to_read" | "read" };

type Props = {
  workId: number;
  log: Log | null;
  onChanged: () => void;
};

export function ShelfButton({ workId, log, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const hasLog = log !== null;
  const isWantToRead = log?.status === "want_to_read";
  const isRead = log?.status === "read";

  const label = hasLog ? (isRead ? "Read" : "Want to read") : "Want to read";
  const suffix = hasLog ? " ✎" : "";

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      setOpen(false);
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function handleMainClick() {
    if (hasLog) {
      setOpen((o) => !o);
    } else {
      run(() =>
        apiPost("/user-work-logs", { work_id: workId, status: "want_to_read" }),
      );
    }
  }

  function handleCaretClick() {
    setOpen((o) => !o);
  }

  function handleWantToRead() {
    if (isWantToRead) return;
    run(() =>
      log
        ? apiPatch(`/user-work-logs/${log.id}`, { status: "want_to_read" })
        : apiPost("/user-work-logs", {
            work_id: workId,
            status: "want_to_read",
          }),
    );
  }

  function handleRead() {
    setOpen(false);
    navigate(`/works/${workId}/log`);
  }

  function handleRemove() {
    if (!log) return;
    run(() => apiDelete(`/user-work-logs/${log.id}`));
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        style={{
          display: "inline-flex",
          border: "1px solid #888",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <button
          onClick={handleMainClick}
          disabled={busy}
          style={{
            border: "none",
            padding: "6px 12px",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          {label}
          {suffix}
        </button>
        {!hasLog && (
          <button
            onClick={handleCaretClick}
            disabled={busy}
            aria-label="More options"
            style={{
              border: "none",
              borderLeft: "1px solid #888",
              padding: "6px 8px",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            ▼
          </button>
        )}
      </div>

      {open && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            background: "white",
            border: "1px solid #ccc",
            listStyle: "none",
            padding: 0,
            margin: "4px 0 0",
            minWidth: "180px",
            zIndex: 10,
          }}
        >
          <li>
            <button
              onClick={handleWantToRead}
              disabled={isWantToRead || busy}
              style={{ width: "100%", textAlign: "left", padding: "6px 10px" }}
            >
              Want to read {isWantToRead ? "✓" : ""}
            </button>
          </li>
          <li>
            <button
              onClick={handleRead}
              disabled={busy}
              style={{ width: "100%", textAlign: "left", padding: "6px 10px" }}
            >
              Read {isRead ? "✓" : ""}
            </button>
          </li>
          {hasLog && (
            <li>
              <button
                onClick={handleRemove}
                disabled={busy}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "6px 10px",
                }}
              >
                Remove from shelf
              </button>
            </li>
          )}
        </ul>
      )}

      {error && <p style={{ color: "red", margin: "4px 0" }}>{error}</p>}
    </div>
  );
}

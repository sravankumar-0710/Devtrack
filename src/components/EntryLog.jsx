import { Trash2 } from "lucide-react";
import { fmtHM } from "../utils/timeUtils";
import { EmptyState } from "./UI";

export default function EntryLog({ entries, categories, projects, onDelete, limit }) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const displayed = limit ? sorted.slice(0, limit) : sorted;

  if (displayed.length === 0) {
    return <EmptyState message="No sessions recorded yet." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {displayed.map((entry) => {
        const cat  = categories.find((c) => c.id === entry.categoryId);
        const proj = projects.find((p) => p.id === entry.project);

        return (
          <div
            key={entry.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 8,
              transition: "background 0.15s",
            }}
          >
            {/* Category dot */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: cat?.color ?? "#475569",
                flexShrink: 0,
              }}
            />

            {/* Main info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#E2E8F0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {cat?.name ?? "Unknown"}
                </span>
                {proj && (
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: `${proj.color}20`,
                      color: proj.color,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      flexShrink: 0,
                    }}
                  >
                    {proj.name}
                  </span>
                )}
              </div>
              {entry.notes && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748B",
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {entry.notes}
                </div>
              )}
            </div>

            {/* Date */}
            <span
              style={{
                fontSize: 10,
                color: "#475569",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {entry.date}
            </span>

            {/* Duration */}
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: cat?.color ?? "#94A3B8",
                minWidth: 44,
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              {fmtHM(entry.duration)}
            </span>

            {/* Delete */}
            {onDelete && (
              <button
                onClick={() => onDelete(entry.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#475569",
                  padding: 4,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.15s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FCA5A5")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

import { useState } from "react";
import { ExternalLink, Trash2, Link2 } from "lucide-react";

/**
 * LinkCard — a single saved-link card.
 * Shows the destination site's favicon (auto-fetched via Google's public
 * favicon service — no API key, no backend needed), a title ("where it
 * takes you"), and a description ("what it teaches you").
 *
 * Props:
 *   item     {object}  { id, url, title, description }
 *   onDelete {fn(id)}
 */
export function LinkCard({ item, onDelete }) {
  const [imgError, setImgError] = useState(false);
  const domain = getDomain(item.url);
  const faviconUrl = domain
    ? `https://www.google.com/s2/favicons?sz=64&domain=${domain}`
    : null;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {faviconUrl && !imgError ? (
            <img
              src={faviconUrl}
              alt=""
              width={20}
              height={20}
              onError={() => setImgError(true)}
              style={{ display: "block" }}
            />
          ) : (
            <Link2 size={16} color="#64748B" />
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={item.title}
          >
            {item.title}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "#64748B",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {domain}
          </div>
        </div>

        <button
          onClick={() => onDelete(item.id)}
          title="Remove"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#475569",
            padding: 4,
            flexShrink: 0,
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {item.description && (
        <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5, flex: 1 }}>
          {item.description}
        </div>
      )}

      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        style={{
          marginTop: "auto",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontWeight: 700,
          color: "#93C5FD",
          textDecoration: "none",
        }}
      >
        Visit <ExternalLink size={11} />
      </a>
    </div>
  );
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

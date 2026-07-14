import { useState } from "react";
import { Link2, Plus } from "lucide-react";
import { SectionTitle, EmptyState } from "../components/UI";
import { Card } from "../components/Card";
import { LinkCard } from "../components/LinkCard";

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6,
  padding: "8px 10px",
  fontSize: 12,
  color: "#E2E8F0",
  fontFamily: "inherit",
  outline: "none",
};

/**
 * LinkVaultView — save any link as a card. Each card shows the destination
 * site's favicon (auto-detected), a title for where it takes you, and a
 * short note on what it teaches you.
 *
 * Props:
 *   linkCards  {Array}          from useConsistencyData (COLLECTIONS)
 *   addItem    {fn(col, item)}
 *   deleteItem {fn(col, id)}
 */
export function LinkVaultView({ linkCards = [], addItem, deleteItem }) {
  const [form, setForm] = useState({ url: "", title: "", description: "" });

  const handleAdd = () => {
    const url = normalizeUrl(form.url);
    if (!url || !form.title.trim()) return;
    addItem("linkCards", {
      url,
      title: form.title.trim(),
      description: form.description.trim(),
    });
    setForm({ url: "", title: "", description: "" });
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Link2 size={18} color="#93C5FD" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Link Vault</h1>
      </div>
      <SectionTitle>Save links as cards — where they go, and what they teach you</SectionTitle>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <input
            placeholder="https://example.com"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            style={{ ...inputStyle, flex: "1 1 220px" }}
          />
          <input
            placeholder="Title (where it takes you)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            style={{ ...inputStyle, flex: "1 1 200px" }}
          />
          <input
            placeholder="What it teaches you"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            style={{ ...inputStyle, flex: "1 1 240px" }}
          />
          <button
            onClick={handleAdd}
            style={{
              background: "#93C5FD",
              color: "#000",
              border: "none",
              borderRadius: 6,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Plus size={13} /> Add
          </button>
        </div>
      </Card>

      {linkCards.length === 0 ? (
        <EmptyState message="No links saved yet." />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {linkCards.map((item) => (
            <LinkCard
              key={item.id}
              item={item}
              onDelete={(id) => deleteItem("linkCards", id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function normalizeUrl(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

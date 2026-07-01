import { useState } from "react";
import { StickyNote, Search } from "lucide-react";
import { Card, SectionTitle } from "../components/UI";
import { RecordManager } from "../components/RecordManager";
import { NOTE_FIELDS } from "../data/consistencyConstants";

export function NotesView({ notes, addItem, deleteItem }) {
  const [q, setQ] = useState("");

  const filtered = notes.filter((n) =>
    !q ||
    n.title?.toLowerCase().includes(q.toLowerCase()) ||
    n.subject?.toLowerCase().includes(q.toLowerCase()) ||
    n.tags?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <StickyNote size={18} color="#93C5FD" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Notes</h1>
      </div>
      <SectionTitle>Study &amp; project notes</SectionTitle>

      <Card style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <Search size={14} color="#64748B" />
        <input
          placeholder="Search notes by title, subject, or tag..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "#E2E8F0", fontSize: 12, fontFamily: "inherit",
          }}
        />
      </Card>

      <RecordManager
        title="Notes"
        fields={NOTE_FIELDS}
        items={filtered}
        accent="#93C5FD"
        onAdd={(item) => addItem("notes", item)}
        onDelete={(id) => deleteItem("notes", id)}
      />
    </div>
  );
}

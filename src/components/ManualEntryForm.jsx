import { useState } from "react";
import { Check, X } from "lucide-react";
import { today } from "../utils/timeUtils";

const BLANK = {
  date:       today(),
  categoryId: "",
  hours:      "",
  minutes:    "",
  notes:      "",
  project:    "",
};

export default function ManualEntryForm({ categories, projects, onSubmit, onClose }) {
  const [form, setForm] = useState(BLANK);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    const h   = parseInt(form.hours   || "0", 10);
    const m   = parseInt(form.minutes || "0", 10);
    const dur = h * 3600 + m * 60;

    if (!form.categoryId) { alert("Please select a category."); return; }
    if (dur <= 0)          { alert("Please enter a duration.");   return; }

    onSubmit({
      date:       form.date,
      categoryId: form.categoryId,
      duration:   dur,
      notes:      form.notes,
      project:    form.project,
      manual:     true,
    });
    setForm(BLANK);
    onClose?.();
  };

  const labelStyle = {
    display: "block",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#64748B",
    marginBottom: 5,
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 7,
    color: "#E2E8F0",
    fontFamily: "inherit",
    fontSize: 13,
    padding: "8px 12px",
    width: "100%",
    outline: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* DATE */}
      <div>
        <label style={labelStyle}>DATE</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
          style={{ ...inputStyle, colorScheme: "dark" }}
        />
      </div>

      {/* CATEGORY */}
      <div>
        <label style={labelStyle}>CATEGORY</label>
        <select
          value={form.categoryId}
          onChange={(e) => set("categoryId", e.target.value)}
          style={inputStyle}
        >
          <option value="">Select category…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* DURATION */}
      <div>
        <label style={labelStyle}>DURATION</label>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="number" min="0" max="23" placeholder="0"
              value={form.hours}
              onChange={(e) => set("hours", e.target.value)}
              style={inputStyle}
            />
            <span style={{
              position: "absolute", right: 10, top: "50%",
              transform: "translateY(-50%)", fontSize: 10, color: "#64748B",
            }}>hrs</span>
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="number" min="0" max="59" placeholder="0"
              value={form.minutes}
              onChange={(e) => set("minutes", e.target.value)}
              style={inputStyle}
            />
            <span style={{
              position: "absolute", right: 10, top: "50%",
              transform: "translateY(-50%)", fontSize: 10, color: "#64748B",
            }}>min</span>
          </div>
        </div>
      </div>

      {/* PROJECT (optional) */}
      <div>
        <label style={labelStyle}>PROJECT (OPTIONAL)</label>
        <select
          value={form.project}
          onChange={(e) => set("project", e.target.value)}
          style={inputStyle}
        >
          <option value="">None</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* NOTES */}
      <div>
        <label style={labelStyle}>NOTES (OPTIONAL)</label>
        <textarea
          rows={3}
          placeholder="What did you work on?"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {/* BUTTONS */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          onClick={handleSubmit}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 700,
            fontSize: 12,
            background: "#6EE7B7",
            color: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Check size={14} /> SAVE ENTRY
        </button>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              background: "transparent",
              color: "#64748B",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

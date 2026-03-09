import { useState } from "react";
import { X, Check } from "lucide-react";
import { today } from "../utils/helpers";

/**
 * ManualEntryModal — overlay form for adding a manual time entry.
 *
 * Props:
 *   categories  {Array}
 *   projects    {Array}
 *   onSave      {fn}   called with entry object
 *   onClose     {fn}
 */
export function ManualEntryModal({ categories, projects, onSave, onClose }) {
  const [form, setForm] = useState({
    date:       today(),
    categoryId: categories[0]?.id || "",
    hours:      "",
    minutes:    "",
    notes:      "",
    project:    "",
  });

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = () => {
    const duration = (parseInt(form.hours || 0) * 3600) + (parseInt(form.minutes || 0) * 60);
    if (!duration || !form.categoryId) return;
    onSave({ date: form.date, categoryId: form.categoryId, duration, notes: form.notes, project: form.project, manual: true });
    onClose();
  };

  return (
    <div
      style={{
        position:        "fixed",
        inset:           0,
        background:      "rgba(0,0,0,0.7)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        zIndex:          500,
        backdropFilter:  "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background:   "#111827",
          border:       "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding:      28,
          width:        400,
          maxWidth:     "90vw",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>
            MANUAL ENTRY
          </h3>
          <button onClick={onClose} style={btnStyle("#475569")}>
            <X size={14} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FieldRow label="DATE">
            <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} style={inputStyle} />
          </FieldRow>

          <FieldRow label="CATEGORY">
            <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} style={inputStyle}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FieldRow>

          <FieldRow label="DURATION">
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="number" placeholder="0" min="0" max="23"
                value={form.hours} onChange={(e) => set("hours", e.target.value)}
                style={{ ...inputStyle, width: 80 }}
              />
              <span style={{ color: "#64748B", alignSelf: "center" }}>h</span>
              <input
                type="number" placeholder="0" min="0" max="59"
                value={form.minutes} onChange={(e) => set("minutes", e.target.value)}
                style={{ ...inputStyle, width: 80 }}
              />
              <span style={{ color: "#64748B", alignSelf: "center" }}>m</span>
            </div>
          </FieldRow>

          <FieldRow label="PROJECT (opt)">
            <select value={form.project} onChange={(e) => set("project", e.target.value)} style={inputStyle}>
              <option value="">— none —</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </FieldRow>

          <FieldRow label="NOTES (opt)">
            <textarea
              placeholder="What did you work on?"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            />
          </FieldRow>
        </div>

        <button
          onClick={handleSave}
          style={{
            ...btnStyle("#6EE7B7"),
            marginTop:      20,
            width:          "100%",
            justifyContent: "center",
            padding:        "10px 0",
            color:          "#000",
            fontWeight:     700,
            fontSize:       12,
            letterSpacing:  "0.06em",
          }}
        >
          <Check size={14} /> SAVE ENTRY
        </button>
      </div>
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#64748B", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 700 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  background:   "rgba(255,255,255,0.05)",
  border:       "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding:      "8px 12px",
  color:        "#E2E8F0",
  fontSize:     13,
  fontFamily:   "inherit",
  width:        "100%",
  outline:      "none",
};

function btnStyle(color) {
  return {
    background:     `${color}18`,
    border:         `1px solid ${color}40`,
    borderRadius:   8,
    color,
    padding:        "7px 12px",
    cursor:         "pointer",
    display:        "flex",
    alignItems:     "center",
    gap:            6,
    fontSize:       12,
    fontFamily:     "inherit",
    fontWeight:     600,
  };
}

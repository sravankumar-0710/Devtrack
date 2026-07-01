import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Card, ProgressBar, EmptyState } from "./UI";

const STATUS_COLORS = {
  "Not Started": "#475569",
  "In Progress": "#FCD34D",
  "Completed":   "#6EE7B7",
  "To Start":    "#475569",
  "Done":        "#6EE7B7",
};

const inputStyle = {
  background:   "rgba(255,255,255,0.04)",
  border:       "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6,
  padding:      "8px 10px",
  fontSize:     12,
  color:        "#E2E8F0",
  fontFamily:   "inherit",
  outline:      "none",
};

/**
 * RecordManager — generic add/list/delete UI for a Project Consistency
 * "database" (Goals, Certifications, Habits, Notes, Resources, Roadmap, Placement).
 *
 * Props:
 *   title    {string}
 *   fields   {Array<{key,label,type,options?}>}  first field = record's title
 *   items    {Array}
 *   onAdd    {fn(item)}
 *   onDelete {fn(id)}
 *   onUpdate {fn(id, patch)}   optional — enables inline progress/streak editing
 *   accent   {string}
 */
export function RecordManager({ title, fields, items, onAdd, onDelete, onUpdate, accent = "#6EE7B7" }) {
  const [form, setForm] = useState(() => emptyForm(fields));
  const titleKey = fields[0].key;

  const handleAdd = () => {
    if (!form[titleKey]?.toString().trim()) return;
    onAdd(form);
    setForm(emptyForm(fields));
  };

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.04em", margin: 0 }}>{title}</h3>
        <span style={{ fontSize: 11, color: "#64748B" }}>{items.length} item{items.length === 1 ? "" : "s"}</span>
      </div>

      {/* Add form */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {fields.map((f) => (
          <Field key={f.key} f={f} value={form[f.key]} onChange={(v) => setForm({ ...form, [f.key]: v })} />
        ))}
        <button
          onClick={handleAdd}
          style={{
            background: accent, color: "#000", border: "none", borderRadius: 6,
            padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4,
          }}
        >
          <Plus size={13} /> Add
        </button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <EmptyState message="Nothing here yet." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background:   "rgba(255,255,255,0.02)",
                border:       "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8,
                padding:      12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 14px", flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", width: "100%" }}>
                    {item[titleKey]}
                  </span>

                  {fields.slice(1).map((f) => {
                    const val = item[f.key];
                    if (val === undefined || val === "" || val === null) return null;

                    if (f.type === "progress") {
                      return (
                        <div key={f.key} style={{ width: "100%", marginTop: 2 }}>
                          <ProgressBar pct={Number(val) || 0} color={accent} />
                          <div style={{ fontSize: 10, color: "#64748B", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                            {val}% complete
                            {onUpdate && (
                              <input
                                type="range" min={0} max={100} value={val}
                                onChange={(e) => onUpdate(item.id, { [f.key]: Number(e.target.value) })}
                                style={{ width: 80 }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    }

                    if (f.key === "status") {
                      return (
                        <span
                          key={f.key}
                          onClick={() => onUpdate && onUpdate(item.id, { status: nextStatus(val, f.options) })}
                          title={onUpdate ? "Click to advance status" : undefined}
                          style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                            background: `${STATUS_COLORS[val] || "#475569"}22`,
                            color: STATUS_COLORS[val] || "#94A3B8",
                            cursor: onUpdate ? "pointer" : "default",
                          }}
                        >
                          {val}
                        </span>
                      );
                    }

                    if (f.key === "link" && val) {
                      return (
                        <a key={f.key} href={val} target="_blank" rel="noreferrer"
                           style={{ fontSize: 11, color: "#93C5FD" }}>
                          {val}
                        </a>
                      );
                    }

                    return (
                      <span key={f.key} style={{ fontSize: 11, color: "#94A3B8" }}>
                        {f.label}: {val}
                      </span>
                    );
                  })}
                </div>

                <button
                  onClick={() => onDelete(item.id)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "#475569", padding: 4, flexShrink: 0 }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Field({ f, value, onChange }) {
  if (f.type === "select") {
    return (
      <select value={value || ""} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, flex: "1 1 130px" }}>
        <option value="">{f.label}</option>
        {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (f.type === "textarea") {
    return (
      <textarea
        placeholder={f.label}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={1}
        style={{ ...inputStyle, flex: "1 1 100%", resize: "vertical" }}
      />
    );
  }
  if (f.type === "progress") {
    return (
      <input
        type="number" min={0} max={100} placeholder="%"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, flex: "0 1 70px" }}
      />
    );
  }
  return (
    <input
      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
      placeholder={f.label}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, flex: "1 1 120px" }}
    />
  );
}

function nextStatus(current, options) {
  if (!options) return current;
  const i = options.indexOf(current);
  return options[(i + 1) % options.length];
}

function emptyForm(fields) {
  return fields.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});
}

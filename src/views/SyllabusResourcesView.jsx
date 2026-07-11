import { BookMarked, ExternalLink, Plus, CheckCircle2 } from "lucide-react";
import { useMemo } from "react";
import { Card } from "../components/Card";
import { SectionTitle } from "../components/UI";
import { CURRICULUM_RESOURCES } from "../data/curriculumResources";

/**
 * SyllabusResourcesView — read-only reference page listing every platform
 * the 365-day curriculum expects you to pull Learn/Practice/DSA work from
 * (freeCodeCamp, MDN, LeetCode, Kaggle, etc). This is what a day's bare
 * "15 exercises" or "solve 1 problem" is implicitly pointing at.
 *
 * Each item can be pushed into the personal "Resources" tracker (the
 * editable page) with one click, via the same addItem("resources", ...)
 * mutation that page uses.
 */
export function SyllabusResourcesView({ resources = [], addItem }) {
  const addedNames = useMemo(
    () => new Set(resources.map((r) => (r.resource || "").trim().toLowerCase())),
    [resources]
  );

  const addToTracker = (item) => {
    addItem("resources", {
      resource: item.name,
      type: "Course",
      link: item.url || "",
      status: "To Start",
    });
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <BookMarked size={18} color="#6EE7B7" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Resources (Syllabus)</h1>
      </div>
      <SectionTitle>
        The platforms the 365-day plan expects you to use for Learn, Practice, and DSA
      </SectionTitle>

      <div style={{ fontSize: 12, color: "#64748B", margin: "6px 0 20px", lineHeight: 1.6 }}>
        When a day just says "15 exercises" or "solve 1 problem" without a link, this is where it's
        meant to come from — the syllabus states these once up front instead of repeating them on
        all 365 days. Click "Add to tracker" to copy any of these into your personal Resources page.
      </div>

      {CURRICULUM_RESOURCES.map((group) => (
        <Card key={group.category} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: group.color, letterSpacing: "0.06em", marginBottom: 10 }}>
            {group.category.toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {group.items.map((item, i) => {
              const already = addedNames.has(item.name.trim().toLowerCase());
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                  padding: "10px 12px", borderRadius: 8,
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>{item.name}</span>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "#64748B", display: "flex" }}>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{item.note}</div>
                  </div>
                  <button
                    onClick={() => addToTracker(item)}
                    disabled={already}
                    style={{
                      display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
                      background: already ? "rgba(110,231,183,0.08)" : "rgba(196,181,253,0.1)",
                      border: `1px solid ${already ? "rgba(110,231,183,0.3)" : "rgba(196,181,253,0.3)"}`,
                      color: already ? "#6EE7B7" : "#C4B5FD",
                      borderRadius: 7, padding: "6px 10px", fontSize: 11, fontWeight: 700,
                      cursor: already ? "default" : "pointer", fontFamily: "inherit",
                    }}
                  >
                    {already ? <><CheckCircle2 size={12} /> Added</> : <><Plus size={12} /> Add to tracker</>}
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}

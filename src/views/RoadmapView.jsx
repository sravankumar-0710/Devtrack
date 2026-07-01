import { useState } from "react";
import { Map, CheckCircle2, Circle } from "lucide-react";
import { Card, SectionTitle, ProgressBar } from "../components/UI";
import { RecordManager } from "../components/RecordManager";
import { ROADMAP_FIELDS, CAREER_LEVELS } from "../data/consistencyConstants";

const TABS = ["Learning Roadmap", "Career Campaign"];

export function RoadmapView({ roadmapItems, certifications, addItem, updateItem, deleteItem }) {
  const [tab, setTab] = useState(TABS[0]);

  const completed = roadmapItems.filter((r) => r.status === "Completed").length;
  const overallPct = roadmapItems.length ? Math.round((completed / roadmapItems.length) * 100) : 0;

  // Career Campaign: a level is "reached" if any roadmap item or certification references it / is completed up to that index
  const reachedLevels = estimateLevelsReached(roadmapItems, certifications);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Map size={18} color="#34D399" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Learning Roadmap</h1>
      </div>
      <SectionTitle>{overallPct}% of roadmap complete &middot; {completed}/{roadmapItems.length} items</SectionTitle>

      <Card style={{ marginBottom: 18 }}>
        <ProgressBar pct={overallPct} color="#34D399" height={8} />
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 12, fontFamily: "inherit", fontWeight: 600,
              background: tab === t ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.04)",
              color: tab === t ? "#34D399" : "#94A3B8",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Learning Roadmap" && (
        <RecordManager
          title="Learning Roadmap"
          fields={ROADMAP_FIELDS}
          items={roadmapItems}
          accent="#34D399"
          onAdd={(item) => addItem("roadmapItems", item)}
          onDelete={(id) => deleteItem("roadmapItems", id)}
          onUpdate={(id, patch) => updateItem("roadmapItems", id, patch)}
        />
      )}

      {tab === "Career Campaign" && (
        <Card>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 14 }}>
            15-Level Career Campaign
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CAREER_LEVELS.map((level, i) => {
              const reached = i < reachedLevels;
              return (
                <div key={level} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: 8,
                  background: reached ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${reached ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.05)"}`,
                }}>
                  {reached ? <CheckCircle2 size={15} color="#34D399" /> : <Circle size={15} color="#475569" />}
                  <span style={{ fontSize: 12, color: reached ? "#E2E8F0" : "#64748B", fontWeight: reached ? 600 : 400 }}>
                    {level}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// Rough heuristic: count how many career levels are "reached" based on
// completed roadmap items + completed certifications, capped to level count.
function estimateLevelsReached(roadmapItems, certifications) {
  const doneRoadmap = roadmapItems.filter((r) => r.status === "Completed").length;
  const doneCerts = certifications.filter((c) => c.status === "Completed").length;
  return Math.min(CAREER_LEVELS.length, doneRoadmap + doneCerts);
}

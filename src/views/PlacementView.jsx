import { GraduationCap, Code2, FileText, Layers, CheckCircle2, Circle } from "lucide-react";
import { Card, SectionTitle, StatCard, ProgressBar } from "../components/UI";
import { RecordManager } from "../components/RecordManager";
import { PLACEMENT_FIELDS } from "../data/consistencyConstants";
import { PLAN_365, DSA_YEAR_TARGET } from "../data/curriculum365";

export function PlacementView({ placementItems, addItem, updateItem, deleteItem, engineState = {} }) {
  const dsaSolved = Object.values(engineState.dsaSolved || {}).reduce((a, b) => a + b, 0);
  const completedDaysMap = engineState.completedDays || {};

  const completed = placementItems.filter((p) => p.status === "Completed").length;
  const byCategory = (cat) => placementItems.filter((p) => p.category === cat).length;

  // Volume 7 — Placement Preparation & Career Launch (Days 327–361)
  const volume7Days = PLAN_365.filter((d) => d.volume === 7);
  const volume7Done = volume7Days.filter((d) => completedDaysMap[d.day]).length;
  const volume7Pct = volume7Days.length ? Math.round((volume7Done / volume7Days.length) * 100) : 0;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <GraduationCap size={18} color="#F472B6" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Placement Prep</h1>
      </div>
      <SectionTitle>{completed}/{placementItems.length} placement tasks completed</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 18 }}>
        <StatCard label="DSA SOLVED" value={dsaSolved} sub={`of ${DSA_YEAR_TARGET} target`} color="#F472B6" icon={Code2} />
        <StatCard label="RESUME TASKS" value={byCategory("Resume")} sub="items" color="#93C5FD" icon={FileText} />
        <StatCard label="PORTFOLIO TASKS" value={byCategory("Portfolio")} sub="items" color="#6EE7B7" icon={Layers} />
      </div>

      {/* Volume 7 — real syllabus days for this phase */}
      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0" }}>
            Volume 7 — Placement Preparation &amp; Career Launch
          </span>
          <span style={{ fontSize: 11, color: "#64748B" }}>
            Days {volume7Days[0]?.day}–{volume7Days[volume7Days.length - 1]?.day} &middot; {volume7Done}/{volume7Days.length}
          </span>
        </div>
        <ProgressBar pct={volume7Pct} color="#F472B6" height={6} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 6, marginTop: 14, maxHeight: 320, overflowY: "auto" }}>
          {volume7Days.map((d) => {
            const done = !!completedDaysMap[d.day];
            return (
              <div key={d.day} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6,
                background: done ? "rgba(244,114,182,0.06)" : "transparent",
              }}>
                {done ? <CheckCircle2 size={13} color="#F472B6" /> : <Circle size={13} color="#475569" />}
                <span style={{ fontSize: 11, color: done ? "#E2E8F0" : "#94A3B8" }}>
                  Day {d.day} — {d.focus}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <RecordManager
        title="Placement Tasks"
        fields={PLACEMENT_FIELDS}
        items={placementItems}
        accent="#F472B6"
        onAdd={(item) => addItem("placementItems", item)}
        onDelete={(id) => deleteItem("placementItems", id)}
        onUpdate={(id, patch) => updateItem("placementItems", id, patch)}
      />
    </div>
  );
}

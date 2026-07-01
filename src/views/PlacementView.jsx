import { useState } from "react";
import { GraduationCap, Code2, FileText, Layers } from "lucide-react";
import { Card, SectionTitle, StatCard } from "../components/UI";
import { RecordManager } from "../components/RecordManager";
import { PLACEMENT_FIELDS } from "../data/consistencyConstants";

const inputStyle = {
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6, padding: "8px 10px", fontSize: 12, color: "#E2E8F0",
  fontFamily: "inherit", outline: "none", width: 90,
};

export function PlacementView({ placementItems, addItem, updateItem, deleteItem }) {
  const [leetcode, setLeetcode] = useState(
    () => Number(localStorage.getItem("devtrack_leetcode_count")) || 0
  );

  const updateLeetcode = (val) => {
    const n = Math.max(0, Number(val) || 0);
    setLeetcode(n);
    localStorage.setItem("devtrack_leetcode_count", n);
  };

  const completed = placementItems.filter((p) => p.status === "Completed").length;
  const byCategory = (cat) => placementItems.filter((p) => p.category === cat).length;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <GraduationCap size={18} color="#F472B6" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Placement Prep</h1>
      </div>
      <SectionTitle>{completed}/{placementItems.length} placement tasks completed</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 18 }}>
        <StatCard label="LEETCODE SOLVED" value={leetcode} sub="all-time" color="#F472B6" icon={Code2} />
        <StatCard label="RESUME TASKS" value={byCategory("Resume")} sub="items" color="#93C5FD" icon={FileText} />
        <StatCard label="PORTFOLIO TASKS" value={byCategory("Portfolio")} sub="items" color="#6EE7B7" icon={Layers} />
      </div>

      <Card style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 12, color: "#94A3B8" }}>LeetCode problems solved:</span>
        <input
          type="number" min={0} value={leetcode}
          onChange={(e) => updateLeetcode(e.target.value)}
          style={inputStyle}
        />
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

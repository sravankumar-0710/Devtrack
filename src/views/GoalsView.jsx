import { Target } from "lucide-react";
import { SectionTitle } from "../components/UI";
import { RecordManager } from "../components/RecordManager";
import { GOAL_FIELDS } from "../data/consistencyConstants";

export function GoalsView({ lifeGoals, addItem, updateItem, deleteItem }) {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Target size={18} color="#6EE7B7" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Goals</h1>
      </div>
      <SectionTitle>Career &amp; life goals — tracked to completion</SectionTitle>

      <RecordManager
        title="Goals"
        fields={GOAL_FIELDS}
        items={lifeGoals}
        accent="#6EE7B7"
        onAdd={(item) => addItem("lifeGoals", item)}
        onDelete={(id) => deleteItem("lifeGoals", id)}
        onUpdate={(id, patch) => updateItem("lifeGoals", id, patch)}
      />
    </div>
  );
}

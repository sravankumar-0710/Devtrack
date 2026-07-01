import { ClipboardCheck } from "lucide-react";
import { SectionTitle } from "../components/UI";
import { RecordManager } from "../components/RecordManager";
import { WEEKLY_REVIEW_FIELDS } from "../data/consistencyConstants";

export function WeeklyReviewView({ weeklyReviews, addItem, updateItem, deleteItem }) {
  const sorted = [...weeklyReviews].sort((a, b) => new Date(b.weekOf) - new Date(a.weekOf));

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <ClipboardCheck size={18} color="#C4B5FD" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Weekly Review</h1>
      </div>
      <SectionTitle>Close out each week — hours, wins, improvements, next plan</SectionTitle>

      <RecordManager
        title="Weekly Reviews"
        fields={WEEKLY_REVIEW_FIELDS}
        items={sorted}
        accent="#C4B5FD"
        onAdd={(item) => addItem("weeklyReviews", item)}
        onDelete={(id) => deleteItem("weeklyReviews", id)}
        onUpdate={(id, patch) => updateItem("weeklyReviews", id, patch)}
      />
    </div>
  );
}

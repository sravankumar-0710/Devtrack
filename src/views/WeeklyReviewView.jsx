import { ClipboardCheck } from "lucide-react";
import { Card, SectionTitle } from "../components/UI";
import { RecordManager } from "../components/RecordManager";
import { WEEKLY_REVIEW_FIELDS } from "../data/consistencyConstants";
import { PLAN_365, getTodayPlan, joinField, stageLabel } from "../data/curriculum365";

export function WeeklyReviewView({ weeklyReviews, addItem, updateItem, deleteItem }) {
  const sorted = [...weeklyReviews].sort((a, b) => new Date(b.weekOf) - new Date(a.weekOf));

  const todayPlan = getTodayPlan();
  const weekDays = todayPlan ? PLAN_365.filter((d) => d.week === todayPlan.week) : [];
  const weekCloser = weekDays.find((d) => d.weeklyMiniProject?.length || d.weeklyAssessment?.length);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <ClipboardCheck size={18} color="#C4B5FD" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Weekly Review</h1>
      </div>
      <SectionTitle>Close out each week — hours, wins, improvements, next plan</SectionTitle>

      {weekCloser && (
        <Card style={{ marginTop: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: "0.06em", marginBottom: 6 }}>
            THIS WEEK &middot; {stageLabel(todayPlan)}
          </div>
          {weekCloser.weeklyMiniProject?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6EE7B7", marginBottom: 2 }}>WEEKLY MINI PROJECT</div>
              <div style={{ fontSize: 13, color: "#CBD5E1" }}>{joinField(weekCloser.weeklyMiniProject)}</div>
            </div>
          )}
          {weekCloser.weeklyAssessment?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#C4B5FD", marginBottom: 2 }}>WEEKLY ASSESSMENT</div>
              <div style={{ fontSize: 13, color: "#CBD5E1" }}>{joinField(weekCloser.weeklyAssessment)}</div>
            </div>
          )}
          <div style={{ fontSize: 10, color: "#475569", marginTop: 10 }}>
            Assigned on Day {weekCloser.day} — log your results below once you've completed it.
          </div>
        </Card>
      )}

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

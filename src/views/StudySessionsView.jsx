import { Brain } from "lucide-react";
import { Card, SectionTitle, StatCard } from "../components/UI";
import { RecordManager } from "../components/RecordManager";
import { STUDY_SESSION_FIELDS } from "../data/consistencyConstants";

export function StudySessionsView({ studySessions, addItem, updateItem, deleteItem }) {
  const completed = studySessions.filter((s) => s.completed === "Yes").length;
  const totalMinutes = studySessions.reduce((a, s) => a + (Number(s.duration) || 0), 0);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Brain size={18} color="#93C5FD" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Study Sessions</h1>
      </div>
      <SectionTitle>Logged focus sessions, by subject</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 18 }}>
        <StatCard label="SESSIONS" value={studySessions.length} sub="logged" color="#93C5FD" icon={Brain} />
        <StatCard label="COMPLETED" value={completed} sub="finished" color="#6EE7B7" icon={Brain} />
        <StatCard label="TOTAL TIME" value={`${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m`} sub="logged" color="#FCD34D" icon={Brain} />
      </div>

      <Card style={{ marginBottom: 18 }}>
        <span style={{ fontSize: 11, color: "#64748B" }}>
          Tip: log each focused study block here (subject + duration + focus type) to keep your roadmap and
          weekly review numbers accurate. Use the Timer for live tracking, or add sessions manually here.
        </span>
      </Card>

      <RecordManager
        title="Study Sessions"
        fields={STUDY_SESSION_FIELDS}
        items={studySessions}
        accent="#93C5FD"
        onAdd={(item) => addItem("studySessions", item)}
        onDelete={(id) => deleteItem("studySessions", id)}
        onUpdate={(id, patch) => updateItem("studySessions", id, patch)}
      />
    </div>
  );
}

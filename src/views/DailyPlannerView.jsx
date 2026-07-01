import { useState } from "react";
import { CalendarDays, Clock } from "lucide-react";
import { Card, SectionTitle } from "../components/UI";
import { RecordManager } from "../components/RecordManager";
import { DAILY_TASK_FIELDS } from "../data/consistencyConstants";
import { today } from "../utils/helpers";

const SCHEDULE_TEMPLATE = [
  { time: "7:00 AM",        label: "Get ready" },
  { time: "9:15 AM",        label: "College starts" },
  { time: "6:00 – 7:00 PM", label: "Home" },
  { time: "Evening",        label: "Study block · weekdays 2–3h" },
  { time: "Weekend",        label: "Study block · 4–5h" },
];

export function DailyPlannerView({ dailyTasks, addItem, updateItem, deleteItem }) {
  const [showAll, setShowAll] = useState(false);
  const todayStr = today();
  const todayTasks = dailyTasks.filter((t) => t.date === todayStr);
  const visible = showAll ? dailyTasks : todayTasks;
  const doneToday = todayTasks.filter((t) => t.status === "Completed").length;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <CalendarDays size={18} color="#FCD34D" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Daily Planner</h1>
      </div>
      <SectionTitle>
        {doneToday}/{todayTasks.length} tasks done today &middot; fit around your fixed schedule
      </SectionTitle>

      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Clock size={13} color="#FCD34D" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em" }}>
            YOUR DAILY SHAPE
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
          {SCHEDULE_TEMPLATE.map((s) => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8, padding: "10px 12px",
            }}>
              <div style={{ fontSize: 10, color: "#FCD34D", fontWeight: 700 }}>{s.time}</div>
              <div style={{ fontSize: 12, color: "#E2E8F0", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <button
          onClick={() => setShowAll((s) => !s)}
          style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
            padding: "6px 12px", fontSize: 11, color: "#94A3B8", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {showAll ? "Show today only" : "Show all days"}
        </button>
      </div>

      <RecordManager
        title={showAll ? "All Planned Tasks" : "Today's Tasks"}
        fields={DAILY_TASK_FIELDS}
        items={visible}
        accent="#FCD34D"
        onAdd={(item) => addItem("dailyTasks", { ...item, date: item.date || todayStr })}
        onDelete={(id) => deleteItem("dailyTasks", id)}
        onUpdate={(id, patch) => updateItem("dailyTasks", id, patch)}
      />
    </div>
  );
}

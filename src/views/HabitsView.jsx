import { useState } from "react";
import { Flame, Trash2, Plus, Check } from "lucide-react";
import { Card, SectionTitle, EmptyState } from "../components/UI";

const inputStyle = {
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6, padding: "8px 10px", fontSize: 12, color: "#E2E8F0",
  fontFamily: "inherit", outline: "none",
};

export function HabitsView({ habits, addItem, updateItem, deleteItem }) {
  const [name, setName] = useState("");
  const [freq, setFreq] = useState("Daily");

  const handleAdd = () => {
    if (!name.trim()) return;
    addItem("habits", {
      habit: name.trim(), frequency: freq,
      currentStreak: 0, longestStreak: 0,
      lastCheckIn: null,
    });
    setName("");
  };

  const checkIn = (habit) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (habit.lastCheckIn === todayStr) return; // already checked in today
    const newStreak = habit.currentStreak + 1;
    updateItem("habits", habit.id, {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, habit.longestStreak || 0),
      lastCheckIn: todayStr,
    });
  };

  const resetStreak = (habit) =>
    updateItem("habits", habit.id, { currentStreak: 0, lastCheckIn: null });

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Flame size={18} color="#FCA5A5" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Habits</h1>
      </div>
      <SectionTitle>Daily discipline — check in to build your streak</SectionTitle>

      <Card>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          <input
            placeholder="New habit (e.g. Solve 1 LeetCode problem)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ ...inputStyle, flex: "1 1 240px" }}
          />
          <select value={freq} onChange={(e) => setFreq(e.target.value)} style={{ ...inputStyle, flex: "0 1 110px" }}>
            <option>Daily</option>
            <option>Weekly</option>
          </select>
          <button
            onClick={handleAdd}
            style={{
              background: "#FCA5A5", color: "#000", border: "none", borderRadius: 6,
              padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <Plus size={13} /> Add
          </button>
        </div>

        {habits.length === 0 ? (
          <EmptyState message="No habits yet — add your first one above." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {habits.map((h) => {
              const checkedToday = h.lastCheckIn === new Date().toISOString().slice(0, 10);
              return (
                <div key={h.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 8, padding: 12, gap: 10,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{h.habit}</div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                      {h.frequency} · 🔥 {h.currentStreak || 0}d current · 🏆 {h.longestStreak || 0}d best
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={() => checkIn(h)}
                      disabled={checkedToday}
                      style={{
                        background: checkedToday ? "rgba(110,231,183,0.15)" : "#6EE7B7",
                        color: checkedToday ? "#6EE7B7" : "#000",
                        border: "none", borderRadius: 6, padding: "6px 12px",
                        fontSize: 11, fontWeight: 700, cursor: checkedToday ? "default" : "pointer",
                        display: "flex", alignItems: "center", gap: 4,
                      }}
                    >
                      <Check size={12} /> {checkedToday ? "Done today" : "Check in"}
                    </button>
                    <button
                      onClick={() => resetStreak(h)}
                      title="Reset streak"
                      style={{ background: "transparent", border: "none", color: "#475569", fontSize: 11, cursor: "pointer" }}
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => deleteItem("habits", h.id)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#475569", padding: 4 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

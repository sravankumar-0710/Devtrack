import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { fmtDuration } from "../utils/helpers";

const DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];

/**
 * ActivityGoalCard — shows today's progress for a single activity goal.
 *
 * Props:
 *   goal        { id, categoryId, targetSeconds, reminderTime, days, enabled }
 *   category    { name, color }
 *   doneSecs    number — how many seconds logged today for this category
 */
export function ActivityGoalCard({ goal, category, doneSecs }) {
  const pct      = Math.min(100, Math.round((doneSecs / goal.targetSeconds) * 100));
  const done     = doneSecs >= goal.targetSeconds;
  const remaining = Math.max(0, goal.targetSeconds - doneSecs);
  const color    = category?.color || "#6EE7B7";

  return (
    <div style={{
      background:   done ? `${color}10` : "rgba(255,255,255,0.03)",
      border:       `1px solid ${done ? color + "40" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 12,
      padding:      "14px 16px",
      transition:   "all 0.3s",
    }}>
      {/* Header row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:color, flexShrink:0 }} />
          <span style={{ fontSize:13, fontWeight:700, color:"#E2E8F0" }}>{category?.name || "Unknown"}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Active days */}
          <div style={{ display:"flex", gap:3 }}>
            {DAYS_SHORT.map((d, i) => {
              const active = (goal.days || [0,1,2,3,4,5,6]).includes(i);
              return (
                <span key={i} style={{
                  fontSize:9, fontWeight:700, width:18, height:18,
                  borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center",
                  background: active ? `${color}25` : "rgba(255,255,255,0.03)",
                  color:      active ? color : "#334155",
                }}>
                  {d}
                </span>
              );
            })}
          </div>
          {/* Reminder time */}
          {goal.reminderTime && (
            <span style={{ fontSize:10, color:"#475569", display:"flex", alignItems:"center", gap:3 }}>
              <Clock size={10} /> {goal.reminderTime}
            </span>
          )}
          {/* Status icon */}
          {done
            ? <CheckCircle size={16} color={color} />
            : <AlertCircle size={16} color="#FCA5A5" />
          }
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:4, height:6, overflow:"hidden", marginBottom:8 }}>
        <div style={{
          width:        `${pct}%`,
          height:       "100%",
          background:   done ? color : `linear-gradient(90deg, ${color}99, ${color})`,
          borderRadius: 4,
          transition:   "width 0.5s ease",
        }} />
      </div>

      {/* Stats row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:11, color:"#64748B" }}>
          {fmtDuration(doneSecs)} / {fmtDuration(goal.targetSeconds)}
        </span>
        <span style={{ fontSize:11, fontWeight:700, color: done ? color : "#FCA5A5" }}>
          {done ? "✓ COMPLETE" : `${remaining > 0 ? fmtDuration(remaining) + " left" : "0m left"} · ${pct}%`}
        </span>
      </div>
    </div>
  );
}
import { Card } from "./Card";
import { fmtH } from "../utils/helpers";

/**
 * GoalBar — shows current vs target with a progress bar.
 *
 * Props:
 *   label      {string}   e.g. "DAILY GOAL"
 *   current    {number}   seconds achieved
 *   target     {number}   seconds goal
 *   color      {string}   hex color for bar
 */
export function GoalBar({ label, current, target, color }) {
  const pct = Math.min(100, (current / target) * 100);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#64748B" }}
        >
          {label}
        </span>
        <span style={{ fontSize: 12, color: "#94A3B8" }}>
          {fmtH(current)} / {fmtH(target)}
        </span>
      </div>

      <div
        style={{
          background:   "rgba(255,255,255,0.05)",
          borderRadius: 4,
          height:       6,
          overflow:     "hidden",
        }}
      >
        <div
          style={{
            width:        `${pct}%`,
            height:       "100%",
            borderRadius: 4,
            background:   `linear-gradient(90deg, ${color}80, ${color})`,
            transition:   "width 0.8s ease",
          }}
        />
      </div>

      <div style={{ fontSize: 11, color, marginTop: 6, fontWeight: 700 }}>
        {pct.toFixed(0)}% complete
      </div>
    </Card>
  );
}

import { BarChart2, Clock, TrendingUp, Settings } from "lucide-react";
import { NAV_ITEMS } from "../data/constants";
import { fmtH } from "../utils/helpers";

const NAV_ICONS = { dashboard: BarChart2, timer: Clock, reports: TrendingUp, settings: Settings };

/**
 * Header — sticky top navigation bar.
 *
 * Props:
 *   view           {string}   active view id
 *   setView        {fn}
 *   streak         {number}
 *   todaySeconds   {number}
 */
export function Header({ view, setView, streak, todaySeconds }) {
  return (
    <header
      style={{
        padding:        "0 28px",
        height:         60,
        background:     "rgba(255,255,255,0.03)",
        borderBottom:   "1px solid rgba(255,255,255,0.07)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        backdropFilter: "blur(10px)",
        position:       "sticky",
        top:            0,
        zIndex:         100,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width:          32,
            height:         32,
            borderRadius:   8,
            background:     "linear-gradient(135deg,#6EE7B7,#3B82F6)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          <TrendingUp size={16} color="#000" />
        </div>
        <span
          style={{ fontWeight: 700, fontSize: 15, letterSpacing: "0.05em", color: "#fff" }}
        >
          DEVTRACK
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", gap: 4 }}>
        {NAV_ITEMS.map(({ id, label }) => {
          const Icon = NAV_ICONS[id];
          const active = view === id;
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              style={{
                padding:     "6px 14px",
                borderRadius: 6,
                border:      "none",
                cursor:      "pointer",
                fontSize:    12,
                fontFamily:  "inherit",
                fontWeight:  600,
                letterSpacing: "0.04em",
                background:  active ? "rgba(110,231,183,0.15)" : "transparent",
                color:       active ? "#6EE7B7" : "#94A3B8",
                display:     "flex",
                alignItems:  "center",
                gap:         6,
                transition:  "all 0.2s",
              }}
            >
              <Icon size={13} /> {label}
            </button>
          );
        })}
      </nav>

      {/* Status chips */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 12, color: "#64748B" }}>
        <span style={{ color: streak > 0 ? "#FCD34D" : "#475569" }}>
          🔥 {streak}d streak
        </span>
        <span
          style={{
            background:   "rgba(110,231,183,0.1)",
            color:        "#6EE7B7",
            padding:      "4px 10px",
            borderRadius: 20,
            fontSize:     11,
            fontWeight:   700,
          }}
        >
          TODAY {fmtH(todaySeconds)}
        </span>
      </div>
    </header>
  );
}

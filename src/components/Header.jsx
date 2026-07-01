import { useState, useRef, useEffect } from "react";
import {
  BarChart2, Clock, TrendingUp, Settings, LogOut,
  Target, Map, Award, Flame, StickyNote, Library, GraduationCap, ChevronDown,
  CalendarDays, Code2, Brain, BarChart3, ClipboardCheck, Rocket, CalendarRange,
} from "lucide-react";
import { NAV_ITEMS, CONSISTENCY_NAV_ITEMS } from "../data/constants";
import { fmtDuration } from "../utils/helpers";

const NAV_ICONS = { dashboard: BarChart2, timer: Clock, reports: TrendingUp, settings: Settings };

const CONSISTENCY_ICONS = {
  dailyPlan: CalendarDays,
  allDays: CalendarRange,
  dailyMission: Rocket,
  planner: CalendarDays, goals: Target, roadmap: Map, projects: Code2,
  certifications: Award, studySessions: Brain, resources: Library,
  notes: StickyNote, habits: Flame, statistics: BarChart3,
  placement: GraduationCap, weeklyReview: ClipboardCheck,
};

/**
 * Header — sticky top navigation bar.
 *
 * Props:
 *   view           {string}
 *   setView        {fn}
 *   streak         {number}
 *   todaySeconds   {number}
 *   user           {object}  Firebase user
 *   logout         {fn}
 */
export function Header({ view, setView, streak, todaySeconds, user, logout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const inConsistency = CONSISTENCY_NAV_ITEMS.some((i) => i.id === view);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <header style={{
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
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "linear-gradient(135deg,#6EE7B7,#3B82F6)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <TrendingUp size={16} color="#000" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "0.05em", color: "#fff" }}>
          DEVTRACK
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {NAV_ITEMS.map(({ id, label }) => {
          const Icon   = NAV_ICONS[id];
          const active = view === id;
          return (
            <button key={id} onClick={() => setView(id)} style={{
              padding: "6px 14px", borderRadius: 6, border: "none",
              cursor: "pointer", fontSize: 12, fontFamily: "inherit",
              fontWeight: 600, letterSpacing: "0.04em",
              background: active ? "rgba(110,231,183,0.15)" : "transparent",
              color:      active ? "#6EE7B7" : "#94A3B8",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
            }}>
              <Icon size={13} /> {label}
            </button>
          );
        })}

        {/* Consistency dropdown */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button onClick={() => setMenuOpen((o) => !o)} style={{
            padding: "6px 14px", borderRadius: 6, border: "none",
            cursor: "pointer", fontSize: 12, fontFamily: "inherit",
            fontWeight: 600, letterSpacing: "0.04em",
            background: inConsistency ? "rgba(196,181,253,0.15)" : "transparent",
            color:      inConsistency ? "#C4B5FD" : "#94A3B8",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Target size={13} /> Consistency <ChevronDown size={12} />
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", right: 0,
              background: "#10131C", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: 6, minWidth: 180, maxHeight: 360, overflowY: "auto",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)", zIndex: 200,
            }}>
              {CONSISTENCY_NAV_ITEMS.map(({ id, label }) => {
                const Icon   = CONSISTENCY_ICONS[id];
                const active = view === id;
                return (
                  <button
                    key={id}
                    onClick={() => { setView(id); setMenuOpen(false); }}
                    style={{
                      width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 6,
                      border: "none", cursor: "pointer", fontSize: 12, fontFamily: "inherit",
                      fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
                      background: active ? "rgba(196,181,253,0.12)" : "transparent",
                      color:      active ? "#C4B5FD" : "#CBD5E1",
                    }}
                  >
                    <Icon size={13} /> {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Right side — streak + today + user */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: streak > 0 ? "#FCD34D" : "#475569" }}>
          🔥 {streak}d streak
        </span>
        <span style={{
          background: "rgba(110,231,183,0.1)", color: "#6EE7B7",
          padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
        }}>
          TODAY {fmtDuration(todaySeconds)}
        </span>

        {/* User avatar + logout */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }}
              />
            ) : (
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(110,231,183,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: "#6EE7B7", fontWeight: 700,
              }}>
                {user.displayName?.[0] || "U"}
              </div>
            )}
            <button
              onClick={logout}
              title="Sign out"
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: "#475569", padding: 4, borderRadius: 6,
                display: "flex", alignItems: "center",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#FCA5A5"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#475569"}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
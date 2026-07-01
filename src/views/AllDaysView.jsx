import { useMemo, useState } from "react";
import {
  CalendarRange, CheckCircle2, Circle, ChevronDown, ChevronRight,
  Search, Rocket, BookOpen, Code2, Brain, Wrench, X, Undo2,
} from "lucide-react";
import { Card } from "../components/Card";
import { PLAN_365, dateForDay, todayDayNum } from "../data/curriculum365";

/**
 * AllDaysView — see every day of the 365-day plan at once, grouped by stage.
 *
 * Lets you mark ANY day done or undo it — not just today — so catching up
 * on a missed day, or backing out a mistaken tap, works from one screen.
 *
 * Props (from useMissionEngine via App.jsx sharedProps):
 *   engineState, isDayComplete, markDayComplete, markDayIncomplete
 */
export function AllDaysView({
  engineState = {}, isDayComplete, markDayComplete, markDayIncomplete,
}) {
  const todayNum = todayDayNum();
  const completedDays = engineState.completedDays || {};
  const totalDone = Object.keys(completedDays).length;

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all | done | missed | upcoming
  const [openStages, setOpenStages] = useState(() => {
    const day = PLAN_365[Math.min(Math.max(todayNum - 1, 0), PLAN_365.length - 1)];
    return new Set(day ? [day.stage] : []);
  });

  const q = query.trim().toLowerCase();

  const stages = useMemo(() => {
    const byStage = new Map();
    PLAN_365.forEach((d) => {
      if (!byStage.has(d.stage)) byStage.set(d.stage, []);
      byStage.get(d.stage).push(d);
    });
    return [...byStage.entries()];
  }, []);

  const matchesQuery = (d) => {
    if (!q) return true;
    return (
      String(d.day).includes(q) ||
      d.stage.toLowerCase().includes(q) ||
      d.t1.toLowerCase().includes(q) ||
      d.t2.toLowerCase().includes(q) ||
      d.t3.toLowerCase().includes(q) ||
      d.t4.toLowerCase().includes(q)
    );
  };

  const matchesFilter = (d) => {
    const done = isDayComplete ? isDayComplete(d.day) : !!completedDays[d.day];
    if (filter === "done") return done;
    if (filter === "missed") return !done && d.day < todayNum;
    if (filter === "upcoming") return d.day >= todayNum;
    return true;
  };

  const toggleStage = (stage) => {
    setOpenStages((prev) => {
      const next = new Set(prev);
      next.has(stage) ? next.delete(stage) : next.add(stage);
      return next;
    });
  };

  const jumpToToday = () => {
    const day = PLAN_365[Math.min(Math.max(todayNum - 1, 0), PLAN_365.length - 1)];
    if (!day) return;
    setOpenStages((prev) => new Set(prev).add(day.stage));
    setFilter("all");
    setQuery("");
    requestAnimationFrame(() => {
      document.getElementById(`day-${day.day}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px 60px" }}>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <Card style={{
        marginBottom: 20, position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(110,231,183,0.08), rgba(196,181,253,0.05))",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "#94A3B8", fontSize: 12, fontWeight: 600 }}>
          <CalendarRange size={14} color="#6EE7B7" />
          <span>All 365 days, one screen</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>
          Full Plan Overview
        </h1>
        <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 16 }}>
          {totalDone} of 365 days marked complete · today is Day {Math.max(1, Math.min(365, todayNum))}.
          Tap any day to mark it done, or undo a day you completed by mistake — order doesn't matter.
        </div>

        {/* Search + filter + jump-to-today */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, flex: "1 1 220px",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "8px 12px",
          }}>
            <Search size={14} color="#64748B" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a day, stage, or task…"
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#E2E8F0", fontSize: 13, fontFamily: "inherit" }}
            />
            {query && (
              <button onClick={() => setQuery("")} style={ghostBtn}><X size={13} /></button>
            )}
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {[
              { id: "all", label: "All" },
              { id: "done", label: "Done" },
              { id: "missed", label: "Missed" },
              { id: "upcoming", label: "Upcoming" },
            ].map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)} style={filterPill(filter === f.id)}>
                {f.label}
              </button>
            ))}
          </div>

          <button onClick={jumpToToday} style={pillBtn("#6EE7B7")}>
            <Rocket size={13} /> Jump to today
          </button>
        </div>
      </Card>

      {/* ── STAGES ───────────────────────────────────────────────── */}
      {stages.map(([stage, days]) => {
        const visibleDays = days.filter((d) => matchesQuery(d) && matchesFilter(d));
        if (visibleDays.length === 0) return null;

        const stageDone = days.filter((d) => (isDayComplete ? isDayComplete(d.day) : !!completedDays[d.day])).length;
        const open = openStages.has(stage);

        return (
          <Card key={stage} style={{ marginBottom: 12, padding: 0, overflow: "hidden" }}>
            <button
              onClick={() => toggleStage(stage)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 12, padding: "16px 18px", background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                {open ? <ChevronDown size={16} color="#64748B" /> : <ChevronRight size={16} color="#64748B" />}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {stage}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                    Days {days[0].day}–{days[days.length - 1].day} · {stageDone}/{days.length} complete
                  </div>
                </div>
              </div>
              <div style={{ width: 90, flexShrink: 0 }}>
                <ProgressBar pct={days.length ? Math.round((stageDone / days.length) * 100) : 0} color="#6EE7B7" />
              </div>
            </button>

            {open && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {visibleDays.map((d) => (
                  <DayRow
                    key={d.day}
                    plan={d}
                    isToday={d.day === todayNum}
                    done={isDayComplete ? isDayComplete(d.day) : !!completedDays[d.day]}
                    onMarkDone={() => markDayComplete?.(d.day)}
                    onUndo={() => markDayIncomplete?.(d.day)}
                  />
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── sub-components ─────────────────────────────────────────────────────

function DayRow({ plan, isToday, done, onMarkDone, onUndo }) {
  const [expanded, setExpanded] = useState(false);
  const date = dateForDay(plan.day);
  const dateLabel = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div
      id={`day-${plan.day}`}
      style={{
        padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: isToday ? "rgba(252,211,77,0.05)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={done ? onUndo : onMarkDone}
          title={done ? "Undo — mark this day incomplete" : "Mark this day complete"}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexShrink: 0 }}
        >
          {done ? <CheckCircle2 size={19} color="#6EE7B7" /> : <Circle size={19} color="#475569" />}
        </button>

        <div
          onClick={() => setExpanded((v) => !v)}
          style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: isToday ? "#FCD34D" : "#94A3B8" }}>
              Day {plan.day}
            </span>
            <span style={{ fontSize: 11, color: "#475569" }}>{dateLabel}</span>
            {isToday && (
              <span style={{ fontSize: 9, fontWeight: 700, color: "#FCD34D", background: "rgba(252,211,77,0.1)", padding: "2px 6px", borderRadius: 4 }}>
                TODAY
              </span>
            )}
            {plan.dayType === "sunday" && (
              <span style={{ fontSize: 9, fontWeight: 700, color: "#C4B5FD", background: "rgba(196,181,253,0.1)", padding: "2px 6px", borderRadius: 4 }}>
                DEEP WORK
              </span>
            )}
          </div>
          <div style={{
            fontSize: 13, color: done ? "#64748B" : "#E2E8F0", marginTop: 3,
            textDecoration: done ? "line-through" : "none",
            whiteSpace: expanded ? "normal" : "nowrap", overflow: expanded ? "visible" : "hidden",
            textOverflow: expanded ? "clip" : "ellipsis",
          }}>
            {plan.t2}
          </div>
        </div>

        <button onClick={() => setExpanded((v) => !v)} style={ghostBtn}>
          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>

      {expanded && (
        <div style={{ marginTop: 10, marginLeft: 31, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 8 }}>
          <TrackLine icon={<BookOpen size={12} color="#93C5FD" />} label="Foundations" text={plan.t1} />
          <TrackLine icon={<Code2 size={12} color="#6EE7B7" />} label="Web Roadmap" text={plan.t2} />
          <TrackLine icon={<Brain size={12} color="#FCD34D" />} label="DSA" text={plan.t3} />
          <TrackLine icon={<Wrench size={12} color="#FB923C" />} label="Project" text={plan.t4} />
          {done && (
            <button onClick={onUndo} style={{ ...pillBtn("#FB923C"), justifySelf: "start", marginTop: 4 }}>
              <Undo2 size={12} /> Undo completion
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function TrackLine({ icon, label, text }) {
  return (
    <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
      <div style={{ marginTop: 2 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#64748B", letterSpacing: "0.05em" }}>{label.toUpperCase()}</div>
        <div style={{ fontSize: 12, color: "#CBD5E1", marginTop: 1 }}>{text}</div>
      </div>
    </div>
  );
}

function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 6, transition: "width 0.4s ease" }} />
    </div>
  );
}

const pillBtn = (color) => ({
  display: "flex", alignItems: "center", gap: 6, background: `${color}1A`, border: `1px solid ${color}55`,
  color, borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
  whiteSpace: "nowrap",
});

const filterPill = (active) => ({
  background: active ? "rgba(110,231,183,0.14)" : "rgba(255,255,255,0.03)",
  border: active ? "1px solid rgba(110,231,183,0.4)" : "1px solid rgba(255,255,255,0.08)",
  color: active ? "#6EE7B7" : "#94A3B8",
  borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
});

const ghostBtn = {
  background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: 2, display: "flex", alignItems: "center",
};

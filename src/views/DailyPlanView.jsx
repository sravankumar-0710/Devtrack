import { useState, useEffect } from "react";
import {
  BookOpen, Code2, Brain, Wrench, Flame, Sun, Moon, Sunrise,
  Trophy, ChevronRight, CheckCircle2, Circle, Rocket, CalendarDays,
  Quote, Sparkles, Github, Gauge, Plus, RotateCcw,
} from "lucide-react";
import { Card } from "../components/Card";
import { getTodayPlan, yearProgress, PLAN_START_DATE } from "../data/curriculum365";
import { ReadinessPanel } from "../components/ReadinessPanel";
import { QUOTES } from "../data/consistencyConstants";
import { fmtDuration } from "../utils/helpers";

/**
 * DailyPlanView — the main "command center" screen.
 *
 * Shows today's 4-track plan from the 365-day curriculum, overall year
 * progress, streak, weekly hours, readiness scores, and DSA/GitHub
 * quick-log. This is what should open by default when the user lands
 * on Project Consistency.
 *
 * Props (all from App.jsx shared props + useMissionEngine):
 *   streak, weekSeconds, goals
 *   readiness, progress, addDSA, addGithubCommits   (from useMissionEngine)
 *   engineState, markDayComplete, isDayComplete       (from useMissionEngine — see below)
 */
export function DailyPlanView({
  streak = 0, weekSeconds = 0, goals = {},
  readiness = null, progress = null,
  addDSA, addGithubCommits,
  engineState = {}, markDayComplete, isDayComplete,
  toggleTrackComplete, isTrackComplete,
}) {
  const plan = getTodayPlan();
  const yp   = Math.round(yearProgress() * 100);

  const dayNum = plan?.day ?? null;
  const done   = isDayComplete ? isDayComplete(dayNum) : false;

  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const quote = QUOTES[quoteIdx];

  const greeting = useGreeting();
  const weeklyPct = goals?.weekly ? Math.min(100, Math.round((weekSeconds / goals.weekly) * 100)) : 0;

  const [celebrate, setCelebrate] = useState(false);
  const handleMarkDone = () => {
    markDayComplete?.(dayNum);
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2600);
  };

  // start date for display
  const startDate = new Date(PLAN_START_DATE + "T00:00:00");
  const todayDate = new Date();
  const elapsed   = Math.max(0, Math.floor((todayDate - startDate) / 86400000));

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px 60px", position: "relative" }}>
      {celebrate && <Confetti />}

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <Card style={{
        marginBottom: 20, position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(110,231,183,0.08), rgba(196,181,253,0.05))",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <GlowOrb />

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "#94A3B8", fontSize: 12, fontWeight: 600 }}>
          {greeting.icon}
          <span>{greeting.text} · {formatToday()}</span>
          {plan && (
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#6EE7B7", fontWeight: 700 }}>
              Day {plan.day} / 365
            </span>
          )}
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 4px", lineHeight: 1.2 }}>
          {plan ? plan.stage : "Your 365-Day Journey"}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94A3B8", fontSize: 13, fontStyle: "italic", marginBottom: 22 }}>
          <Quote size={13} color="#FCD34D" />
          <span>"{quote}"</span>
          <button onClick={() => setQuoteIdx((i) => (i + 1) % QUOTES.length)} style={ghostBtn}>
            <Sparkles size={12} />
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
          <RingStat value={yp} label="YEAR COMPLETE" sub={`Day ${elapsed} of 365`} color="#6EE7B7" />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 46, height: 46, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(252,165,116,0.12)", border: "1px solid rgba(252,165,116,0.3)",
            }}>
              <Flame size={22} color="#FB923C" style={{ filter: streak > 0 ? "drop-shadow(0 0 6px #FB923C)" : "none" }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{streak}d</div>
              <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, letterSpacing: "0.06em" }}>STREAK</div>
            </div>
          </div>
          <RingStat value={weeklyPct} label="WEEKLY TARGET" sub={`${fmtDuration(weekSeconds)} logged`} color="#C4B5FD" />
          {plan && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: plan.dayType === "sunday" ? "#FCD34D" : "#93C5FD" }}>
                {plan.hours}h
              </div>
              <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, letterSpacing: "0.06em" }}>
                {plan.dayType === "sunday" ? "DEEP WORK" : "TODAY'S TARGET"}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── TODAY'S 4-TRACK PLAN ────────────────────────────────── */}
      {plan ? (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CalendarDays size={15} color="#6EE7B7" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em" }}>
                TODAY'S PLAN — {plan.dayType === "sunday" ? "DEEP WORK DAY" : "STUDY DAY"}
              </span>
            </div>
            {!done ? (
              <button onClick={handleMarkDone} style={pillBtn("#6EE7B7")}>
                <CheckCircle2 size={13} /> Mark Day Complete
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6EE7B7", fontSize: 12, fontWeight: 700 }}>
                <CheckCircle2 size={14} /> Day {plan.day} Complete 🎉
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <TrackCard
              icon={<BookOpen size={15} color="#93C5FD" />}
              label="TRACK 1 · FOUNDATIONS"
              accent="#93C5FD"
              duration={plan.dayType === "sunday" ? "90 min" : "60 min"}
              content={plan.t1}
              done={isTrackComplete ? isTrackComplete(plan.day, "t1") : false}
              onToggle={() => toggleTrackComplete?.(plan.day, "t1")}
            />
            <TrackCard
              icon={<Code2 size={15} color="#6EE7B7" />}
              label="TRACK 2 · WEB ROADMAP"
              accent="#6EE7B7"
              duration={plan.dayType === "sunday" ? "75 min" : "45 min"}
              content={plan.t2}
              done={isTrackComplete ? isTrackComplete(plan.day, "t2") : false}
              onToggle={() => toggleTrackComplete?.(plan.day, "t2")}
            />
            <TrackCard
              icon={<Brain size={15} color="#FCD34D" />}
              label="TRACK 3 · DSA PRACTICE"
              accent="#FCD34D"
              duration={plan.dayType === "sunday" ? "75 min" : "45 min"}
              content={plan.t3}
              done={isTrackComplete ? isTrackComplete(plan.day, "t3") : false}
              onToggle={() => toggleTrackComplete?.(plan.day, "t3")}
            />
            <TrackCard
              icon={<Wrench size={15} color="#FB923C" />}
              label="TRACK 4 · PROJECT TASK"
              accent="#FB923C"
              duration={plan.dayType === "sunday" ? "60 min" : "30 min"}
              content={plan.t4}
              done={isTrackComplete ? isTrackComplete(plan.day, "t4") : false}
              onToggle={() => toggleTrackComplete?.(plan.day, "t4")}
            />
          </div>

          {done && (
            <div style={{
              marginTop: 16, padding: "12px 14px", borderRadius: 10,
              background: "rgba(110,231,183,0.08)", border: "1px solid rgba(110,231,183,0.25)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <Trophy size={16} color="#6EE7B7" />
              <span style={{ fontSize: 13, color: "#6EE7B7", fontWeight: 700 }}>
                You locked in another day. Streak is alive — see you tomorrow.
              </span>
            </div>
          )}
        </Card>
      ) : (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#475569", padding: 8 }}>
            {elapsed < 0
              ? `Your plan starts on July 1 2026 — ${Math.abs(elapsed)} days to go.`
              : "You've completed all 365 days. Take a bow."}
          </div>
        </Card>
      )}

      {/* ── QUICK LOG ───────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <QuickLogCard icon={<Gauge size={15} color="#FCD34D" />} label="LOG DSA PROBLEMS SOLVED TODAY" accent="#FCD34D" onLog={addDSA} />
        <QuickLogCard icon={<Github size={15} color="#93C5FD" />} label="LOG GITHUB COMMITS TODAY" accent="#93C5FD" onLog={addGithubCommits} />
      </div>

      {/* ── READINESS ───────────────────────────────────────────── */}
      {readiness && progress && (
        <ReadinessPanel readiness={readiness} progress={progress} />
      )}
    </div>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────

function TrackCard({ icon, label, accent, duration, content, done = false, onToggle }) {
  return (
    <div style={{
      borderRadius: 10, padding: "14px 16px",
      background: done ? `${accent}0D` : "rgba(255,255,255,0.02)",
      border: `1px solid ${done ? accent + "44" : "rgba(255,255,255,0.06)"}`,
      transition: "all 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {icon}
          <span style={{ fontSize: 9, fontWeight: 700, color: "#64748B", letterSpacing: "0.06em" }}>{label}</span>
        </div>
        <button
          onClick={onToggle}
          title={done ? "Mark this task incomplete" : "Mark this task complete"}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          {done
            ? <CheckCircle2 size={16} color={accent} />
            : <Circle size={16} color="#334155" />}
        </button>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: done ? "#64748B" : "#E2E8F0", textDecoration: done ? "line-through" : "none", lineHeight: 1.4, marginBottom: 8 }}>
        {content}
      </div>
      <div style={{ fontSize: 10, color: accent, fontWeight: 700 }}>{duration}</div>
    </div>
  );
}

function QuickLogCard({ icon, label, accent, onLog }) {
  const [val, setVal] = useState("");
  const submit = () => {
    const n = parseInt(val, 10);
    if (!n || n <= 0) return;
    onLog?.(n);
    setVal("");
  };
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
        {icon}
        <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: "0.06em" }}>{label}</span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="0"
          inputMode="numeric"
          style={{
            width: 70, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "#E2E8F0", fontFamily: "inherit",
          }}
        />
        <button onClick={submit} style={pillBtn(accent)}>
          <Plus size={13} /> Add
        </button>
      </div>
    </Card>
  );
}

function RingStat({ value, label, sub, color }) {
  const r = 26, c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={64} height={64} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={32} cy={32} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={6} fill="none" />
        <circle cx={32} cy={32} r={r} stroke={color} strokeWidth={6} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
        <text x={32} y={36} textAnchor="middle" fill="#fff" fontSize="13" fontWeight="800"
          style={{ transform: "rotate(90deg)", transformOrigin: "32px 32px", fontFamily: "inherit" }}>
          {value}%
        </text>
      </svg>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "#64748B" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function GlowOrb() {
  return (
    <div style={{
      position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(110,231,183,0.15), transparent 70%)", pointerEvents: "none",
    }} />
  );
}

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 0.5,
    dur: 1.8 + Math.random() * 1.2,
    color: ["#6EE7B7", "#FCD34D", "#C4B5FD", "#FB923C"][i % 4],
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999, overflow: "hidden" }}>
      <style>{`@keyframes cf-fall{0%{transform:translateY(-10vh) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(360deg);opacity:.2}}`}</style>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.left}%`, top: 0, width: 8, height: 12,
          background: p.color, borderRadius: 2,
          animation: `cf-fall ${p.dur}s ease-in ${p.delay}s forwards`,
        }} />
      ))}
    </div>
  );
}

function useGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", icon: <Sunrise size={14} color="#FCD34D" /> };
  if (h < 18) return { text: "Good afternoon", icon: <Sun size={14} color="#FCD34D" /> };
  return { text: "Good evening", icon: <Moon size={14} color="#C4B5FD" /> };
}

function formatToday() {
  return new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

const pillBtn = (color) => ({
  display: "flex", alignItems: "center", gap: 6,
  background: `${color}1A`, border: `1px solid ${color}55`,
  color, borderRadius: 8, padding: "9px 14px", fontSize: 12, fontWeight: 700,
  cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
});

const ghostBtn = {
  background: "none", border: "none", cursor: "pointer",
  color: "#64748B", padding: 2, display: "flex", alignItems: "center",
};

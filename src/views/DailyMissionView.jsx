import { useState, useEffect, useMemo, useRef } from "react";
import {
  Flame, Compass, CheckCircle2, Circle, Sparkles, Sunrise, Sun, Moon,
  Trophy, Target, BookOpen, Code2, Award, ChevronRight, Plus, X, Quote,
  Brain, Hammer, RotateCcw, ClipboardCheck, Github, Gauge, Gift,
} from "lucide-react";
import { Card } from "../components/Card";
import { QUOTES, CAREER_LEVELS } from "../data/consistencyConstants";
import { today, fmtDuration } from "../utils/helpers";
import { ReadinessPanel } from "../components/ReadinessPanel";

/**
 * DailyMissionView — a single, highly interactive "command center" page.
 * Pulls together today's tasks, the mission statement, streak, weekly
 * target progress, current course/project, next certification and next
 * milestone into one motivational, game-like screen.
 *
 * Props mirror what Dashboard already receives so it can be wired in
 * without any new data plumbing:
 *   dailyTasks, addItem, updateItem, deleteItem   (from useConsistencyData)
 *   mission, saveMission                          (from useConsistencyData)
 *   roadmapItems, certifications, lifeGoals        (from useConsistencyData)
 *   projects, entries                              (from useFirebaseData)
 *   streak, weekSeconds, goals                     (from App)
 */
export function DailyMissionView({
  dailyTasks = [], addItem, updateItem, deleteItem,
  mission, saveMission,
  roadmapItems = [], certifications = [], lifeGoals = [],
  projects = [], entries = [],
  streak = 0, weekSeconds = 0, goals = {},
  // Project Consistency v1 engine (from useMissionEngine)
  todayTopics = [], revisionTopics = [], bonus = null,
  readiness = null, progress = null,
  markComplete, markIncomplete, addDSA, addGithubCommits,
}) {
  const todayStr = today();
  const todayTasks = useMemo(
    () => dailyTasks.filter((t) => t.date === todayStr),
    [dailyTasks, todayStr]
  );
  const doneCount = todayTasks.filter((t) => t.status === "Completed").length;
  const pct = todayTasks.length ? Math.round((doneCount / todayTasks.length) * 100) : 0;

  const [celebrate, setCelebrate] = useState(false);
  const prevPct = useRef(pct);
  useEffect(() => {
    if (pct === 100 && todayTasks.length > 0 && prevPct.current < 100) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 2600);
      return () => clearTimeout(t);
    }
    prevPct.current = pct;
  }, [pct, todayTasks.length]);

  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const quote = mission?.quote || QUOTES[quoteIdx];

  const greeting = useGreeting();

  const currentCourse = roadmapItems.find((r) => r.status === "In Progress") || roadmapItems[0];
  const nextCertification = certifications.find((c) => c.status !== "Completed");
  const nextMilestone = [...lifeGoals]
    .filter((g) => g.status !== "Completed" && g.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0]
    || lifeGoals.find((g) => g.status !== "Completed");
  const currentProject = [...projects]
    .map((p) => ({ ...p, seconds: entries.filter((e) => e.project === p.id).reduce((a, b) => a + b.duration, 0) }))
    .sort((a, b) => b.seconds - a.seconds)[0];

  const weeklyTarget = goals?.weekly || 0;
  const weeklyPct = weeklyTarget ? Math.min(100, Math.round((weekSeconds / weeklyTarget) * 100)) : 0;

  const roadmapDone = roadmapItems.filter((r) => r.status === "Completed").length;
  const roadmapPct = roadmapItems.length ? Math.round((roadmapDone / roadmapItems.length) * 100) : 0;

  const [newTask, setNewTask] = useState("");
  const submitTask = () => {
    const v = newTask.trim();
    if (!v) return;
    addItem?.("dailyTasks", {
      task: v, date: todayStr, timeSlot: currentBlock().slot,
      priority: "Medium", status: "Not Started",
    });
    setNewTask("");
  };

  const toggleTask = (t) => {
    const next = t.status === "Completed" ? "Not Started" : "Completed";
    updateItem?.("dailyTasks", t.id, { status: next });
  };

  const [editingMission, setEditingMission] = useState(false);
  const [missionDraft, setMissionDraft] = useState(mission?.statement || "");
  useEffect(() => setMissionDraft(mission?.statement || ""), [mission?.statement]);

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px 60px", position: "relative" }}>
      {celebrate && <Confetti />}

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <Card style={{
        marginBottom: 20, position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(110,231,183,0.08), rgba(196,181,253,0.05), rgba(252,211,77,0.05))",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <GlowOrb />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "#94A3B8", fontSize: 12, fontWeight: 600 }}>
          {greeting.icon}
          <span>{greeting.text} · {formatToday()}</span>
        </div>

        {editingMission ? (
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input
              autoFocus
              value={missionDraft}
              onChange={(e) => setMissionDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commitMission()}
              style={{
                flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8, padding: "10px 12px", fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "inherit",
              }}
            />
            <button onClick={commitMission} style={pillBtn("#6EE7B7")}>Save</button>
          </div>
        ) : (
          <h1
            onClick={() => setEditingMission(true)}
            title="Click to edit your mission"
            style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 6px", cursor: "pointer", lineHeight: 1.25 }}
          >
            {mission?.statement || "Become an AI / Software Engineer in ~1 year."}
          </h1>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94A3B8", fontSize: 13, fontStyle: "italic", marginBottom: 22 }}>
          <Quote size={13} color="#FCD34D" />
          <span>"{quote}"</span>
          <button onClick={() => setQuoteIdx((i) => (i + 1) % QUOTES.length)} style={iconGhostBtn}>
            <Sparkles size={12} />
          </button>
        </div>

        {/* Today's ring + streak + weekly target */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center" }}>
          <RingStat value={pct} label="TODAY'S MISSION" sub={`${doneCount}/${todayTasks.length} done`} color="#6EE7B7" />
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
          <RingStat value={weeklyPct} label="WEEKLY TARGET" sub={`${fmtDuration(weekSeconds)} / ${fmtDuration(weeklyTarget)}`} color="#C4B5FD" />
          <RingStat value={roadmapPct} label="ROADMAP" sub={`${roadmapDone}/${roadmapItems.length} stages`} color="#FCD34D" />
        </div>
      </Card>

      {/* ── TODAY'S MISSION CHECKLIST ─────────────────────────────── */}
      <Card style={{ marginBottom: 20 }}>
        <SectionHead icon={<Target size={15} color="#6EE7B7" />} title="TODAY'S MISSION" right={`${pct}%`} />
        <ProgressBar pct={pct} color="#6EE7B7" />

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
          {todayTasks.length === 0 && (
            <div style={{ fontSize: 12, color: "#475569", padding: "10px 2px" }}>
              No tasks queued for today yet — add your first move below.
            </div>
          )}
          {todayTasks.map((t) => (
            <TaskRow key={t.id} task={t} onToggle={() => toggleTask(t)} onDelete={() => deleteItem?.("dailyTasks", t.id)} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitTask()}
            placeholder={`Add a task for ${currentBlock().slot.split(" ")[0]}…`}
            style={{
              flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#E2E8F0", fontFamily: "inherit",
            }}
          />
          <button onClick={submitTask} style={pillBtn("#6EE7B7")}>
            <Plus size={13} /> Add
          </button>
        </div>

        {pct === 100 && todayTasks.length > 0 && (
          <div style={{
            marginTop: 16, padding: "12px 14px", borderRadius: 10, display: "flex", alignItems: "center", gap: 10,
            background: "rgba(110,231,183,0.08)", border: "1px solid rgba(110,231,183,0.25)",
          }}>
            <Trophy size={16} color="#6EE7B7" />
            <span style={{ fontSize: 13, color: "#6EE7B7", fontWeight: 700 }}>
              Mission complete. That's a streak day locked in — go enjoy it.
            </span>
          </div>
        )}
      </Card>

      {/* ── CURRICULUM-GENERATED MISSION (Project Consistency v1 engine) ── */}
      <Card style={{ marginBottom: 20 }}>
        <SectionHead icon={<Brain size={15} color="#C4B5FD" />} title="GENERATED FROM YOUR CURRICULUM" />
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          {todayTopics.length === 0 && (
            <div style={{ fontSize: 12, color: "#475569" }}>
              No curriculum loaded yet, or you're caught up — nothing left to assign today.
            </div>
          )}
          {todayTopics.map((t) => (
            <CurriculumTopicBlock key={t.id} topic={t} done={false} onToggle={() => markComplete?.(t.id)} />
          ))}
        </div>

        {revisionTopics.length > 0 && (
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
              <RotateCcw size={13} color="#93C5FD" />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: "0.06em" }}>
                REVISION QUEUE — spaced repetition
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {revisionTopics.map((t) => (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px", borderRadius: 8, background: "rgba(147,197,253,0.06)",
                  border: "1px solid rgba(147,197,253,0.15)",
                }}>
                  <span style={{ fontSize: 12, color: "#E2E8F0" }}>{t.concept}</span>
                  <span style={{ fontSize: 10, color: "#93C5FD" }}>{t.monthTitle}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {bonus && (
          <div style={{
            marginTop: 16, padding: "12px 14px", borderRadius: 10, display: "flex", alignItems: "center", gap: 10,
            background: "rgba(196,181,253,0.08)", border: "1px solid rgba(196,181,253,0.25)",
          }}>
            <Gift size={16} color="#C4B5FD" />
            <div>
              <div style={{ fontSize: 12, color: "#C4B5FD", fontWeight: 700 }}>You finished early — bonus round:</div>
              <div style={{ fontSize: 12, color: "#CBD5E1", marginTop: 2 }}>{bonus.concept}</div>
            </div>
          </div>
        )}
      </Card>

      {/* ── QUICK LOG: DSA + GitHub ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <QuickLogCard icon={<Gauge size={15} color="#FCD34D" />} label="LOG DSA SOLVED" accent="#FCD34D" onLog={(n) => addDSA?.(n)} />
        <QuickLogCard icon={<Github size={15} color="#93C5FD" />} label="LOG GITHUB COMMITS" accent="#93C5FD" onLog={(n) => addGithubCommits?.(n)} />
      </div>

      {/* ── READINESS ──────────────────────────────────────────────── */}
      {readiness && progress && (
        <div style={{ marginBottom: 20 }}>
          <ReadinessPanel readiness={readiness} progress={progress} />
        </div>
      )}


      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14, marginBottom: 20 }}>
        <FocusCard icon={<BookOpen size={15} color="#FCD34D" />} label="CURRENT COURSE"
          title={currentCourse?.item || "Not set"} sub={currentCourse?.stage} accent="#FCD34D" />
        <FocusCard icon={<Code2 size={15} color="#C4B5FD" />} label="CURRENT PROJECT"
          title={currentProject?.name || "Not set"} sub={currentProject?.seconds ? fmtDuration(currentProject.seconds) + " logged" : null} accent="#C4B5FD" />
        <FocusCard icon={<Award size={15} color="#FB923C" />} label="NEXT CERTIFICATION"
          title={nextCertification?.certificate || "None queued"} sub={nextCertification?.provider} accent="#FB923C" />
        <FocusCard icon={<Compass size={15} color="#6EE7B7" />} label="NEXT MILESTONE"
          title={nextMilestone?.goal || "None set"} sub={nextMilestone?.deadline} accent="#6EE7B7" />
      </div>

      {/* ── DAILY SHAPE — live schedule with current block highlighted ── */}
      <Card>
        <SectionHead icon={<Sunrise size={15} color="#FCD34D" />} title="YOUR DAILY SHAPE" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginTop: 14 }}>
          {SCHEDULE.map((s) => {
            const active = s.slot === currentBlock().slot;
            return (
              <div key={s.slot} style={{
                background: active ? "rgba(252,211,77,0.1)" : "rgba(255,255,255,0.02)",
                border: active ? "1px solid rgba(252,211,77,0.4)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, padding: "12px 14px", position: "relative",
              }}>
                {active && (
                  <div style={{ position: "absolute", top: 10, right: 10, width: 7, height: 7, borderRadius: "50%", background: "#FCD34D", boxShadow: "0 0 8px #FCD34D" }} />
                )}
                <div style={{ fontSize: 10, color: "#FCD34D", fontWeight: 700 }}>{s.time}</div>
                <div style={{ fontSize: 12, color: "#E2E8F0", marginTop: 3 }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  function commitMission() {
    saveMission?.({ ...(mission || {}), statement: missionDraft.trim() || "Become an AI / Software Engineer in ~1 year." });
    setEditingMission(false);
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────

const SCHEDULE = [
  { time: "7:00 AM",        label: "Get ready",                      slot: "Morning (7-9AM)" },
  { time: "9:15 AM",        label: "College starts",                 slot: "College (9-4PM)" },
  { time: "6 – 7 PM",       label: "Home",                            slot: "Evening (7-9PM)" },
  { time: "Evening",        label: "Study block · weekdays 2–3h",     slot: "Evening (7-9PM)" },
  { time: "Night",          label: "Wind down / review",              slot: "Night (9-11PM)" },
  { time: "Weekend",        label: "Deep work block · 4–5h",          slot: "Weekend Block" },
];

function currentBlock() {
  const h = new Date().getHours();
  const isWeekend = [0, 6].includes(new Date().getDay());
  if (isWeekend) return { slot: "Weekend Block" };
  if (h < 7) return { slot: "Night (9-11PM)" };
  if (h < 9) return { slot: "Morning (7-9AM)" };
  if (h < 18) return { slot: "College (9-4PM)" };
  if (h < 21) return { slot: "Evening (7-9PM)" };
  return { slot: "Night (9-11PM)" };
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

function RingStat({ value, label, sub, color }) {
  const r = 26, c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={64} height={64} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={32} cy={32} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={6} fill="none" />
        <circle
          cx={32} cy={32} r={r} stroke={color} strokeWidth={6} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
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

function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 8, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 6, transition: "width 0.5s ease" }} />
    </div>
  );
}

function SectionHead({ icon, title, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon}
        <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em" }}>{title}</span>
      </div>
      {right && <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{right}</span>}
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }) {
  const done = task.status === "Completed";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8,
      background: done ? "rgba(110,231,183,0.05)" : "rgba(255,255,255,0.02)",
      border: "1px solid " + (done ? "rgba(110,231,183,0.18)" : "rgba(255,255,255,0.05)"),
    }}>
      <button onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
        {done ? <CheckCircle2 size={18} color="#6EE7B7" /> : <Circle size={18} color="#475569" />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, color: done ? "#64748B" : "#E2E8F0",
          textDecoration: done ? "line-through" : "none",
        }}>
          {task.task}
        </div>
        {task.timeSlot && <div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>{task.timeSlot}</div>}
      </div>
      {task.priority === "High" && !done && (
        <span style={{ fontSize: 9, fontWeight: 700, color: "#FB923C", background: "rgba(251,146,60,0.1)", padding: "2px 6px", borderRadius: 4 }}>
          HIGH
        </span>
      )}
      <button onClick={onDelete} style={{ ...iconGhostBtn, opacity: 0.5 }}>
        <X size={13} />
      </button>
    </div>
  );
}

function FocusCard({ icon, label, title, sub, accent }) {
  return (
    <Card style={{ padding: "16px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        {icon}
        <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: "0.06em" }}>{label}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: accent, marginTop: 3 }}>{sub}</div>}
    </Card>
  );
}

function GlowOrb() {
  return (
    <div style={{
      position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(110,231,183,0.18), transparent 70%)", pointerEvents: "none",
    }} />
  );
}

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    duration: 1.8 + Math.random() * 1.2,
    color: ["#6EE7B7", "#FCD34D", "#C4B5FD", "#FB923C"][i % 4],
    rotate: Math.random() * 360,
  })), []);
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999, overflow: "hidden" }}>
      <style>{`
        @keyframes mc-fall {
          0%   { transform: translateY(-10vh) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0.2; }
        }
      `}</style>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.left}%`, top: 0, width: 8, height: 12,
          background: p.color, borderRadius: 2,
          animation: `mc-fall ${p.duration}s ease-in ${p.delay}s forwards`,
        }} />
      ))}
    </div>
  );
}

function CurriculumTopicBlock({ topic, onToggle }) {
  return (
    <div style={{
      borderRadius: 10, padding: "12px 14px", background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BookOpen size={14} color="#C4B5FD" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{topic.concept}</span>
        </div>
        <button onClick={onToggle} style={pillBtn("#6EE7B7")}>
          <CheckCircle2 size={12} /> Done
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 11 }}>
        <Tag icon={<Sun size={10} />} text={`${topic.estMinutes}m`} color="#64748B" />
        {topic.build && <Tag icon={<Hammer size={10} />} text={topic.build} color="#FB923C" />}
        {topic.practice && (
          <Tag icon={<Code2 size={10} />} text={`${topic.practice.count} × ${topic.practice.topic} (${topic.practice.difficulty})`} color="#FCD34D" />
        )}
        {topic.assess && <Tag icon={<ClipboardCheck size={10} />} text={topic.assess} color="#93C5FD" />}
      </div>
    </div>
  );
}

function Tag({ icon, text, color }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4, color, background: `${color}14`, padding: "3px 8px", borderRadius: 6 }}>
      {icon} {text}
    </span>
  );
}

function QuickLogCard({ icon, label, accent, onLog }) {
  const [val, setVal] = useState("");
  const submit = () => {
    const n = parseInt(val, 10);
    if (!n || n <= 0) return;
    onLog(n);
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

const pillBtn = (color) => ({
  display: "flex", alignItems: "center", gap: 6, background: `${color}1A`, border: `1px solid ${color}55`,
  color, borderRadius: 8, padding: "9px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
  whiteSpace: "nowrap",
});

const iconGhostBtn = {
  background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: 2, display: "flex", alignItems: "center",
};
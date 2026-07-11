import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Clock, Calendar, Flame, Zap, Trash2, Compass, Pencil, Check } from "lucide-react";
import { Card }              from "../components/Card";
import { StatCard }          from "../components/StatCard";
import { GoalBar }           from "../components/GoalBar";
import { ActivityGoalCard }  from "../components/ActivityGoalCard";
import {
  fmtDuration, fmtH, today,
  buildDailyChartData, buildCategoryData, buildMonthlyTrendData, buildMonthDailyData,
} from "../utils/helpers";
import {
  getTodayPlan, yearProgress, todayDayNum, PLAN_365, dateForDay, joinField, stageLabel, DSA_YEAR_TARGET,
  PLANNED_CERTIFICATIONS, activeCertifications, nextCertification as nextSyllabusCertification, certStatus,
} from "../data/curriculum365";
import { BookOpen, Code2, Brain, Wrench, CalendarDays, CheckCircle2, Circle, Trophy, ClipboardList, Search, X, Award, Target } from "lucide-react";

// Map the 4 legacy track keys (kept for Firebase-state backward-compat) onto
// the real syllabus fields.
const TRACK_FIELD = { t1: "learn", t2: "practice", t3: "dsaTopic", t4: "project" };
function trackContent(plan, key) {
  if (!plan) return "";
  return joinField(plan[TRACK_FIELD[key]]);
}
export function Dashboard({
  entries, categories, projects, goals, activityGoals, todaySeconds, weekSeconds, streak, deleteEntry,
  lifeGoals = [], roadmapItems = [], certifications = [],
  mission, saveMission,

  // ADD THESE HERE
  markDayComplete,
  isDayComplete,
  toggleTrackComplete,
  isTrackComplete,
  engineState = {},
  readiness = null,
  progress = null,
  addDSA,
  addGithubCommits,
}) {
  const dailyData     = buildDailyChartData(entries);
  const catData       = buildCategoryData(entries, categories);
  const weekTrend     = buildMonthlyTrendData(entries);
  const monthDailyData = buildMonthDailyData(entries);

  // Project time totals
  const projData = projects.map((p) => ({
    ...p,
    seconds: entries.filter((e) => e.project === p.id).reduce((a, b) => a + b.duration, 0),
  })).filter((p) => p.seconds > 0).sort((a, b) => b.seconds - a.seconds);

  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const statCards = [
    { label: "TODAY",     value: fmtDuration(todaySeconds), sub: "productive",  color: "#6EE7B7", icon: Clock    },
    { label: "THIS WEEK", value: fmtDuration(weekSeconds),  sub: "productive",  color: "#93C5FD", icon: Calendar },
    { label: "STREAK",    value: `${streak}d`,              sub: "consecutive", color: "#FCD34D", icon: Flame    },
    { label: "SESSIONS",  value: entries.filter((e) => e.date === today()).length, sub: "today", color: "#FCA5A5", icon: Zap },
  ];

  // Custom tooltip that shows h + m
  const DurationTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:"#1E293B", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 12px", fontSize:12, fontFamily:"inherit" }}>
        <div style={{ color:"#94A3B8", marginBottom:4 }}>{label}</div>
        <div style={{ color:"#6EE7B7", fontWeight:700 }}>{fmtDuration(payload[0].payload.seconds)}</div>
      </div>
    );
  };

  const CatTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:"#1E293B", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 12px", fontSize:12, fontFamily:"inherit" }}>
        <div style={{ color:"#94A3B8", marginBottom:4 }}>{payload[0].name}</div>
        <div style={{ color: payload[0].payload.color, fontWeight:700 }}>{fmtDuration(payload[0].payload.seconds)}</div>
      </div>
    );
  };

  // ── Project Consistency derived values ──────────────────────────────────────
  const currentCourse = roadmapItems.find((r) => r.status === "In Progress") || roadmapItems[0];
  const nextCertification = certifications.find((c) => c.status !== "Completed");
  const nextMilestone = [...lifeGoals]
    .filter((g) => g.status !== "Completed" && g.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0]
    || lifeGoals.find((g) => g.status !== "Completed");
  const currentProjectTracked = [...projects]
    .map((p) => ({ ...p, seconds: entries.filter((e) => e.project === p.id).reduce((a, b) => a + b.duration, 0) }))
    .sort((a, b) => b.seconds - a.seconds)[0];

  return (
    <div style={{ padding:28, maxWidth:1200, margin:"0 auto" }}>
      
      <DailyPlanStrip
        markDayComplete={markDayComplete}
        isDayComplete={isDayComplete}
        toggleTrackComplete={toggleTrackComplete}
        isTrackComplete={isTrackComplete}
        engineState={engineState}
      />
      <CertificationRoadmapCard />
      <ConsistencyProgressPanel
        engineState={engineState}
        readiness={readiness}
        progress={progress}
      />
      <TaskClipboard
        engineState={engineState}
        isTrackComplete={isTrackComplete}
        toggleTrackComplete={toggleTrackComplete}
      />
      {/* MISSION CONTROL — Project Consistency */}
      <MissionControl
        mission={mission}
        saveMission={saveMission}
        currentCourse={currentCourse}
        currentProject={currentProjectTracked}
        weeklyTargetSeconds={goals.weekly}
        weekSeconds={weekSeconds}
        streak={streak}
        nextCertification={nextCertification}
        nextMilestone={nextMilestone}
      />
      {/* STAT CARDS */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {statCards.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* GOAL BARS */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
        <GoalBar label="DAILY GOAL"  current={todaySeconds} target={goals.daily}  color="#6EE7B7" />
        <GoalBar label="WEEKLY GOAL" current={weekSeconds}  target={goals.weekly} color="#93C5FD" />
      </div>

      {/* ACTIVITY GOALS */}
      {activityGoals?.length > 0 && (() => {
        const todayDay    = new Date().getDay();
        const todayStr    = today();
        const todayGoals  = activityGoals.filter((g) => g.enabled && (g.days || [0,1,2,3,4,5,6]).includes(todayDay));
        if (!todayGoals.length) return null;
        const allDone     = todayGoals.every((g) => {
          const done = entries.filter((e) => e.date === todayStr && e.categoryId === g.categoryId).reduce((a,b) => a+b.duration, 0);
          return done >= g.targetSeconds;
        });
        return (
          <Card style={{ marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <SectionLabel style={{ marginBottom:0 }}>TODAY'S ACTIVITY GOALS</SectionLabel>
              <span style={{ fontSize:11, fontWeight:700, color: allDone ? "#6EE7B7" : "#FCA5A5" }}>
                {todayGoals.filter((g) => {
                  const done = entries.filter((e) => e.date === todayStr && e.categoryId === g.categoryId).reduce((a,b)=>a+b.duration,0);
                  return done >= g.targetSeconds;
                }).length} / {todayGoals.length} complete
              </span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:10 }}>
              {todayGoals.map((goal) => {
                const cat     = categories.find((c) => c.id === goal.categoryId);
                const doneSecs = entries.filter((e) => e.date === todayStr && e.categoryId === goal.categoryId).reduce((a,b)=>a+b.duration,0);
                return <ActivityGoalCard key={goal.id} goal={goal} category={cat} doneSecs={doneSecs} />;
              })}
            </div>
          </Card>
        );
      })()}

      {/* THIS WEEK + CATEGORY */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:24 }}>
        <Card>
          <SectionLabel>THIS WEEK</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v < 1 ? `${Math.round(v*60)}m` : `${v}h`} />
              <Tooltip content={<DurationTooltip />} />
              <Bar dataKey="hours" fill="#6EE7B7" radius={[4,4,0,0]} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionLabel>BY CATEGORY</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={catData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3}>
                {catData.map((entry) => <Cell key={entry.name} fill={entry.color} fillOpacity={0.85} />)}
              </Pie>
              <Tooltip content={<CatTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 10px", marginTop:4 }}>
            {catData.slice(0,5).map((c) => (
              <span key={c.name} style={{ fontSize:10, color:"#64748B", display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:c.color, display:"inline-block" }} />
                {c.name}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* MONTHLY TREND (30 days daily) */}
      <Card style={{ marginBottom:24 }}>
        <SectionLabel>30-DAY TREND</SectionLabel>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={monthDailyData}>
            <defs>
              <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#C4B5FD" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#C4B5FD" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" tick={{ fill:"#64748B", fontSize:9 }} axisLine={false} tickLine={false}
              interval={4} />
            <YAxis tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => v < 1 ? `${Math.round(v*60)}m` : `${v}h`} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div style={{ background:"#1E293B", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 12px", fontSize:12, fontFamily:"inherit" }}>
                    <div style={{ color:"#94A3B8", marginBottom:4 }}>{label}</div>
                    <div style={{ color:"#C4B5FD", fontWeight:700 }}>{fmtDuration(payload[0].payload.seconds)}</div>
                  </div>
                );
              }}
            />
            <Area type="monotone" dataKey="hours" stroke="#C4B5FD" fill="url(#monthGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* 4-WEEK TREND + PROJECTS */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:24 }}>
        <Card>
          <SectionLabel>4-WEEK TREND</SectionLabel>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weekTrend}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#93C5FD" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#93C5FD" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v < 1 ? `${Math.round(v*60)}m` : `${v}h`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={{ background:"#1E293B", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 12px", fontSize:12, fontFamily:"inherit" }}>
                      <div style={{ color:"#94A3B8", marginBottom:4 }}>{label}</div>
                      <div style={{ color:"#93C5FD", fontWeight:700 }}>{fmtDuration(payload[0].payload.seconds)}</div>
                    </div>
                  );
                }}
              />
              <Area type="monotone" dataKey="hours" stroke="#93C5FD" fill="url(#trendGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionLabel>PROJECTS</SectionLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>
            {projData.length === 0 && (
              <span style={{ fontSize:12, color:"#475569" }}>No project time logged yet</span>
            )}
            {projData.map((p) => (
              <div key={p.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:p.color }} />
                  <span style={{ fontSize:12, color:"#94A3B8" }}>{p.name}</span>
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:"#fff" }}>{fmtDuration(p.seconds)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* RECENT SESSIONS */}
      <Card>
        <SectionLabel>RECENT SESSIONS</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:2, marginTop:8 }}>
          {recentEntries.length === 0 && (
            <span style={{ fontSize:12, color:"#475569" }}>No sessions yet — start tracking!</span>
          )}
          {recentEntries.map((e) => <SessionRow key={e.id} e={e} categories={categories} projects={projects} deleteEntry={deleteEntry} />)}
        </div>
      </Card>
    </div>
  );
}

function SessionRow({ e, categories, projects, deleteEntry }) {
  const [hovered,   setHovered]   = useState(false);
  const [confirming, setConfirming] = useState(false);

  const cat  = categories.find((c) => c.id === e.categoryId);
  const proj = projects.find((p) => p.id === e.project);
  const addedAt = e.createdAt ? (() => {
    const d = new Date(e.createdAt);
    return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  })() : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirming(false); }}
      style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 12px", borderRadius:8, background: hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)", transition:"background 0.15s" }}
    >
      <div style={{ width:8, height:8, borderRadius:"50%", background:cat?.color||"#475569", flexShrink:0 }} />
      <span style={{ fontSize:12, color:"#94A3B8", flex:1 }}>{cat?.name || "Unknown"}</span>
      {proj && (
        <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:`${proj.color}20`, color:proj.color, fontWeight:700 }}>
          {proj.name}
        </span>
      )}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:1 }}>
        <span style={{ fontSize:11, color:"#475569" }}>{e.date}</span>
        {addedAt && <span style={{ fontSize:10, color:"#334155", fontWeight:700 }}>{addedAt}</span>}
      </div>
      <span style={{ fontSize:12, fontWeight:700, color:"#fff", minWidth:50, textAlign:"right" }}>
        {fmtDuration(e.duration)}
      </span>

      {/* Delete button — appears on hover */}
      {hovered && !confirming && (
        <button
          onClick={() => setConfirming(true)}
          title="Delete session"
          style={{ background:"transparent", border:"none", cursor:"pointer", color:"#475569", padding:"2px 4px", borderRadius:4, display:"flex", alignItems:"center", transition:"color 0.15s", flexShrink:0 }}
          onMouseEnter={(e) => e.currentTarget.style.color="#FCA5A5"}
          onMouseLeave={(e) => e.currentTarget.style.color="#475569"}
        >
          <Trash2 size={13} />
        </button>
      )}

      {/* Inline confirmation */}
      {confirming && (
        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
          <span style={{ fontSize:10, color:"#FCA5A5", fontWeight:700 }}>DELETE?</span>
          <button
            onClick={() => deleteEntry(e.id)}
            style={{ fontSize:10, fontWeight:700, fontFamily:"inherit", padding:"2px 8px", borderRadius:4, border:"1px solid rgba(252,165,165,0.4)", background:"rgba(252,165,165,0.12)", color:"#FCA5A5", cursor:"pointer" }}
          >
            YES
          </button>
          <button
            onClick={() => setConfirming(false)}
            style={{ fontSize:10, fontWeight:700, fontFamily:"inherit", padding:"2px 8px", borderRadius:4, border:"1px solid rgba(100,116,139,0.3)", background:"rgba(100,116,139,0.1)", color:"#64748B", cursor:"pointer" }}
          >
            NO
          </button>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children, style = {} }) {
  return (
    <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", color:"#64748B", marginBottom:12, ...style }}>
      {children}
    </div>
  );
}

// ─── MISSION CONTROL ──────────────────────────────────────────────────────────
// Surfaces the "Project Consistency" dashboard fields: Mission, Today's Mission,
// Current Course, Current Project, Weekly Target, Streak, Hours This Week,
// Next Certification, Next Milestone, Quote.
function MissionControl({
  mission, saveMission, currentCourse, currentProject,
  weeklyTargetSeconds, weekSeconds, streak, nextCertification, nextMilestone,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(mission || { statement: "", quote: "" });

  const handleSave = () => {
    saveMission?.(draft);
    setEditing(false);
  };

  const weeklyPct = weeklyTargetSeconds
    ? Math.min(100, Math.round((weekSeconds / weeklyTargetSeconds) * 100))
    : 0;

  return (
    <Card style={{ marginBottom: 24, background: "linear-gradient(135deg, rgba(110,231,183,0.06), rgba(59,130,246,0.04))" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Compass size={16} color="#6EE7B7" />
          <SectionLabel style={{ marginBottom: 0 }}>MISSION</SectionLabel>
        </div>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#475569", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
        >
          {editing ? <><Check size={12} /> Save</> : <><Pencil size={12} /> Edit</>}
        </button>
      </div>

      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          <input
            value={draft.statement}
            onChange={(e) => setDraft({ ...draft, statement: e.target.value })}
            placeholder="Mission statement"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 10px", fontSize: 13, color: "#fff", fontFamily: "inherit" }}
          />
          <input
            value={draft.quote}
            onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
            placeholder="Daily quote"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 10px", fontSize: 12, color: "#94A3B8", fontFamily: "inherit" }}
          />
        </div>
      ) : (
        <>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>
            {mission?.statement || "Become an AI / Software Engineer in ~1 year."}
          </p>
          <p style={{ fontSize: 12, color: "#64748B", fontStyle: "italic", margin: "0 0 18px" }}>
            "{mission?.quote || "Consistency beats intensity."}"
          </p>
        </>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
        <MissionTile label="TODAY'S MISSION" value={currentCourse ? `Study ${currentCourse.item}` : "Pick a focus for today"} />
        <MissionTile label="CURRENT COURSE" value={currentCourse?.item || "Not set"} sub={currentCourse?.status} />
        <MissionTile label="CURRENT PROJECT" value={currentProject?.name || "Not set"} />
        <MissionTile label="WEEKLY TARGET" value={`${weeklyPct}%`} sub={`${fmtH(weekSeconds)} of ${fmtH(weeklyTargetSeconds)}`} />
        <MissionTile label="CURRENT STREAK" value={`${streak}d`} />
        <MissionTile label="HOURS THIS WEEK" value={fmtH(weekSeconds)} />
        <MissionTile label="NEXT CERTIFICATION" value={nextCertification?.certificate || "None queued"} />
        <MissionTile label="NEXT MILESTONE" value={nextMilestone?.goal || "None set"} sub={nextMilestone?.deadline} />
      </div>
    </Card>
  );
}

function MissionTile({ label, value, sub }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "#64748B", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
function CertificationRoadmapCard() {
  const dayNum = todayDayNum();
  const active = activeCertifications(dayNum);
  const next = nextSyllabusCertification(dayNum);
  const doneCount = PLANNED_CERTIFICATIONS.filter((c) => certStatus(c, dayNum) === "done").length;

  if (dayNum < 1 || dayNum > 365) return null;

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Award size={15} color="#FCD34D" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em" }}>
            CERTIFICATION ROADMAP
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#64748B" }}>
          {doneCount} of {PLANNED_CERTIFICATIONS.length} tracks completed
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(252,211,77,0.06)", border: "1px solid rgba(252,211,77,0.2)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#FCD34D", letterSpacing: "0.05em", marginBottom: 6 }}>
            {active.length > 1 ? "WORKING ON NOW" : "WORKING ON NOW"}
          </div>
          {active.length > 0 ? (
            active.map((c) => (
              <div key={c.name} style={{ fontSize: 13, color: "#E2E8F0", fontWeight: 600, marginBottom: 2 }}>
                {c.name} <span style={{ color: "#64748B", fontWeight: 400 }}>· {c.provider}</span>
              </div>
            ))
          ) : (
            <div style={{ fontSize: 13, color: "#64748B" }}>Nothing scheduled today — a light day.</div>
          )}
        </div>

        <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(196,181,253,0.06)", border: "1px solid rgba(196,181,253,0.2)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#C4B5FD", letterSpacing: "0.05em", marginBottom: 6 }}>NEXT UP</div>
          {next ? (
            <div style={{ fontSize: 13, color: "#E2E8F0", fontWeight: 600 }}>
              {next.name} <span style={{ color: "#64748B", fontWeight: 400 }}>· {next.provider}</span>
              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 400, marginTop: 2 }}>
                Starts Day {next.startDay} (Week {next.startWeek})
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "#64748B" }}>You've reached the final certification track. 🎉</div>
          )}
        </div>
      </div>
    </Card>
  );
}

function DailyPlanStrip({ markDayComplete, isDayComplete, toggleTrackComplete, isTrackComplete, engineState }) {
  const plan = getTodayPlan();
  const yp   = Math.round(yearProgress() * 100);
  const done = plan && isDayComplete ? isDayComplete(plan.day) : false;
  const [celebrate, setCelebrate] = useState(false);

  if (!plan) return null;

  const tracks = [
    { key: "t1", icon: <BookOpen size={13} color="#93C5FD" />, label: "LEARN",    content: trackContent(plan, "t1"), color: "#93C5FD", time: plan.dayType === "sunday" ? "90m" : "60m" },
    { key: "t2", icon: <Code2    size={13} color="#6EE7B7" />, label: "PRACTICE", content: trackContent(plan, "t2"), color: "#6EE7B7", time: plan.dayType === "sunday" ? "75m" : "45m" },
    { key: "t3", icon: <Brain    size={13} color="#FCD34D" />, label: "DSA",      content: trackContent(plan, "t3"), color: "#FCD34D", time: plan.dayType === "sunday" ? "75m" : "45m" },
    { key: "t4", icon: <Wrench   size={13} color="#FB923C" />, label: "PROJECT",  content: trackContent(plan, "t4"), color: "#FB923C", time: plan.dayType === "sunday" ? "60m" : "30m" },
  ];

  const handleDone = () => {
    markDayComplete?.(plan.day);
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2600);
  };

  return (
    <Card style={{ marginBottom: 24, background: "linear-gradient(135deg, rgba(110,231,183,0.05), rgba(147,197,253,0.03))" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarDays size={15} color="#6EE7B7" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em" }}>
            TODAY'S PLAN — DAY {plan.day} / 365
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
            background: plan.dayType === "sunday" ? "rgba(252,211,77,0.12)" : "rgba(147,197,253,0.1)",
            color: plan.dayType === "sunday" ? "#FCD34D" : "#93C5FD",
          }}>
            {plan.dayType === "sunday" ? "DEEP WORK · 5h" : "STUDY DAY · 3h"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Year progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 80, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ width: `${yp}%`, height: "100%", background: "#6EE7B7", borderRadius: 3, transition: "width 0.5s" }} />
            </div>
            <span style={{ fontSize: 10, color: "#6EE7B7", fontWeight: 700 }}>{yp}%</span>
          </div>
          {!done ? (
            <button
              onClick={handleDone}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(110,231,183,0.1)", border: "1px solid rgba(110,231,183,0.3)",
                color: "#6EE7B7", borderRadius: 8, padding: "6px 12px",
                fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <CheckCircle2 size={12} /> Mark Done
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#6EE7B7", fontSize: 11, fontWeight: 700 }}>
              <Trophy size={12} /> Day {plan.day} Complete
            </div>
          )}
        </div>
      </div>

      {/* Stage name */}
      <div style={{ fontSize: 11, color: "#475569", marginBottom: 4, fontStyle: "italic" }}>
        Volume {plan.volume} — {plan.volumeTitle} · {stageLabel(plan)}
      </div>
      {/* Focus of the day */}
      <div style={{ fontSize: 15, fontWeight: 700, color: "#E2E8F0", marginBottom: 12 }}>
        {plan.focus}
      </div>

      {/* 4 track cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 12 }}>
        {tracks.map((t) => (
          <TrackMini
            key={t.key}
            {...t}
            done={isTrackComplete ? isTrackComplete(plan.day, t.key) : false}
            onToggle={() => toggleTrackComplete?.(plan.day, t.key)}
          />
        ))}
      </div>

      {/* DSA target + certification chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: (plan.weeklyMiniProject?.length || plan.checkpoint?.length) ? 12 : 0 }}>
        {plan.dsaTarget != null && (
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#FCD34D", background: "rgba(252,211,77,0.1)", border: "1px solid rgba(252,211,77,0.25)", borderRadius: 8, padding: "5px 10px" }}>
            <Target size={12} /> Solve {plan.dsaTarget} today — {plan.dsaRunningTotal}/{plan.dsaYearTotal ?? DSA_YEAR_TARGET} this year
          </span>
        )}
        {joinField(plan.certification) && (
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#C4B5FD", background: "rgba(196,181,253,0.1)", border: "1px solid rgba(196,181,253,0.25)", borderRadius: 8, padding: "5px 10px" }}>
            <Award size={12} /> {joinField(plan.certification)}
          </span>
        )}
      </div>

      {/* Weekly mini project banner (only shows on the day it's assigned) */}
      {plan.weeklyMiniProject?.length > 0 && (
        <div style={{ marginTop: 4, padding: "10px 12px", borderRadius: 8, background: "rgba(110,231,183,0.06)", border: "1px solid rgba(110,231,183,0.2)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#6EE7B7", letterSpacing: "0.05em", marginBottom: 4 }}>WEEKLY MINI PROJECT</div>
          <div style={{ fontSize: 12, color: "#CBD5E1" }}>{joinField(plan.weeklyMiniProject)}</div>
        </div>
      )}
    </Card>
  );
}

function TrackMini({ icon, label, content, color, time, done, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        borderRadius: 8, padding: "10px 12px", cursor: "pointer",
        background: done ? `${color}0D` : "rgba(255,255,255,0.02)",
        border: `1px solid ${done ? color + "44" : "rgba(255,255,255,0.06)"}`,
        transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {icon}
          <span style={{ fontSize: 9, fontWeight: 700, color: "#64748B", letterSpacing: "0.05em" }}>{label}</span>
        </div>
        {done
          ? <CheckCircle2 size={13} color={color} />
          : <Circle size={13} color="#334155" />}
      </div>
      <div style={{
        fontSize: 11, color: done ? "#64748B" : "#CBD5E1", lineHeight: 1.4,
        textDecoration: done ? "line-through" : "none", marginBottom: 6,
      }}>
        {content}
      </div>
      <span style={{ fontSize: 9, color, fontWeight: 700 }}>{time}</span>
    </div>
  );
}
// ─── TASK CLIPBOARD — missed & upcoming individual tasks, filterable by type ──

const CLIPBOARD_TRACKS = [
  { key: "t1", label: "Learn",    icon: <BookOpen size={11} />, color: "#93C5FD" },
  { key: "t2", label: "Practice", icon: <Code2    size={11} />, color: "#6EE7B7" },
  { key: "t3", label: "DSA",      icon: <Brain    size={11} />, color: "#FCD34D" },
  { key: "t4", label: "Project",  icon: <Wrench   size={11} />, color: "#FB923C" },
];
const UPCOMING_WINDOW_DAYS = 14;
const PAGE_SIZE = 25;

function TaskClipboard({ engineState = {}, isTrackComplete, toggleTrackComplete }) {
  const todayNum = todayDayNum();
  const [tab, setTab] = useState("missed"); // missed | upcoming
  const [typeFilter, setTypeFilter] = useState(() => new Set(CLIPBOARD_TRACKS.map((t) => t.key)));
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const done = (day, key) => (isTrackComplete ? isTrackComplete(day, key) : false);

  // Build the full flat list of individual tasks (day + track) once per render.
  const allTasks = useMemoTasks(todayNum);

  const q = query.trim().toLowerCase();

  const filtered = allTasks.filter((task) => {
    if (tab === "missed" && !(task.day < todayNum && !done(task.day, task.key))) return false;
    if (tab === "upcoming" && !(task.day >= todayNum && task.day < todayNum + UPCOMING_WINDOW_DAYS && !done(task.day, task.key))) return false;
    if (!typeFilter.has(task.key)) return false;
    if (q && !task.content.toLowerCase().includes(q) && !String(task.day).includes(q)) return false;
    return true;
  });

  const visible = filtered.slice(0, limit);
  const missedTotal = allTasks.filter((t) => t.day < todayNum && !done(t.day, t.key)).length;
  const upcomingTotal = allTasks.filter((t) => t.day >= todayNum && t.day < todayNum + UPCOMING_WINDOW_DAYS && !done(t.day, t.key)).length;

  const toggleType = (key) => {
    setTypeFilter((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next.size ? next : prev; // keep at least one type selected
    });
    setLimit(PAGE_SIZE);
  };

  return (
    <Card style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ClipboardList size={15} color="#C4B5FD" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em" }}>TASK CLIPBOARD</span>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => { setTab("missed"); setLimit(PAGE_SIZE); }} style={clipTabBtn(tab === "missed", "#FCA5A5")}>
            Missed ({missedTotal})
          </button>
          <button onClick={() => { setTab("upcoming"); setLimit(PAGE_SIZE); }} style={clipTabBtn(tab === "upcoming", "#93C5FD")}>
            Upcoming ({upcomingTotal})
          </button>
        </div>
      </div>

      {/* Search + type filter pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6, flex: "1 1 180px",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8, padding: "6px 10px",
        }}>
          <Search size={12} color="#64748B" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setLimit(PAGE_SIZE); }}
            placeholder="Search a task or day…"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#E2E8F0", fontSize: 12, fontFamily: "inherit" }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", display: "flex" }}>
              <X size={12} />
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CLIPBOARD_TRACKS.map((t) => {
            const active = typeFilter.has(t.key);
            return (
              <button key={t.key} onClick={() => toggleType(t.key)} style={clipTypePill(active, t.color)}>
                {t.icon} {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task list */}
      <div style={{ maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, paddingRight: 4 }}>
        {visible.length === 0 && (
          <div style={{ fontSize: 12, color: "#475569", padding: "16px 4px", textAlign: "center" }}>
            {tab === "missed" ? "No missed tasks matching this filter — nice." : "No upcoming tasks matching this filter."}
          </div>
        )}
        {visible.map((task) => (
          <ClipboardTaskRow
            key={`${task.day}-${task.key}`}
            task={task}
            done={done(task.day, task.key)}
            onToggle={() => toggleTrackComplete?.(task.day, task.key)}
          />
        ))}
      </div>

      {filtered.length > limit && (
        <button
          onClick={() => setLimit((l) => l + PAGE_SIZE)}
          style={{ ...pillBtn("#C4B5FD"), marginTop: 10, width: "100%", justifyContent: "center" }}
        >
          Show {Math.min(PAGE_SIZE, filtered.length - limit)} more
        </button>
      )}
    </Card>
  );
}

// Builds the flat { day, key, type, content, date }[] list once per todayNum.
function useMemoTasks(todayNum) {
  return useMemo(() => {
    const tasks = [];
    PLAN_365.forEach((d) => {
      CLIPBOARD_TRACKS.forEach((t) => {
        tasks.push({ day: d.day, key: t.key, type: t.label, color: t.color, icon: t.icon, content: trackContent(d, t.key), stage: stageLabel(d) });
      });
    });
    return tasks;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayNum]);
}

function ClipboardTaskRow({ task, done, onToggle }) {
  const date = dateForDay(task.day);
  const dateLabel = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return (
    <div
      onClick={onToggle}
      title={done ? "Mark this task incomplete" : "Mark this task complete"}
      style={{
        display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
        padding: "8px 10px", borderRadius: 8,
        background: done ? "rgba(110,231,183,0.05)" : "rgba(255,255,255,0.02)",
        border: done ? "1px solid rgba(110,231,183,0.2)" : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 1, display: "flex", flexShrink: 0 }}
      >
        {done ? <CheckCircle2 size={15} color="#6EE7B7" /> : <Circle size={15} color="#475569" />}
      </button>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B" }}>Day {task.day}</span>
          <span style={{ fontSize: 10, color: "#475569" }}>{dateLabel}</span>
          <span style={{
            fontSize: 9, fontWeight: 700, color: task.color, background: `${task.color}1A`,
            padding: "1px 6px", borderRadius: 4, letterSpacing: "0.04em",
          }}>
            {task.type.toUpperCase()}
          </span>
        </div>
        <div style={{
          fontSize: 12, color: done ? "#64748B" : "#CBD5E1", lineHeight: 1.4,
          textDecoration: done ? "line-through" : "none",
        }}>
          {task.content}
        </div>
      </div>
    </div>
  );
}

const pillBtn = (color) => ({
  display: "flex", alignItems: "center", gap: 6,
  background: `${color}1A`, border: `1px solid ${color}55`,
  color, borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700,
  cursor: "pointer", fontFamily: "inherit",
});

const clipTabBtn = (active, color) => ({
  background: active ? `${color}1A` : "rgba(255,255,255,0.03)",
  border: active ? `1px solid ${color}55` : "1px solid rgba(255,255,255,0.08)",
  color: active ? color : "#94A3B8",
  borderRadius: 8, padding: "7px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
});

const clipTypePill = (active, color) => ({
  display: "flex", alignItems: "center", gap: 5,
  background: active ? `${color}1A` : "rgba(255,255,255,0.03)",
  border: active ? `1px solid ${color}55` : "1px solid rgba(255,255,255,0.08)",
  color: active ? color : "#64748B",
  borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
});

function ConsistencyProgressPanel({ engineState = {}, readiness, progress }) {
  const completedMap  = engineState.completedDays || {};
  const completedDays = Object.keys(completedMap).length;
  const dsaSolved     = Object.values(engineState.dsaSolved    || {}).reduce((a, b) => a + b, 0);
  const githubCommits = Object.values(engineState.githubCommits|| {}).reduce((a, b) => a + b, 0);
  const yp            = Math.round(yearProgress() * 100);

  // Missed days = plan days that are already in the past and were never marked done
  const todayNum    = todayDayNum();
  const missedDays  = PLAN_365.filter((d) => d.day < todayNum && !completedMap[d.day]);
  const missedCount = missedDays.length;

  // This week — last 7 days, which are marked done
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dayNum = Math.floor((d - new Date("2026-07-01T00:00:00")) / 86400000) + 1;
    const plan   = PLAN_365[dayNum - 1];
    const done   = !!(engineState.completedDays || {})[dayNum];
    days.push({ dayNum, date: d, done, label: d.toLocaleDateString(undefined, { weekday: "short" }) });
  }

  const TRACK_COLORS = {
    fullstack: "#6EE7B7", dsa: "#FCD34D", coreCS: "#93C5FD", aiml: "#C4B5FD", placement: "#FB923C",
  };
  const TRACK_LABELS = {
    fullstack: "Full Stack", dsa: "DSA", coreCS: "Core CS", aiml: "AI/ML", placement: "Placement",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

      {/* Left — Stats + readiness */}
      <Card>
        <SectionLabel>CONSISTENCY PROGRESS</SectionLabel>

        {/* Big stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
          <BigStat value={completedDays} label="DAYS DONE" sub="/ 365" color="#6EE7B7" />
          <BigStat value={missedCount}   label="MISSED"    sub="days"     color="#FCA5A5" />
          <BigStat value={dsaSolved}     label="DSA SOLVED" sub={`/ ${DSA_YEAR_TARGET}`} color="#FCD34D" />
          <BigStat value={githubCommits} label="COMMITS"    sub="total"    color="#93C5FD" />
        </div>

        {/* Missed days callout */}
        {missedCount > 0 && (
          <div style={{
            display: "flex", flexDirection: "column", gap: 6,
            padding: "10px 12px", marginBottom: 16, borderRadius: 8,
            background: "rgba(252,165,165,0.08)", border: "1px solid rgba(252,165,165,0.25)",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#FCA5A5" }}>
              ⚠ {missedCount} missed day{missedCount > 1 ? "s" : ""} — go catch up
            </span>
            <span style={{ fontSize: 10, color: "#94A3B8" }}>
              {missedDays.slice(0, 5).map((d) => `Day ${d.day}`).join(", ")}
              {missedDays.length > 5 ? `, +${missedDays.length - 5} more` : ""}
            </span>
          </div>
        )}

        {/* Per-track readiness bars */}
        {readiness && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(TRACK_LABELS).map(([key, label]) => {
              const pct = readiness.byTrack?.[key] || 0;
              return (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: "#64748B" }}>{label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: TRACK_COLORS[key] }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: TRACK_COLORS[key], borderRadius: 3, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Right — This week + upcoming */}
      <Card>
        <SectionLabel>THIS WEEK</SectionLabel>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {days.map((d) => (
            <div key={d.dayNum} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 9, color: "#475569", fontWeight: 700 }}>{d.label.toUpperCase()}</span>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: d.done ? "rgba(110,231,183,0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${d.done ? "#6EE7B744" : "rgba(255,255,255,0.06)"}`,
              }}>
                {d.done
                  ? <CheckCircle2 size={14} color="#6EE7B7" />
                  : <span style={{ fontSize: 10, color: "#334155" }}>{d.date.getDate()}</span>}
              </div>
            </div>
          ))}
        </div>

        <SectionLabel>NEXT 3 DAYS</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1, 2, 3].map((offset) => {
            const d      = new Date(); d.setDate(d.getDate() + offset);
            const dayNum = Math.floor((d - new Date("2026-07-01T00:00:00")) / 86400000) + 1;
            const p      = PLAN_365[dayNum - 1];
            if (!p) return null;
            return (
              <div key={offset} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "6px 10px",
                borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <span style={{ fontSize: 10, color: "#475569", minWidth: 28, fontWeight: 700 }}>+{offset}d</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.focus}
                  </div>
                  <div style={{ fontSize: 9, color: "#475569", marginTop: 1 }}>{joinField(p.dsaTopic)}</div>
                </div>
                <span style={{ fontSize: 9, color: p.dayType === "sunday" ? "#FCD34D" : "#475569", fontWeight: 700, flexShrink: 0 }}>
                  {p.dayType === "sunday" ? "5h" : "3h"}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

    </div>
  );
}

function BigStat({ value, label, sub, color }) {
  return (
    <div style={{ textAlign: "center", padding: "10px 0" }}>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: "#64748B", letterSpacing: "0.06em", marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 9, color: "#334155", marginTop: 1 }}>{sub}</div>
    </div>
  );
}
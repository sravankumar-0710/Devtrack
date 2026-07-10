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
import { getTodayPlan, yearProgress, todayDayNum, PLAN_365, dateForDay } from "../data/curriculum365";
import { BookOpen, Code2, Brain, Wrench, CalendarDays, CheckCircle2, Circle, Trophy, ClipboardList, Search, X, AlertTriangle, GitCommit, Sparkles } from "lucide-react";
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
function DailyPlanStrip({ markDayComplete, isDayComplete, toggleTrackComplete, isTrackComplete, engineState }) {
  const plan = getTodayPlan();
  const yp   = Math.round(yearProgress() * 100);
  const done = plan && isDayComplete ? isDayComplete(plan.day) : false;
  const [celebrate, setCelebrate] = useState(false);

  if (!plan) return null;

  const tracks = [
    { key: "t1", icon: <BookOpen size={13} color="#93C5FD" />, label: "FOUNDATIONS", content: plan.t1, color: "#93C5FD", time: plan.dayType === "sunday" ? "90m" : "60m" },
    { key: "t2", icon: <Code2    size={13} color="#6EE7B7" />, label: "WEB ROADMAP", content: plan.t2, color: "#6EE7B7", time: plan.dayType === "sunday" ? "75m" : "45m" },
    { key: "t3", icon: <Brain    size={13} color="#FCD34D" />, label: "DSA PRACTICE", content: plan.t3, color: "#FCD34D", time: plan.dayType === "sunday" ? "75m" : "45m" },
    { key: "t4", icon: <Wrench   size={13} color="#FB923C" />, label: "PROJECT TASK", content: plan.t4, color: "#FB923C", time: plan.dayType === "sunday" ? "60m" : "30m" },
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
      <div style={{ fontSize: 11, color: "#475569", marginBottom: 12, fontStyle: "italic" }}>
        {plan.stage}
      </div>

      {/* 4 track cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {tracks.map((t) => (
          <TrackMini
            key={t.key}
            {...t}
            done={isTrackComplete ? isTrackComplete(plan.day, t.key) : false}
            onToggle={() => toggleTrackComplete?.(plan.day, t.key)}
          />
        ))}
      </div>
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
  { key: "t1", label: "Foundations", icon: <BookOpen size={11} />, color: "#93C5FD" },
  { key: "t2", label: "Web Roadmap", icon: <Code2    size={11} />, color: "#6EE7B7" },
  { key: "t3", label: "DSA",         icon: <Brain    size={11} />, color: "#FCD34D" },
  { key: "t4", label: "Project",     icon: <Wrench   size={11} />, color: "#FB923C" },
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
        tasks.push({ day: d.day, key: t.key, type: t.label, color: t.color, icon: t.icon, content: d[t.key], stage: d.stage });
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

const TRACK_COLORS = {
  fullstack: "#6EE7B7", dsa: "#FCD34D", coreCS: "#93C5FD", aiml: "#C4B5FD", placement: "#FB923C",
};
const TRACK_LABELS = {
  fullstack: "Full Stack", dsa: "DSA", coreCS: "Core CS", aiml: "AI/ML", placement: "Placement",
};
const TRACK_ICONS = {
  fullstack: Code2, dsa: Brain, coreCS: BookOpen, aiml: Sparkles, placement: Trophy,
};

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

  // Completion % across the whole 365-day plan vs. % of the year already elapsed
  const completionPct = Math.round((completedDays / 365) * 100);
  const onPace         = completionPct >= yp;

  // Whichever track currently has the highest readiness %
  const bestTrackEntry = readiness
    ? Object.entries(readiness.byTrack || {}).sort((a, b) => b[1] - a[1])[0]
    : null;
  const bestTrack = bestTrackEntry
    ? { label: TRACK_LABELS[bestTrackEntry[0]] || bestTrackEntry[0], color: TRACK_COLORS[bestTrackEntry[0]] || "#93C5FD" }
    : null;

  // This week — last 7 days, which are marked done
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dayNum = Math.floor((d - new Date("2026-07-01T00:00:00")) / 86400000) + 1;
    const done   = !!completedMap[dayNum];
    days.push({ dayNum, date: d, done, label: d.toLocaleDateString(undefined, { weekday: "short" }) });
  }

  return (
    <>
      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 16 }}>
        <KpiTile icon={CheckCircle2}  value={completedDays}  label="DAYS DONE"   sub="of 365 total"  color="#6EE7B7" />
        <KpiTile icon={AlertTriangle} value={missedCount}    label="MISSED"      sub="need catch-up"  color="#FCA5A5" />
        <KpiTile icon={Brain}         value={dsaSolved}      label="DSA SOLVED"  sub="problems"       color="#FCD34D" />
        <KpiTile icon={GitCommit}     value={githubCommits}  label="COMMITS"     sub="all time"       color="#93C5FD" />
      </div>

      {/* Readiness (rings + tracks) and This Week — natural heights, never force-stretched */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <SectionLabel style={{ marginBottom: 0 }}>READINESS</SectionLabel>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", padding: "3px 9px", borderRadius: 20,
              background: onPace ? "rgba(110,231,183,0.12)" : "rgba(252,165,165,0.12)",
              border: `1px solid ${onPace ? "rgba(110,231,183,0.3)" : "rgba(252,165,165,0.3)"}`,
              color: onPace ? "#6EE7B7" : "#FCA5A5",
            }}>
              {onPace ? "ON PACE" : "BEHIND PACE"}
            </span>
          </div>

          <div style={{ display: "flex", gap: 22, alignItems: "center", marginBottom: 20 }}>
            <PaceRings elapsedPct={yp} completedPct={completionPct} readinessPct={readiness?.overall || 0} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 2 }}>Day {todayNum} <span style={{ color: "#334155" }}>/ 365</span></div>
              <div style={{ fontSize: 10, color: "#475569", marginBottom: 12 }}>{yp}% of the year has passed</div>
              <LegendRow color="#6EE7B7" label="Plan completed" value={`${completionPct}%`} />
              <LegendRow color="#93C5FD" label="Overall readiness" value={`${readiness?.overall || 0}%`} />
              {bestTrack && <LegendRow color={bestTrack.color} label="Strongest track" value={bestTrack.label} />}
            </div>
          </div>

          {missedCount > 0 && (
            <div style={{
              display: "flex", flexDirection: "column", gap: 4,
              padding: "9px 12px", marginBottom: 18, borderRadius: 8,
              background: "rgba(252,165,165,0.07)", border: "1px solid rgba(252,165,165,0.22)",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#FCA5A5" }}>
                <AlertTriangle size={12} /> {missedCount} missed day{missedCount > 1 ? "s" : ""} — go catch up
              </span>
              <span style={{ fontSize: 10, color: "#94A3B8", paddingLeft: 18 }}>
                {missedDays.slice(0, 5).map((d) => `Day ${d.day}`).join(", ")}
                {missedDays.length > 5 ? `, +${missedDays.length - 5} more` : ""}
              </span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(TRACK_LABELS).map(([key, label]) => (
              <TrackRow key={key} trackKey={key} label={label} pct={readiness?.byTrack?.[key] || 0} color={TRACK_COLORS[key]} />
            ))}
          </div>
        </Card>

        <Card>
          <SectionLabel>THIS WEEK</SectionLabel>
          <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
            {days.map((d) => (
              <div key={d.dayNum} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
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
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                  borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                  borderLeft: `2px solid ${p.dayType === "sunday" ? "#FCD34D55" : "rgba(255,255,255,0.08)"}`,
                }}>
                  <span style={{ fontSize: 10, color: "#475569", minWidth: 26, fontWeight: 700 }}>+{offset}d</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.t2}
                    </div>
                    <div style={{ fontSize: 9, color: "#475569", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.t3}</div>
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

      {/* Activity — a proper fixed-size contribution graph, full width */}
      <ActivityCard completedMap={completedMap} todayNum={todayNum} />
    </>
  );
}

function KpiTile({ icon: Icon, value, label, sub, color }) {
  return (
    <Card style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color, opacity: 0.65 }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "#64748B" }}>{label}</span>
        <Icon size={13} color={color} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#475569", marginTop: 5 }}>{sub}</div>}
    </Card>
  );
}

function LegendRow({ color, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
      <span style={{ width: 7, height: 7, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 10, color: "#64748B", flex: 1 }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

function TrackRow({ trackKey, label, pct, color }) {
  const Icon = TRACK_ICONS[trackKey] || Circle;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon size={11} color={color} />
          <span style={{ fontSize: 11, color: "#94A3B8" }}>{label}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

// Two concentric rings, Apple-Watch style: outer compares plan-completion vs.
// year-elapsed on the same track; inner shows overall track readiness.
function PaceRings({ elapsedPct, completedPct, readinessPct }) {
  const size = 108, cx = size / 2, cy = size / 2;
  const rOuter = 46, swOuter = 8;
  const rInner = 32, swInner = 7;
  const circO = 2 * Math.PI * rOuter;
  const circI = 2 * Math.PI * rInner;
  const arc = (circ, pct) => `${Math.max(0, (circ * Math.min(100, pct)) / 100)} ${circ}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={swOuter} />
      <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={swOuter}
        strokeDasharray={arc(circO, elapsedPct)} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="#6EE7B7" strokeWidth={swOuter}
        strokeDasharray={arc(circO, completedPct)} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 0.6s" }} />
      <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={swInner} />
      <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="#93C5FD" strokeWidth={swInner}
        strokeDasharray={arc(circI, readinessPct)} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 0.6s" }} />
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize="19" fontWeight="800" fill="#fff" fontFamily="inherit">{completedPct}%</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#64748B" letterSpacing="0.05em" fontFamily="inherit">OF PLAN</text>
    </svg>
  );
}

const HEAT_COLOR = {
  done: "#6EE7B7",
  missed: "rgba(252,165,165,0.45)",
  upcoming: "rgba(255,255,255,0.05)",
};

function buildHeatCells(completedMap, todayNum, weeks) {
  const currentWeekIdx = Math.floor((todayNum - 1) / 7);
  const startWeekIdx   = Math.max(0, currentWeekIdx - weeks + 1);
  const cells = [];
  for (let w = startWeekIdx; w <= currentWeekIdx; w++) {
    for (let r = 0; r < 7; r++) {
      const day = w * 7 + r + 1;
      if (day > todayNum) cells.push({ day, state: "upcoming" });
      else cells.push({ day, state: completedMap[day] ? "done" : "missed" });
    }
  }
  return cells;
}

function computeStreaks(completedMap, todayNum) {
  let current = 0;
  for (let d = todayNum - 1; d >= 1; d--) {
    if (completedMap[d]) current++; else break;
  }
  let longest = 0, run = 0;
  for (let d = 1; d < todayNum; d++) {
    if (completedMap[d]) { run++; longest = Math.max(longest, run); } else run = 0;
  }
  return { current, longest: Math.max(longest, current) };
}

// Github-style contribution graph — fixed-size tiles, weeks run left-to-right as columns.
function ActivityCard({ completedMap, todayNum }) {
  const weeks    = 16;
  const cells    = buildHeatCells(completedMap, todayNum, weeks);
  const streaks  = computeStreaks(completedMap, todayNum);

  return (
    <Card style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <SectionLabel style={{ marginBottom: 0 }}>ACTIVITY</SectionLabel>
        <span style={{ fontSize: 10, color: "#475569" }}>last {weeks} weeks</span>
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "grid", gridAutoFlow: "column", gridTemplateRows: "repeat(7, 11px)", gridAutoColumns: "11px", gap: 3 }}>
            {cells.map((c) => (
              <div
                key={c.day}
                title={`Day ${c.day} — ${c.state}`}
                style={{
                  width: 11, height: 11, borderRadius: 3,
                  background: HEAT_COLOR[c.state],
                  border: c.day === todayNum ? "1px solid #93C5FD" : "none",
                  boxSizing: "border-box",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
            <LegendDot color="#6EE7B7" label="Done" />
            <LegendDot color="rgba(252,165,165,0.6)" label="Missed" />
            <LegendDot color="rgba(255,255,255,0.08)" label="Upcoming" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 28 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#6EE7B7", fontVariantNumeric: "tabular-nums" }}>{streaks.current}d</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: "#64748B", marginTop: 2 }}>CURRENT STREAK</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#93C5FD", fontVariantNumeric: "tabular-nums" }}>{streaks.longest}d</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: "#64748B", marginTop: 2 }}>LONGEST STREAK</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, color: "#64748B" }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}
import { useState } from "react";
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

export function Dashboard({
  entries, categories, projects, goals, activityGoals, todaySeconds, weekSeconds, streak, deleteEntry,
  lifeGoals = [], roadmapItems = [], certifications = [],
  mission, saveMission,
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
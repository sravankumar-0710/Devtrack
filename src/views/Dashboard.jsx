import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Clock, Calendar, Flame, Zap } from "lucide-react";
import { Card }              from "../components/Card";
import { StatCard }          from "../components/StatCard";
import { GoalBar }           from "../components/GoalBar";
import { ActivityGoalCard }  from "../components/ActivityGoalCard";
import {
  fmtDuration, fmtH, today,
  buildDailyChartData, buildCategoryData, buildMonthlyTrendData, buildMonthDailyData,
} from "../utils/helpers";

export function Dashboard({ entries, categories, projects, goals, activityGoals, todaySeconds, weekSeconds, streak }) {
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

  return (
    <div style={{ padding:28, maxWidth:1200, margin:"0 auto" }}>

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
          {recentEntries.map((e) => {
            const cat  = categories.find((c) => c.id === e.categoryId);
            const proj = projects.find((p) => p.id === e.project);
            const addedAt = e.createdAt ? (() => {
              const d = new Date(e.createdAt);
              return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
            })() : null;
            return (
              <div key={e.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 12px", borderRadius:8, background:"rgba(255,255,255,0.02)" }}>
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
              </div>
            );
          })}
        </div>
      </Card>
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
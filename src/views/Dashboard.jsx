import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Clock, Calendar, Flame, Zap } from "lucide-react";
import { Card }     from "../components/Card";
import { StatCard } from "../components/StatCard";
import { GoalBar }  from "../components/GoalBar";
import {
  fmtH, today,
  buildDailyChartData, buildCategoryData, buildMonthlyTrendData,
} from "../utils/helpers";

/**
 * Dashboard — overview of today's progress, goals, charts, recent activity.
 *
 * Props: entries, categories, projects, goals, todaySeconds, weekSeconds, streak
 */
export function Dashboard({ entries, categories, projects, goals, todaySeconds, weekSeconds, streak }) {
  const dailyData   = buildDailyChartData(entries);
  const catData     = buildCategoryData(entries, categories);
  const monthlyData = buildMonthlyTrendData(entries);

  const projData = projects.map((p) => ({
    ...p,
    hours: +(entries.filter((e) => e.project === p.id).reduce((a, b) => a + b.duration, 0) / 3600).toFixed(1),
  }));

  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const statCards = [
    { label: "TODAY",     value: fmtH(todaySeconds), sub: "productive",  color: "#6EE7B7", icon: Clock    },
    { label: "THIS WEEK", value: fmtH(weekSeconds),  sub: "productive",  color: "#93C5FD", icon: Calendar },
    { label: "STREAK",    value: `${streak}d`,        sub: "consecutive", color: "#FCD34D", icon: Flame    },
    { label: "SESSIONS",  value: entries.filter((e) => e.date === today()).length, sub: "today", color: "#FCA5A5", icon: Zap },
  ];

  return (
    <div style={{ padding: 28, maxWidth: 1200, margin: "0 auto" }}>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* GOAL BARS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <GoalBar label="DAILY GOAL"  current={todaySeconds} target={goals.daily}  color="#6EE7B7" />
        <GoalBar label="WEEKLY GOAL" current={weekSeconds}  target={goals.weekly} color="#93C5FD" />
      </div>

      {/* CHARTS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>

        {/* Daily bar chart */}
        <Card>
          <SectionLabel>THIS WEEK</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} unit="h" />
              <Tooltip
                contentStyle={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, fontFamily: "inherit" }}
                labelStyle={{ color: "#94A3B8" }} itemStyle={{ color: "#6EE7B7" }}
              />
              <Bar dataKey="hours" fill="#6EE7B7" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Category pie */}
        <Card>
          <SectionLabel>BY CATEGORY</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={catData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3}>
                {catData.map((entry) => <Cell key={entry.name} fill={entry.color} fillOpacity={0.85} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, fontFamily: "inherit" }}
                formatter={(v) => [`${v}h`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", marginTop: 4 }}>
            {catData.slice(0, 4).map((c) => (
              <span key={c.name} style={{ fontSize: 10, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, display: "inline-block" }} />
                {c.name}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* MONTHLY TREND + PROJECTS */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>

        {/* Area trend */}
        <Card>
          <SectionLabel>4-WEEK TREND</SectionLabel>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#93C5FD" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#93C5FD" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} unit="h" />
              <Tooltip
                contentStyle={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, fontFamily: "inherit" }}
                itemStyle={{ color: "#93C5FD" }}
              />
              <Area type="monotone" dataKey="hours" stroke="#93C5FD" fill="url(#trendGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Projects */}
        <Card>
          <SectionLabel>PROJECTS</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            {projData.length === 0 && (
              <span style={{ fontSize: 12, color: "#475569" }}>No project data yet</span>
            )}
            {projData.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>{p.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{p.hours}h</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* RECENT ENTRIES */}
      <Card>
        <SectionLabel>RECENT SESSIONS</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 8 }}>
          {recentEntries.map((e) => {
            const cat = categories.find((c) => c.id === e.categoryId);
            return (
              <div
                key={e.id}
                style={{
                  display:       "flex",
                  alignItems:    "center",
                  gap:           12,
                  padding:       "8px 12px",
                  borderRadius:  8,
                  background:    "rgba(255,255,255,0.02)",
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat?.color || "#475569", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#94A3B8", flex: 1 }}>{cat?.name || "Unknown"}</span>
                <span style={{ fontSize: 11, color: "#475569" }}>{e.date}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", minWidth: 36, textAlign: "right" }}>
                  {fmtH(e.duration)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#64748B", marginBottom: 12 }}>
      {children}
    </div>
  );
}

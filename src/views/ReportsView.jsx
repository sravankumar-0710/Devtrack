import { useState } from "react";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Download } from "lucide-react";
import { Card } from "../components/Card";
import {
  fmtDuration, getWeekDates, buildDailyChartData,
  buildCategoryData, buildMonthlyTrendData, buildMonthDailyData,
} from "../utils/helpers";

export function ReportsView({ entries, categories, projects }) {
  const [period, setPeriod] = useState("week");

  const dailyData      = buildDailyChartData(entries);
  const catData        = buildCategoryData(entries, categories);
  const weekTrend      = buildMonthlyTrendData(entries);
  const monthDailyData = buildMonthDailyData(entries);

  // Category totals (all time)
  const catTotals = categories
    .map((c) => ({
      ...c,
      seconds: entries.filter((e) => e.categoryId === c.id).reduce((a, b) => a + b.duration, 0),
    }))
    .filter((c) => c.seconds > 0)
    .sort((a, b) => b.seconds - a.seconds);

  // Project totals (all time)
  const projTotals = projects
    .map((p) => ({
      ...p,
      seconds: entries.filter((e) => e.project === p.id).reduce((a, b) => a + b.duration, 0),
    }))
    .filter((p) => p.seconds > 0)
    .sort((a, b) => b.seconds - a.seconds);

  // Summary stats
  const weekDates  = getWeekDates();
  const weekTotal  = entries.filter((e) => weekDates.includes(e.date)).reduce((a, b) => a + b.duration, 0);
  const weekAvg    = weekTotal / 7;
  const bestDay    = dailyData.reduce((a, b) => (b.seconds > a.seconds ? b : a), dailyData[0] || { seconds: 0 });

  const now30      = new Date();
  const monthDates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now30); d.setDate(now30.getDate() - 29 + i);
    return d.toISOString().slice(0, 10);
  });
  const monthTotal = entries.filter((e) => monthDates.includes(e.date)).reduce((a, b) => a + b.duration, 0);

  const exportCSV = () => {
    const rows = [["Date","Category","Hours","Minutes","Project","Notes","Type"]];
    [...entries].sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach((e) => {
      const cat  = categories.find((c) => c.id === e.categoryId);
      const proj = projects.find((p) => p.id === e.project);
      rows.push([
        e.date, cat?.name||"",
        (e.duration/3600).toFixed(2),
        Math.round(e.duration/60),
        proj?.name||"",
        `"${(e.notes||"").replace(/"/g,'""')}"`,
        e.manual?"manual":"timer",
      ]);
    });
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8,"+encodeURIComponent(rows.map(r=>r.join(",")).join("\n"));
    a.download = `devtrack-export-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  // Custom tooltips
  const DurTooltip = ({ active, payload, label }) => {
    if (!active||!payload?.length) return null;
    return (
      <div style={ttpStyle}>
        <div style={{ color:"#94A3B8", marginBottom:3, fontSize:11 }}>{label}</div>
        <div style={{ color:"#6EE7B7", fontWeight:700 }}>{fmtDuration(payload[0].payload.seconds)}</div>
      </div>
    );
  };
  const WeekTooltip = ({ active, payload, label }) => {
    if (!active||!payload?.length) return null;
    return (
      <div style={ttpStyle}>
        <div style={{ color:"#94A3B8", marginBottom:3, fontSize:11 }}>{label}</div>
        <div style={{ color:"#93C5FD", fontWeight:700 }}>{fmtDuration(payload[0].payload.seconds)}</div>
      </div>
    );
  };
  const MonthTooltip = ({ active, payload, label }) => {
    if (!active||!payload?.length) return null;
    return (
      <div style={ttpStyle}>
        <div style={{ color:"#94A3B8", marginBottom:3, fontSize:11 }}>{label}</div>
        <div style={{ color:"#C4B5FD", fontWeight:700 }}>{fmtDuration(payload[0].payload.seconds)}</div>
      </div>
    );
  };

  const tickFmt = (v) => v < 1 ? `${Math.round(v*60)}m` : `${v}h`;

  return (
    <div style={{ padding:28, maxWidth:1100, margin:"0 auto" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div style={{ display:"flex", gap:8 }}>
          {["week","month"].map((p) => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding:"7px 16px", borderRadius:8, cursor:"pointer", fontSize:12, fontFamily:"inherit", fontWeight:700, letterSpacing:"0.05em",
              border:`1px solid ${period===p?"rgba(110,231,183,0.3)":"rgba(255,255,255,0.07)"}`,
              background: period===p?"rgba(110,231,183,0.1)":"rgba(255,255,255,0.03)",
              color: period===p?"#6EE7B7":"#64748B",
            }}>{p.toUpperCase()}</button>
          ))}
        </div>
        <button onClick={exportCSV} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 16px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.03)", color:"#94A3B8", cursor:"pointer", fontSize:12, fontFamily:"inherit", fontWeight:700 }}>
          <Download size={13} /> EXPORT CSV
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        <SummaryCard label="WEEK TOTAL"  value={fmtDuration(weekTotal)}  sub="this week"     color="#6EE7B7" />
        <SummaryCard label="DAILY AVG"   value={fmtDuration(weekAvg)}    sub="7-day average" color="#93C5FD" />
        <SummaryCard label="MONTH TOTAL" value={fmtDuration(monthTotal)} sub="last 30 days"  color="#FCD34D" />
      </div>

      {/* Week view */}
      {period === "week" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap:16, marginBottom:24 }}>
            <Card>
              <SectionLabel>DAILY BREAKDOWN (THIS WEEK)</SectionLabel>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={tickFmt} />
                  <Tooltip content={<DurTooltip />} />
                  <Bar dataKey="hours" radius={[4,4,0,0]} fillOpacity={0.85}>
                    {dailyData.map((d,i) => (
                      <Cell key={i} fill={d.day===bestDay.day?"#6EE7B7":"#6EE7B740"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <SectionLabel>BY CATEGORY (THIS WEEK)</SectionLabel>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={catData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3}>
                    {catData.map((entry) => <Cell key={entry.name} fill={entry.color} fillOpacity={0.85} />)}
                  </Pie>
                  <Tooltip content={({ active, payload }) => {
                    if (!active||!payload?.length) return null;
                    return <div style={ttpStyle}><div style={{ color:"#94A3B8", marginBottom:3 }}>{payload[0].name}</div><div style={{ color:payload[0].payload.color, fontWeight:700 }}>{fmtDuration(payload[0].payload.seconds)}</div></div>;
                  }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 10px", marginTop:4 }}>
                {catData.slice(0,5).map((c)=>(
                  <span key={c.name} style={{ fontSize:10, color:"#64748B", display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:c.color, display:"inline-block" }} />
                    {c.name}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          <Card style={{ marginBottom:24 }}>
            <SectionLabel>4-WEEK TREND</SectionLabel>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weekTrend}>
                <defs>
                  <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#93C5FD" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#93C5FD" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={tickFmt} />
                <Tooltip content={<WeekTooltip />} />
                <Area type="monotone" dataKey="hours" stroke="#93C5FD" fill="url(#wGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}

      {/* Month view */}
      {period === "month" && (
        <>
          <Card style={{ marginBottom:24 }}>
            <SectionLabel>30-DAY DAILY TREND</SectionLabel>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthDailyData}>
                <defs>
                  <linearGradient id="mGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C4B5FD" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#C4B5FD" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill:"#64748B", fontSize:9 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={tickFmt} />
                <Tooltip content={<MonthTooltip />} />
                <Area type="monotone" dataKey="hours" stroke="#C4B5FD" fill="url(#mGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Project breakdown */}
          {projTotals.length > 0 && (
            <Card style={{ marginBottom:24 }}>
              <SectionLabel>PROJECT BREAKDOWN (ALL TIME)</SectionLabel>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>
                {projTotals.map((p) => {
                  const maxS = projTotals[0].seconds;
                  return (
                    <div key={p.id} style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:p.color, flexShrink:0 }} />
                      <span style={{ fontSize:12, color:"#94A3B8", width:160 }}>{p.name}</span>
                      <div style={{ flex:1, background:"rgba(255,255,255,0.05)", borderRadius:4, height:6, overflow:"hidden" }}>
                        <div style={{ width:`${(p.seconds/maxS)*100}%`, height:"100%", background:p.color, opacity:0.75, borderRadius:4 }} />
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, color:"#fff", width:70, textAlign:"right" }}>
                        {fmtDuration(p.seconds)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Category breakdown (both views) */}
      <Card style={{ marginBottom:24 }}>
        <SectionLabel>CATEGORY BREAKDOWN (ALL TIME)</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>
          {catTotals.length === 0 && <span style={{ fontSize:12, color:"#475569" }}>No data yet</span>}
          {catTotals.map((c) => {
            const maxS = catTotals[0].seconds;
            return (
              <div key={c.id} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:c.color, flexShrink:0 }} />
                <span style={{ fontSize:12, color:"#94A3B8", width:140 }}>{c.name}</span>
                <div style={{ flex:1, background:"rgba(255,255,255,0.05)", borderRadius:4, height:6, overflow:"hidden" }}>
                  <div style={{ width:`${(c.seconds/maxS)*100}%`, height:"100%", background:c.color, opacity:0.75, borderRadius:4 }} />
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:"#fff", width:70, textAlign:"right" }}>
                  {fmtDuration(c.seconds)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Full log */}
      <Card>
        <SectionLabel>FULL LOG</SectionLabel>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr>
                {["Date","Category","Duration","Project","Notes"].map((h) => (
                  <th key={h} style={{ textAlign:"left", padding:"8px 12px", color:"#475569", fontWeight:700, fontSize:10, letterSpacing:"0.06em", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...entries]
                .sort((a,b)=>new Date(b.date)-new Date(a.date))
                .slice(0,100)
                .map((e) => {
                  const cat  = categories.find((c)=>c.id===e.categoryId);
                  const proj = projects.find((p)=>p.id===e.project);
                  return (
                    <tr key={e.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                      <td style={{ padding:"8px 12px", color:"#64748B" }}>{e.date}</td>
                      <td style={{ padding:"8px 12px" }}>
                        <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ width:6, height:6, borderRadius:"50%", background:cat?.color||"#475569", flexShrink:0 }} />
                          <span style={{ color:"#94A3B8" }}>{cat?.name||"—"}</span>
                        </span>
                      </td>
                      <td style={{ padding:"8px 12px", color:"#fff", fontWeight:700 }}>{fmtDuration(e.duration)}</td>
                      <td style={{ padding:"8px 12px" }}>
                        {proj ? <span style={{ padding:"2px 8px", borderRadius:10, background:`${proj.color}20`, color:proj.color, fontSize:11, fontWeight:700 }}>{proj.name}</span> : <span style={{ color:"#475569" }}>—</span>}
                      </td>
                      <td style={{ padding:"8px 12px", color:"#475569", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.notes||"—"}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, sub, color }) {
  return (
    <div style={{ background:`${color}0A`, border:`1px solid ${color}22`, borderRadius:12, padding:"18px 20px" }}>
      <div style={{ fontSize:10, color:"#475569", letterSpacing:"0.08em", fontWeight:700, marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:700, color:"#fff", lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, color:"#64748B", marginTop:4 }}>{sub}</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", color:"#64748B", marginBottom:12 }}>{children}</div>;
}

const ttpStyle = {
  background:"#1E293B", border:"1px solid rgba(255,255,255,0.1)",
  borderRadius:8, padding:"8px 12px", fontSize:12, fontFamily:"inherit",
};
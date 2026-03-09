import { useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Download } from "lucide-react";
import { Card }     from "../components/Card";
import {
  fmtH, getWeekDates, buildDailyChartData,
  buildCategoryData, buildMonthlyTrendData,
} from "../utils/helpers";
import { DAYS, MONTHS } from "../data/constants";

/**
 * ReportsView — detailed analytics broken down by day / week / month.
 *
 * Props: entries, categories, projects
 */
export function ReportsView({ entries, categories, projects }) {
  const [period, setPeriod] = useState("week"); // "week" | "month"

  const dailyData   = buildDailyChartData(entries);
  const catData     = buildCategoryData(entries, categories);
  const monthlyData = buildMonthlyTrendData(entries);

  // Per-category total hours
  const catTotals = categories
    .map((c) => ({
      ...c,
      hours: +(entries.filter((e) => e.categoryId === c.id).reduce((a, b) => a + b.duration, 0) / 3600).toFixed(1),
    }))
    .sort((a, b) => b.hours - a.hours);

  // Weekly stats
  const weekDates   = getWeekDates();
  const weekTotal   = entries.filter((e) => weekDates.includes(e.date)).reduce((a, b) => a + b.duration, 0);
  const weekAvg     = weekTotal / 7;
  const bestDay     = dailyData.reduce((a, b) => (b.hours > a.hours ? b : a), dailyData[0] || {});

  // 30-day stats
  const now30 = new Date();
  const monthDates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now30); d.setDate(now30.getDate() - 29 + i);
    return d.toISOString().slice(0, 10);
  });
  const monthTotal = entries.filter((e) => monthDates.includes(e.date)).reduce((a, b) => a + b.duration, 0);

  const exportCSV = () => {
    const rows = [["Date", "Category", "Duration (h)", "Project", "Notes"]];
    entries.forEach((e) => {
      const cat = categories.find((c) => c.id === e.categoryId);
      const proj = projects.find((p) => p.id === e.project);
      rows.push([e.date, cat?.name || "", (e.duration / 3600).toFixed(2), proj?.name || "", e.notes]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "devtrack-export.csv";
    a.click();
  };

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: "0 auto" }}>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["week", "month"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding:    "7px 16px",
                borderRadius: 8,
                border:     `1px solid ${period === p ? "rgba(110,231,183,0.3)" : "rgba(255,255,255,0.07)"}`,
                background: period === p ? "rgba(110,231,183,0.1)" : "rgba(255,255,255,0.03)",
                color:      period === p ? "#6EE7B7" : "#64748B",
                cursor:     "pointer",
                fontSize:   12,
                fontFamily: "inherit",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={exportCSV}
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        6,
            padding:    "7px 16px",
            borderRadius: 8,
            border:     "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
            color:      "#94A3B8",
            cursor:     "pointer",
            fontSize:   12,
            fontFamily: "inherit",
            fontWeight: 700,
          }}
        >
          <Download size={13} /> EXPORT CSV
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        <SummaryCard label="WEEK TOTAL"   value={fmtH(weekTotal)}  sub="this week"           color="#6EE7B7" />
        <SummaryCard label="DAILY AVG"    value={fmtH(weekAvg)}    sub="7-day average"        color="#93C5FD" />
        <SummaryCard label="MONTH TOTAL"  value={fmtH(monthTotal)} sub="last 30 days"         color="#FCD34D" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

        <Card>
          <SectionLabel>DAILY HOURS (7 days)</SectionLabel>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} unit="h" />
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#6EE7B7" }} labelStyle={{ color: "#94A3B8" }} />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]} fillOpacity={0.85}>
                {dailyData.map((entry, i) => (
                  <Cell key={i} fill={entry.day === bestDay.day ? "#6EE7B7" : "#6EE7B740"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionLabel>4-WEEK TREND</SectionLabel>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#93C5FD" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#93C5FD" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} unit="h" />
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#93C5FD" }} labelStyle={{ color: "#94A3B8" }} />
              <Area type="monotone" dataKey="hours" stroke="#93C5FD" fill="url(#areaGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Category breakdown table */}
      <Card style={{ marginBottom: 24 }}>
        <SectionLabel>CATEGORY BREAKDOWN (ALL TIME)</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          {catTotals.filter((c) => c.hours > 0).map((c) => {
            const maxH = catTotals[0]?.hours || 1;
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#94A3B8", width: 140 }}>{c.name}</span>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{
                    width:      `${(c.hours / maxH) * 100}%`,
                    height:     "100%",
                    background: c.color,
                    opacity:    0.75,
                    borderRadius: 4,
                  }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", width: 44, textAlign: "right" }}>
                  {c.hours}h
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Full entry log */}
      <Card>
        <SectionLabel>FULL LOG</SectionLabel>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Date", "Category", "Duration", "Project", "Notes"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#475569", fontWeight: 700, fontSize: 10, letterSpacing: "0.06em", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...entries]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 50)
                .map((e) => {
                  const cat  = categories.find((c) => c.id === e.categoryId);
                  const proj = projects.find((p) => p.id === e.project);
                  return (
                    <tr key={e.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td style={{ padding: "8px 12px", color: "#64748B" }}>{e.date}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: cat?.color || "#475569", flexShrink: 0 }} />
                          <span style={{ color: "#94A3B8" }}>{cat?.name || "—"}</span>
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px", color: "#fff", fontWeight: 700 }}>{fmtH(e.duration)}</td>
                      <td style={{ padding: "8px 12px", color: "#64748B" }}>{proj?.name || "—"}</td>
                      <td style={{ padding: "8px 12px", color: "#475569", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.notes || "—"}</td>
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
    <div style={{
      background:   `${color}0A`,
      border:       `1px solid ${color}22`,
      borderRadius: 12,
      padding:      "18px 20px",
    }}>
      <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{sub}</div>
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

const tooltipStyle = {
  background:   "#1E293B",
  border:       "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize:     12,
  fontFamily:   "inherit",
};

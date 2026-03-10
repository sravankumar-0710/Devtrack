import { DAYS, MONTHS } from "../data/constants";

/** Format seconds → "HH:MM:SS" */
export function fmt(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

/**
 * Smart duration formatter — always shows minutes, adds hours when >= 60 min.
 * 45s        → "0m"
 * 5m         → "5m"
 * 90m        → "1h 30m"
 * 3h exactly → "3h 0m"
 */
export function fmtDuration(sec) {
  const totalMin = Math.floor(sec / 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/** Format seconds → "Xh" (1 decimal) — kept for chart axes */
export function fmtH(sec) {
  const h = sec / 3600;
  if (h < 1) return `${Math.round(sec / 60)}m`;
  return `${h.toFixed(1)}h`;
}

/** Format seconds → decimal hours for chart data points */
export function toHours(sec) {
  return +(sec / 3600).toFixed(2);
}

/** Today's date as "YYYY-MM-DD" */
export function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Returns array of last 7 date strings (YYYY-MM-DD), oldest first */
export function getWeekDates() {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - 6 + i);
    return d.toISOString().slice(0, 10);
  });
}

/** Returns array of last N date strings, oldest first */
export function getLastNDates(n) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (n - 1) + i);
    return d.toISOString().slice(0, 10);
  });
}

/**
 * Daily bar-chart data for last 7 days.
 * Y-axis = decimal hours (e.g. 1.5 = 1h 30m)
 * Tooltip formatter in the chart should use fmtDuration.
 */
export function buildDailyChartData(entries) {
  return getWeekDates().map((d) => {
    const total = entries.filter((e) => e.date === d).reduce((a, b) => a + b.duration, 0);
    return {
      day:     DAYS[new Date(d + "T12:00:00").getDay()],
      hours:   toHours(total),
      minutes: Math.round(total / 60),
      seconds: total,
      date:    d,
    };
  });
}

/**
 * Category pie-chart data — uses decimal hours for sizing
 * but stores raw seconds for precise tooltip display.
 */
export function buildCategoryData(entries, categories) {
  return categories
    .map((c) => {
      const total = entries.filter((e) => e.categoryId === c.id).reduce((a, b) => a + b.duration, 0);
      return {
        name:    c.name,
        value:   toHours(total),
        seconds: total,
        color:   c.color,
      };
    })
    .filter((c) => c.seconds > 0);
}

/**
 * 4-week trend — decimal hours per week.
 */
export function buildMonthlyTrendData(entries) {
  const now = new Date();
  return Array.from({ length: 4 }, (_, wi) => {
    let total = 0;
    for (let d = 0; d < 7; d++) {
      const dt = new Date(now);
      dt.setDate(now.getDate() - wi * 7 - d);
      const ds = dt.toISOString().slice(0, 10);
      total += entries.filter((e) => e.date === ds).reduce((a, b) => a + b.duration, 0);
    }
    return { week: `W${4 - wi}`, hours: toHours(total), seconds: total };
  }).reverse();
}

/**
 * Full 30-day daily trend — each day as a data point.
 */
export function buildMonthDailyData(entries) {
  return getLastNDates(30).map((d) => {
    const total = entries.filter((e) => e.date === d).reduce((a, b) => a + b.duration, 0);
    const dt = new Date(d + "T12:00:00");
    return {
      label:   `${dt.getDate()} ${MONTHS[dt.getMonth()]}`,
      day:     dt.getDate(),
      month:   MONTHS[dt.getMonth()],
      hours:   toHours(total),
      seconds: total,
      date:    d,
    };
  });
}

/** Consecutive-day streak */
export function calcStreak(entries) {
  let s = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    if (entries.some((e) => e.date === ds && e.duration > 0)) s++;
    else break;
  }
  return s;
}

export function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}
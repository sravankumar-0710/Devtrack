import { DAYS } from "../data/constants";

/** Format seconds → "HH:MM:SS" */
export function fmt(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Format seconds → "Xh" (1 decimal) */
export function fmtH(sec) {
  return `${(sec / 3600).toFixed(1)}h`;
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

/**
 * Builds daily bar-chart data for the last 7 days.
 * @param {Array} entries
 * @returns {Array} [{ day, hours, date }, ...]
 */
export function buildDailyChartData(entries) {
  return getWeekDates().map((d) => {
    const total = entries
      .filter((e) => e.date === d)
      .reduce((a, b) => a + b.duration, 0);
    return {
      day:   DAYS[new Date(d + "T12:00:00").getDay()],
      hours: +(total / 3600).toFixed(2),
      date:  d,
    };
  });
}

/**
 * Builds category pie-chart data from all entries.
 * @param {Array} entries
 * @param {Array} categories
 * @returns {Array} [{ name, value, color }, ...]
 */
export function buildCategoryData(entries, categories) {
  return categories
    .map((c) => {
      const total = entries
        .filter((e) => e.categoryId === c.id)
        .reduce((a, b) => a + b.duration, 0);
      return { name: c.name, value: +(total / 3600).toFixed(1), color: c.color };
    })
    .filter((c) => c.value > 0);
}

/**
 * Builds weekly trend data (4 weeks, most recent last).
 * @param {Array} entries
 * @returns {Array} [{ week, hours }, ...]
 */
export function buildMonthlyTrendData(entries) {
  const now = new Date();
  return Array.from({ length: 4 }, (_, wi) => {
    let total = 0;
    for (let d = 0; d < 7; d++) {
      const dt = new Date(now);
      dt.setDate(now.getDate() - wi * 7 - d);
      const ds = dt.toISOString().slice(0, 10);
      total += entries
        .filter((e) => e.date === ds)
        .reduce((a, b) => a + b.duration, 0);
    }
    return { week: `W${4 - wi}`, hours: +(total / 3600).toFixed(1) };
  }).reverse();
}

/**
 * Calculates the current consecutive-day streak.
 * @param {Array} entries
 * @returns {number}
 */
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

/** Clamp a value between min and max */
export function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

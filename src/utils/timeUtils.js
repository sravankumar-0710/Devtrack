import { DAYS } from "../data/constants";

// ─── TIME FORMATTING ──────────────────────────────────────────────────────────

/** "01:23:45" */
export function fmt(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/** "3.5h" */
export function fmtH(sec) {
  return `${(sec / 3600).toFixed(1)}h`;
}

/** "1h 30m" */
export function fmtHM(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────

/** Today's date as "YYYY-MM-DD" */
export function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Last 7 days as array of "YYYY-MM-DD" strings (oldest → newest) */
export function getWeekDates() {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - 6 + i);
    return d.toISOString().slice(0, 10);
  });
}

/** Last N days as array of "YYYY-MM-DD" strings */
export function getLastNDates(n) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (n - 1) + i);
    return d.toISOString().slice(0, 10);
  });
}

/** Short day label for a date string ("Mon", "Tue" …) */
export function dayLabel(dateStr) {
  return DAYS[new Date(dateStr + "T12:00:00").getDay()];
}

// ─── ANALYTICS HELPERS ────────────────────────────────────────────────────────

/** Total seconds for entries matching a date string */
export function secondsForDate(entries, dateStr) {
  return entries
    .filter((e) => e.date === dateStr)
    .reduce((a, b) => a + b.duration, 0);
}

/** Total seconds for entries whose date is in the given array */
export function secondsForDates(entries, dates) {
  return entries
    .filter((e) => dates.includes(e.date))
    .reduce((a, b) => a + b.duration, 0);
}

/** Calculate current streak (consecutive days with at least one entry) */
export function calcStreak(entries) {
  let s = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    if (entries.some((e) => e.date === ds && e.duration > 0)) {
      s++;
    } else {
      break;
    }
  }
  return s;
}

/** Group entries by category and return totals */
export function categoryTotals(entries, categories) {
  return categories
    .map((c) => ({
      ...c,
      seconds: entries
        .filter((e) => e.categoryId === c.id)
        .reduce((a, b) => a + b.duration, 0),
      hours: +(
        entries
          .filter((e) => e.categoryId === c.id)
          .reduce((a, b) => a + b.duration, 0) / 3600
      ).toFixed(1),
    }))
    .filter((c) => c.seconds > 0);
}

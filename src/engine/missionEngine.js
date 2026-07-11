import { flattenCurriculum, TRACKS } from "../data/curriculum";

/**
 * missionEngine.js — the "brain" of Project Consistency v1.
 *
 * Pure functions only. Nothing here talks to Firebase or React — it takes
 * plain state in, returns plain state/derived values out. That makes it
 * trivial to test and to later swap for an AI-driven version without
 * touching any view code.
 *
 * EngineState shape (what gets persisted):
 * {
 *   cursor: 0,                          // index into flattenCurriculum() — next topic not yet started
 *   completed: { [topicId]: isoDateString },   // when each topic was finished
 *   missions: { [yyyy-mm-dd]: { topicIds: [...], revisionIds: [...], generatedAt } },
 *   dsaSolved: { [yyyy-mm-dd]: count },
 *   githubCommits: { [yyyy-mm-dd]: count },
 * }
 */

export function emptyEngineState() {
  return {
    cursor: 0, completed: {}, missions: {}, dsaSolved: {}, githubCommits: {},
    completedDays: {}, completedTracks: {}, trackDsaLog: {},
  };
}

const WEEKDAY_BUDGET_MIN = 150; // 2.5h average of the 2-3h weekday window
const WEEKEND_BUDGET_MIN = 270; // 4.5h average of the 4-5h weekend window

function isWeekend(date) {
  const d = date.getDay();
  return d === 0 || d === 6;
}

function dayBudget(date) {
  return isWeekend(date) ? WEEKEND_BUDGET_MIN : WEEKDAY_BUDGET_MIN;
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Returns today's mission, generating + persisting it into engineState.missions
 * the first time it's called for a given date. Calling it again the same day
 * is idempotent (returns the already-generated mission, doesn't reroll).
 *
 * Adaptive behavior: the cursor only advances past topics that have been
 * explicitly marked complete (via completeTopic). If yesterday's topics
 * weren't finished, today's generation simply continues from the same
 * cursor — no stacking, no duplication, the backlog just gets carried
 * forward one day budget at a time, which naturally throttles burnout.
 */
export function generateMission(engineState, curriculum, date = new Date()) {
  const key = dateKey(date);
  if (engineState.missions[key]) {
    return { mission: engineState.missions[key], engineState };
  }

  const flat = flattenCurriculum(curriculum);
  const budget = dayBudget(date);

  const topicIds = [];
  let spent = 0;
  let i = engineState.cursor;
  while (i < flat.length && spent < budget) {
    const t = flat[i];
    if (!engineState.completed[t.id]) {
      topicIds.push(t.id);
      spent += t.estMinutes || 30;
    }
    i++;
    // stop once we've queued at least one topic and would blow the budget
    if (spent >= budget) break;
  }

  const revisionIds = pickRevisionTopics(engineState, flat, date);

  const mission = { topicIds, revisionIds, generatedAt: new Date().toISOString(), budgetMinutes: budget };
  const nextState = {
    ...engineState,
    missions: { ...engineState.missions, [key]: mission },
  };
  return { mission, engineState: nextState };
}

/** Spaced repetition: pull one completed topic each from ~1 day, ~7 days, ~30 days ago. */
function pickRevisionTopics(engineState, flat, date) {
  const targets = [1, 7, 30].map((n) => {
    const d = new Date(date);
    d.setDate(d.getDate() - n);
    return dateKey(d);
  });
  const byId = Object.fromEntries(flat.map((t) => [t.id, t]));
  const picks = [];
  targets.forEach((target) => {
    const match = Object.entries(engineState.completed).find(([, completedDate]) => completedDate.slice(0, 10) === target);
    if (match && byId[match[0]]) picks.push(match[0]);
  });
  return [...new Set(picks)];
}

/** Mark a topic complete. Advances the cursor past it if it's the leading one. */
export function completeTopic(engineState, curriculum, topicId, date = new Date()) {
  const flat = flattenCurriculum(curriculum);
  const completed = { ...engineState.completed, [topicId]: date.toISOString() };

  // advance cursor past any leading run of now-completed topics
  let cursor = engineState.cursor;
  while (cursor < flat.length && completed[flat[cursor].id]) cursor++;

  return { ...engineState, completed, cursor };
}

export function uncompleteTopic(engineState, topicId) {
  const completed = { ...engineState.completed };
  delete completed[topicId];
  return { ...engineState, completed };
}

/** If every topic in today's mission is done, suggest the next unstarted topic as a bonus. */
export function getBonusSuggestion(engineState, curriculum, date = new Date()) {
  const key = dateKey(date);
  const mission = engineState.missions[key];
  if (!mission || mission.topicIds.length === 0) return null;
  const allDone = mission.topicIds.every((id) => engineState.completed[id]);
  if (!allDone) return null;

  const flat = flattenCurriculum(curriculum);
  const next = flat.find((t) => !engineState.completed[t.id] && !mission.topicIds.includes(t.id));
  return next || null;
}

export function logDSA(engineState, count, date = new Date()) {
  const key = dateKey(date);
  return { ...engineState, dsaSolved: { ...engineState.dsaSolved, [key]: (engineState.dsaSolved[key] || 0) + count } };
}

export function logGithubCommits(engineState, count, date = new Date()) {
  const key = dateKey(date);
  return { ...engineState, githubCommits: { ...engineState.githubCommits, [key]: (engineState.githubCommits[key] || 0) + count } };
}

export function totalDSASolved(engineState) {
  return Object.values(engineState.dsaSolved || {}).reduce((a, b) => a + b, 0);
}

export function totalGithubCommits(engineState) {
  return Object.values(engineState.githubCommits || {}).reduce((a, b) => a + b, 0);
}

/**
 * Readiness scoring — percentage complete per track, plus a blended overall.
 * Pure curriculum-completion based for v1; DSA volume nudges the DSA track.
 */
export function computeReadiness(engineState, curriculum, dsaTargetTotal = 150) {
  const flat = flattenCurriculum(curriculum);
  const byTrack = {};
  Object.keys(TRACKS).forEach((t) => (byTrack[t] = { total: 0, done: 0 }));

  flat.forEach((t) => {
    if (!byTrack[t.track]) byTrack[t.track] = { total: 0, done: 0 };
    byTrack[t.track].total++;
    if (engineState.completed[t.id]) byTrack[t.track].done++;
  });

  const pct = {};
  Object.entries(byTrack).forEach(([track, { total, done }]) => {
    pct[track] = total ? Math.round((done / total) * 100) : 0;
  });

  const dsaSolved = totalDSASolved(engineState);
  pct.dsa = Math.max(pct.dsa || 0, Math.min(100, Math.round((dsaSolved / dsaTargetTotal) * 100)));

  const values = Object.values(pct);
  const overall = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

  return { byTrack: pct, overall, dsaSolved, githubCommits: totalGithubCommits(engineState) };
}

export function curriculumProgressSummary(engineState, curriculum) {
  const flat = flattenCurriculum(curriculum);
  const done = flat.filter((t) => engineState.completed[t.id]).length;
  return { done, total: flat.length, pct: flat.length ? Math.round((done / flat.length) * 100) : 0 };
}

export { dateKey, dayBudget };

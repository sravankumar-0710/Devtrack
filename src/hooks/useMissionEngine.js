import { useState, useEffect, useCallback } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../firebase";
import { CURRICULUM, flattenCurriculum } from "../data/curriculum";
import {
  emptyEngineState, generateMission, completeTopic, uncompleteTopic,
  getBonusSuggestion, logDSA, logGithubCommits, computeReadiness,
  curriculumProgressSummary,
} from "../engine/missionEngine";

/**
 * useMissionEngine — syncs everything to users/{uid}/missionEngine in Firebase.
 *
 * Extended in v1.1 to also track which 365-day plan days have been
 * marked complete (engineState.completedDays: { [dayNum]: isoDate }).
 */
export function useMissionEngine(uid, curriculum = CURRICULUM) {
  const [engineState, setEngineState] = useState(emptyEngineState());
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const r = ref(db, `users/${uid}/missionEngine`);
    const unsub = onValue(r, (snap) => {
      const val = snap.val();
      setEngineState(val ? { ...emptyEngineState(), ...val } : emptyEngineState());
      setSynced(true);
    });
    return unsub;
  }, [uid]);

  const persist = useCallback((next) => {
    setEngineState(next);
    if (uid) set(ref(db, `users/${uid}/missionEngine`), next);
  }, [uid]);

  // Auto-generate today's mission (idempotent)
  const { mission: todayMission, engineState: stateAfterGen } = generateMission(engineState, curriculum, new Date());
  useEffect(() => {
    if (stateAfterGen !== engineState) persist(stateAfterGen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateAfterGen]);

  const flat = flattenCurriculum(curriculum);
  const topicById = Object.fromEntries(flat.map((t) => [t.id, t]));

  // ── topic-level actions (curriculum.js) ──────────────────────────────────
  const markComplete   = (topicId)  => persist(completeTopic(engineState, curriculum, topicId));
  const markIncomplete = (topicId)  => persist(uncompleteTopic(engineState, topicId));

  // ── day-level actions (curriculum365.js / 365-day plan) ──────────────────
  const markDayComplete = (dayNum) => {
    if (!dayNum) return;
    const completedDays = { ...(engineState.completedDays || {}), [dayNum]: new Date().toISOString() };
    persist({ ...engineState, completedDays });
  };
  // Undo a day that was marked complete by mistake (e.g. fat-fingered the wrong day).
  const markDayIncomplete = (dayNum) => {
    if (!dayNum) return;
    const completedDays = { ...(engineState.completedDays || {}) };
    delete completedDays[dayNum];
    persist({ ...engineState, completedDays });
  };
  // Toggle helper — handy for a single click target in list UIs.
  const toggleDayComplete = (dayNum) => {
    if (!dayNum) return;
    isDayComplete(dayNum) ? markDayIncomplete(dayNum) : markDayComplete(dayNum);
  };
  const isDayComplete = (dayNum) => !!(engineState.completedDays || {})[dayNum];

  // ── logging ──────────────────────────────────────────────────────────────
  const addDSA           = (count) => persist(logDSA(engineState, count));
  const addGithubCommits = (count) => persist(logGithubCommits(engineState, count));

  // ── derived ──────────────────────────────────────────────────────────────
  const bonus     = getBonusSuggestion(engineState, curriculum);
  const readiness = computeReadiness(engineState, curriculum);
  const progress  = curriculumProgressSummary(engineState, curriculum);

  return {
    synced,
    engineState,
    todayMission,
    todayTopics:    (todayMission?.topicIds || []).map((id) => topicById[id]).filter(Boolean),
    revisionTopics: (todayMission?.revisionIds || []).map((id) => topicById[id]).filter(Boolean),
    bonus,
    readiness,
    progress,
    markComplete,
    markIncomplete,
    markDayComplete,
    markDayIncomplete,
    toggleDayComplete,
    isDayComplete,
    addDSA,
    addGithubCommits,
  };
}

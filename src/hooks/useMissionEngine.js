import { useState, useEffect, useCallback } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../firebase";
import { CURRICULUM, flattenCurriculum } from "../data/curriculum";
import { getPlanForDay, dateForDay } from "../data/curriculum365";
import {
  emptyEngineState, generateMission, completeTopic, uncompleteTopic,
  getBonusSuggestion, logDSA, logGithubCommits, computeReadiness,
  curriculumProgressSummary,
} from "../engine/missionEngine";

const ALL_TRACK_KEYS = ["t1", "t2", "t3", "t4"];

function dsaDateKey(dayNum) {
  return dateForDay(dayNum).toISOString().slice(0, 10);
}

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
  const isTopicComplete = (topicId) => !!(engineState.completed || {})[topicId];
  const toggleTopicComplete = (topicId) =>
    isTopicComplete(topicId) ? markIncomplete(topicId) : markComplete(topicId);

  // ── day-level & track-level actions (curriculum365.js / 365-day plan) ────
  // These three concepts are kept in sync with each other so the Consistency
  // Progress panel reacts immediately no matter which UI the person uses:
  //   - completedTracks[day][t1..t4]  → the 4 mini checkboxes on a day
  //   - completedDays[day]            → true once all 4 tracks are done
  //   - dsaSolved[yyyy-mm-dd]          → incremented by that day's DSA target
  //                                      when the DSA track is checked, and
  //                                      un-done (via trackDsaLog) if unchecked

  // Recompute completedDays[dayNum] from the current completedTracks state.
  const syncDayFromTracks = (state, dayNum) => {
    const dayTracks = (state.completedTracks || {})[dayNum] || {};
    const allDone = ALL_TRACK_KEYS.every((k) => dayTracks[k]);
    const completedDays = { ...(state.completedDays || {}) };
    if (allDone) {
      if (!completedDays[dayNum]) completedDays[dayNum] = new Date().toISOString();
    } else {
      delete completedDays[dayNum];
    }
    return { ...state, completedDays };
  };

  // Add/remove that day's DSA target from the dsaSolved log, tracking exactly
  // how much this mechanism contributed (trackDsaLog) so it never clobbers
  // problems logged manually via addDSA for the same date.
  const syncDsaForTrack = (state, dayNum, turningOn) => {
    const plan = getPlanForDay(dayNum);
    const target = plan?.dsaTarget || 0;
    if (!target) return state;
    const key = dsaDateKey(dayNum);
    const trackDsaLog = { ...(state.trackDsaLog || {}) };
    const dsaSolved = { ...(state.dsaSolved || {}) };
    const prevContribution = trackDsaLog[dayNum] || 0;
    if (turningOn && !prevContribution) {
      dsaSolved[key] = (dsaSolved[key] || 0) + target;
      trackDsaLog[dayNum] = target;
    } else if (!turningOn && prevContribution) {
      dsaSolved[key] = Math.max(0, (dsaSolved[key] || 0) - prevContribution);
      delete trackDsaLog[dayNum];
    }
    return { ...state, dsaSolved, trackDsaLog };
  };

  const markDayComplete = (dayNum) => {
    if (!dayNum) return;
    const completedTracks = { ...(engineState.completedTracks || {}) };
    completedTracks[dayNum] = { t1: true, t2: true, t3: true, t4: true };
    let next = { ...engineState, completedTracks };
    next = syncDsaForTrack(next, dayNum, true);
    next = syncDayFromTracks(next, dayNum);
    persist(next);
  };
  // Undo a day that was marked complete by mistake (e.g. fat-fingered the wrong day).
  const markDayIncomplete = (dayNum) => {
    if (!dayNum) return;
    const completedTracks = { ...(engineState.completedTracks || {}) };
    delete completedTracks[dayNum];
    let next = { ...engineState, completedTracks };
    next = syncDsaForTrack(next, dayNum, false);
    next = syncDayFromTracks(next, dayNum);
    persist(next);
  };
  // Toggle helper — handy for a single click target in list UIs.
  const toggleDayComplete = (dayNum) => {
    if (!dayNum) return;
    isDayComplete(dayNum) ? markDayIncomplete(dayNum) : markDayComplete(dayNum);
  };
  const isDayComplete = (dayNum) => !!(engineState.completedDays || {})[dayNum];

  // ── track-level actions (the 4 mini cards — Learn/Practice/DSA/Project — within a day) ──
  const toggleTrackComplete = (dayNum, trackKey) => {
    if (!dayNum || !trackKey) return;
    const completedTracks = { ...(engineState.completedTracks || {}) };
    const dayTracks = { ...(completedTracks[dayNum] || {}) };
    const turningOn = !dayTracks[trackKey];
    dayTracks[trackKey] = turningOn;
    completedTracks[dayNum] = dayTracks;

    let next = { ...engineState, completedTracks };
    if (trackKey === "t3") next = syncDsaForTrack(next, dayNum, turningOn);
    next = syncDayFromTracks(next, dayNum);
    persist(next);
  };
  const isTrackComplete = (dayNum, trackKey) =>
    !!(engineState.completedTracks || {})[dayNum]?.[trackKey];

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
    isTopicComplete,
    toggleTopicComplete,
    markDayComplete,
    markDayIncomplete,
    toggleDayComplete,
    isDayComplete,
    toggleTrackComplete,
    isTrackComplete,
    addDSA,
    addGithubCommits,
  };
}

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
 * useMissionEngine — syncs Project Consistency v1's engine state to
 * Firebase at users/{uid}/missionEngine, mirroring the same pattern as
 * useConsistencyData / useFirebaseData. One JSON blob, last-write-wins.
 */
export function useMissionEngine(uid, curriculum = CURRICULUM) {
  const [engineState, setEngineState] = useState(emptyEngineState());
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const r = ref(db, `users/${uid}/missionEngine`);
    const unsub = onValue(r, (snap) => {
      const val = snap.val();
      setEngineState(val || emptyEngineState());
      setSynced(true);
    });
    return unsub;
  }, [uid]);

  const persist = useCallback((next) => {
    setEngineState(next);
    if (uid) set(ref(db, `users/${uid}/missionEngine`), next);
  }, [uid]);

  // Today's mission is computed on read, and persisted the first time it's generated.
  const { mission: todayMission, engineState: stateAfterGen } = generateMission(engineState, curriculum, new Date());
  useEffect(() => {
    if (stateAfterGen !== engineState) persist(stateAfterGen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateAfterGen]);

  const flat = flattenCurriculum(curriculum);
  const topicById = Object.fromEntries(flat.map((t) => [t.id, t]));

  const markComplete = (topicId) => persist(completeTopic(engineState, curriculum, topicId));
  const markIncomplete = (topicId) => persist(uncompleteTopic(engineState, topicId));
  const addDSA = (count) => persist(logDSA(engineState, count));
  const addGithubCommits = (count) => persist(logGithubCommits(engineState, count));

  const bonus = getBonusSuggestion(engineState, curriculum);
  const readiness = computeReadiness(engineState, curriculum);
  const progress = curriculumProgressSummary(engineState, curriculum);

  return {
    synced,
    engineState,
    todayMission,
    todayTopics: (todayMission?.topicIds || []).map((id) => topicById[id]).filter(Boolean),
    revisionTopics: (todayMission?.revisionIds || []).map((id) => topicById[id]).filter(Boolean),
    bonus,
    readiness,
    progress,
    markComplete,
    markIncomplete,
    addDSA,
    addGithubCommits,
  };
}

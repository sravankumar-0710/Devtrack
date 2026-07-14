import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../firebase";
import { CAREER_LEVELS, INITIAL_LEARNING, CERT_ROADMAP_PRESET } from "../data/consistencyConstants";

/**
 * useConsistencyData — syncs the "Project Consistency" feature set
 * (Goals, Roadmap, Certifications, Habits, Notes, Resources, Placement)
 * to/from Firebase Realtime Database, mirroring the same pattern as
 * useFirebaseData. Stored under users/{uid}/consistency/*.
 */
const COLLECTIONS = [
  "lifeGoals",
  "habits",
  "certifications",
  "notes",
  "resources",
  "roadmapItems",
  "placementItems",
  "devProjects",
  "studySessions",
  "dailyTasks",
  "weeklyReviews",
  "linkCards",
];

export function useConsistencyData(uid) {
  const [state, setState] = useState(() =>
    COLLECTIONS.reduce((acc, c) => ({ ...acc, [c]: [] }), {})
  );
  const [mission, setMission] = useState({
    statement: "Become an AI / Software Engineer in ~1 year.",
    quote: "Consistency beats intensity.",
  });
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!uid) return;

    const r = ref(db, `users/${uid}/consistency`);
    const unsub = onValue(r, (snap) => {
      const val = snap.val();
      if (val) {
        const next = {};
        COLLECTIONS.forEach((c) => {
          next[c] = val[c] ? Object.values(val[c]) : [];
        });
        setState(next);
        setMission(val.mission || mission);
      } else {
        // First run — seed roadmap with the planned learning track
        const seededRoadmap = INITIAL_LEARNING.map((name, i) => ({
          id: `seed-${i}`,
          item: name,
          stage: CAREER_LEVELS[Math.min(i, CAREER_LEVELS.length - 1)],
          status: i === 0 ? "In Progress" : "Not Started",
          progress: 0,
        }));
        const seededCerts = CERT_ROADMAP_PRESET.map((name, i) => ({
          id: `cert-seed-${i}`,
          certificate: name,
          provider: "",
          status: "Not Started",
          startDate: "",
          endDate: "",
          credential: "",
        }));
        set(ref(db, `users/${uid}/consistency`), {
          roadmapItems: arrayToObject(seededRoadmap),
          certifications: arrayToObject(seededCerts),
          mission,
        });
      }
      setSynced(true);
    });

    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const save = (col, arr) =>
    set(ref(db, `users/${uid}/consistency/${col}`), arrayToObject(arr));

  const addItem = (col, item) => {
    const now = new Date().toISOString();
    const newItem = { ...item, id: `${Date.now()}`, createdAt: now };
    const updated = [...state[col], newItem];
    setState((s) => ({ ...s, [col]: updated }));
    save(col, updated);
  };

  const updateItem = (col, id, patch) => {
    const updated = state[col].map((it) =>
      it.id === id ? { ...it, ...patch, updatedAt: new Date().toISOString() } : it
    );
    setState((s) => ({ ...s, [col]: updated }));
    save(col, updated);
  };

  const deleteItem = (col, id) => {
    const updated = state[col].filter((it) => it.id !== id);
    setState((s) => ({ ...s, [col]: updated }));
    save(col, updated);
  };

  const saveMission = (m) => {
    setMission(m);
    set(ref(db, `users/${uid}/consistency/mission`), m);
  };

  return {
    ...state,
    mission,
    synced,
    addItem,
    updateItem,
    deleteItem,
    saveMission,
  };
}

function arrayToObject(arr) {
  if (!arr || arr.length === 0) return {};
  return arr.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}

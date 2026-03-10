import { useState, useEffect, useRef } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../firebase";
import { PRESET_CATEGORIES, PRESET_PROJECTS, DEFAULT_GOALS } from "../data/constants";

/**
 * useFirebaseData — syncs all app data to/from Firebase Realtime Database.
 * Each piece of state is mirrored under users/{uid}/ in the database.
 * Changes on any device instantly appear on all other devices.
 *
 * @param {string} uid  - Firebase user ID
 * @returns app data + setters
 */
export function useFirebaseData(uid) {
  const [entries,    setEntries]    = useState([]);
  const [categories, setCategories] = useState(PRESET_CATEGORIES);
  const [projects,   setProjects]   = useState(PRESET_PROJECTS);
  const [goals,      setGoals]      = useState(DEFAULT_GOALS);
  const [synced,     setSynced]     = useState(false);

  // Track if we've received the first snapshot (to avoid overwriting on mount)
  const initialized = useRef(false);

  // ── Subscribe to Firebase on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!uid) return;

    const userRef = ref(db, `users/${uid}`);
    const unsub = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert entries object back to array (Firebase stores arrays as objects)
        const entriesArr = data.entries
          ? Object.values(data.entries)
          : [];
        setEntries(entriesArr);
        setCategories(data.categories ? Object.values(data.categories) : PRESET_CATEGORIES);
        setProjects(data.projects     ? Object.values(data.projects)   : PRESET_PROJECTS);
        setGoals(data.goals           || DEFAULT_GOALS);
      } else {
        // First time user — write defaults to database
        set(ref(db, `users/${uid}`), {
          entries:    {},
          categories: arrayToObject(PRESET_CATEGORIES),
          projects:   arrayToObject(PRESET_PROJECTS),
          goals:      DEFAULT_GOALS,
        });
      }
      initialized.current = true;
      setSynced(true);
    });

    return unsub;
  }, [uid]);

  // ── Write helpers — each writes only its slice to Firebase ─────────────────
  const saveEntries    = (arr) => set(ref(db, `users/${uid}/entries`),    arrayToObject(arr));
  const saveCategories = (arr) => set(ref(db, `users/${uid}/categories`), arrayToObject(arr));
  const saveProjects   = (arr) => set(ref(db, `users/${uid}/projects`),   arrayToObject(arr));
  const saveGoals      = (obj) => set(ref(db, `users/${uid}/goals`),      obj);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const addEntry = (entry) => {
    const newEntry = { ...entry, id: Date.now().toString(), createdAt: new Date().toISOString() };
    const updated  = [...entries, newEntry];
    setEntries(updated);
    saveEntries(updated);
  };

  const deleteEntry = (id) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
  };

  const addCategory = (c) => {
    const updated = [...categories, { ...c, id: Date.now().toString() }];
    setCategories(updated);
    saveCategories(updated);
  };

  const deleteCategory = (id) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    saveCategories(updated);
  };

  const addProject = (p) => {
    const updated = [...projects, { ...p, id: Date.now().toString() }];
    setProjects(updated);
    saveProjects(updated);
  };

  const deleteProject = (id) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    saveProjects(updated);
  };

  const updateGoals = (newGoals) => {
    setGoals(newGoals);
    saveGoals(newGoals);
  };

  const onRestore = (backup) => {
    const e = backup.entries    || [];
    const c = backup.categories || PRESET_CATEGORIES;
    const p = backup.projects   || PRESET_PROJECTS;
    const g = backup.goals      || DEFAULT_GOALS;
    setEntries(e); setCategories(c); setProjects(p); setGoals(g);
    set(ref(db, `users/${uid}`), {
      entries:    arrayToObject(e),
      categories: arrayToObject(c),
      projects:   arrayToObject(p),
      goals:      g,
    });
  };

  return {
    entries, categories, projects, goals, synced,
    addEntry, deleteEntry, addCategory, deleteCategory,
    addProject, deleteProject, updateGoals, onRestore,
  };
}

// Firebase doesn't support arrays natively — store as {id: object} map
function arrayToObject(arr) {
  if (!arr || arr.length === 0) return {};
  return arr.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}
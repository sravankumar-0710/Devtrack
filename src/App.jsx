import { useState, useEffect } from "react";

// Data & utils
import { PRESET_CATEGORIES, PRESET_PROJECTS, DEFAULT_GOALS } from "./data/constants";
import { calcStreak, today } from "./utils/helpers";

// Components
import { Header }       from "./components/Header";
import { Notification } from "./components/Notification";

// Views
import { Dashboard }    from "./views/Dashboard";
import { TimerView }    from "./views/TimerView";
import { ReportsView }  from "./views/ReportsView";
import { SettingsView } from "./views/SettingsView";

// ── localStorage helpers ────────────────────────────────────────────────────
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("localStorage save failed:", e);
  }
}

const VIEW_MAP = {
  dashboard: Dashboard,
  timer:     TimerView,
  reports:   ReportsView,
  settings:  SettingsView,
};

export default function App() {
  // ── core state — all seeded from localStorage ───────────────────────────────
  const [view,         setView]         = useState("dashboard");
  const [entries,      setEntries]      = useState(() => load("devtrack-entries",    []));
  const [categories,   setCategories]   = useState(() => load("devtrack-categories", PRESET_CATEGORIES));
  const [projects,     setProjects]     = useState(() => load("devtrack-projects",   PRESET_PROJECTS));
  const [goals,        setGoals]        = useState(() => load("devtrack-goals",      DEFAULT_GOALS));
  const [notification, setNotification] = useState(null);

  // ── persist every change to localStorage ───────────────────────────────────
  useEffect(() => { save("devtrack-entries",    entries);    }, [entries]);
  useEffect(() => { save("devtrack-categories", categories); }, [categories]);
  useEffect(() => { save("devtrack-projects",   projects);   }, [projects]);
  useEffect(() => { save("devtrack-goals",      goals);      }, [goals]);

  // ── notification helper ─────────────────────────────────────────────────────
  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 2800);
  };

  // ── data mutations ──────────────────────────────────────────────────────────
  const addEntry = (entry) => {
    setEntries((prev) => [
      ...prev,
      { ...entry, id: Date.now().toString(), createdAt: new Date().toISOString() },
    ]);
    showNotif("Session recorded!");
  };

  const deleteEntry = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    showNotif("Entry deleted", "info");
  };

  const addProject  = (p) => setProjects((prev)   => [...prev, { ...p, id: Date.now().toString() }]);
  const addCategory = (c) => setCategories((prev) => [...prev, { ...c, id: Date.now().toString() }]);

  const updateGoals = (newGoals) => {
    setGoals(newGoals);
    showNotif("Goals saved!");
  };

  // ── restore entire dataset from backup ──────────────────────────────────────
  const onRestore = (backup) => {
    setEntries(backup.entries         ?? []);
    setCategories(backup.categories   ?? PRESET_CATEGORIES);
    setProjects(backup.projects       ?? PRESET_PROJECTS);
    setGoals(backup.goals             ?? DEFAULT_GOALS);
  };

  // ── auto-backup: once per day, silently save a JSON file ──────────────────
  useEffect(() => {
    const BACKUP_KEY = "devtrack-last-auto-backup";
    const lastBackup = localStorage.getItem(BACKUP_KEY);
    const todayStr   = new Date().toISOString().slice(0, 10);

    // Only run once per day, and only if there's actual data
    if (lastBackup === todayStr || entries.length === 0) return;

    try {
      const backup = {
        version:    1,
        exportedAt: new Date().toISOString(),
        autoBackup: true,
        entries, categories, projects, goals,
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const a    = document.createElement("a");
      a.href     = URL.createObjectURL(blob);
      a.download = `devtrack-auto-${todayStr}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      localStorage.setItem(BACKUP_KEY, todayStr);
    } catch (e) {
      console.warn("Auto-backup failed:", e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs once on app open — checks date internally

  // ── derived values ──────────────────────────────────────────────────────────
  const todaySeconds = entries
    .filter((e) => e.date === today())
    .reduce((a, b) => a + b.duration, 0);

  const weekSeconds = entries
    .filter((e) => {
      const d = new Date(); d.setDate(d.getDate() - 6);
      return e.date >= d.toISOString().slice(0, 10);
    })
    .reduce((a, b) => a + b.duration, 0);

  const streak = calcStreak(entries);

  // ── render ──────────────────────────────────────────────────────────────────
  const ActiveView = VIEW_MAP[view] || Dashboard;

  const sharedProps = {
    entries, categories, projects, goals,
    setGoals: updateGoals, addEntry, deleteEntry,
    addProject, addCategory, onRestore,
    todaySeconds, weekSeconds, streak,
    showNotif,
  };

  return (
    <div
      style={{
        minHeight:  "100vh",
        background: "#0A0A0F",
        fontFamily: "'DM Mono', 'Fira Code', monospace",
        color:      "#E2E8F0",
        display:    "flex",
        flexDirection: "column",
      }}
    >
      <Notification notification={notification} />

      <Header
        view={view}
        setView={setView}
        streak={streak}
        todaySeconds={todaySeconds}
      />

      <main style={{ flex: 1, overflow: "auto" }}>
        <ActiveView {...sharedProps} />
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0A0A0F; }
        ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 2px; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 1; }
        input, select, textarea {
          color-scheme: dark;
        }
      `}</style>
    </div>
  );
}
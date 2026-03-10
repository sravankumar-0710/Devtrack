import { useState, useEffect } from "react";

// Firebase
import { useAuth }         from "./hooks/useAuth";
import { useFirebaseData } from "./hooks/useFirebaseData";

// Utils
import { calcStreak, today } from "./utils/helpers";

// Hooks
import { useActivityGoalNotifications } from "./hooks/useActivityGoalNotifications";

// Components
import { Header }       from "./components/Header";
import { Notification } from "./components/Notification";

// Views
import { LoginView }    from "./views/LoginView";
import { Dashboard }    from "./views/Dashboard";
import { TimerView }    from "./views/TimerView";
import { ReportsView }  from "./views/ReportsView";
import { SettingsView } from "./views/SettingsView";

const VIEW_MAP = {
  dashboard: Dashboard,
  timer:     TimerView,
  reports:   ReportsView,
  settings:  SettingsView,
};

export default function App() {
  const [view,         setView]         = useState("dashboard");
  const [notification, setNotification] = useState(null);

  // ── Auth ────────────────────────────────────────────────────────────────────
  const { user, loading: authLoading, signIn, logout } = useAuth();

  // ── Firebase data — only active when user is signed in ─────────────────────
  const {
    entries, categories, projects, goals, activityGoals, synced,
    addEntry, deleteEntry,
    addCategory, deleteCategory,
    addProject, deleteProject,
    updateGoals,
    addActivityGoal, updateActivityGoal, deleteActivityGoal,
    onRestore,
  } = useFirebaseData(user?.uid);

  // ── Activity goal notifications ─────────────────────────────────────────────
  useActivityGoalNotifications(activityGoals, entries, categories);

  // ── Notification helper ─────────────────────────────────────────────────────
  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 2800);
  };

  // Wrap mutations to show notifications
  const handleAddEntry = (entry) => { addEntry(entry);   showNotif("Session recorded!"); };
  const handleDelete   = (id)    => { deleteEntry(id);   showNotif("Entry deleted", "info"); };
  const handleGoals    = (g)     => { updateGoals(g);    showNotif("Goals saved!"); };
  const handleRestore  = (b)     => { onRestore(b);      showNotif(`Restored ${b.entries?.length || 0} sessions!`); };

  // ── Derived values ──────────────────────────────────────────────────────────
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

  // ── Loading states ──────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0A0A0F",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Mono', monospace", color: "#64748B", fontSize: 13,
      }}>
        Loading...
      </div>
    );
  }

  // ── Not signed in → show login ──────────────────────────────────────────────
  if (!user) {
    return <LoginView signIn={signIn} loading={authLoading} />;
  }

  // ── Signed in but data not yet synced ───────────────────────────────────────
  if (!synced) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0A0A0F",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Mono', monospace", color: "#64748B", fontSize: 13,
      }}>
        Syncing your data...
      </div>
    );
  }

  // ── Main app ────────────────────────────────────────────────────────────────
  const ActiveView = VIEW_MAP[view] || Dashboard;

  const sharedProps = {
    entries, categories, projects, goals, activityGoals,
    setGoals:            handleGoals,
    addEntry:            handleAddEntry,
    deleteEntry:         handleDelete,
    addCategory,         deleteCategory,
    addProject,          deleteProject,
    addActivityGoal,     updateActivityGoal, deleteActivityGoal,
    onRestore:           handleRestore,
    todaySeconds, weekSeconds, streak,
    showNotif,
    user, logout,
  };

  return (
    <div style={{
      minHeight:     "100vh",
      background:    "#0A0A0F",
      fontFamily:    "'DM Mono', 'Fira Code', monospace",
      color:         "#E2E8F0",
      display:       "flex",
      flexDirection: "column",
    }}>
      <Notification notification={notification} />

      <Header
        view={view}
        setView={setView}
        streak={streak}
        todaySeconds={todaySeconds}
        user={user}
        logout={logout}
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
        input, select, textarea { color-scheme: dark; }
      `}</style>
    </div>
  );
}
export const PRESET_CATEGORIES = [
  { id: "study",    name: "Study",            color: "#6EE7B7", icon: "BookOpen" },
  { id: "coding",   name: "Coding",           color: "#93C5FD", icon: "Code2"   },
  { id: "project",  name: "Project Building", color: "#FCA5A5", icon: "Hammer"  },
  { id: "reading",  name: "Reading",          color: "#FCD34D", icon: "FileText"},
  { id: "dsa",      name: "DSA",              color: "#C4B5FD", icon: "Zap"     },
  { id: "exercise", name: "Exercise",         color: "#6EE7F7", icon: "Coffee"  },
];

export const PRESET_PROJECTS = [
  { id: "p1", name: "SecureVault",   color: "#F472B6" },
  { id: "p2", name: "Portfolio Site", color: "#34D399" },
];

export const DEFAULT_GOALS = {
  daily:   5 * 3600,   // 5 hours in seconds
  weekly:  30 * 3600,  // 30 hours in seconds
};

export const POMODORO_SETTINGS = {
  work:       25 * 60,
  shortBreak:  5 * 60,
  longBreak:  15 * 60,
};

export const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "timer",     label: "Timer"     },
  { id: "reports",   label: "Reports"   },
  { id: "settings",  label: "Settings"  },
];

# DevTrack — Architecture

## Overview

DevTrack is a single-page React application (SPA) for personal productivity and learning tracking. It uses Firebase Realtime Database as its backend, Google OAuth for authentication, and is deployed on Vercel. There is no custom server — all logic runs in the browser.

---

## Tech Stack

| Layer          | Technology                        | Version  |
|----------------|-----------------------------------|----------|
| UI Framework   | React                             | 18.2.0   |
| Build Tool     | Vite                              | 5.0.0    |
| Database       | Firebase Realtime Database        | 10.7.0   |
| Auth           | Firebase Auth (Google OAuth)      | 10.7.0   |
| Charts         | Recharts                          | 2.10.0   |
| Icons          | Lucide React                      | 0.383.0  |
| Deployment     | Vercel                            | —        |
| Font           | DM Mono (Google Fonts)            | —        |

---

## Directory Structure

```
DEVTRACK/
├── index.html                        # HTML entry point — mounts React at #root
├── package.json                      # Dependencies and npm scripts
├── vite.config.js                    # Vite bundler configuration
├── vercel.json                       # Vercel deployment / SPA redirect rules
└── src/
    ├── index.jsx                     # React root — renders <App />
    ├── App.jsx                       # Root component: auth gate, state hub, view routing
    ├── firebase.js                   # Firebase init: auth, db, Google provider
    │
    ├── components/                   # Reusable UI primitives
    │   ├── ActivityGoalCard.jsx      # Progress card for a single activity goal
    │   ├── Card.jsx                  # Base card container with dark styling
    │   ├── EntryLog.jsx              # Alias — actually exports SettingsView sections
    │   ├── GoalBar.jsx               # Progress bar for daily/weekly goals
    │   ├── Header.jsx                # Top nav: logo, tabs, streak badge, user avatar
    │   ├── ManualEntryForm.jsx       # Form fields for adding a manual session
    │   ├── ManualEntryModal.jsx      # Modal wrapper around ManualEntryForm
    │   ├── Notification.jsx          # Toast notification (slide-in, auto-dismiss)
    │   ├── PomodoroTimer.jsx         # Pomodoro UI widget (25/5 focus cycles)
    │   ├── StatCard.jsx              # Stat summary card (Today, Week, Streak, Sessions)
    │   └── UI.jsx                    # Shared micro-components (buttons, inputs, etc.)
    │
    ├── views/                        # Full-page views, one per tab
    │   ├── LoginView.jsx             # Google sign-in screen
    │   ├── Dashboard.jsx             # Main overview: stats, charts, recent sessions
    │   ├── TimerView.jsx             # Live timer + Pomodoro + manual entry
    │   ├── ReportsView.jsx           # Historical charts and data analysis
    │   └── SettingsView.jsx          # Goals, categories, projects, data management
    │
    ├── hooks/                        # Custom React hooks
    │   ├── useAuth.js                # Firebase auth state (signIn, logout, user)
    │   ├── useFirebaseData.js        # All data sync: reads/writes to Firebase RTDB
    │   ├── useActivityGoalNotifications.js  # Browser notification scheduler
    │   ├── usePomodoro.js            # Pomodoro timer state machine
    │   └── useTimer.js              # Raw stopwatch/countdown logic
    │
    ├── data/
    │   ├── constants.js              # PRESET_CATEGORIES, PRESET_PROJECTS, DEFAULT_GOALS
    │   └── seedData.js               # Sample data for development/demo
    │
    ├── utils/
    │   ├── helpers.js                # calcStreak, today(), fmtDuration, chart builders
    │   └── timeUtils.js             # Time formatting and conversion utilities
    │
    └── styles/
        └── global.css               # Minimal global resets and scrollbar styles
```

---

## Application Architecture

### State Management

There is no Redux or Zustand. State lives in two places:

1. **`App.jsx` (root)** — owns all global state and is the single source of truth:
   - `view` — which tab is active
   - `notification` — current toast message
   - All data state delegated to `useFirebaseData`

2. **`useFirebaseData.js`** — owns all domain data:
   - `entries`, `categories`, `projects`, `goals`, `activityGoals`
   - All mutations (add/delete/update) are defined here and passed down as props

All state flows **downward** via `sharedProps` spread onto `<ActiveView />`. There is no context, no event bus, no global store.

### Data Flow

```
Firebase RTDB
     │
     │  onValue() listener (real-time)
     ▼
useFirebaseData(uid)
     │
     │  returns { entries, addEntry, deleteEntry, ... }
     ▼
App.jsx
     │  wraps mutations with showNotif(), assembles sharedProps
     ▼
<ActiveView {...sharedProps} />
     │
     ├── Dashboard.jsx     (reads entries, categories, projects, goals)
     ├── TimerView.jsx     (calls addEntry)
     ├── ReportsView.jsx   (reads entries, categories)
     └── SettingsView.jsx  (reads/writes everything)
```

### Routing

There is no React Router. Navigation is a simple `VIEW_MAP` object in `App.jsx`:

```js
const VIEW_MAP = {
  dashboard: Dashboard,
  timer:     TimerView,
  reports:   ReportsView,
  settings:  SettingsView,
};
```

The `Header` component calls `setView(tabName)`, which swaps the rendered component. The URL never changes. This is intentional for simplicity — the app is not meant to support deep-linking.

---

## Firebase Architecture

### Auth

- Provider: `GoogleAuthProvider` (OAuth 2.0)
- Managed by `useAuth.js` which wraps `onAuthStateChanged`
- `App.jsx` gates all data and views behind `user !== null`

### Realtime Database Schema

All user data lives under a single path keyed by Firebase UID:

```
users/
  {uid}/
    entries/
      {id}/
        id:         string (Date.now().toString())
        date:       string (YYYY-MM-DD)
        categoryId: string
        project:    string (project id, optional)
        duration:   number (seconds)
        notes:      string (optional)
        manual:     boolean
        createdAt:  ISO string
    categories/
      {id}/
        id:    string
        name:  string
        color: hex string
        icon:  string
    projects/
      {id}/
        id:    string
        name:  string
        color: hex string
    goals/
      daily:  number (seconds)
      weekly: number (seconds)
    activityGoals/
      {id}/
        id:             string
        categoryId:     string
        targetSeconds:  number
        reminderTime:   string (HH:MM)
        days:           number[] (0=Sun … 6=Sat)
        enabled:        boolean
        createdAt:      ISO string
        updatedAt:      ISO string
```

### Why Objects Instead of Arrays

Firebase Realtime Database does not have a native array type. Arrays stored as JSON get overwritten unpredictably under concurrent writes. DevTrack converts all arrays to `{ id: object }` maps before writing via `arrayToObject()`, and converts back to arrays with `Object.values()` on read.

### Write Strategy

Every mutation optimistically updates React state first (`setEntries(updated)`), then fires a `set()` call to Firebase. The `onValue` listener will echo the write back, but since state is already updated the UI does not flicker. All writes replace the entire collection at once (`set` not `update`) — this is safe because only one user ever writes to their own path.

---

## Deployment

### Vercel

- Triggered automatically on every push to `main` branch on GitHub
- Build command: `npm run build` (Vite outputs to `dist/`)
- Output directory: `dist`
- `vercel.json` contains SPA rewrites so all routes serve `index.html`
- Live URL: https://devtrack-mu.vercel.app

### Environment

No `.env` file is needed. The Firebase config is hardcoded in `firebase.js` (safe for client-side Firebase projects — security is enforced by Firebase Rules on the server, not by hiding the config).

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| No router | Single-user tool; no need for shareable URLs or browser history |
| No state library | Data shape is flat; prop drilling is shallow (1 level deep from App) |
| Firebase RTDB over Firestore | Real-time sync without polling; simpler API for flat data |
| `set()` over `update()` | Avoids partial-write race conditions on a single-user path |
| Optimistic updates | Mutations feel instant; no loading spinners on writes |
| All styles inline | Zero CSS file maintenance; styles co-located with components |
| DM Mono font | Terminal/developer aesthetic that matches the product's audience |

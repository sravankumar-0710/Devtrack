# DevTrack — Development Plan

## Project Status: Active (v1.0 Live)

Live at https://devtrack-mu.vercel.app  
Repo: https://github.com/sravankumar-0710/Devtrack  
Branch strategy: single `main` branch, Vercel auto-deploys on push

---

## What Is Built (v1.0 — Complete)

### Infrastructure
- [x] Vite + React 18 project scaffold
- [x] Firebase project created (`devtrack-a3e61`)
- [x] Firebase Realtime Database enabled
- [x] Firebase Auth with Google OAuth provider
- [x] Vercel deployment connected to GitHub (`main` branch)
- [x] `vercel.json` SPA rewrite rules

### Authentication
- [x] `useAuth.js` — wraps `onAuthStateChanged`, `signInWithPopup`, `signOut`
- [x] `LoginView.jsx` — Google sign-in button
- [x] Auth gate in `App.jsx` (loading → login → syncing → app)

### Data Layer
- [x] `useFirebaseData.js` — full RTDB sync with `onValue` listener
- [x] `arrayToObject()` helper for Firebase-safe storage
- [x] Auto-initialize new user node with preset data on first sign-in
- [x] `addEntry` / `deleteEntry`
- [x] `addCategory` / `deleteCategory`
- [x] `addProject` / `deleteProject`
- [x] `addActivityGoal` / `updateActivityGoal` / `deleteActivityGoal`
- [x] `updateGoals`
- [x] `onRestore` — bulk overwrite from backup

### Session Tracking
- [x] `useTimer.js` — stopwatch hook
- [x] `usePomodoro.js` — 25/5 pomodoro state machine
- [x] `PomodoroTimer.jsx` — Pomodoro UI
- [x] `TimerView.jsx` — live timer tab with category/project/notes selection
- [x] `ManualEntryForm.jsx` + `ManualEntryModal.jsx` — manual session logging

### Dashboard
- [x] Stat cards (Today, Week, Streak, Sessions today)
- [x] Daily and weekly goal progress bars (`GoalBar.jsx`)
- [x] Today's activity goals section (`ActivityGoalCard.jsx`)
- [x] This Week bar chart (Recharts `BarChart`)
- [x] By Category pie chart (Recharts `PieChart`)
- [x] 30-Day trend area chart
- [x] 4-Week trend area chart
- [x] Projects time breakdown panel
- [x] Recent Sessions list (last 8, with delete)

### Settings
- [x] Productivity goals editor (daily + weekly in h/m)
- [x] Activity goals manager (add/toggle/delete, with reminder time + active days)
- [x] Categories manager (add with color picker, delete)
- [x] Projects manager (add with color picker, delete)
- [x] Data section: JSON backup, CSV export, restore, clear all

### Notifications
- [x] `useActivityGoalNotifications.js` — browser notification scheduler
- [x] Permission request on first goal creation
- [x] Fires at reminder time if goal not yet complete for the day

### Reports
- [x] `ReportsView.jsx` — historical charts and analysis

### UI Polish
- [x] `Notification.jsx` — slide-in toast with 2.8s auto-dismiss
- [x] `Header.jsx` — tab nav with streak badge and today's time
- [x] DM Mono monospace font throughout
- [x] Dark theme (#0A0A0F background, consistent color system)
- [x] Thin custom scrollbar styling
- [x] Hover states on all interactive elements

---

## Known Issues / Bugs

| Issue | Severity | Status |
|-------|----------|--------|
| `TimerView.jsx` has duplicate `border` key in inline style object (line 81) | Low — warning only, no visual bug | Open |
| Bundle size is 974 KB (minified), 248 KB gzipped — above Vite's 500 KB warning threshold | Low — no user impact, just build warning | Open |
| Sessions list on Dashboard only shows last 8 — no pagination | Low — acceptable for personal tool | Open |
| No session edit — only delete | Medium — workaround is delete + re-add | Open |

---

## Immediate Next Steps (v1.1)

These are small, low-risk improvements that can be made without architectural changes:

### Bug Fixes
- [ ] Fix duplicate `border` key in `TimerView.jsx` line 81 (remove one of the two `border` properties)
- [ ] Add code splitting via `vite.config.js` `manualChunks` to bring bundle below 500 KB warning

### UX Improvements
- [ ] Show all sessions with pagination or a "Show more" button (currently capped at 8)
- [ ] Add edit session capability — modal to modify duration, category, notes, date
- [ ] Confirm before deleting a category that has sessions tagged to it
- [ ] Show session count badge per category in the categories list
- [ ] Allow reordering of categories and projects

### Data
- [ ] Add `updatedAt` field to entries (currently only `createdAt`)
- [ ] Add session duration validation — reject entries with 0 seconds

---

## Medium-Term Roadmap (v1.2 — v1.5)

### v1.2 — Reports Enhancements
- [ ] Date range picker for filtering Reports view
- [ ] Per-category breakdown table with totals
- [ ] Heatmap calendar (GitHub-style) showing daily activity intensity
- [ ] Export filtered data from Reports view

### v1.3 — Timer Improvements
- [ ] Multiple simultaneous timers (one per category)
- [ ] Timer auto-save on browser tab close / page unload
- [ ] Session history accessible from Timer view without switching tabs
- [ ] Keyboard shortcut to start/stop timer (Space bar)

### v1.4 — Mobile Responsive
- [ ] Audit and fix layout at 375px viewport width
- [ ] Collapsible sidebar / bottom nav for mobile
- [ ] Touch-friendly timer controls

### v1.5 — Advanced Goals
- [ ] Weekly goal breakdowns (e.g., "4h DSA + 2h Projects per week")
- [ ] Goal history — track whether goals were met each day/week
- [ ] Streak recovery — grace period option (e.g., one miss allowed per week)

---

## Long-Term Ideas (Backlog)

- [ ] PWA / installable app with offline support (Service Worker + IndexedDB cache)
- [ ] Weekly email digest (would require a backend function — Firebase Cloud Functions)
- [ ] CSV import for migrating data from other tools (Toggl, Clockify, etc.)
- [ ] Dark/light theme toggle
- [ ] Multi-language / i18n support
- [ ] Public profile / shareable stats page (opt-in)

---

## How to Run Locally

```bash
# Clone the repo
git clone https://github.com/sravankumar-0710/Devtrack.git
cd Devtrack

# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

No `.env` file needed. Firebase config is in `src/firebase.js`.

---

## How to Deploy

### Vercel (automatic)
Push to `main` on GitHub. Vercel auto-triggers a build and deploys to https://devtrack-mu.vercel.app within ~30 seconds.

### Manual deploy via Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

---

## How to Add a New Feature (Checklist)

1. **Data** — If the feature needs new persistent data, add the field to the Firebase schema and add read/write helpers to `useFirebaseData.js`
2. **Mutation** — If it mutates state, add the function to `useFirebaseData.js` and export it
3. **App wiring** — Destructure the new function in `App.jsx`, optionally wrap with `showNotif`, add to `sharedProps`
4. **UI** — Add the UI to the relevant view or create a new component in `src/components/`
5. **Test** — Manually verify add, delete, persist across page refresh, and sync across two browser tabs
6. **Deploy** — Push to `main`; Vercel deploys automatically

# DevTrack — Product Requirements Document (PRD)

## Product Summary

DevTrack is a personal productivity and learning tracker built for developers. It helps individuals measure how they spend their study and coding time, set daily and weekly goals, and visualize progress over time. It is a single-user tool — each user sees only their own data, secured behind Google sign-in.

**Live:** https://devtrack-mu.vercel.app  
**Repo:** https://github.com/sravankumar-0710/Devtrack

---

## Problem Statement

Developers who are self-studying, building side projects, or upskilling often have no reliable way to measure how much time they actually spend working versus how much they think they spend. Without data, it's hard to build consistent habits, hit learning goals, or understand where time actually goes.

---

## Target User

A developer (student or professional) who:
- Learns independently (DSA, system design, new frameworks, projects)
- Wants to build consistent daily habits
- Prefers a minimal, distraction-free tool over a complex project management suite
- Is comfortable with a terminal/developer aesthetic

---

## Core Features

### 1. Session Tracking

**Timer Mode**
- Start/stop a live timer to record a focus session
- Select a category and optionally a project before or after timing
- Add notes to the session
- Session is saved when the timer is stopped

**Manual Entry Mode**
- Log a session that already happened (e.g., forgot to start the timer)
- Enter duration directly in hours and minutes
- Select date, category, project, notes
- Accessible via a modal from the Timer view

**Pomodoro Mode**
- 25-minute focused work intervals with 5-minute breaks
- Auto-transitions between work and break phases
- Completed pomodoros are counted and displayed

### 2. Dashboard

The main view shown on login. Contains:

- **Stat cards** — Today's total time, this week's total time, current streak (consecutive days with at least 1 session), and today's session count
- **Goal progress bars** — Visual progress toward daily and weekly time goals
- **Today's activity goals** — Cards showing per-category goal completion for the current day
- **This Week bar chart** — Daily hours for the last 7 days
- **By Category pie chart** — Breakdown of time across categories
- **30-Day trend** — Area chart of daily hours for the last 30 days
- **4-Week trend** — Area chart of weekly totals for the last 4 weeks
- **Projects panel** — Time logged per project, sorted by most time
- **Recent Sessions list** — Last 8 sessions with category, project tag, date, time, and duration. Each session has a delete option.

### 3. Reports View

Historical analysis across all recorded data:
- Filterable by date range and category
- Aggregated totals
- Charts for longer-term trends

### 4. Goals

**Productivity Goals** (in Settings)
- Set a daily target (hours + minutes)
- Set a weekly target (hours + minutes)
- Progress toward these goals is shown on the Dashboard with goal bars

**Activity Goals** (in Settings)
- Per-category daily targets (e.g., "30 min of DSA every weekday")
- Configurable active days (any subset of Sun–Sat)
- Optional browser notification reminder at a specified time if the goal hasn't been met yet
- Toggle enabled/disabled per goal
- Shown on the Dashboard for the current day

### 5. Categories

- Preset categories provided on first sign-in (e.g., DSA, System Design, Projects)
- User can add custom categories with a name and color
- User can delete categories (minimum 1 must remain)
- Each session is tagged with exactly one category

### 6. Projects

- User can create projects with a name and color
- Sessions can optionally be tagged with a project
- Project time totals are shown on the Dashboard

### 7. Data Management (Settings)

- **Backup (JSON)** — Export all data as a downloadable JSON file
- **Export CSV** — Export sessions as a CSV for use in spreadsheets
- **Restore backup** — Import a previously exported JSON file to fully restore data
- **Clear all data** — Wipe all sessions and reset to defaults (with confirmation step)
- Storage size indicator showing how much data is stored
- Auto-backup timestamp tracking via localStorage

### 8. Authentication

- Google OAuth via Firebase Auth
- No email/password — one-click sign-in
- Data is scoped per user (users cannot see each other's data)
- Signing out clears the session; data persists in Firebase

### 9. Notifications

- Browser push notifications for activity goal reminders
- Fires at the configured reminder time if the day's goal for that category is not yet complete
- Permission is requested the first time a goal is added
- Works in supported browsers (Chrome, Edge, Firefox)

---

## Non-Features (Explicit Scope Limits)

The following are intentionally out of scope for the current version:

- **No collaboration** — This is a single-user tool. No teams, no sharing.
- **No mobile app** — Web only. Responsive design is not a stated requirement.
- **No deep linking / URL routing** — Tab navigation does not change the URL.
- **No offline mode** — Requires an internet connection to sync data.
- **No edit session** — Sessions can be deleted but not modified after creation.
- **No dark/light theme toggle** — Always dark.
- **No CSV import** — Import supports JSON backup format only.

---

## User Flows

### First-time User
1. Lands on login screen → clicks "Sign in with Google"
2. Firebase Auth completes → new user node created in RTDB with preset data
3. Redirected to Dashboard → sees empty stat cards and charts
4. Prompted to start a timer or add a manual entry

### Returning User
1. Lands on login screen → clicks "Sign in with Google"
2. Firebase RTDB syncs existing data → Dashboard loads with history
3. User starts timer, works, stops timer → session appears in Recent Sessions

### Deleting a Session
1. User hovers over a row in Recent Sessions on Dashboard
2. Trash icon appears on the right
3. User clicks it → inline "DELETE? YES / NO" confirmation appears
4. User clicks YES → session removed from Firebase and UI instantly

### Adding an Activity Goal
1. User goes to Settings → Activity Goals & Reminders
2. Clicks "NEW GOAL"
3. Selects activity (category), sets daily target duration, sets reminder time, selects active days
4. Clicks "SAVE GOAL"
5. Goal appears in the list and on the Dashboard for today if it's an active day

---

## Data Model Summary

| Entity        | Key Fields                                                         |
|---------------|--------------------------------------------------------------------|
| Entry/Session | id, date, categoryId, project, duration (seconds), notes, manual, createdAt |
| Category      | id, name, color, icon                                              |
| Project       | id, name, color                                                    |
| Goals         | daily (seconds), weekly (seconds)                                  |
| ActivityGoal  | id, categoryId, targetSeconds, reminderTime, days[], enabled       |

---

## Success Metrics (Personal Tool)

Since this is a personal tool with no analytics infrastructure, success is measured informally:

- User logs at least one session per day for 7+ consecutive days (streak)
- Daily and weekly goal bars consistently reach 100%
- Activity goals for target categories are completed on scheduled days
- Data is backed up periodically and can be restored without data loss

---

## Future Improvements (Potential Backlog)

- Edit session (modify duration, category, notes after creation)
- Session tags / labels beyond category and project
- Heatmap calendar view (GitHub-style contribution graph)
- Weekly email/digest summary
- Mobile-responsive layout
- Dark/light theme toggle
- CSV import support
- Multiple timers running simultaneously

# 365-Day Plan Integration

## New files — copy these into your repo

| File | Destination |
|---|---|
| `curriculum365.js` | `src/data/curriculum365.js` |
| `DailyPlanView.jsx` | `src/views/DailyPlanView.jsx` |
| `useMissionEngine.js` | `src/hooks/useMissionEngine.js` *(replace the previous one)* |

`curriculum.js`, `missionEngine.js`, `ReadinessPanel.jsx` stay the same — copy them if you haven't already.

---

## `src/data/constants.js`

Make `dailyPlan` the **first** item in `CONSISTENCY_NAV_ITEMS` (adds a new entry, rename whatever you called dailyMission if you already added it, or keep both):

```js
export const CONSISTENCY_NAV_ITEMS = [
  { id: "dailyPlan",     label: "Daily Plan"     },   // ← NEW — main landing page
  { id: "dailyMission",  label: "Daily Mission"  },   // existing
  { id: "planner",       label: "Daily Planner"  },
  ...
];
```

---

## `src/components/Header.jsx`

Add `CalendarDays` icon for the new entry:

```js
const CONSISTENCY_ICONS = {
  dailyPlan:    CalendarDays,   // ← add
  dailyMission: Rocket,
  ...
};
```

(`CalendarDays` is already imported from lucide-react if your planner uses it.)

---

## `src/App.jsx`

### 1. Import the new view

```js
import { DailyPlanView } from "./views/DailyPlanView";
```

### 2. Add to VIEW_MAP

```js
const VIEW_MAP = {
  dashboard:   Dashboard,
  dailyPlan:   DailyPlanView,   // ← add — make it the default for consistency
  dailyMission: DailyMissionView,
  ...
};
```

### 3. Pass engine props into shared props

If you did the previous integration, `useMissionEngine` already provides all props.
The new props `DailyPlanView` needs are:

```js
// these already exist from useMissionEngine:
markDayComplete: engine.markDayComplete,
isDayComplete:   engine.isDayComplete,
```

Add them to `sharedProps` alongside the existing engine props:

```js
const sharedProps = {
  ...existingProps,
  // engine (already added previously):
  todayTopics:      engine.todayTopics,
  revisionTopics:   engine.revisionTopics,
  bonus:            engine.bonus,
  readiness:        engine.readiness,
  progress:         engine.progress,
  markComplete:     engine.markComplete,
  markIncomplete:   engine.markIncomplete,
  addDSA:           engine.addDSA,
  addGithubCommits: engine.addGithubCommits,
  // NEW:
  markDayComplete:  engine.markDayComplete,
  isDayComplete:    engine.isDayComplete,
  engineState:      engine.engineState,
};
```

---

## Make Daily Plan the default Consistency landing page

In App.jsx, find where you handle the default view for Consistency (likely where clicking "Consistency" in the header sets the view). Change the default from whatever it was to `"dailyPlan"`.

Or in Header.jsx, if clicking the "Consistency" header item (not a sub-item) navigates somewhere, point it to `"dailyPlan"`.

---

## How it works

- `getTodayPlan()` in `curriculum365.js` computes `Math.floor((today - 2026-07-01) / 86400000)` and returns the matching row from `PLAN_365`. No state needed — pure date math.
- The "Mark Day Complete" button writes to `users/{uid}/missionEngine.completedDays[dayNum]`, which Firebase syncs.
- Each track card has its own local checkbox for within-session tracking of individual tracks — this isn't persisted (intentionally lightweight for v1).
- Year progress ring fills based on elapsed days since July 1 2026.
- DSA / GitHub counts persist to Firebase via `addDSA` / `addGithubCommits` (same as before).

---

## Test checklist

1. Open Daily Plan — should show Day N / 365, today's stage name, and 4 track cards with today's tasks.
2. Check the day type: Monday–Saturday shows "60 min / 45 min / 45 min / 30 min"; Sunday shows "90 / 75 / 75 / 60".
3. Mark individual tracks done (local checkboxes go green).
4. Click "Mark Day Complete" — confetti fires, banner appears.
5. Refresh — "Day X Complete" persists (Firebase sync confirmed).
6. Log DSA and commits, refresh, confirm readiness panel updated.

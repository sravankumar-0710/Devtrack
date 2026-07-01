# DevTrack — AI Rules

This file tells any AI assistant (Claude, Copilot, Cursor, etc.) everything it needs to know to work on this codebase safely and consistently. Read this before touching any file.

---

## Project Identity

- **Name:** DevTrack
- **Purpose:** Personal productivity and learning time tracker for developers
- **Stack:** React 18 + Vite 5 + Firebase Realtime Database + Firebase Auth (Google OAuth)
- **Deployed:** Vercel — https://devtrack-mu.vercel.app
- **Repo:** https://github.com/sravankumar-0710/Devtrack
- **Single branch:** `main` — every push auto-deploys

---

## Absolute Rules (Never Break These)

### 1. Never introduce a router
There is no React Router and no URL-based navigation. Views are switched by `setView(name)` in `App.jsx` using a `VIEW_MAP` object. Do not add `react-router-dom` or any routing library. Do not change the URL on navigation.

### 2. Never add a global state library
There is no Redux, Zustand, Jotai, Context, or any global state. All state lives in `App.jsx` and flows down as props. If a feature needs new state, add it to `useFirebaseData.js` and thread it through `sharedProps` in `App.jsx`. Do not create a context provider.

### 3. Never use Firestore — always use Realtime Database
The project uses `firebase/database` (`getDatabase`, `ref`, `onValue`, `set`). Do not import from `firebase/firestore`. All data paths follow `users/{uid}/...`.

### 4. Never store arrays directly in Firebase
Firebase Realtime Database does not support native arrays reliably. Always convert arrays to `{ id: object }` maps using `arrayToObject()` before writing, and convert back with `Object.values()` on read. This function already exists in `useFirebaseData.js` — use it.

```js
// WRONG
set(ref(db, `users/${uid}/entries`), entriesArray);

// CORRECT
set(ref(db, `users/${uid}/entries`), arrayToObject(entriesArray));
```

### 5. Never add CSS files or CSS modules
All styling is done with inline `style={{}}` objects directly in JSX. Do not create `.css`, `.module.css`, or `.scss` files. Do not add Tailwind, styled-components, or any CSS-in-JS library. The only exception is `src/styles/global.css` which already exists for minimal resets.

### 6. Never add a new dependency without a strong reason
The project intentionally has a minimal dependency footprint. Before adding any `npm` package, ask: can this be done with what's already installed? Existing libraries: React, Vite, Firebase, Recharts, Lucide React. Do not add date libraries (use native `Date`), animation libraries, form libraries, or UI component kits.

### 7. Never hardcode data in views
All domain data (categories, projects, goals, entries) comes from `useFirebaseData`. Do not hardcode category names, colors, or any user-facing data in view files. Constants (preset defaults) live in `src/data/constants.js`.

### 8. Never bypass the `deleteEntry` → Firebase write chain
Deleting an entry must go through `deleteEntry(id)` in `useFirebaseData.js`, which updates both React state and Firebase atomically. Do not manipulate `entries` state directly in a view or component.

---

## Code Style Rules

### File and Component Conventions
- One component per file for views; utility components can be co-located in the same file (see how `SettingsView` sections are all in `EntryLog.jsx`)
- Named exports only — no default exports except `App.jsx`
- File names match their primary exported component exactly

### Inline Styles
- Always use inline style objects: `style={{ property: value }}`
- Colors come from the established palette (see Color System below)
- Never use string class names — there is no CSS class system

### Colors — Use These Exactly

| Token         | Hex       | Used For                        |
|---------------|-----------|---------------------------------|
| Background    | `#0A0A0F` | Page background                 |
| Surface       | `#1E293B` | Cards, tooltips                 |
| Border soft   | `rgba(255,255,255,0.06)` | Card borders         |
| Border medium | `rgba(255,255,255,0.1)`  | Input borders        |
| Text primary  | `#E2E8F0` | Main body text                  |
| Text muted    | `#94A3B8` | Secondary text                  |
| Text faint    | `#64748B` | Labels, section headers         |
| Text dimmed   | `#475569` | Disabled / placeholder          |
| Green accent  | `#6EE7B7` | Primary actions, success, today |
| Blue accent   | `#93C5FD` | Week stats, secondary           |
| Yellow accent | `#FCD34D` | Streak, warnings, reminders     |
| Red accent    | `#FCA5A5` | Errors, delete actions          |
| Purple accent | `#C4B5FD` | Monthly trend                   |
| Orange accent | `#FB923C` | Palette option                  |

### Typography
- Font: `'DM Mono', 'Fira Code', monospace` (loaded via Google Fonts in `App.jsx`)
- Section labels: `fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#64748B"`
- Body text: `fontSize: 13, color: "#E2E8F0"`
- Small labels: `fontSize: 10-11, color: "#475569"`
- Never use serif or sans-serif fonts

### Icons
- Use `lucide-react` exclusively. Import only what's needed per file.
- Standard icon size: `size={13}` for inline/button icons, `size={16}` for section headers
- Delete actions always use `<Trash2 />`
- Never import from `@heroicons`, `react-icons`, or any other icon library

### Delete / Destructive Action Pattern
All destructive buttons must follow this pattern (already established in categories, projects, and session rows):

```jsx
<button
  onClick={() => handleDelete(id)}
  style={{
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#475569",
    padding: 4,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    transition: "color 0.15s",
  }}
  onMouseEnter={(e) => e.currentTarget.style.color = "#FCA5A5"}
  onMouseLeave={(e) => e.currentTarget.style.color = "#475569"}
  title="Delete [thing]"
>
  <Trash2 size={13} />
</button>
```

For actions with irreversible consequences, add an inline confirmation step (see `SessionRow` in `Dashboard.jsx` for the YES/NO pattern).

---

## Data Rules

### Entry / Session Shape
```js
{
  id:         string,          // Date.now().toString() — generated in addEntry()
  date:       string,          // "YYYY-MM-DD"
  categoryId: string,          // FK → categories[].id
  project:    string | null,   // FK → projects[].id, optional
  duration:   number,          // seconds (integer)
  notes:      string,          // optional, can be ""
  manual:     boolean,         // true if added via manual entry form
  createdAt:  string,          // ISO 8601 datetime string
}
```

### IDs
All IDs are `Date.now().toString()`. Never use `Math.random()`, `uuid`, or any other ID strategy. Collision risk is negligible for a single-user tool.

### Dates
Dates are stored as `"YYYY-MM-DD"` strings. The `today()` helper in `src/utils/helpers.js` returns today's date in this format. Use it — never construct date strings manually.

```js
import { today } from "../utils/helpers";
const date = today(); // "2025-01-15"
```

### Duration
All durations are stored in **seconds** as integers. Display formatting is done by `fmtDuration(seconds)` from `src/utils/helpers.js`. Never store durations in minutes or hours.

---

## Mutation Rules

All data mutations follow this pattern in `useFirebaseData.js`:

1. Compute the new array/object
2. Set React state immediately (optimistic update)
3. Write to Firebase

```js
const deleteEntry = (id) => {
  const updated = entries.filter((e) => e.id !== id);
  setEntries(updated);        // step 2: optimistic UI update
  saveEntries(updated);       // step 3: write to Firebase
};
```

When adding a new mutation:
- Follow this exact pattern
- Export the function from `useFirebaseData`
- Destructure it in `App.jsx`
- Optionally wrap it with `showNotif()` in `App.jsx`
- Add it to `sharedProps`
- Pass it as a prop to the view that needs it

---

## What Files to Touch for Common Tasks

| Task | Files to Edit |
|------|---------------|
| Add a new session field | `useFirebaseData.js` (addEntry shape) + the form component in TimerView |
| Add a new data type (like "tags") | `useFirebaseData.js` + `App.jsx` (sharedProps) + relevant view |
| Add a new dashboard chart | `Dashboard.jsx` + `src/utils/helpers.js` (chart data builder) |
| Add a new settings section | `src/views/SettingsView.jsx` (or co-located in `EntryLog.jsx`) |
| Add a new tab/view | `App.jsx` (VIEW_MAP + sharedProps) + new file in `src/views/` + `Header.jsx` |
| Fix a style | Only the component file — no global CSS to touch |
| Change default categories/projects | `src/data/constants.js` only |

---

## What Not to Do

- Do not add `useEffect` to views — side effects belong in hooks
- Do not `console.log` in production code — remove before committing
- Do not add loading spinners for individual mutations — writes are optimistic
- Do not add error boundaries — the app is simple enough that errors surface naturally
- Do not split `App.jsx` into smaller files — it is intentionally the single orchestrator
- Do not use `async/await` with Firebase `set()` — fire-and-forget is intentional
- Do not add TypeScript — the project is plain JavaScript
- Do not rename the `sharedProps` pattern — it is referenced throughout the codebase

---

## Testing Checklist (Manual — No Test Suite)

Before pushing any change, verify:

1. **Add a session** via timer and via manual entry — both appear in Recent Sessions
2. **Delete a session** — disappears from UI and does not reappear on refresh
3. **Sign out and sign back in** — all data is still present (Firebase sync works)
4. **Open two browser tabs** — a change in one appears in the other within 1–2 seconds
5. **Add a category** — appears in the category dropdown when adding a session
6. **Delete a category** — removed from the list; existing sessions retain their `categoryId` (orphaned display as "Unknown")
7. **Set a goal** — progress bars on Dashboard update correctly
8. **Export JSON backup → Clear all data → Restore backup** — all data returns exactly as before

---

## Firebase Project Reference

| Setting | Value |
|---------|-------|
| Project ID | `devtrack-a3e61` |
| Auth domain | `devtrack-a3e61.firebaseapp.com` |
| Database URL | `https://devtrack-a3e61-default-rtdb.firebaseio.com` |
| App ID | `1:1071905082327:web:96a9efd32878c041b65992` |
| Auth provider | Google (OAuth 2.0) |

The Firebase config is in `src/firebase.js`. Do not move it or split it. Do not add environment variable handling — the config is intentionally public (client-side Firebase apps always expose their config).

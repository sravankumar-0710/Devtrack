# DevTrack

DevTrack is a personal productivity and study tracker I built to see how much time I actually spend studying and coding, instead of just guessing. You sign in with Google, start a timer when you sit down to work, and it keeps track of everything from there - streaks, goals, and a 365 day study plan.

Live link: https://devtrack-mu.vercel.app

## What it does

- **Timer** - press start when you start studying, press stop when you're done. Also has a manual entry if you forget to start it, and a Pomodoro mode (25 min work / 5 min break)
- **Dashboard** - shows today's time, this week's time, your streak, some charts (bar chart / pie chart / trend lines), recent sessions
- **365 Day Plan** - I made a big curriculum plan split across 365 days (Foundations / Web / DSA / Projects tracks). You can mark days done, and there's a page called "All Days" where you can filter by All / Done / Missed / Upcoming so you can see what you fell behind on
- **Missed tasks on Dashboard** - this was the newest thing I added. If you have days in the plan that are in the past and you never marked them done, the Dashboard now shows a "MISSED" stat plus a callout listing which days you missed, so you don't have to go dig through the All Days page to find out you're behind
- **Goals** - set a daily/weekly time goal, and per-category goals too (like "30 min DSA every day"), with a reminder notification if you haven't hit it yet
- **Categories & Projects** - tag your sessions so you know where your time actually goes
- **Backup/export** - you can export your data as JSON or CSV, and restore from a JSON backup if something breaks
- **Google Sign-in** - no passwords, just Google login through Firebase

## Built with

- React + Vite
- Firebase (Auth + Realtime Database)
- Recharts for the graphs
- lucide-react for icons
- Deployed on Vercel

## Running it yourself

1. Clone it

```
git clone https://github.com/sravankumar-0710/Devtrack.git
cd Devtrack
npm install
```

2. You'll need your own Firebase project (turn on Auth with Google provider + Realtime Database). Put your config in `src/firebase.js`, something like:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

3. Run it

```
npm run dev
```

That should start it up on localhost. To build for production it's just `npm run build`.

## Project folder

- `src/views` - the actual pages (Dashboard, Timer, AllDaysView, Settings etc)
- `src/components` - smaller reusable pieces
- `src/hooks` - stuff like useAuth, useTimer, useMissionEngine (this one runs the 365 day plan logic)
- `src/data` - the curriculum data + constants
- `docs/` - I wrote up a PRD and some architecture notes if you want more detail, check `docs/prd.md`


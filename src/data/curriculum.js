/**
 * curriculum.js — the single source of truth for the 12-month plan.
 *
 * This is PLACEHOLDER data shaped exactly like your real curriculum will be.
 * When you send the real content, replace the `CURRICULUM` array below —
 * nothing else in the engine, views, or dashboard needs to change, because
 * everything downstream only reads this shape.
 *
 * Shape:
 * CURRICULUM = [
 *   {
 *     month: 1,
 *     title: "Programming Foundations",
 *     track: "fullstack" | "dsa" | "coreCS" | "aiml" | "placement",
 *     weeks: [
 *       {
 *         week: 1,
 *         topics: [
 *           {
 *             id: "unique-id",
 *             concept: "Closures",
 *             estMinutes: 45,
 *             build: "Build a counter using closures",       // optional
 *             practice: { topic: "Arrays", difficulty: "Easy", count: 3 }, // optional, DSA
 *             assess: "mini quiz" | "debugging challenge" | "interview question" | "project review" | null,
 *           },
 *           ...
 *         ]
 *       },
 *       ...
 *     ]
 *   },
 *   ...
 * ]
 */

export const CURRICULUM = [
  {
    month: 1,
    title: "Programming Foundations",
    track: "fullstack",
    weeks: [
      {
        week: 1,
        topics: [
          { id: "m1w1t1", concept: "Variables, Types & Operators", estMinutes: 40,
            build: "Build a unit converter (temp, currency, length)",
            practice: { topic: "Arrays", difficulty: "Easy", count: 3 } },
          { id: "m1w1t2", concept: "Control Flow & Loops", estMinutes: 40,
            build: "Build a number-guessing game",
            practice: { topic: "Strings", difficulty: "Easy", count: 3 } },
          { id: "m1w1t3", concept: "Functions & Scope", estMinutes: 45,
            build: "Refactor previous build into reusable functions",
            assess: "mini quiz" },
        ],
      },
      {
        week: 2,
        topics: [
          { id: "m1w2t1", concept: "Closures", estMinutes: 45,
            build: "Build a counter using closures",
            practice: { topic: "Arrays", difficulty: "Easy", count: 3 } },
          { id: "m1w2t2", concept: "Event Loop", estMinutes: 40,
            practice: { topic: "Recursion", difficulty: "Easy", count: 2 } },
          { id: "m1w2t3", concept: "Promises & Async/Await", estMinutes: 50,
            build: "Build a weather fetcher using async/await",
            assess: "debugging challenge" },
        ],
      },
    ],
  },
  {
    month: 2,
    title: "Frontend Fundamentals",
    track: "fullstack",
    weeks: [
      {
        week: 1,
        topics: [
          { id: "m2w1t1", concept: "Semantic HTML & Accessibility", estMinutes: 35,
            build: "Build an accessible landing page" },
          { id: "m2w1t2", concept: "CSS Flexbox & Grid", estMinutes: 45,
            build: "Build a responsive navbar",
            practice: { topic: "Strings", difficulty: "Easy", count: 2 } },
        ],
      },
      {
        week: 2,
        topics: [
          { id: "m2w2t1", concept: "React Components & Props", estMinutes: 50,
            build: "Build a card list component",
            practice: { topic: "Hashing", difficulty: "Easy", count: 3 } },
          { id: "m2w2t2", concept: "React State & Hooks", estMinutes: 50,
            build: "Build a login page with form state",
            assess: "project review" },
        ],
      },
    ],
  },
];

// Track labels used by the readiness engine / dashboard
export const TRACKS = {
  fullstack:  "Full Stack Development",
  dsa:        "Data Structures & Algorithms",
  coreCS:     "Core Computer Science",
  aiml:       "AI / Machine Learning",
  placement:  "Placement Preparation",
};

/** Flatten the whole curriculum into one ordered list of topics. */
export function flattenCurriculum(curriculum = CURRICULUM) {
  const out = [];
  curriculum.forEach((m) => {
    m.weeks.forEach((w) => {
      w.topics.forEach((t) => {
        out.push({ ...t, month: m.month, monthTitle: m.title, track: m.track, week: w.week });
      });
    });
  });
  return out;
}

// ─── Career Campaign — 15-level progression toward "Job" ──────────────────────
export const CAREER_LEVELS = [
  "Level 1 · Programming Foundations",
  "Level 2 · Frontend",
  "Level 3 · Backend",
  "Level 4 · Databases",
  "Level 5 · Python",
  "Level 6 · DSA",
  "Level 7 · AI",
  "Level 8 · Machine Learning",
  "Level 9 · Deep Learning",
  "Level 10 · LLMs",
  "Level 11 · Cloud",
  "Level 12 · DevOps",
  "Level 13 · Interview Prep",
  "Level 14 · Placement",
  "Level 15 · Job",
];

// ─── Initial Learning track ─────────────────────────────────────────────────────
export const INITIAL_LEARNING = [
  "CS50",
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Backend",
  "Databases",
  "Python",
  "DSA",
  "AI",
];

// ─── Certification Roadmap presets ─────────────────────────────────────────────
export const CERT_ROADMAP_PRESET = [
  "CS50",
  "Google AI Essentials",
  "IBM SkillsBuild",
  "Cisco Networking Academy",
  "Microsoft Learn",
  "Oracle Academy",
];

// ─── Dashboard quotes ───────────────────────────────────────────────────────────
export const QUOTES = [
  "Consistency beats intensity.",
  "Motivation gets you started. Discipline keeps you going.",
  "Small daily progress compounds into massive results.",
  "Show up even when you don't feel like it.",
  "One percent better every day.",
];

// ─── Field schemas for each Project Consistency database ──────────────────────
export const GOAL_FIELDS = [
  { key: "goal",     label: "Goal",     type: "text" },
  { key: "status",   label: "Status",   type: "select", options: ["Not Started", "In Progress", "Completed"] },
  { key: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High"] },
  { key: "area",     label: "Area",     type: "text" },
  { key: "deadline", label: "Deadline", type: "date" },
  { key: "progress", label: "Progress", type: "progress" },
  { key: "notes",    label: "Notes",    type: "text" },
];

export const CERTIFICATION_FIELDS = [
  { key: "certificate", label: "Certificate", type: "text" },
  { key: "provider",    label: "Provider",    type: "text" },
  { key: "status",      label: "Status",      type: "select", options: ["Not Started", "In Progress", "Completed"] },
  { key: "startDate",   label: "Start Date",  type: "date" },
  { key: "endDate",     label: "End Date",    type: "date" },
  { key: "credential",  label: "Credential",  type: "text" },
];

export const RESOURCE_FIELDS = [
  { key: "resource", label: "Resource", type: "text" },
  { key: "type",     label: "Type",     type: "select", options: ["Course", "Video", "Book", "Article", "Docs", "Repo"] },
  { key: "link",     label: "Link",     type: "text" },
  { key: "status",   label: "Status",   type: "select", options: ["To Start", "In Progress", "Done"] },
];

export const NOTE_FIELDS = [
  { key: "title",   label: "Title",   type: "text" },
  { key: "subject", label: "Subject", type: "text" },
  { key: "tags",    label: "Tags (comma separated)", type: "text" },
  { key: "content", label: "Content", type: "textarea" },
];

export const HABIT_FIELDS = [
  { key: "habit",          label: "Habit",          type: "text" },
  { key: "frequency",      label: "Frequency",      type: "select", options: ["Daily", "Weekly"] },
  { key: "currentStreak",  label: "Current Streak", type: "number" },
  { key: "longestStreak",  label: "Longest Streak", type: "number" },
];

export const ROADMAP_FIELDS = [
  { key: "item",     label: "Item",     type: "text" },
  { key: "stage",    label: "Stage",    type: "select", options: CAREER_LEVELS },
  { key: "status",   label: "Status",   type: "select", options: ["Not Started", "In Progress", "Completed"] },
  { key: "progress", label: "Progress", type: "progress" },
];

export const PLACEMENT_FIELDS = [
  { key: "task",     label: "Task",     type: "text" },
  { key: "category", label: "Category", type: "select", options: ["LeetCode", "Resume", "Portfolio", "Interview Prep", "Applications", "GitHub"] },
  { key: "status",   label: "Status",   type: "select", options: ["Not Started", "In Progress", "Completed"] },
  { key: "deadline", label: "Deadline", type: "date" },
];

// ─── Projects database — 💻 Projects ────────────────────────────────────────
export const DEV_PROJECT_FIELDS = [
  { key: "project",    label: "Project",    type: "text" },
  { key: "status",     label: "Status",     type: "select", options: ["Idea", "Not Started", "In Progress", "Completed"] },
  { key: "difficulty", label: "Difficulty", type: "select", options: ["Beginner", "Intermediate", "Advanced"] },
  { key: "techStack",  label: "Tech Stack", type: "text" },
  { key: "startDate",  label: "Start Date", type: "date" },
  { key: "endDate",    label: "End Date",   type: "date" },
  { key: "progress",   label: "Progress",   type: "progress" },
  { key: "github",     label: "GitHub",     type: "text" },
];

// ─── Study Sessions database — 🧠 Study Sessions ────────────────────────────
export const STUDY_SESSION_FIELDS = [
  { key: "session",   label: "Session",   type: "text" },
  { key: "date",      label: "Date",      type: "date" },
  { key: "subject",   label: "Subject",   type: "text" },
  { key: "duration",  label: "Duration (min)", type: "number" },
  { key: "focus",     label: "Focus",     type: "select", options: ["Deep Work", "Review", "Practice", "Reading", "Project Work"] },
  { key: "completed", label: "Completed", type: "select", options: ["No", "Yes"] },
];

// ─── Daily Planner — 📅 Daily Planner ───────────────────────────────────────
export const DAILY_TASK_FIELDS = [
  { key: "task",     label: "Task",     type: "text" },
  { key: "date",     label: "Date",     type: "date" },
  { key: "timeSlot", label: "Time Slot", type: "select", options: ["Morning (7-9AM)", "College (9-4PM)", "Evening (7-9PM)", "Night (9-11PM)", "Weekend Block"] },
  { key: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High"] },
  { key: "status",   label: "Status",   type: "select", options: ["Not Started", "In Progress", "Completed"] },
];

// ─── Weekly Review ───────────────────────────────────────────────────────────
export const WEEKLY_REVIEW_FIELDS = [
  { key: "weekOf",            label: "Week Of",                 type: "date" },
  { key: "hoursStudied",      label: "Hours Studied",           type: "number" },
  { key: "targetAchieved",    label: "Target Achieved",         type: "select", options: ["No", "Yes"] },
  { key: "certsCompleted",    label: "Certificates Completed",  type: "number" },
  { key: "projectsCompleted", label: "Projects Completed",      type: "number" },
  { key: "leetcodeSolved",    label: "LeetCode Solved",         type: "number" },
  { key: "wins",              label: "Wins",                    type: "textarea" },
  { key: "improvements",      label: "Improvements",            type: "textarea" },
  { key: "planNextWeek",      label: "Plan For Next Week",      type: "textarea" },
];

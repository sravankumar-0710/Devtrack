/**
 * curriculumResources.js — the reference resources named in the 365-day
 * curriculum for each subject area, plus the AI/ML-track providers used in
 * Volume 5. This is the platform list to pull "N exercises" / "solve N
 * problems" from when a day doesn't spell out a specific link.
 */

export const CURRICULUM_RESOURCES = [
  {
    category: "HTML & CSS",
    color: "#93C5FD",
    items: [
      { name: "MDN Web Docs", note: "Reference for HTML & CSS syntax and behavior", url: "https://developer.mozilla.org" },
      { name: "freeCodeCamp — Responsive Web Design", note: "Primary certification course for Volume 1", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/" },
    ],
  },
  {
    category: "JavaScript",
    color: "#FCD34D",
    items: [
      { name: "JavaScript.info", note: "Deep-dive tutorial for daily Learn sections", url: "https://javascript.info" },
      { name: "MDN JavaScript Reference", note: "Language & API reference", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
      { name: "freeCodeCamp — JavaScript Algorithms & Data Structures", note: "Certification course for Volume 2–4", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/" },
    ],
  },
  {
    category: "DSA",
    color: "#6EE7B7",
    items: [
      { name: "Hello Algo", note: "Free DSA concepts & visual explanations", url: "https://www.hello-algo.com" },
      { name: "VisuAlgo", note: "Visualize how each data structure/algorithm works", url: "https://visualgo.net" },
      { name: "LeetCode", note: "Where the daily DSA problem target gets solved", url: "https://leetcode.com" },
      { name: "HackerRank", note: "Alternate practice source for DSA problems", url: "https://www.hackerrank.com" },
    ],
  },
  {
    category: "Git & GitHub",
    color: "#C4B5FD",
    items: [
      { name: "GitHub Skills", note: "Interactive Git/GitHub courses, incl. GitHub Foundations", url: "https://skills.github.com" },
    ],
  },
  {
    category: "Backend (Volume 4)",
    color: "#FB923C",
    items: [
      { name: "SQLBolt", note: "Interactive SQL lessons", url: "https://sqlbolt.com" },
      { name: "MongoDB University", note: "Free MongoDB courses & certification", url: "https://learn.mongodb.com" },
      { name: "Postman API Fundamentals", note: "API design & testing course", url: "https://academy.postman.com" },
      { name: "OWASP Top 10", note: "Web security fundamentals", url: "https://owasp.org/www-project-top-ten/" },
      { name: "Docker — Getting Started", note: "Containers basics", url: "https://docs.docker.com/get-started/" },
      { name: "Redis University", note: "Free Redis courses", url: "https://university.redis.com" },
    ],
  },
  {
    category: "AI / Machine Learning (Volume 5)",
    color: "#F472B6",
    items: [
      { name: "Kaggle — Intro/Intermediate ML, Deep Learning, Computer Vision, NLP, AI Ethics", note: "6 free micro-certifications", url: "https://www.kaggle.com/learn" },
      { name: "Google Machine Learning Crash Course", note: "Free ML fundamentals course from Google", url: "https://developers.google.com/machine-learning/crash-course" },
      { name: "Hugging Face NLP / Transformers Course", note: "Free course at huggingface.co/learn", url: "https://huggingface.co/learn" },
      { name: "fast.ai — Practical Deep Learning for Coders", note: "Project-first parallel track", url: "https://course.fast.ai" },
      { name: "Microsoft Learn — Intro to AI in Azure", note: "Content only; AI-900 exam optional", url: "https://learn.microsoft.com/training/" },
      { name: "Google Cloud Skills Boost — ML content", note: "Content only; Professional ML Engineer exam optional", url: "https://www.cloudskillsboost.google" },
    ],
  },
  {
    category: "Core CS (Volume 6)",
    color: "#38BDF8",
    items: [
      { name: "Linux Journey", note: "Free Linux fundamentals course", url: "https://linuxjourney.com" },
      { name: "Refactoring Guru", note: "Design patterns reference", url: "https://refactoring.guru" },
    ],
  },
];

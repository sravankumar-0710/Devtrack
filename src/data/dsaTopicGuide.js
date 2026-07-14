/**
 * dsaTopicGuide.js — maps every raw DSA topic string used across the
 * 365-day curriculum to a canonical topic, a suggested difficulty
 * (Easy / Medium / Hard / Mixed), and real, working links to go practice it.
 *
 * IMPORTANT: these are links to a *filtered problem list* (LeetCode search /
 * HackerRank domain page), not links to individual named problems. There's
 * no reliable way to guarantee an exact problem-by-problem mapping for 365
 * days without risking broken or wrong links, so this gives you a curated
 * starting point per topic instead — open it, then use LeetCode's own
 * Easy/Medium/Hard filter alongside the suggested difficulty below.
 */

export const LEETCODE_SEARCH_BASE = 'https://leetcode.com/problemset/?search=';
export const HR_DATA_STRUCTURES = 'https://www.hackerrank.com/domains/data-structures';
export const HR_ALGORITHMS = 'https://www.hackerrank.com/domains/algorithms';

// canonical topic -> { leetcodeUrl, hackerrankUrl } (null fields mean no reliable direct link)
export const DSA_TOPIC_LINKS = {
  'Big O Notation': { leetcodeUrl: null, hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Arrays': { leetcodeUrl: "https://leetcode.com/problemset/?search=Array", hackerrankUrl: "https://www.hackerrank.com/domains/data-structures" },
  'Hash Table': { leetcodeUrl: "https://leetcode.com/problemset/?search=Hash%20Table", hackerrankUrl: "https://www.hackerrank.com/domains/data-structures" },
  'Two Pointers': { leetcodeUrl: "https://leetcode.com/problemset/?search=Two%20Pointers", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Sliding Window': { leetcodeUrl: "https://leetcode.com/problemset/?search=Sliding%20Window", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Prefix Sum': { leetcodeUrl: "https://leetcode.com/problemset/?search=Prefix%20Sum", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Binary Search': { leetcodeUrl: "https://leetcode.com/problemset/?search=Binary%20Search", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Linear Search': { leetcodeUrl: "https://leetcode.com/problemset/?search=Linear%20Search", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Sorting Algorithms': { leetcodeUrl: "https://leetcode.com/problemset/?search=Sorting", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Merge Sort': { leetcodeUrl: "https://leetcode.com/problemset/?search=Merge%20Sort", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Quicksort': { leetcodeUrl: "https://leetcode.com/problemset/?search=Quicksort", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Strings': { leetcodeUrl: "https://leetcode.com/problemset/?search=String", hackerrankUrl: "https://www.hackerrank.com/domains/data-structures" },
  'String Matching (KMP)': { leetcodeUrl: "https://leetcode.com/problemset/?search=String%20Matching", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Stack': { leetcodeUrl: "https://leetcode.com/problemset/?search=Stack", hackerrankUrl: "https://www.hackerrank.com/domains/data-structures" },
  'Queue': { leetcodeUrl: "https://leetcode.com/problemset/?search=Queue", hackerrankUrl: "https://www.hackerrank.com/domains/data-structures" },
  'Recursion': { leetcodeUrl: "https://leetcode.com/problemset/?search=Recursion", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Backtracking': { leetcodeUrl: "https://leetcode.com/problemset/?search=Backtracking", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Linked List': { leetcodeUrl: "https://leetcode.com/problemset/?search=Linked%20List", hackerrankUrl: "https://www.hackerrank.com/domains/data-structures" },
  'Binary Search Tree': { leetcodeUrl: "https://leetcode.com/problemset/?search=Binary%20Search%20Tree", hackerrankUrl: "https://www.hackerrank.com/domains/data-structures" },
  'Binary Tree': { leetcodeUrl: "https://leetcode.com/problemset/?search=Binary%20Tree", hackerrankUrl: "https://www.hackerrank.com/domains/data-structures" },
  'Trie': { leetcodeUrl: "https://leetcode.com/problemset/?search=Trie", hackerrankUrl: "https://www.hackerrank.com/domains/data-structures" },
  'Heap / Priority Queue': { leetcodeUrl: "https://leetcode.com/problemset/?search=Heap", hackerrankUrl: "https://www.hackerrank.com/domains/data-structures" },
  'Segment Tree / Fenwick Tree': { leetcodeUrl: "https://leetcode.com/problemset/?search=Segment%20Tree", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Graph Traversal (BFS/DFS)': { leetcodeUrl: "https://leetcode.com/problemset/?search=Graph%20BFS%20DFS", hackerrankUrl: "https://www.hackerrank.com/domains/data-structures" },
  'Shortest Path (Dijkstra)': { leetcodeUrl: "https://leetcode.com/problemset/?search=Shortest%20Path", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Minimum Spanning Tree': { leetcodeUrl: "https://leetcode.com/problemset/?search=Minimum%20Spanning%20Tree", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Union Find': { leetcodeUrl: "https://leetcode.com/problemset/?search=Union%20Find", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Topological Sort': { leetcodeUrl: "https://leetcode.com/problemset/?search=Topological%20Sort", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Strongly Connected Components': { leetcodeUrl: "https://leetcode.com/problemset/?search=Strongly%20Connected%20Components", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Graph Algorithms': { leetcodeUrl: "https://leetcode.com/problemset/?search=Graph", hackerrankUrl: "https://www.hackerrank.com/domains/data-structures" },
  'Dynamic Programming': { leetcodeUrl: "https://leetcode.com/problemset/?search=Dynamic%20Programming", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Greedy Algorithms': { leetcodeUrl: "https://leetcode.com/problemset/?search=Greedy", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Intervals': { leetcodeUrl: "https://leetcode.com/problemset/?search=Intervals", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Bit Manipulation': { leetcodeUrl: "https://leetcode.com/problemset/?search=Bit%20Manipulation", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Sweep Line': { leetcodeUrl: "https://leetcode.com/problemset/?search=Sweep%20Line", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Interview / Contest Practice': { leetcodeUrl: "https://leetcode.com/problemset/?search=Top%20Interview%20Questions", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Mixed Practice': { leetcodeUrl: "https://leetcode.com/problemset/?search=Easy", hackerrankUrl: "https://www.hackerrank.com/domains/algorithms" },
  'Mixed Review Practice': { leetcodeUrl: null, hackerrankUrl: null },
};

const CATEGORY_RULES = [
  { keys: ["no dsa today"], term: null },
  { keys: ["what is an algorithm", "what is a data structure", "big o", "time complexity", "o(1)", "o(n)"], term: "Big O Notation", base: "Easy" },
  { keys: ["array"], term: "Arrays", base: "Easy" },
  { keys: ["hashing", "frequency counting"], term: "Hash Table", base: "Easy" },
  { keys: ["two pointer"], term: "Two Pointers", base: "Easy" },
  { keys: ["sliding window"], term: "Sliding Window", base: "Medium" },
  { keys: ["prefix sum"], term: "Prefix Sum", base: "Medium" },
  { keys: ["binary search"], term: "Binary Search", base: "Easy" },
  { keys: ["linear search", "search"], term: "Linear Search", base: "Easy" },
  { keys: ["bubble sort", "insertion sort", "selection sort", "sorting introduction", "sorting comparison"], term: "Sorting Algorithms", base: "Easy" },
  { keys: ["merge sort"], term: "Merge Sort", base: "Medium" },
  { keys: ["quick sort"], term: "Quicksort", base: "Medium" },
  { keys: ["string"], term: "Strings", base: "Easy" },
  { keys: ["kmp"], term: "String Matching (KMP)", base: "Hard" },
  { keys: ["stack"], term: "Stack", base: "Easy" },
  { keys: ["queue"], term: "Queue", base: "Easy" },
  { keys: ["recursion"], term: "Recursion", base: "Medium" },
  { keys: ["backtracking", "n-queens", "sudoku"], term: "Backtracking", base: "Medium" },
  { keys: ["linked list", "reverse linked list"], term: "Linked List", base: "Easy" },
  { keys: ["bst ", "binary search tree"], term: "Binary Search Tree", base: "Medium" },
  { keys: ["binary tree", "tree traversal", "inorder", "postorder", "preorder", "tree problems", "trees introduction", "trees basics", "tree revision", "trees revision", "advanced trees", "balanced trees", "trees"], term: "Binary Tree", base: "Medium" },
  { keys: ["trie"], term: "Trie", base: "Medium" },
  { keys: ["heap", "priority queue"], term: "Heap / Priority Queue", base: "Medium" },
  { keys: ["segment tree", "fenwick"], term: "Segment Tree / Fenwick Tree", base: "Hard" },
  { keys: ["graph traversal", "bfs", "dfs", "graph basics", "graph introduction", "graph representation"], term: "Graph Traversal (BFS/DFS)", base: "Medium" },
  { keys: ["dijkstra", "shortest path"], term: "Shortest Path (Dijkstra)", base: "Hard" },
  { keys: ["minimum spanning tree", "mst"], term: "Minimum Spanning Tree", base: "Hard" },
  { keys: ["union find", "disjoint set"], term: "Union Find", base: "Medium" },
  { keys: ["topological sort"], term: "Topological Sort", base: "Medium" },
  { keys: ["strongly connected", "scc"], term: "Strongly Connected Components", base: "Hard" },
  { keys: ["graph"], term: "Graph Algorithms", base: "Medium" },
  { keys: ["dynamic programming", "dp ", "dp basics", "dp optimization", "dp problems", "dp on strings", "longest increasing subsequence"], term: "Dynamic Programming", base: "Hard" },
  { keys: ["greedy"], term: "Greedy Algorithms", base: "Medium" },
  { keys: ["interval", "meeting room", "merge interval", "non-overlapping"], term: "Intervals", base: "Medium" },
  { keys: ["bit manipulation", "bitwise"], term: "Bit Manipulation", base: "Medium" },
  { keys: ["sweep line"], term: "Sweep Line", base: "Hard" },
  { keys: ["mock interview", "mock coding", "timed", "contest-style", "interview problem", "interview pattern", "company tagged", "concurrency-style", "scheduling-style"], term: "Interview / Contest Practice", base: "Hard" },
  { keys: ["insert", "delete"], term: "Binary Search Tree", base: "Medium" },
  { keys: ["leetcode problems", "leetcode:"], term: "Mixed Practice", base: "Mixed" },
  { keys: ["revision", "review", "assessment", "mixed", "final", "monthly", "solve:"], term: "Mixed Review Practice", base: "Mixed" },
];

/**
 * Classify a raw DSA topic string (as written in the syllabus) into a
 * canonical topic with a suggested difficulty and real practice links.
 * Returns null for explicit rest days ("No DSA today").
 */
export function classifyDsaTopic(raw) {
  if (!raw) return null;
  const low = raw.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keys.some((k) => low.includes(k))) {
      if (rule.term === null) return null; // rest day
      let difficulty = rule.base;
      if (difficulty !== "Mixed") {
        if (low.includes("advanced") || low.includes("mock") || low.includes("timed") || low.includes("contest")) {
          difficulty = "Hard";
        } else if (low.includes("introduction") || low.includes("basics") || low.includes("what is")) {
          if (rule.base === "Hard") difficulty = "Medium";
          else if (rule.base === "Medium") difficulty = "Easy";
        }
      }
      const links = DSA_TOPIC_LINKS[rule.term] || { leetcodeUrl: null, hackerrankUrl: null };
      return { topic: rule.term, difficulty, ...links };
    }
  }
  return { topic: raw, difficulty: "Mixed", leetcodeUrl: null, hackerrankUrl: null };
}

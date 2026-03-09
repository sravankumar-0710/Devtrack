/**
 * Generates 30 days of sample productivity data for demo purposes.
 * @param {Array} categories - list of category objects
 * @returns {Array} array of entry objects
 */
export function generateSeedData(categories) {
  const entries = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    const numEntries = Math.floor(Math.random() * 4) + 1;
    for (let j = 0; j < numEntries; j++) {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const secs = (Math.floor(Math.random() * 120) + 30) * 60;
      entries.push({
        id:         `seed-${i}-${j}`,
        date:       dateStr,
        categoryId: cat.id,
        duration:   secs,
        notes:      "",
        project:    "",
        manual:     true,
        createdAt:  d.toISOString(),
      });
    }
  }

  return entries;
}

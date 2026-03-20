/**
 * spaced-repetition.ts — Simplified spaced repetition scheduling
 *
 * Based loosely on SM-2 but simplified for a child with mild ID:
 *   - No complex ease factors
 *   - Interval grows with mastery level
 *   - Due score 0–3: 0 = just practiced, 1 = due today, >1 = overdue
 *
 * Low mastery skills are practiced daily.
 * High mastery skills can wait up to 2 weeks.
 */

// ─── Interval table (mastery → ideal days between practice) ──────────────────

const INTERVALS: [minMastery: number, days: number][] = [
  [90, 14],   // mastered  → every 2 weeks
  [75, 7],    // secure    → weekly
  [60, 3],    // practicing → every 3 days
  [40, 2],    // developing → every 2 days
  [0,  1],    // new/struggling → daily
];

export function idealInterval(masteryScore: number): number {
  for (const [min, days] of INTERVALS) {
    if (masteryScore >= min) return days;
  }
  return 1;
}

// ─── Due score ────────────────────────────────────────────────────────────────

/**
 * How urgently should this skill be practiced?
 *   0   = just practiced (within 1 interval)
 *   1.0 = exactly due today
 *   >1  = overdue (capped at 3.0)
 */
export function dueScore(
  lastPracticed: number,  // timestamp, 0 if never
  masteryScore:  number,
  now = Date.now()
): number {
  if (lastPracticed === 0) return 2.0;  // never practiced = high priority

  const daysSince  = (now - lastPracticed) / (1000 * 60 * 60 * 24);
  const interval   = idealInterval(masteryScore);
  const ratio      = daysSince / interval;
  return Math.min(3.0, Math.max(0, ratio));
}

// ─── Sort by urgency ──────────────────────────────────────────────────────────

export interface SpacedItem {
  skillId:      string;
  lastPracticed: number;
  mastery:      number;
}

/**
 * Returns items sorted by due score (most urgent first).
 */
export function sortByDue(items: SpacedItem[], now = Date.now()): SpacedItem[] {
  return [...items].sort((a, b) => {
    const scoreA = dueScore(a.lastPracticed, a.mastery, now);
    const scoreB = dueScore(b.lastPracticed, b.mastery, now);
    return scoreB - scoreA;
  });
}

// ─── Next review message (Hebrew) ────────────────────────────────────────────

export function nextReviewLabel(lastPracticed: number, mastery: number): string {
  const score = dueScore(lastPracticed, mastery);
  if (score >= 1.5)  return 'כְּדַאי לְתַרְגֵּל עַכְשָׁו!';
  if (score >= 0.95) return 'הַיּוֹם טוֹב לְתַרְגֵּל';
  const interval = idealInterval(mastery);
  if (interval <= 1) return 'מָחָר';
  if (interval <= 3) return `בְּעוֹד ${interval} יָמִים`;
  if (interval <= 7) return 'בְּסוֹף הַשָּׁבוּעַ';
  return 'בְּשָׁבוּעַ הַבָּא';
}

/**
 * curriculum.ts — Activity selection engine
 *
 * Selects the next activity for Gefen based on:
 *   1. Spaced repetition urgency (overdue skills first)
 *   2. Mastery: prioritise skills in the ZPD (60–85%)
 *   3. Alternating subjects (math → reading → math) for variety
 *   4. Prerequisites: don't unlock new skill until prev ≥ 50% mastery
 *
 * Currently mapped activities:
 *   counting-garden   → math/number-sense
 *   letter-explorer   → reading/letters-abc
 */

import {
  loadProgress,
  getMetrics,
} from './progress';
import type { ProgressData } from './progress';
import { dueScore } from './spaced-repetition';
import { masteryScore } from './adaptive';

// ─── Skill tree ───────────────────────────────────────────────────────────────

export type Subject = 'math' | 'reading';

export interface SkillNode {
  id:           string;
  subject:      Subject;
  activityId:   string;     // maps to a screen/component key
  label:        string;     // Hebrew label
  defaultLevel: number;     // starting difficulty (1-based)
  maxLevel:     number;
  prerequisites: string[]; // skill ids that must reach 50% mastery first
}

export const SKILL_TREE: SkillNode[] = [
  // ── Math ─────────────────────────────────────────────────────────────────
  {
    id:           'number-sense',
    subject:      'math',
    activityId:   'counting-garden',
    label:        'מֵנְיָה וּסְפִירָה',
    defaultLevel: 3,
    maxLevel:     10,
    prerequisites: [],
  },
  {
    id:           'addition-basic',
    subject:      'math',
    activityId:   'addition-activity',   // not yet built
    label:        'חִיבּוּר בָּסִיסִי',
    defaultLevel: 1,
    maxLevel:     5,
    prerequisites: ['number-sense'],
  },
  // ── Reading ───────────────────────────────────────────────────────────────
  {
    id:           'letters-abc',
    subject:      'reading',
    activityId:   'letter-explorer',
    label:        'אוֹתִיּוֹת אָלֶף-בֵּית',
    defaultLevel: 1,
    maxLevel:     3,    // maps to 3 Hebrew letters (א ב ג)
    prerequisites: [],
  },
  {
    id:           'syllables-basic',
    subject:      'reading',
    activityId:   'syllable-activity',   // not yet built
    label:        'הֲבָרוֹת',
    defaultLevel: 1,
    maxLevel:     5,
    prerequisites: ['letters-abc'],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActivityRecommendation {
  activityId:   string;
  skillId:      string;
  subject:      Subject;
  startLevel:   number;
  scaffoldLevel: 0 | 1 | 2 | 3;
  mastery:      number;      // 0–100
  dueScore:     number;      // 0–3 urgency
  reason:       string;      // Hebrew label for parent dashboard
  isNew:        boolean;     // child hasn't tried this skill yet
}

// ─── Prerequisites check ──────────────────────────────────────────────────────

function prerequisitesMet(node: SkillNode, data: ProgressData): boolean {
  return node.prerequisites.every(prereqId => {
    const m = getMetrics(data, prereqId);
    return masteryScore(m) >= 50;
  });
}

// ─── Priority score (0–1) ────────────────────────────────────────────────────

function priorityScore(
  node:    SkillNode,
  data:    ProgressData,
  now:     number,
  lastSubject: Subject | null
): number {
  const metrics = getMetrics(data, node.id);
  const mastery = masteryScore(metrics);
  const due     = dueScore(metrics.lastAttemptAt, mastery, now);

  // Already mastered → very low priority (but not zero — spaced repetition)
  if (mastery >= 90) return due * 0.1;

  // In ZPD (60–85%) — active learning, weighted by due score
  const zdpBonus = mastery >= 60 && mastery < 85 ? 1.5 : 1.0;

  // Low mastery but active (< 60%) — urgent
  const urgencyBonus = mastery < 60 && metrics.totalAttempts > 0 ? 1.3 : 1.0;

  // Subject alternation — slight penalty if same as last subject
  const subjectPenalty = node.subject === lastSubject ? 0.7 : 1.0;

  // Never attempted — give medium priority (introduce new skills gradually)
  const noveltyScore = metrics.totalAttempts === 0 ? 0.8 : 1.0;

  return Math.min(1, due * zdpBonus * urgencyBonus * subjectPenalty * noveltyScore * 0.5);
}

// ─── Main selector ────────────────────────────────────────────────────────────

/**
 * Selects the highest-priority unlocked activity based on current progress.
 * Falls back to the first skill in each subject if no progress exists.
 */
export function selectNextActivity(
  data:         ProgressData,
  lastSubject?: Subject
): ActivityRecommendation {
  const now = Date.now();

  // Build candidate list: unlocked skills only
  const candidates = SKILL_TREE.filter(node => prerequisitesMet(node, data));

  if (candidates.length === 0) {
    // Safety fallback: return first math skill
    return buildRecommendation(SKILL_TREE[0], data);
  }

  // Score each candidate
  const scored = candidates.map(node => ({
    node,
    score: priorityScore(node, data, now, lastSubject ?? null),
  }));

  // Sort by score descending, with tie-breaking by subject alternation
  scored.sort((a, b) => b.score - a.score);

  return buildRecommendation(scored[0].node, data);
}

function buildRecommendation(
  node: SkillNode,
  data: ProgressData
): ActivityRecommendation {
  const metrics = getMetrics(data, node.id);
  const mastery = masteryScore(metrics);
  const due     = dueScore(metrics.lastAttemptAt, mastery);
  const isNew   = metrics.totalAttempts === 0;

  // Starting level: current engine level, clamped to skill's valid range
  const startLevel = Math.max(
    node.defaultLevel,
    Math.min(metrics.currentLevel, node.maxLevel)
  );

  let reason = isNew
    ? `נִסָּיוֹן רִאשׁוֹן בְּ${node.label}!`
    : due >= 1.5
      ? `זְמַן לְחַזֵּר אֶת ${node.label}`
      : `מֶמְשִׁיכָה בְּ${node.label}`;

  return {
    activityId:    node.activityId,
    skillId:       node.id,
    subject:       node.subject,
    startLevel,
    scaffoldLevel: metrics.scaffoldLevel,
    mastery,
    dueScore:      Math.round(due * 100) / 100,
    reason,
    isNew,
  };
}

// ─── Recommended subject (for WorldMap island highlighting) ──────────────────

/**
 * Returns which subject the cat should point to on the world map.
 * Picks the subject with the highest-priority candidate.
 */
export function getRecommendedSubject(data: ProgressData): Subject {
  const recommendation = selectNextActivity(data);
  return recommendation.subject;
}

// ─── Starting level for a specific activity ───────────────────────────────────

/**
 * Returns the appropriate starting difficulty for an activity.
 * Useful for initialLevel prop passed to activity screens.
 *
 * For counting-garden: returns flower count (3–10)
 * For letter-explorer: always starts from letter 0 (activity is self-contained)
 */
export function getStartingLevel(
  activityId: string,
  data: ProgressData
): number {
  const node = SKILL_TREE.find(n => n.activityId === activityId);
  if (!node) return 1;

  const metrics = getMetrics(data, node.id);
  return Math.max(node.defaultLevel, Math.min(metrics.currentLevel, node.maxLevel));
}

// ─── Quick helper used by App without loading progress manually ───────────────

export function getRecommendedSubjectFromStorage(): Subject {
  const data = loadProgress();
  return getRecommendedSubject(data);
}

export function getStartingLevelFromStorage(activityId: string): number {
  const data = loadProgress();
  return getStartingLevel(activityId, data);
}

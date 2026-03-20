// ─── Engine public API ────────────────────────────────────────────────────────
// Import from here, not directly from sub-modules, to keep coupling loose.

export type { AttemptRecord, SkillMetrics, AdaptiveAction, AdaptiveDecision } from './adaptive';
export {
  createSkillMetrics,
  computeAccuracy,
  evaluateDecision,
  recordAttempt as adaptiveRecordAttempt,
  masteryScore,
} from './adaptive';

export type { SpacedItem } from './spaced-repetition';
export { idealInterval, dueScore, sortByDue, nextReviewLabel } from './spaced-repetition';

export type {
  SessionRecord,
  ProgressData,
  AttemptInput,
  AttemptResult,
  SkillSummary,
} from './progress';
export {
  defaultProgress,
  loadProgress,
  saveProgress,
  getMetrics,
  setMetrics,
  recordAttemptToProgress,
  beginSession,
  recordSessionAttempt,
  endSession,
  getSkillSummaries,
  getSubjectSummary,
} from './progress';

export type { Subject, SkillNode, ActivityRecommendation } from './curriculum';
export {
  SKILL_TREE,
  selectNextActivity,
  getRecommendedSubject,
  getStartingLevel,
  getRecommendedSubjectFromStorage,
  getStartingLevelFromStorage,
} from './curriculum';

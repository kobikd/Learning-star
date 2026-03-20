/**
 * adaptive.ts — Core adaptive learning engine
 *
 * Zone of Proximal Development model:
 *   accuracy > 85% (≥ MIN_SAMPLE attempts) → level up, reset window
 *   accuracy < 60% (≥ MIN_SAMPLE attempts) → level down, add scaffold
 *   60–85%                                 → stay (child is in the learning zone)
 *
 * Accuracy weighting (correct answer quality, never punishes child):
 *   scaffold 0 = 1.00,  scaffold 1 = 0.75,  scaffold 2 = 0.50,  scaffold 3 = 0.30
 *
 * Response time is intentionally NOT used for level decisions:
 *   dyspraxia causes motor delays that don't reflect cognitive readiness.
 *
 * Stars/stickers are handled by rewardStore — this engine is learning-only.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const WINDOW_SIZE      = 10;   // rolling accuracy window
const MIN_SAMPLE       = 5;    // minimum attempts before any level change
const MASTERY_THRESHOLD = 85;  // % weighted accuracy → level up
const STRUGGLE_THRESHOLD = 60; // % weighted accuracy → level down
const MAX_LEVEL        = 10;
const MIN_LEVEL        = 1;

const SCAFFOLD_WEIGHT = [1.0, 0.75, 0.50, 0.30] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AttemptRecord {
  timestamp:     number;   // Date.now()
  correct:       boolean;
  responseTimeMs: number;  // tracked but not used for level decisions
  scaffoldLevel: 0 | 1 | 2 | 3;
  hintsUsed:     number;   // 0 = no external hints
}

export interface SkillMetrics {
  skillId:             string;
  currentLevel:        number;   // 1–10
  scaffoldLevel:       0 | 1 | 2 | 3;
  attempts:            AttemptRecord[];   // last WINDOW_SIZE attempts
  consecutiveCorrect:  number;
  consecutiveWrong:    number;
  lastAttemptAt:       number;   // timestamp, 0 if never attempted
  totalAttempts:       number;   // lifetime count
  totalCorrect:        number;
}

export type AdaptiveAction = 'level-up' | 'level-down' | 'maintain';

export interface AdaptiveDecision {
  action:           AdaptiveAction;
  newLevel:         number;
  scaffoldSuggestion: 0 | 1 | 2 | 3;
  accuracy:         number;   // 0–100 weighted
  confidence:       number;   // 0–1 (based on sample size)
  reason:           string;   // human-readable Hebrew for debugging
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createSkillMetrics(
  skillId: string,
  initialLevel = 1
): SkillMetrics {
  return {
    skillId,
    currentLevel:       Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, initialLevel)),
    scaffoldLevel:      0,
    attempts:           [],
    consecutiveCorrect: 0,
    consecutiveWrong:   0,
    lastAttemptAt:      0,
    totalAttempts:      0,
    totalCorrect:       0,
  };
}

// ─── Accuracy ─────────────────────────────────────────────────────────────────

/**
 * Compute weighted accuracy from a window of attempts.
 * Returns accuracy (0–100) and confidence (0–1).
 * Correct answers at high scaffold levels count less — the child needed more help.
 */
export function computeAccuracy(
  attempts: AttemptRecord[]
): { accuracy: number; confidence: number } {
  const window = attempts.slice(-WINDOW_SIZE);
  if (window.length === 0) return { accuracy: 75, confidence: 0 };

  let weightedCorrect = 0;
  for (const a of window) {
    if (a.correct) {
      weightedCorrect += SCAFFOLD_WEIGHT[a.scaffoldLevel];
    }
    // Wrong = 0 contribution — accuracy can only drop, never below 0
  }

  // Divide by window.length (not sum of weights) so the denominator stays stable
  const accuracy   = (weightedCorrect / window.length) * 100;
  const confidence = Math.min(1, window.length / MIN_SAMPLE);

  return { accuracy, confidence };
}

// ─── Decision ─────────────────────────────────────────────────────────────────

/**
 * Pure function — evaluates current skill metrics and returns a decision.
 * Does NOT modify metrics. Call recordAttempt() to apply the decision.
 */
export function evaluateDecision(metrics: SkillMetrics): AdaptiveDecision {
  const { accuracy, confidence } = computeAccuracy(metrics.attempts);

  let action: AdaptiveAction = 'maintain';
  let newLevel    = metrics.currentLevel;
  let newScaffold = metrics.scaffoldLevel;
  let reason      = 'בְּאֶזוֹר הַהִתְפַּתְחוּת הַקָּרוֹב';

  // Need MIN_SAMPLE before any level change
  if (confidence >= 1) {
    if (accuracy >= MASTERY_THRESHOLD) {
      action   = 'level-up';
      newLevel = Math.min(metrics.currentLevel + 1, MAX_LEVEL);
      newScaffold = 0;
      reason   = `דִּיּוּק ${Math.round(accuracy)}% — עוֹלָה לְרָמָה ${newLevel}`;
    } else if (accuracy < STRUGGLE_THRESHOLD) {
      action   = 'level-down';
      newLevel = Math.max(metrics.currentLevel - 1, MIN_LEVEL);
      newScaffold = Math.min(metrics.scaffoldLevel + 1, 3) as 0|1|2|3;
      reason   = `דִּיּוּק ${Math.round(accuracy)}% — חוֹזֶרֶת לְרָמָה ${newLevel} עִם עֶזְרָה`;
    }
  }

  // Immediate scaffold adjustments (don't wait for full window)
  if (metrics.consecutiveWrong >= 3) {
    newScaffold = Math.min(newScaffold + 1, 3) as 0|1|2|3;
  }
  if (metrics.consecutiveCorrect >= 5 && newScaffold > 0 && action === 'maintain') {
    newScaffold = Math.max(newScaffold - 1, 0) as 0|1|2|3;
  }

  return {
    action,
    newLevel,
    scaffoldSuggestion: newScaffold as 0|1|2|3,
    accuracy:           Math.round(accuracy),
    confidence,
    reason,
  };
}

// ─── Record attempt ───────────────────────────────────────────────────────────

/**
 * Records a new attempt, evaluates, and returns updated metrics.
 * On level change: clears the attempt window so the child starts fresh.
 */
export function recordAttempt(
  metrics: SkillMetrics,
  attempt: Omit<AttemptRecord, 'timestamp'>
): { metrics: SkillMetrics; decision: AdaptiveDecision } {
  const record: AttemptRecord = { ...attempt, timestamp: Date.now() };

  // Add attempt to window FIRST, then evaluate
  const newAttempts = [...metrics.attempts, record].slice(-WINDOW_SIZE);
  const withAttempt: SkillMetrics = {
    ...metrics,
    attempts:            newAttempts,
    consecutiveCorrect:  attempt.correct ? metrics.consecutiveCorrect + 1 : 0,
    consecutiveWrong:    attempt.correct ? 0 : metrics.consecutiveWrong + 1,
    lastAttemptAt:       record.timestamp,
    totalAttempts:       metrics.totalAttempts + 1,
    totalCorrect:        metrics.totalCorrect + (attempt.correct ? 1 : 0),
  };

  const decision = evaluateDecision(withAttempt);

  // Apply level change — reset window for fresh start at new difficulty
  const levelChanged = decision.action !== 'maintain';
  const finalMetrics: SkillMetrics = {
    ...withAttempt,
    currentLevel:        decision.newLevel,
    scaffoldLevel:       decision.scaffoldSuggestion,
    attempts:            levelChanged ? [record] : newAttempts,
    consecutiveCorrect:  levelChanged ? (attempt.correct ? 1 : 0) : withAttempt.consecutiveCorrect,
    consecutiveWrong:    levelChanged ? (attempt.correct ? 0 : 1) : withAttempt.consecutiveWrong,
  };

  return { metrics: finalMetrics, decision };
}

// ─── Mastery score (0–100) ────────────────────────────────────────────────────

/**
 * Lifetime mastery score factoring total correct and current level.
 * Used by curriculum engine and progress display.
 */
export function masteryScore(metrics: SkillMetrics): number {
  if (metrics.totalAttempts < 3) return 0;
  const lifetimeAccuracy = (metrics.totalCorrect / metrics.totalAttempts) * 100;
  const levelBonus       = ((metrics.currentLevel - 1) / (MAX_LEVEL - 1)) * 30;
  return Math.min(100, Math.round(lifetimeAccuracy * 0.7 + levelBonus));
}

/**
 * useAdaptive — React hook wrapping the adaptive engine.
 *
 * Usage in an activity:
 *   const { recordAttempt, scaffoldLevel, currentLevel } = useAdaptive('number-sense');
 *
 * recordAttempt() saves to localStorage automatically and returns the decision.
 * scaffoldLevel updates reactively after each attempt.
 */
import { useCallback, useState } from 'react';
import {
  loadProgress,
  saveProgress,
  getMetrics,
  recordAttemptToProgress,
  beginSession,
  recordSessionAttempt,
  endSession,
} from '../engine/progress';
import type { AttemptInput, AttemptResult } from '../engine/progress';
import type { SkillMetrics } from '../engine/adaptive';

// ─── useAdaptive ─────────────────────────────────────────────────────────────

export function useAdaptive(skillId: string) {
  const [metrics, setMetrics] = useState<SkillMetrics>(() => {
    return getMetrics(loadProgress(), skillId);
  });

  const recordAttempt = useCallback(
    (input: Omit<AttemptInput, 'skillId'>): AttemptResult => {
      const data   = loadProgress();
      const result = recordAttemptToProgress(data, { ...input, skillId });

      saveProgress(result.data);
      setMetrics(result.metrics);
      recordSessionAttempt(skillId, input.correct);

      return result;
    },
    [skillId]
  );

  return {
    metrics,
    currentLevel:      metrics.currentLevel,
    scaffoldLevel:     metrics.scaffoldLevel,
    consecutiveCorrect: metrics.consecutiveCorrect,
    consecutiveWrong:  metrics.consecutiveWrong,
    recordAttempt,
  };
}

// ─── useCurriculum ────────────────────────────────────────────────────────────
// For App-level activity selection.

import {
  selectNextActivity,
  getRecommendedSubject,
  getStartingLevel,
} from '../engine/curriculum';
import type { Subject } from '../engine/curriculum';

export function useCurriculum() {
  const [data, setData] = useState(() => loadProgress());

  // Refresh from storage (call after an activity completes)
  const refresh = useCallback(() => {
    setData(loadProgress());
  }, []);

  const startSession = useCallback((subject: Subject) => {
    beginSession(subject);
  }, []);

  const finishSession = useCallback(() => {
    const progress = loadProgress();
    const updated  = endSession(progress);
    saveProgress(updated);
    setData(updated);
  }, []);

  return {
    data,
    refresh,
    startSession,
    finishSession,
    recommendedSubject:  getRecommendedSubject(data),
    nextActivity:        selectNextActivity(data),
    getStartingLevel:    (activityId: string) => getStartingLevel(activityId, data),
  };
}

// ─── Skill & Mastery ────────────────────────────────────────────────────────

/** Unique identifier for a single learnable skill */
export type SkillId = string;

/** Difficulty band as described in the ZPD algorithm */
export type DifficultyBand = 'decrease' | 'scaffold' | 'hint' | 'maintain' | 'increase';

/** Categories of error patterns for analysis */
export type ErrorPatternType =
  | 'reversal'         // flipping similar letters (ב/כ, ד/ר)
  | 'sequence'         // wrong order
  | 'omission'         // skipping elements
  | 'substitution'     // replacing with similar
  | 'random';          // no clear pattern

export interface ErrorPattern {
  skillId: SkillId;
  type: ErrorPatternType;
  occurrences: number;
  lastSeen: Date;
}

// ─── Mastery Level ──────────────────────────────────────────────────────────

/**
 * Tracks mastery for a single skill.
 * score 0.0–1.0 drives the ZPD algorithm:
 *   > 0.85 → increase difficulty
 *   0.70–0.85 → maintain (optimal zone)
 *   0.60–0.70 → add hints
 *   < 0.60 → decrease + scaffold
 */
export interface MasteryLevel {
  score: number;             // 0.0–1.0
  attempts: number;
  lastPracticed: Date;
  consecutiveCorrect: number;
  needsReview: boolean;      // spaced-repetition flag
}

// ─── Learner Profile ────────────────────────────────────────────────────────

export type PreferredModality = 'visual' | 'auditory' | 'kinesthetic';

export interface LearnerProfile {
  skillMastery: Record<SkillId, MasteryLevel>;
  avgResponseTime: Record<SkillId, number>;   // milliseconds
  streaks: {
    successes: number;
    failures: number;
  };
  preferredModality: PreferredModality;
  engagementScore: number;                    // 0.0–1.0
  errorPatterns: ErrorPattern[];
}

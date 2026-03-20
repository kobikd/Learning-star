// ─── Companion ───────────────────────────────────────────────────────────────

export type CompanionType = 'cat' | 'dog' | 'bunny' | 'unicorn' | 'dragon';

export type CompanionReaction = 'happy' | 'encouraging' | 'celebrating' | 'sleeping';

export interface CompanionState {
  type: CompanionType;
  currentReaction: CompanionReaction;
  /** 0–100, unlocks visual growth milestones */
  growthPoints: number;
}

// ─── Stickers ────────────────────────────────────────────────────────────────

export type StickerTheme = 'animals' | 'space' | 'ocean' | 'flowers' | 'food';

export interface Sticker {
  id: string;
  theme: StickerTheme;
  imageUrl: string;
  altText: string;      // Hebrew alt text for accessibility
  earnedAt?: Date;
  isUnlocked: boolean;
}

export interface StickerAlbum {
  stickers: Sticker[];
  totalEarned: number;
}

// ─── Stars ────────────────────────────────────────────────────────────────────

export interface StarState {
  total: number;
  /** stars earned in current session */
  sessionCount: number;
  /** current consecutive-correct streak (resets on wrong answer) */
  currentStreak: number;
}

// ─── Reward System ───────────────────────────────────────────────────────────

/**
 * Rules:
 * - Stars earned per correct answer; bonus star on streak of 3
 * - Stickers earned per completed activity; displayed in sticker album
 * - Companion grows with progress and reacts to events
 * - NO rankings, NO losing stars, NO time pressure, NO negative messages
 */
export interface RewardSystem {
  stars: {
    earnedPer: 'correct_answer';
    bonusFor: 'streak_of_3';
  };
  stickers: {
    earnedPer: 'completed_activity';
    collection: 'sticker_album';
    themes: StickerTheme[];
  };
  companion: {
    type: CompanionType;
    reactions: Record<CompanionReaction, string>;  // reaction → animation key
    growth: 'evolves_with_progress';
  };
}

// ─── Live reward state (stored in Zustand) ────────────────────────────────────

export interface RewardState {
  stars: StarState;
  album: StickerAlbum;
  companion: CompanionState;
}

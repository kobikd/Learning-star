import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STICKERS } from '../content/stickers';
import type { StickerDefinition } from '../content/stickers';

// ─── State shape ──────────────────────────────────────────────────────────────

export interface RewardState {
  // Persisted
  stars:          number;
  streak:         number;       // current correct-answer streak (cross-activity)
  stickersEarned: string[];     // ordered list of earned sticker ids

  // Actions — can return values from Zustand actions
  recordCorrect:    () => { streakBonus: boolean };
  recordWrong:      () => void;
  earnNextSticker:  () => StickerDefinition | null;
  resetProgress:    () => void;  // dev-only reset
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useRewardStore = create<RewardState>()(
  persist(
    (set, get) => ({
      stars:          0,
      streak:         0,
      stickersEarned: [],

      // Correct answer: +1 star, track streak, +3 bonus on every 3rd
      recordCorrect: () => {
        const newStreak   = get().streak + 1;
        const streakBonus = newStreak % 3 === 0;
        set(s => ({
          streak: newStreak,
          stars:  s.stars + 1 + (streakBonus ? 3 : 0),
        }));
        return { streakBonus };
      },

      // Wrong answer: reset streak, stars never decrease
      recordWrong: () => set({ streak: 0 }),

      // Award the next unearned sticker in sequence
      earnNextSticker: () => {
        const earned = get().stickersEarned;
        const next   = STICKERS.find(s => !earned.includes(s.id)) ?? null;
        if (!next) return null;
        set(s => ({ stickersEarned: [...s.stickersEarned, next.id] }));
        return next;
      },

      resetProgress: () => set({ stars: 0, streak: 0, stickersEarned: [] }),
    }),
    { name: 'gefen-learning-star-v1' }
  )
);

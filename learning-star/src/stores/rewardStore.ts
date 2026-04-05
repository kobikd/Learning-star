import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STICKERS } from '../content/stickers';
import type { StickerDefinition } from '../content/stickers';

export interface RewardState {
  stars:             number;
  streak:            number;
  stickersEarned:    string[];
  completedGames:    string[];   // routes finished at least once, e.g. ['/counting', '/addition']
  islandTreasures:   string[];   // subject names whose treasure is unlocked, e.g. ['math']

  recordCorrect:      () => { streakBonus: boolean };
  recordWrong:        () => void;
  earnNextSticker:    () => StickerDefinition | null;
  markGameCompleted:  (route: string) => void;
  unlockTreasure:     (subject: string) => void;
  resetProgress:      () => void;
}

export const useRewardStore = create<RewardState>()(
  persist(
    (set, get) => ({
      stars:           0,
      streak:          0,
      stickersEarned:  [],
      completedGames:  [],
      islandTreasures: [],

      recordCorrect: () => {
        const newStreak   = get().streak + 1;
        const streakBonus = newStreak % 3 === 0;
        set(s => ({
          streak: newStreak,
          stars:  s.stars + 1 + (streakBonus ? 3 : 0),
        }));
        return { streakBonus };
      },

      recordWrong: () => set({ streak: 0 }),

      earnNextSticker: () => {
        const earned = get().stickersEarned;
        const next   = STICKERS.find(s => !earned.includes(s.id)) ?? null;
        if (!next) return null;
        set(s => ({ stickersEarned: [...s.stickersEarned, next.id] }));
        return next;
      },

      markGameCompleted: (route: string) => {
        const current = get().completedGames;
        if (!current.includes(route)) {
          set({ completedGames: [...current, route] });
        }
      },

      unlockTreasure: (subject: string) => {
        const current = get().islandTreasures;
        if (!current.includes(subject)) {
          set(s => ({
            islandTreasures: [...s.islandTreasures, subject],
            stars: s.stars + 5,
          }));
        }
      },

      resetProgress: () => set({
        stars: 0, streak: 0, stickersEarned: [],
        completedGames: [], islandTreasures: [],
      }),
    }),
    { name: 'gefen-learning-star-v1' }
  )
);

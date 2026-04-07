import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STICKERS } from "../content/stickers";
import type { StickerDefinition } from "../content/stickers";

export interface EarnedCard {
  gameId: string;
  earnedAt: number;
  animal: string;
  titleHe: string;
}

export interface RewardState {
  // ── Existing ──────────────────────────────────────────────────────────────
  stars:             number;
  streak:            number;
  stickersEarned:    string[];
  completedGames:    string[];
  islandTreasures:   string[];

  // ── New ───────────────────────────────────────────────────────────────────
  earnedCards:       EarnedCard[];
  puzzlePieces:      { math: boolean[]; reading: boolean[] };
  islandAlive:       Array<"math" | "reading">;
  earnedSkins:       string[];
  activeSkin:        string | null;

  // ── Actions ───────────────────────────────────────────────────────────────
  recordCorrect:      () => { streakBonus: boolean };
  recordWrong:        () => void;
  earnNextSticker:    () => StickerDefinition | null;
  earnSticker:        (id: string) => void;
  markGameCompleted:  (route: string) => void;
  unlockTreasure:     (subject: string) => void;
  earnCard:           (card: EarnedCard) => void;
  earnPuzzlePiece:    (islandId: "math" | "reading", pieceIndex: number) => void;
  unlockIsland:       (islandId: "math" | "reading") => void;
  earnSkin:           (skinId: string) => void;
  resetProgress:      () => void;
}

const INITIAL_PUZZLE_PIECES = { math: [false, false, false, false], reading: [false, false, false, false] };

export const useRewardStore = create<RewardState>()(
  persist(
    (set, get) => ({
      stars:           0,
      streak:          0,
      stickersEarned:  [],
      completedGames:  [],
      islandTreasures: [],
      earnedCards:     [],
      puzzlePieces:    { math: [false, false, false, false], reading: [false, false, false, false] },
      islandAlive:     [],
      earnedSkins:     [],
      activeSkin:      null,

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

      earnSticker: (id: string) => {
        const earned = get().stickersEarned;
        if (!earned.includes(id)) {
          set(s => ({ stickersEarned: [...s.stickersEarned, id] }));
        }
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

      earnCard: (card: EarnedCard) => {
        const existing = get().earnedCards;
        if (!existing.find(c => c.gameId === card.gameId)) {
          set(s => ({ earnedCards: [...s.earnedCards, card] }));
        }
      },

      earnPuzzlePiece: (islandId: "math" | "reading", pieceIndex: number) => {
        const current = get().puzzlePieces;
        if (current[islandId][pieceIndex]) return;
        const updated = {
          ...current,
          [islandId]: current[islandId].map((v, i) => i === pieceIndex ? true : v),
        };
        set({ puzzlePieces: updated });
      },

      unlockIsland: (islandId: "math" | "reading") => {
        const current = get().islandAlive;
        if (!current.includes(islandId)) {
          set(s => ({
            islandAlive: [...s.islandAlive, islandId],
            stars: s.stars + 5,
          }));
        }
      },

      earnSkin: (skinId: string) => {
        const earned = get().earnedSkins;
        if (!earned.includes(skinId)) {
          set(s => ({ earnedSkins: [...s.earnedSkins, skinId], activeSkin: skinId }));
        }
      },

      resetProgress: () => set({
        stars: 0, streak: 0, stickersEarned: [],
        completedGames: [], islandTreasures: [],
        earnedCards: [], puzzlePieces: INITIAL_PUZZLE_PIECES,
        islandAlive: [], earnedSkins: [], activeSkin: null,
      }),
    }),
    { name: "gefen-learning-star-v2" }
  )
);

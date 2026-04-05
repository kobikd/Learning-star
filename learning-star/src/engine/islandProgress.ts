/**
 * islandProgress.ts — Pure functions for island/game progress
 *
 * Games unlock sequentially within each island.
 * A game is COMPLETED when its route appears in completedGames.
 * A game is CURRENT when it's the first incomplete game on the path.
 * A game is LOCKED when a preceding game is not yet completed.
 * Treasure unlocks when ALL games on the island are completed.
 */

// ─── Registry ────────────────────────────────────────────────────────────────

export interface GameEntry {
  /** Unique id within the island */
  id: string;
  /** React Router route, e.g. '/counting' */
  route: string;
  /** Large emoji displayed on pin */
  icon: string;
  /** Hebrew name with nikud */
  name: string;
}

export type IslandSubject = 'math' | 'reading';

export const GAME_REGISTRY: Record<IslandSubject, GameEntry[]> = {
  math: [
    { id: 'counting',    route: '/counting',    icon: '🔢', name: 'סְפִירָה' },
    { id: 'addition',    route: '/addition',    icon: '🫧', name: 'חִיבּוּר בּוּעוֹת' },
    { id: 'gafbon',      route: '/gafbon',      icon: '🧮', name: 'גַּפְבּוֹן' },
    { id: 'subtraction', route: '/subtraction', icon: '🐠', name: 'חִיסּוּר בַּיָּם' },
  ],
  reading: [
    { id: 'letters', route: '/reading', icon: '📖', name: 'אוֹתִיּוֹת' },
  ],
};

export const ISLAND_META: Record<IslandSubject, { name: string; icon: string; treasureSticker: string }> = {
  math:    { name: 'אִי הַמִּסְפָּרִים', icon: '🏝️', treasureSticker: '🏆' },
  reading: { name: 'אִי הַסִּפּוּרִים', icon: '📚', treasureSticker: '📜' },
};

// ─── Game state ───────────────────────────────────────────────────────────────

export type GamePinState = 'completed' | 'current' | 'locked';

export interface GameWithState extends GameEntry {
  state: GamePinState;
}

/**
 * Returns every game on an island with its current pin state.
 * @param subject  'math' | 'reading'
 * @param completed  array of route strings from rewardStore.completedGames
 */
export function getIslandGames(
  subject: IslandSubject,
  completed: string[]
): GameWithState[] {
  const games = GAME_REGISTRY[subject];
  let foundCurrent = false;

  return games.map((game, index) => {
    const isDone = completed.includes(game.route);

    if (isDone) return { ...game, state: 'completed' as GamePinState };

    // First uncompleted game — check if previous is done (or this is first)
    const prevDone = index === 0 || completed.includes(games[index - 1].route);
    if (prevDone && !foundCurrent) {
      foundCurrent = true;
      return { ...game, state: 'current' as GamePinState };
    }

    return { ...game, state: 'locked' as GamePinState };
  });
}

/**
 * The first game with state 'current' on an island, or null if all complete.
 */
export function getCurrentGame(
  subject: IslandSubject,
  completed: string[]
): GameWithState | null {
  return getIslandGames(subject, completed).find(g => g.state === 'current') ?? null;
}

/**
 * True when every game on the island is completed.
 */
export function isTreasureUnlocked(
  subject: IslandSubject,
  completed: string[]
): boolean {
  return GAME_REGISTRY[subject].every(g => completed.includes(g.route));
}

/**
 * Number of completed games / total games on the island.
 */
export function islandProgress(
  subject: IslandSubject,
  completed: string[]
): { done: number; total: number } {
  const games = GAME_REGISTRY[subject];
  return {
    done:  games.filter(g => completed.includes(g.route)).length,
    total: games.length,
  };
}

/**
 * Subject of the recommended island (whichever has the earliest incomplete game).
 * Falls back to 'math'.
 */
export function getRecommendedIsland(completed: string[]): IslandSubject {
  const subjects: IslandSubject[] = ['math', 'reading'];
  for (const s of subjects) {
    if (!isTreasureUnlocked(s, completed)) return s;
  }
  return 'math';
}

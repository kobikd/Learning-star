# World Map Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat IslandButton row with a parchment treasure-map (world view) + zoom-in island landscapes with a winding path, game pinpoints, and a treasure chest reward.

**Architecture:** WorldMapScreen holds a `MapView` state machine (`'map'` | `'island'`). The parchment map is an inline SVG. Tapping an island triggers AnimatePresence crossfade into `IslandView`, which shows a unique landscape, winding path, and `GamePin` markers. Completion is tracked in `rewardStore.completedGames` (array of route strings). All new files are standalone; `App.tsx` only loses 4 individual callbacks.

**Tech Stack:** React 18 + TypeScript, Framer Motion, Zustand (persist), Vite. No test runner — use `npx tsc --noEmit` for type-checking after each task.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/stores/rewardStore.ts` | Add `completedGames: string[]` + `markGameCompleted(route)` |
| Create | `src/engine/islandProgress.ts` | Pure fns: GAME_REGISTRY, game states, treasure check |
| Create | `src/components/ui/GamePin.tsx` | Individual pin: 3 states, 64px hit area, flag SVG |
| Create | `src/components/ui/IslandLandscape.tsx` | Island background SVG per subject |
| Create | `src/components/ui/IslandView.tsx` | Island view: landscape + path + pins + cat + progress |
| Rewrite | `src/pages/WorldMapScreen.tsx` | State machine + parchment SVG map + transition |
| Modify | `src/App.tsx` | Simplify to `onSelectGame(route)`, record completion |
| Delete | `src/components/ui/IslandButton.tsx` | Replaced (keep until Task 6 is working) |

---

## Task 1: Track Game Completion in RewardStore

**Files:**
- Modify: `src/stores/rewardStore.ts`

This adds a `completedGames` array to the persisted reward store. `App.tsx` will call `markGameCompleted(location.pathname)` in `handleActivityBack()`. The island progress engine reads this to determine pin states.

- [ ] **Step 1: Add `completedGames` field and action to rewardStore**

In `src/stores/rewardStore.ts`, add to the `RewardState` interface and the Zustand store:

```typescript
// In RewardState interface — add after stickersEarned:
completedGames: string[];     // routes completed at least once, e.g. ['/counting', '/addition']
markGameCompleted: (route: string) => void;
```

Full updated file `src/stores/rewardStore.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STICKERS } from '../content/stickers';
import type { StickerDefinition } from '../content/stickers';

export interface RewardState {
  stars:             number;
  streak:            number;
  stickersEarned:    string[];
  completedGames:    string[];   // ← NEW: routes finished at least once
  islandTreasures:   string[];   // ← NEW: subjects whose treasure is unlocked

  recordCorrect:      () => { streakBonus: boolean };
  recordWrong:        () => void;
  earnNextSticker:    () => StickerDefinition | null;
  markGameCompleted:  (route: string) => void;           // ← NEW
  unlockTreasure:     (subject: string) => void;         // ← NEW
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
            stars: s.stars + 5,   // 5 bonus stars for treasure
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
```

- [ ] **Step 2: Type-check**

```bash
cd ~/Desktop/Stuff/Gefen*/learning-star && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors (the new fields are additive — Zustand persist merges existing stored values).

- [ ] **Step 3: Commit**

```bash
cd ~/Desktop/Stuff/Gefen*/learning-star
git -C ~/Desktop/Stuff/Gefen*Tree* add learning-star/src/stores/rewardStore.ts
git -C ~/Desktop/Stuff/Gefen*Tree* commit -m "feat(map): add completedGames and islandTreasures to rewardStore"
```

---

## Task 2: Island Progress Engine (Pure Functions)

**Files:**
- Create: `src/engine/islandProgress.ts`

Pure functions with no React or Zustand imports. The single source of truth for: which games exist, which are unlocked, and whether a treasure is earned. Reads `completedGames` from rewardStore at call time (passed as argument).

- [ ] **Step 1: Create `src/engine/islandProgress.ts`**

```typescript
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
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git -C ~/Desktop/Stuff/Gefen*Tree* add learning-star/src/engine/islandProgress.ts
git -C ~/Desktop/Stuff/Gefen*Tree* commit -m "feat(map): add islandProgress engine with GAME_REGISTRY and pin state logic"
```

---

## Task 3: GamePin Component

**Files:**
- Create: `src/components/ui/GamePin.tsx`

A single game pinpoint on the island path. Renders as an SVG group: a flag pole + flag + circle base. Has an invisible 64×64px HTML hit area overlaid on top for dyspraxia-friendly touch.

- [ ] **Step 1: Create `src/components/ui/GamePin.tsx`**

```typescript
import { motion } from "framer-motion";
import type { GameWithState } from "../../engine/islandProgress";

interface GamePinProps {
  game: GameWithState;
  /** SVG coordinate of the pin base (bottom of the pole) */
  x: number;
  y: number;
  onClick: (game: GameWithState) => void;
}

// ─── Color map ────────────────────────────────────────────────────────────────
const PIN_COLORS = {
  completed: { flag: '#6BCB77', circle: '#6BCB77', opacity: 1 },
  current:   { flag: '#FFD700', circle: '#FFD700', opacity: 1 },
  locked:    { flag: '#BBBBBB', circle: '#BBBBBB', opacity: 0.6 },
} as const;

export function GamePin({ game, x, y, onClick }: GamePinProps) {
  const colors = PIN_COLORS[game.state];

  return (
    // foreignObject lets us use HTML (div) for the touch target inside SVG
    <g>
      {/* Visual pin — pole, flag, base circle */}
      <g opacity={colors.opacity} transform={`translate(${x}, ${y})`}>
        {/* Pole */}
        <line x1="0" y1="0" x2="0" y2="-42" stroke="#5A3E1B" strokeWidth="3" strokeLinecap="round"/>

        {/* Flag */}
        {game.state === 'current' ? (
          <motion.path
            d="M0,-42 L26,-35 L0,-28Z"
            fill={colors.flag}
            animate={{ scaleX: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            style={{ transformOrigin: '0px -42px' }}
          />
        ) : (
          <path d="M0,-42 L26,-35 L0,-28Z" fill={colors.flag} />
        )}

        {/* Base circle */}
        {game.state === 'current' ? (
          <>
            {/* Glow ring */}
            <motion.circle
              cx="0" cy="0" r="16"
              fill="none" stroke={colors.circle} strokeWidth="2.5"
              animate={{ r: [14, 18, 14], opacity: [0.6, 0.2, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            />
            <circle cx="0" cy="0" r="9" fill={colors.circle} stroke="white" strokeWidth="2.5"/>
            <text x="0" y="4" textAnchor="middle" fontSize="9" fill="white">⭐</text>
          </>
        ) : game.state === 'completed' ? (
          <>
            <circle cx="0" cy="0" r="9" fill={colors.circle} stroke="white" strokeWidth="2.5"/>
            <text x="0" y="4" textAnchor="middle" fontSize="9" fill="white">✓</text>
          </>
        ) : (
          <>
            <circle cx="0" cy="0" r="9" fill={colors.circle} stroke="white" strokeWidth="2.5"/>
            <text x="0" y="4" textAnchor="middle" fontSize="9" fill="#888">🔒</text>
          </>
        )}

        {/* Game icon + name below */}
        <text x="0" y="20" textAnchor="middle" fontSize="14">{game.icon}</text>
        <text
          x="0" y="34"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fontFamily="var(--font-primary)"
          fill={game.state === 'locked' ? '#999' : '#2D3748'}
          direction="rtl"
        >
          {game.name}
        </text>
      </g>

      {/* Invisible 64×64 hit area (accessible button) */}
      <foreignObject
        x={x - 32}
        y={y - 64}
        width="64"
        height="80"
        style={{ overflow: 'visible' }}
      >
        <button
          onClick={() => onClick(game)}
          aria-label={`${game.name} — ${
            game.state === 'completed' ? 'הוּשְׁלַם' :
            game.state === 'current'   ? 'פָּעִיל' :
            'נָעוּל'
          }`}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            cursor: game.state === 'locked' ? 'not-allowed' : 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        />
      </foreignObject>
    </g>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git -C ~/Desktop/Stuff/Gefen*Tree* add learning-star/src/components/ui/GamePin.tsx
git -C ~/Desktop/Stuff/Gefen*Tree* commit -m "feat(map): add GamePin component — 3-state flag pins with 64px hit area"
```

---

## Task 4: IslandLandscape Component

**Files:**
- Create: `src/components/ui/IslandLandscape.tsx`

Two SVG landscapes. Math Island = tropical + volcanic. Reading Island = enchanted forest. Both use the same `viewBox="0 0 800 520"` so the winding path coordinates in IslandView work on both.

- [ ] **Step 1: Create `src/components/ui/IslandLandscape.tsx`**

```typescript
import type { IslandSubject } from "../../engine/islandProgress";

interface IslandLandscapeProps {
  subject: IslandSubject;
}

function MathLandscape() {
  return (
    <>
      {/* Sky */}
      <defs>
        <linearGradient id="mathSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB"/>
          <stop offset="100%" stopColor="#B8E4F0"/>
        </linearGradient>
        <linearGradient id="mathOcean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4FA8D4"/>
          <stop offset="100%" stopColor="#2B7BBB"/>
        </linearGradient>
      </defs>

      <rect width="800" height="300" fill="url(#mathSky)"/>
      {/* Ocean at bottom */}
      <rect y="400" width="800" height="120" fill="url(#mathOcean)"/>
      {/* Gentle wave line */}
      <path d="M0,405 Q100,398 200,405 Q300,412 400,405 Q500,398 600,405 Q700,412 800,405"
            fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>

      {/* Island land mass */}
      <path d="M60,390 Q40,330 80,265 Q110,220 175,205 Q225,175 300,165 Q380,140 400,148
               Q460,138 535,168 Q590,178 635,210 Q695,230 720,275 Q755,330 740,390
               Q720,408 660,418 Q575,436 490,425 Q415,436 330,425 Q250,436 170,418 Q95,405 60,390Z"
            fill="#7BA05B" stroke="#5A8040" strokeWidth="2"/>

      {/* Sandy beach edge */}
      <path d="M60,390 Q95,405 170,418 Q250,436 330,425 Q415,436 490,425 Q575,436 660,418 Q720,408 740,390"
            fill="none" stroke="#E8D5A3" strokeWidth="14" strokeLinecap="round" opacity="0.65"/>

      {/* Volcano mountain */}
      <path d="M350,155 L395,218 L305,218Z" fill="#5A7A3A" stroke="#4A6A2A" strokeWidth="1.5"/>
      <path d="M355,162 L385,202 L328,202Z" fill="#6B8E4E"/>
      {/* Snow cap */}
      <path d="M352,160 L368,182 L336,182Z" fill="white" opacity="0.55"/>
      {/* Smoke puffs */}
      <circle cx="354" cy="148" r="9" fill="white" opacity="0.28"/>
      <circle cx="362" cy="138" r="7" fill="white" opacity="0.2"/>
      <circle cx="357" cy="129" r="5" fill="white" opacity="0.14"/>

      {/* Tree cluster left */}
      <circle cx="148" cy="285" r="20" fill="#2E7D32"/>
      <circle cx="164" cy="278" r="15" fill="#388E3C"/>
      <circle cx="138" cy="295" r="13" fill="#43A047"/>

      {/* Tree cluster right */}
      <circle cx="648" cy="288" r="18" fill="#2E7D32"/>
      <circle cx="663" cy="280" r="13" fill="#388E3C"/>
      <circle cx="638" cy="296" r="11" fill="#43A047"/>

      {/* Left palm tree */}
      <line x1="118" y1="320" x2="122" y2="282" stroke="#8B6340" strokeWidth="4" strokeLinecap="round"/>
      <path d="M122,282 Q106,270 100,278" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M122,282 Q138,268 143,276" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M122,282 Q120,265 126,263" stroke="#66BB6A" strokeWidth="3" fill="none" strokeLinecap="round"/>

      {/* Right palm tree */}
      <line x1="682" y1="318" x2="679" y2="282" stroke="#8B6340" strokeWidth="4" strokeLinecap="round"/>
      <path d="M679,282 Q663,270 657,278" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M679,282 Q695,268 700,276" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </>
  );
}

function ReadingLandscape() {
  return (
    <>
      <defs>
        <linearGradient id="readingSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8D5F5"/>
          <stop offset="100%" stopColor="#C8E6C9"/>
        </linearGradient>
      </defs>

      {/* Magical sky */}
      <rect width="800" height="520" fill="url(#readingSky)"/>

      {/* Ground */}
      <path d="M0,288 Q200,260 400,275 Q600,260 800,288 L800,520 L0,520Z" fill="#5A8040"/>
      <path d="M0,308 Q200,288 400,296 Q600,288 800,308 L800,520 L0,520Z" fill="#4A7030"/>

      {/* Magical trees — left cluster */}
      <rect x="84" y="210" width="13" height="78" rx="5" fill="#6B4226"/>
      <circle cx="90" cy="198" r="36" fill="#2E7D32"/>
      <circle cx="110" cy="204" r="26" fill="#388E3C"/>
      <circle cx="70" cy="210" r="22" fill="#43A047"/>

      {/* Right cluster */}
      <rect x="686" y="218" width="12" height="70" rx="5" fill="#6B4226"/>
      <circle cx="692" cy="206" r="32" fill="#2E7D32"/>
      <circle cx="710" cy="212" r="23" fill="#388E3C"/>
      <circle cx="676" cy="218" r="18" fill="#43A047"/>

      {/* Mid-left tree */}
      <rect x="284" y="228" width="10" height="62" rx="4" fill="#6B4226"/>
      <circle cx="289" cy="216" r="26" fill="#2E7D32"/>
      <circle cx="305" cy="222" r="19" fill="#388E3C"/>

      {/* Mid-right tree */}
      <rect x="536" y="222" width="10" height="66" rx="4" fill="#6B4226"/>
      <circle cx="541" cy="210" r="29" fill="#2E7D32"/>
      <circle cx="556" cy="216" r="20" fill="#388E3C"/>

      {/* Sparkles */}
      <circle cx="152" cy="252" r="3.5" fill="#FFD700" opacity="0.7"/>
      <circle cx="358" cy="242" r="3" fill="#FFD700" opacity="0.6"/>
      <circle cx="502" cy="255" r="3.5" fill="#FFD700" opacity="0.7"/>
      <circle cx="635" cy="245" r="2.5" fill="#FFD700" opacity="0.5"/>
      <text x="204" y="270" fontSize="14" opacity="0.55">✨</text>
      <text x="438" y="260" fontSize="12" opacity="0.45">✨</text>
      <text x="598" y="272" fontSize="14" opacity="0.55">✨</text>

      {/* Magical moon in sky */}
      <circle cx="660" cy="80" r="32" fill="#FFF9C4" opacity="0.6"/>
      <circle cx="674" cy="72" r="26" fill="url(#readingSky)" opacity="0.75"/>

      {/* Stars */}
      <circle cx="120" cy="55" r="2.5" fill="white" opacity="0.7"/>
      <circle cx="240" cy="38" r="2" fill="white" opacity="0.6"/>
      <circle cx="490" cy="48" r="2.5" fill="white" opacity="0.7"/>
      <circle cx="730" cy="38" r="2" fill="white" opacity="0.5"/>
    </>
  );
}

export function IslandLandscape({ subject }: IslandLandscapeProps) {
  return subject === 'math' ? <MathLandscape /> : <ReadingLandscape />;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git -C ~/Desktop/Stuff/Gefen*Tree* add learning-star/src/components/ui/IslandLandscape.tsx
git -C ~/Desktop/Stuff/Gefen*Tree* commit -m "feat(map): add IslandLandscape — Math tropical + Reading enchanted forest SVGs"
```

---

## Task 5: IslandView Component

**Files:**
- Create: `src/components/ui/IslandView.tsx`

Full island view: landscape + winding path SVG + GamePins + CatCharacter + progress bar + treasure chest. The path coordinates are hardcoded per island.

- [ ] **Step 1: Create `src/components/ui/IslandView.tsx`**

```typescript
import { motion } from "framer-motion";
import { useState } from "react";
import { IslandLandscape } from "./IslandLandscape";
import { GamePin } from "./GamePin";
import { CatCharacter } from "./CatCharacter";
import {
  getIslandGames, isTreasureUnlocked, islandProgress, ISLAND_META,
} from "../../engine/islandProgress";
import type { IslandSubject, GameWithState } from "../../engine/islandProgress";
import { useRewardStore } from "../../stores/rewardStore";

interface IslandViewProps {
  subject: IslandSubject;
  onSelectGame: (route: string) => void;
  onBack: () => void;
  onSafeSpace: () => void;
}

// ─── Pin positions per island (SVG coordinates, viewBox 0 0 800 520) ─────────

const PIN_POSITIONS: Record<IslandSubject, Array<{ x: number; y: number }>> = {
  math: [
    { x: 152, y: 362 },   // counting  — start of path
    { x: 298, y: 295 },   // addition  — mid-left
    { x: 468, y: 282 },   // gafbon    — mid-right
    { x: 605, y: 268 },   // subtraction — near end
  ],
  reading: [
    { x: 280, y: 318 },   // letters — only game for now
  ],
};

// ─── Path shapes per island ───────────────────────────────────────────────────

const PATHS: Record<IslandSubject, string> = {
  math:    'M152,362 Q210,338 250,318 Q298,295 348,295 Q420,308 468,282 Q540,258 605,268 Q665,278 700,310',
  reading: 'M180,340 Q228,320 280,318 Q340,322 400,318',
};

// ─── Treasure chest position ─────────────────────────────────────────────────

const TREASURE_POS: Record<IslandSubject, { x: number; y: number }> = {
  math:    { x: 700, y: 310 },
  reading: { x: 440, y: 318 },
};

// ─── Cat speech ───────────────────────────────────────────────────────────────

function getCatSpeech(games: GameWithState[], treasureUnlocked: boolean): string {
  if (treasureUnlocked)                              return '!מַדְהִים! פִּתְחִי אֶת הָאוֹצָר';
  const allDone = games.every(g => g.state === 'completed');
  if (allDone)                                       return '!מַדְהִים! פִּתְחִי אֶת הָאוֹצָר';
  const hasCompleted = games.some(g => g.state === 'completed');
  if (hasCompleted)                                  return '!יֹפִי, תַּמְשִׁיכִי';
  return '!בַּחֲרִי מִשְׂחָק';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function IslandView({ subject, onSelectGame, onBack, onSafeSpace }: IslandViewProps) {
  const { completedGames, islandTreasures, unlockTreasure, earnNextSticker } = useRewardStore();
  const [lockedMsg, setLockedMsg] = useState(false);

  const games         = getIslandGames(subject, completedGames);
  const treasureReady = isTreasureUnlocked(subject, completedGames);
  const treasureOpen  = islandTreasures.includes(subject);
  const { done, total } = islandProgress(subject, completedGames);
  const meta          = ISLAND_META[subject];
  const positions     = PIN_POSITIONS[subject];
  const path          = PATHS[subject];
  const treasurePos   = TREASURE_POS[subject];

  function handlePinClick(game: GameWithState) {
    if (game.state === 'locked') {
      setLockedMsg(true);
      setTimeout(() => setLockedMsg(false), 2200);
      return;
    }
    onSelectGame(game.route);
  }

  function handleTreasureClick() {
    if (!treasureReady || treasureOpen) return;
    unlockTreasure(subject);
    earnNextSticker();
  }

  // Cat position: near the current/recommended pin
  const currentIdx = games.findIndex(g => g.state === 'current');
  const catPos = currentIdx >= 0 ? positions[currentIdx] : positions[positions.length - 1];
  const catX   = (catPos?.x ?? 400) - 35;
  const catY   = (catPos?.y ?? 300) + 40;

  const catSpeech = lockedMsg
    ? '!קוֹדֶם נְסַיֵּם אֶת הַמִּשְׂחָק הַקּוֹדֵם'
    : getCatSpeech(games, treasureOpen);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 220, damping: 28 }}
      style={{ position: 'relative', width: '100%', height: '100svh', overflow: 'hidden' }}
    >
      {/* ── Island SVG (fills screen) ─────────────────────────────── */}
      <svg
        viewBox="0 0 800 520"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        role="img"
        aria-label={`${meta.name} — מַפַּת הַמִּשְׂחָקִים`}
      >
        {/* Background landscape */}
        <IslandLandscape subject={subject} />

        {/* ── Winding path ─────────────────────────────────────────── */}
        {/* Dirt/sand base */}
        <path d={path} stroke="#C8963A" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.55"/>
        {/* Dashed overlay */}
        <path d={path} stroke="#E8B84A" strokeWidth="5" fill="none" strokeDasharray="10,9" opacity="0.45" strokeLinecap="round"/>

        {/* ── Game pins ─────────────────────────────────────────────── */}
        {games.map((game, i) => {
          const pos = positions[i];
          if (!pos) return null;
          return (
            <GamePin
              key={game.id}
              game={game}
              x={pos.x}
              y={pos.y}
              onClick={handlePinClick}
            />
          );
        })}

        {/* ── Treasure chest ───────────────────────────────────────── */}
        <g
          transform={`translate(${treasurePos.x}, ${treasurePos.y})`}
          style={{ cursor: treasureReady && !treasureOpen ? 'pointer' : 'default' }}
          onClick={handleTreasureClick}
          role={treasureReady && !treasureOpen ? 'button' : undefined}
          aria-label={treasureOpen ? 'אוֹצָר נִפְתַּח!' : 'אוֹצָר נָעוּל'}
        >
          {treasureOpen ? (
            <motion.text
              x="0" y="0"
              textAnchor="middle" fontSize="38"
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >🎁</motion.text>
          ) : (
            <>
              <text x="0" y="0" textAnchor="middle" fontSize="32"
                    opacity={treasureReady ? 1 : 0.5}>📦</text>
              {!treasureReady && (
                <text x="0" y="-2" textAnchor="middle" fontSize="16">🔒</text>
              )}
            </>
          )}
          <text x="0" y="20" textAnchor="middle" fontSize="11"
                fontWeight="700" fontFamily="var(--font-primary)" fill="#8B6340"
                direction="rtl">
            {treasureOpen ? '!נִפְתַּח' : '!אוֹצָר'}
          </text>

          {/* Touch target for treasure */}
          {treasureReady && !treasureOpen && (
            <circle cx="0" cy="-10" r="32" fill="transparent"/>
          )}
        </g>
      </svg>

      {/* ── Cat companion (HTML overlay) ─────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: `${(catX / 800) * 100}%`,
        top: `${(catY / 520) * 100}%`,
        zIndex: 5,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }}>
        <CatCharacter
          size={90}
          pose="idle"
          speechBubble={catSpeech}
          doFunnyAnimation={false}
        />
      </div>

      {/* ── Progress bar ─────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(340px, 80%)',
        zIndex: 6,
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.18)',
          borderRadius: '999px',
          height: '10px',
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            style={{ height: '100%', background: '#6BCB77', borderRadius: '999px' }}
          />
        </div>
        <p style={{
          textAlign: 'center', margin: '0.3rem 0 0',
          fontFamily: 'var(--font-primary)', fontSize: '13px',
          color: 'white', fontWeight: 700,
          textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          direction: 'rtl',
        }}>
          {done}/{total} מִשְׂחָקִים הוּשְׁלְמוּ
        </p>
      </div>

      {/* ── Top header ───────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.65rem 1.2rem',
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.5)',
          direction: 'rtl',
        }}
      >
        <h2 style={{
          fontFamily: 'var(--font-primary)', fontSize: '1.1rem', fontWeight: 700,
          color: subject === 'math' ? '#7C6FEB' : '#4ECDC4', margin: 0,
        }}>
          {meta.icon} {meta.name}
        </h2>
        <button
          onClick={onBack}
          aria-label="חֲזָרָה לַמַּפָּה"
          style={{
            fontFamily: 'var(--font-primary)', fontSize: '0.95rem',
            color: '#4A5568', background: 'rgba(0,0,0,0.06)',
            border: 'none', borderRadius: '8px', padding: '6px 14px',
            cursor: 'pointer', direction: 'rtl',
          }}
        >
          ← חֲזָרָה לַמַּפָּה
        </button>
      </motion.header>

      {/* ── Safe space button ─────────────────────────────────────── */}
      <button
        onClick={onSafeSpace}
        aria-label="פִּינַת הַשֶּׁקֶט"
        style={{
          position: 'absolute',
          bottom: '1rem',
          insetInlineEnd: '1rem',
          zIndex: 10,
          width: 52, height: 52,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.85)',
          border: '2px solid rgba(255,255,255,0.9)',
          fontSize: '1.5rem',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
        }}
      >
        🏠
      </button>
    </motion.div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git -C ~/Desktop/Stuff/Gefen*Tree* add learning-star/src/components/ui/IslandView.tsx
git -C ~/Desktop/Stuff/Gefen*Tree* commit -m "feat(map): add IslandView — landscape, winding path, pins, cat, progress bar"
```

---

## Task 6: Rewrite WorldMapScreen

**Files:**
- Rewrite: `src/pages/WorldMapScreen.tsx`

The parchment treasure map. Inline SVG with two island shapes + decorations. State machine switches between `'map'` and `'island'` views using AnimatePresence.

- [ ] **Step 1: Rewrite `src/pages/WorldMapScreen.tsx`**

```typescript
import { AnimatePresence, motion } from "framer-motion";
import { useState, useCallback } from "react";
import { IslandView } from "../components/ui/IslandView";
import { CatCharacter } from "../components/ui/CatCharacter";
import { StarCounter } from "../components/ui/StarCounter";
import { SafeSpaceButton } from "../components/ui/SafeSpaceButton";
import { useWorldMapMusic } from "../hooks/useWorldMapMusic";
import { useRewardStore } from "../stores/rewardStore";
import {
  getRecommendedIsland, isTreasureUnlocked,
} from "../engine/islandProgress";
import type { IslandSubject } from "../engine/islandProgress";

// ─── Types ────────────────────────────────────────────────────────────────────

type MapView =
  | { mode: 'map' }
  | { mode: 'island'; subject: IslandSubject };

interface WorldMapScreenProps {
  onSelectGame:  (route: string) => void;
  onSafeSpace:   () => void;
  onOpenAlbum?:  () => void;
  starCount?:    number;
  stickerCount?: number;
}

// ─── Parchment map SVG ────────────────────────────────────────────────────────

interface MapSVGProps {
  recommendedSubject: IslandSubject;
  mathTreasureOpen: boolean;
  readingTreasureOpen: boolean;
  onSelectMath: () => void;
  onSelectReading: () => void;
}

function ParchmentMap({
  recommendedSubject,
  mathTreasureOpen,
  readingTreasureOpen,
  onSelectMath,
  onSelectReading,
}: MapSVGProps) {
  const mathGlow    = recommendedSubject === 'math';
  const readingGlow = recommendedSubject === 'reading';

  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-label="מַפַּת הַהַרְפַּתְקָאוֹת"
    >
      {/* Parchment base */}
      <rect width="800" height="500" fill="#D4B87A"/>
      {/* Subtle radial sheen */}
      <radialGradient id="parchGlow" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#E8D4A0" stopOpacity="0.4"/>
        <stop offset="100%" stopColor="#B89850" stopOpacity="0.0"/>
      </radialGradient>
      <rect width="800" height="500" fill="url(#parchGlow)"/>

      {/* Ocean/sea colour tint over parchment */}
      <rect width="800" height="500" fill="#5A94B0" opacity="0.22"/>

      {/* Hand-drawn wave lines */}
      <g stroke="#4A7A8C" fill="none" strokeWidth="1.2" opacity="0.18">
        <path d="M40,130 Q72,125 104,130 Q136,135 168,130 Q200,125 232,130"/>
        <path d="M310,85 Q342,80 374,85 Q406,90 438,85"/>
        <path d="M495,420 Q527,415 559,420 Q591,425 623,420"/>
        <path d="M90,395 Q122,390 154,395 Q186,400 218,395"/>
        <path d="M595,162 Q627,157 659,162 Q691,167 723,162"/>
      </g>

      {/* ── MATH ISLAND — upper right ─────────────────────────────── */}
      <g
        onClick={onSelectMath}
        style={{ cursor: 'pointer' }}
        role="button"
        aria-label="אִי הַמִּסְפָּרִים — 4 מִשְׂחָקִים"
      >
        {/* Glow ring if recommended or treasure open */}
        {(mathGlow || mathTreasureOpen) && (
          <motion.ellipse
            cx="590" cy="175" rx="105" ry="100"
            fill="none"
            stroke={mathTreasureOpen ? '#FFD700' : '#7C6FEB'}
            strokeWidth="4" opacity="0.45"
            animate={{ opacity: [0.45, 0.2, 0.45] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          />
        )}
        {/* Island land shape */}
        <path
          d="M480,108 Q518,72 578,82 Q638,68 678,94 Q718,114 707,154 Q728,195 697,224
             Q677,264 637,273 Q598,284 558,268 Q518,273 488,242 Q458,212 448,172 Q438,132 480,108Z"
          fill="#8B9E6B" stroke="#6B7D4E" strokeWidth="2.5"
        />
        {/* Sandy beach edge */}
        <path
          d="M488,242 Q518,273 558,268 Q598,284 637,273 Q677,264 697,224"
          fill="none" stroke="#E8D5A3" strokeWidth="8" opacity="0.7" strokeLinecap="round"
        />
        {/* Mini volcano */}
        <path d="M578,85 L598,132 L558,132Z" fill="#7A8B5A" stroke="#6B7D4E" strokeWidth="1"/>
        <path d="M573,92 L588,114 L562,114Z" fill="#9BAF7A"/>
        {/* Palm trees */}
        <line x1="518" y1="162" x2="522" y2="136" stroke="#8B6340" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M522,136 Q510,126 505,132" stroke="#4CAF50" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M522,136 Q534,124 538,130" stroke="#4CAF50" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <line x1="660" y1="175" x2="657" y2="150" stroke="#8B6340" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M657,150 Q645,140 641,146" stroke="#4CAF50" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M657,150 Q669,138 674,144" stroke="#4CAF50" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

        {/* Island label */}
        <text x="590" y="204"
              textAnchor="middle" fontFamily="'Assistant','Rubik',sans-serif"
              fontSize="17" fontWeight="700" fill="#2D3748" direction="rtl">
          🏝️ אִי הַמִּסְפָּרִים
        </text>
        <text x="590" y="224"
              textAnchor="middle" fontFamily="'Assistant','Rubik',sans-serif"
              fontSize="12" fill="#4A5568">
          4 מִשְׂחָקִים{mathTreasureOpen ? ' ✅' : ''}
        </text>

        {/* Recommended badge */}
        {mathGlow && (
          <motion.g
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <rect x="525" y="68" width="130" height="18" rx="9" fill="#FFD700"/>
            <text x="590" y="81"
                  textAnchor="middle" fontSize="11" fontWeight="700"
                  fontFamily="'Assistant','Rubik',sans-serif" fill="#2D3748">
              ✨ מוּמְלָץ עַכְשָׁו
            </text>
          </motion.g>
        )}
      </g>

      {/* ── READING ISLAND — lower left ───────────────────────────── */}
      <g
        onClick={onSelectReading}
        style={{ cursor: 'pointer' }}
        role="button"
        aria-label="אִי הַסִּפּוּרִים — 1 מִשְׂחָקִים"
      >
        {(readingGlow || readingTreasureOpen) && (
          <motion.ellipse
            cx="180" cy="305" rx="108" ry="98"
            fill="none"
            stroke={readingTreasureOpen ? '#FFD700' : '#4ECDC4'}
            strokeWidth="4" opacity="0.45"
            animate={{ opacity: [0.45, 0.2, 0.45] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          />
        )}
        <path
          d="M78,255 Q118,224 178,233 Q238,218 278,243 Q308,263 298,303
             Q308,343 278,363 Q238,393 178,382 Q128,398 88,372 Q58,342 53,302 Q48,272 78,255Z"
          fill="#6B8E5A" stroke="#5A7A4A" strokeWidth="2.5"
        />
        {/* Beach */}
        <path
          d="M88,372 Q128,398 178,382 Q238,393 278,363 Q308,343 298,303"
          fill="none" stroke="#E8D5A3" strokeWidth="8" opacity="0.7" strokeLinecap="round"
        />
        {/* Trees */}
        <rect x="134" y="260" width="11" height="55" rx="4" fill="#6B4226"/>
        <circle cx="139" cy="252" r="23" fill="#2E7D32" opacity="0.85"/>
        <circle cx="154" cy="258" r="17" fill="#388E3C" opacity="0.8"/>
        <circle cx="128" cy="265" r="14" fill="#43A047" opacity="0.8"/>
        <rect x="196" y="265" width="10" height="50" rx="4" fill="#6B4226"/>
        <circle cx="201" cy="257" r="20" fill="#2E7D32" opacity="0.85"/>
        <circle cx="215" cy="263" r="14" fill="#388E3C" opacity="0.8"/>
        {/* Sparkles */}
        <text x="112" y="308" fontSize="12" opacity="0.55">✨</text>
        <text x="228" y="295" fontSize="10" opacity="0.45">✨</text>

        {/* Island label */}
        <text x="178" y="338"
              textAnchor="middle" fontFamily="'Assistant','Rubik',sans-serif"
              fontSize="17" fontWeight="700" fill="#2D3748" direction="rtl">
          📚 אִי הַסִּפּוּרִים
        </text>
        <text x="178" y="358"
              textAnchor="middle" fontFamily="'Assistant','Rubik',sans-serif"
              fontSize="12" fill="#4A5568">
          1 מִשְׂחָקִים{readingTreasureOpen ? ' ✅' : ''}
        </text>

        {readingGlow && (
          <motion.g
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <rect x="112" y="218" width="132" height="18" rx="9" fill="#FFD700"/>
            <text x="178" y="231"
                  textAnchor="middle" fontSize="11" fontWeight="700"
                  fontFamily="'Assistant','Rubik',sans-serif" fill="#2D3748">
              ✨ מוּמְלָץ עַכְשָׁו
            </text>
          </motion.g>
        )}
      </g>

      {/* ── Dotted sea route ──────────────────────────────────────── */}
      <path
        d="M278,300 Q340,255 400,275 Q460,295 488,242"
        stroke="#8B6340" strokeWidth="2" fill="none"
        strokeDasharray="8,7" opacity="0.38"
      />

      {/* ── Compass rose ─────────────────────────────────────────── */}
      <g transform="translate(715, 428)" opacity="0.42">
        <circle cx="0" cy="0" r="26" fill="none" stroke="#8B6340" strokeWidth="1.5"/>
        <text x="0" y="-14" textAnchor="middle" fontSize="9" fill="#8B6340" fontWeight="700">N</text>
        <text x="0" y="20" textAnchor="middle" fontSize="9" fill="#8B6340" fontWeight="700">S</text>
        <text x="17" y="4" textAnchor="middle" fontSize="9" fill="#8B6340" fontWeight="700">E</text>
        <text x="-17" y="4" textAnchor="middle" fontSize="9" fill="#8B6340" fontWeight="700">W</text>
        <line x1="0" y1="-10" x2="0" y2="10" stroke="#8B6340" strokeWidth="1.5"/>
        <line x1="-10" y1="0" x2="10" y2="0" stroke="#8B6340" strokeWidth="1.5"/>
      </g>

      {/* ── Decorations ──────────────────────────────────────────── */}
      <text x="390" y="445" fontSize="22" opacity="0.25">🐙</text>
      <text x="648" y="358" fontSize="16" opacity="0.22">🐠</text>
      <text x="338" y="155" fontSize="14" opacity="0.2">🐚</text>
      <text x="105" y="165" fontSize="20" opacity="0.22">⚓</text>

      {/* ── Parchment border ─────────────────────────────────────── */}
      <rect x="2" y="2" width="796" height="496" fill="none" stroke="#B8963E" strokeWidth="7" rx="6"/>
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WorldMapScreen({
  onSelectGame,
  onSafeSpace,
  onOpenAlbum,
  starCount = 0,
  stickerCount = 0,
}: WorldMapScreenProps) {
  useWorldMapMusic();
  const { completedGames, islandTreasures } = useRewardStore();
  const [view, setView] = useState<MapView>({ mode: 'map' });
  const [catFunny, setCatFunny] = useState(false);

  const recommendedSubject = getRecommendedIsland(completedGames);
  const mathTreasureOpen   = islandTreasures.includes('math');
  const readingTreasureOpen = islandTreasures.includes('reading');

  const catSpeech =
    view.mode === 'map'
      ? recommendedSubject === 'math'
        ? '!נְסִי אֶת אִי הַמִּסְפָּרִים'
        : '!נְסִי אֶת אִי הַסִּפּוּרִים'
      : '!בַּחֲרִי מִשְׂחָק';

  const handleCatClick = useCallback(() => {
    setCatFunny(true);
    setTimeout(() => setCatFunny(false), 600);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ position: 'relative', width: '100%', height: '100svh', overflow: 'hidden' }}
    >
      <AnimatePresence mode="wait">

        {view.mode === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}
          >
            {/* ── Top header ──────────────────────────────────────── */}
            <header style={{
              position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.65rem 1.2rem',
              background: 'rgba(212,184,122,0.88)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderBottom: '1px solid rgba(184,150,62,0.4)',
              direction: 'rtl',
            }}>
              <h1 style={{
                flex: 1, fontFamily: 'var(--font-primary)', fontSize: '1.15rem',
                fontWeight: 700, color: '#5A3E1B', margin: 0,
              }}>
                🗺️ מַפַּת הַהַרְפַּתְקָאוֹת
              </h1>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {stickerCount > 0 && (
                  <motion.button
                    onClick={onOpenAlbum}
                    whileTap={{ scale: 0.92 }}
                    aria-label={`פְּתַח אַלְבּוּם מַדְבְּקוֹת — ${stickerCount} מַדְבְּקוֹת`}
                    style={{
                      background: 'rgba(255,255,255,0.7)', border: 'none',
                      borderRadius: '20px', padding: '4px 12px',
                      fontFamily: 'var(--font-primary)', fontSize: '14px',
                      fontWeight: 700, color: '#FFB347', cursor: 'pointer',
                    }}
                  >
                    🏅 {stickerCount}
                  </motion.button>
                )}
                <StarCounter count={starCount} compact />
              </div>
            </header>

            {/* ── Parchment map ────────────────────────────────────── */}
            <div style={{ flex: 1, paddingTop: '48px', position: 'relative' }}>
              <ParchmentMap
                recommendedSubject={recommendedSubject}
                mathTreasureOpen={mathTreasureOpen}
                readingTreasureOpen={readingTreasureOpen}
                onSelectMath={() => setView({ mode: 'island', subject: 'math' })}
                onSelectReading={() => setView({ mode: 'island', subject: 'reading' })}
              />
            </div>

            {/* ── Cat on boat ──────────────────────────────────────── */}
            <div style={{
              position: 'absolute',
              bottom: '18%', left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 5,
            }}>
              <CatCharacter
                size={100}
                pose="idle"
                speechBubble={catSpeech}
                doFunnyAnimation={catFunny}
                onClick={handleCatClick}
              />
            </div>

            {/* ── Safe space ───────────────────────────────────────── */}
            <SafeSpaceButton onPress={onSafeSpace} position="bottom-end" />
          </motion.div>
        )}

        {view.mode === 'island' && (
          <IslandView
            key={`island-${view.subject}`}
            subject={view.subject}
            onSelectGame={onSelectGame}
            onBack={() => setView({ mode: 'map' })}
            onSafeSpace={onSafeSpace}
          />
        )}

      </AnimatePresence>
    </motion.div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Fix any type errors before proceeding. Common fix: if `SafeSpaceButton` doesn't accept `position` prop, remove it and position it manually.

- [ ] **Step 3: Run dev server and verify map renders**

```bash
npm run dev
```

Open http://localhost:5173/map — verify the parchment map appears with both islands.

- [ ] **Step 4: Commit**

```bash
git -C ~/Desktop/Stuff/Gefen*Tree* add learning-star/src/pages/WorldMapScreen.tsx
git -C ~/Desktop/Stuff/Gefen*Tree* commit -m "feat(map): rewrite WorldMapScreen — parchment SVG map + island zoom state machine"
```

---

## Task 7: Simplify App.tsx + Wire Completion Tracking

**Files:**
- Modify: `src/App.tsx`
- Delete (safe to remove now): `src/components/ui/IslandButton.tsx`

Replace 5 separate `onSelectX` callbacks with a single `onSelectGame(route)`. Record game completion in `handleActivityBack()`.

- [ ] **Step 1: Update `src/App.tsx`**

Find and replace the `/map` route element. Change from:

```typescript
// OLD — 5 separate props
<WorldMapScreen
  onSelectMath={() => enterActivity("/counting", "math")}
  onSelectAddition={() => { ensureSession(); navigate("/addition"); }}
  onSelectGafbon={() => { ensureSession(); navigate("/gafbon"); }}
  onSelectOceanSub={() => { ensureSession(); navigate("/subtraction"); }}
  onSelectReading={() => enterActivity("/reading", "reading")}
  onSafeSpace={() => navigate("/safe-space")}
  onOpenAlbum={() => setShowAlbum(true)}
  starCount={stars}
  stickerCount={stickersEarned.length}
  recommendedSubject={recommendedSubject}
/>
```

To:

```typescript
// NEW — single onSelectGame prop
<WorldMapScreen
  onSelectGame={(route) => {
    const subject: "math" | "reading" =
      route === "/reading" ? "reading" : "math";
    enterActivity(route, subject);
  }}
  onSafeSpace={() => navigate("/safe-space")}
  onOpenAlbum={() => setShowAlbum(true)}
  starCount={stars}
  stickerCount={stickersEarned.length}
/>
```

- [ ] **Step 2: Add completion tracking to `handleActivityBack`**

Add `markGameCompleted` to the imports from rewardStore, then update `handleActivityBack`:

```typescript
// Add to existing reward store destructure near top of App():
const { stars, stickersEarned, markGameCompleted } = useRewardStore();

// Update handleActivityBack:
function handleActivityBack() {
  markGameCompleted(location.pathname);   // ← NEW: record which game was finished
  finishSession();
  refreshCurriculum();
  navigate("/map");
}
```

- [ ] **Step 3: Remove stale imports from App.tsx**

Remove these lines (no longer needed):
```typescript
// Remove:
const {
  recommendedSubject,
  nextActivity,
  ...
} = useCurriculum();

// Keep only what's still used: getStartingLevel, startSession, finishSession, refresh
```

Check the actual `useCurriculum` destructure in App.tsx and remove any bindings that are no longer referenced (TypeScript will flag them).

- [ ] **Step 4: Type-check + build**

```bash
npx tsc --noEmit 2>&1 | head -30
npm run build 2>&1 | tail -20
```

Expected: clean build with no errors.

- [ ] **Step 5: Delete old IslandButton.tsx**

```bash
rm "/Users/Kobi/Desktop/Stuff/Gefen's Tree of Knowledge/learning-star/src/components/ui/IslandButton.tsx"
```

- [ ] **Step 6: Commit**

```bash
git -C ~/Desktop/Stuff/Gefen*Tree* add -A learning-star/src/App.tsx learning-star/src/components/ui/IslandButton.tsx
git -C ~/Desktop/Stuff/Gefen*Tree* commit -m "feat(map): simplify App.tsx — single onSelectGame prop, completion tracking, remove IslandButton"
```

---

## Task 8: Smoke Test + Mobile Verification

No code changes — verify the complete feature works correctly.

- [ ] **Step 1: Start dev server and test world map**

```bash
npm run dev
```

Open http://localhost:5173/map — verify:
- [ ] Parchment map renders with Math Island (upper-right) and Reading Island (lower-left)
- [ ] Cat visible with speech bubble
- [ ] Tapping Math Island transitions to Math island view
- [ ] Tapping Reading Island transitions to Reading island view
- [ ] Back button returns to parchment map

- [ ] **Step 2: Test island view**

In Math island view — verify:
- [ ] Tropical landscape renders (sky, ocean, terrain, mountain, palms)
- [ ] 4 pins on the winding path — counting as 'current' (gold), rest 'locked' (grey)
- [ ] Tapping 'current' pin navigates to /counting game
- [ ] Completing /counting (pressing back) returns to /map
- [ ] Returning to Math island now shows counting as 'completed' (green), addition as 'current'
- [ ] Tapping a locked pin shows cat speech "!קוֹדֶם נְסַיֵּם אֶת הַמִּשְׂחָק הַקּוֹדֵם"
- [ ] Progress bar updates after completion

- [ ] **Step 3: Test treasure system**

Manually mark all math games complete via browser console (or just play through counting):
```javascript
// In browser console (for testing):
window.__rewardStore = require('./stores/rewardStore');
```
Or simply play through all games. When all 4 math games are completed:
- [ ] Treasure chest becomes tappable (no lock icon)
- [ ] Tapping treasure → chest changes to 🎁, +5 stars added, sticker awarded
- [ ] On world map, Math Island shows "4 מִשְׂחָקִים ✅"

- [ ] **Step 4: Test mobile (320px viewport)**

In browser DevTools, set viewport to 320×568 (iPhone SE size):
- [ ] Both islands visible on parchment map, no overflow
- [ ] Island tap works with finger-sized targets
- [ ] Island view fills screen, pins tappable without zooming
- [ ] Back button + safe space reachable
- [ ] Progress bar and header don't overlap content

- [ ] **Step 5: Final commit**

```bash
git -C ~/Desktop/Stuff/Gefen*Tree* commit -m "feat(map): world map redesign complete — treasure map, island zoom, pinpoints, treasure system" --allow-empty
```

---

## Summary of All Files Changed

| File | Change |
|------|--------|
| `src/stores/rewardStore.ts` | + `completedGames`, `islandTreasures`, 2 actions |
| `src/engine/islandProgress.ts` | NEW — pure functions, GAME_REGISTRY |
| `src/components/ui/GamePin.tsx` | NEW — flag pin, 3 states, 64px hit area |
| `src/components/ui/IslandLandscape.tsx` | NEW — Math + Reading SVG landscapes |
| `src/components/ui/IslandView.tsx` | NEW — full island view component |
| `src/pages/WorldMapScreen.tsx` | REWRITE — parchment map + state machine |
| `src/App.tsx` | Simplify callbacks + record completion |
| `src/components/ui/IslandButton.tsx` | DELETE |

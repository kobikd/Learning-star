# Game Mechanics Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap every game in a `RescueSession` that shows a live animal-rescue narrative during gameplay and delivers a 4-act reward sequence (freedom → rescue card → puzzle piece → unicorn skin) when enough correct answers are given.

**Architecture:** A render-props wrapper `RescueSession` sits between App.tsx and each game component. Games call `onCorrectAnswer()` per correct answer; when the count reaches `config.totalQuestions`, the wrapper hides the game and shows the `RewardSequence`. All config (animal, danger type, skin, puzzle piece) lives in a single `gameRegistry.ts`.

**Tech Stack:** React 18 + TypeScript + Framer Motion 12 + Zustand persist + SVG (feTurbulence, SMIL) + CSS keyframes. No new npm packages.

**Path note:** The project root folder name contains a curly apostrophe (U+2019). Use `python3` for all file writes and `python3 -c "import subprocess; subprocess.run([...], check=True)"` for git commands. All paths use `os.path.expanduser`.

**Verification:** After each task run `cd ~/Desktop/Stuff/Gefen\u2019s\ Tree\ of\ Knowledge/learning-star && npx tsc --noEmit 2>&1 | head -30` — expect 0 new errors (pre-existing errors in unrelated files are OK).

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `src/engine/gameRegistry.ts` | All 5 game configs: rescue narrative + reward data |
| Create | `src/components/rescue/DangerScene.tsx` | SVG danger scenes (5 types), `progress` prop 0→1 |
| Create | `src/components/rescue/RescueOverlay.tsx` | 120px fixed strip shown during gameplay |
| Create | `src/components/rescue/UnicornDresser.tsx` | SVG unicorn + costume pieces that animate on |
| Create | `src/components/rescue/RewardSequence.tsx` | Full-screen 4-act post-game celebration |
| Create | `src/components/rescue/RescueSession.tsx` | Render-props wrapper |
| Modify | `src/content/stickers.ts` | Add owl sticker (id='owl') |
| Modify | `src/stores/rewardStore.ts` | Add cards, puzzlePieces, islandAlive, skins + actions |
| Modify | `src/pages/activities/CountingGarden.tsx` | Add `onCorrectAnswer?` prop |
| Modify | `src/pages/activities/AdditionBubbles.tsx` | Add `onCorrectAnswer?` prop |
| Modify | `src/pages/activities/LetterExplorer.tsx` | Add `onCorrectAnswer?` prop |
| Modify | `src/pages/activities/Gafbon.tsx` | Add `onCorrectAnswer?` prop |
| Modify | `src/pages/activities/OceanSubtraction.tsx` | Add `onCorrectAnswer?` prop |
| Modify | `src/App.tsx` | Wrap routes with RescueSession, add handleSessionComplete |
| Modify | `src/components/ui/IslandView.tsx` | Add puzzle board + unicorn avatar in corner |

---

### Task 1: Game Registry + Owl Sticker

**Files:**
- Create: `learning-star/src/engine/gameRegistry.ts`
- Modify: `learning-star/src/content/stickers.ts` (add owl)

- [ ] **Step 1: Add owl sticker to stickers.ts**

Open `src/content/stickers.ts`. The `STICKERS` array currently has 27 items ending with `coral`. Add owl after `fox` in the animals section:

```typescript
  { id: 'fox',       emoji: '🦊', name: 'שׁוּעָל',      topic: 'animals' },
  { id: 'owl',       emoji: '🦉', name: 'יַנְשׁוּף',     topic: 'animals' },
```

(Insert before the `// ── Space ──` comment.)

- [ ] **Step 2: Create `src/engine/gameRegistry.ts`**

Write the full file using python3:

```bash
python3 << 'EOF'
import os
path = os.path.expanduser("~/Desktop/Stuff/Gefen\u2019s Tree of Knowledge/learning-star/src/engine/gameRegistry.ts")
content = '''// gameRegistry.ts — single source of truth for all game rescue + reward configs

export interface RescueStage {
  labelHe: string;   // Hebrew encouragement shown at this stage
  progress: number;  // 0–1, drives DangerScene animation
}

export interface SkinPiece {
  id: string;
  svgPath: string;
  color: string;
  animateFrom: "top" | "right" | "left" | "pop";
  x: number;        // center x on the unicorn SVG (viewBox 0 0 100 120)
  y: number;        // center y
  width: number;
  height: number;
}

export interface SkinConfig {
  id: string;
  nameHe: string;
  pieces: SkinPiece[];
}

export interface GameConfig {
  id: string;
  route: string;
  subject: "math" | "reading";
  nameHe: string;
  totalQuestions: number;
  rescue: {
    animal: string;
    animalNameHe: string;
    danger: "web" | "quicksand" | "bubble" | "net" | "storm";
    stages: RescueStage[];   // length === totalQuestions
    freedomTextHe: string;
  };
  reward: {
    cardTitleHe: string;
    cardSubtitleHe: string;
    stickerEmoji: string;
    stickerId: string;
    skin: SkinConfig;
    puzzlePiece: {
      islandId: "math" | "reading";
      pieceIndex: 0 | 1 | 2 | 3;
    };
  };
}

function makeStages(total: number, labels: string[]): RescueStage[] {
  return Array.from({ length: total }, (_, i) => ({
    labelHe: labels[i] ?? `\u05e2\u05d5\u05b9\u05d3 ${total - i - 1} \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05d5\u05b9\u05ea!`,
    progress: (i + 1) / total,
  }));
}

export const GAME_CONFIGS: Record<string, GameConfig> = {
  "/counting": {
    id: "counting",
    route: "/counting",
    subject: "math",
    nameHe: "\u05d2\u05bc\u05b7\u05df \u05d4\u05b7\u05e1\u05b0\u05bc\u05e4\u05b4\u05d9\u05e8\u05b8\u05d4",
    totalQuestions: 5,
    rescue: {
      animal: "\u{1F98B}",
      animalNameHe: "\u05e4\u05bc\u05b7\u05e8\u05b0\u05e4\u05bc\u05b7\u05e8",
      danger: "web",
      stages: makeStages(5, [
        "\u05e2\u05d5\u05b9\u05d3 4 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05d5\u05b9\u05ea!",
        "\u05e2\u05d5\u05b9\u05d3 3 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05d5\u05b9\u05ea!",
        "\u05e2\u05d5\u05b9\u05d3 2 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05d5\u05b9\u05ea!",
        "\u05e2\u05d5\u05b9\u05d3 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05b8\u05d4 \u05d0\u05b7\u05d7\u05b7\u05ea!",
        "\u05db\u05bc\u05b8\u05de\u05b0\u05e2\u05b7\u05d8 \u05d7\u05d5\u05b9\u05e4\u05b0\u05e9\u05c1\u05b4\u05d9!",
      ]),
      freedomTextHe: "\u05d4\u05b7\u05e4\u05bc\u05b7\u05e8\u05b0\u05e4\u05bc\u05b7\u05e8 \u05d7\u05d5\u05b9\u05e4\u05b0\u05e9\u05c1\u05b4\u05d9!",
    },
    reward: {
      cardTitleHe: "\u05e4\u05bc\u05b7\u05e8\u05b0\u05e4\u05bc\u05b7\u05e8 \u05d7\u05d5\u05b9\u05e4\u05b0\u05e9\u05c1\u05b4\u05d9!",
      cardSubtitleHe: "\u05e9\u05c1\u05b4\u05d7\u05b0\u05e8\u05b7\u05e8\u05b0\u05ea\u05bc\u05b0 \u05d0\u05d5\u05b9\u05ea\u05d5\u05b9 \u05de\u05b5\u05d4\u05b8\u05e8\u05b6\u05e9\u05c1\u05b6\u05ea",
      stickerEmoji: "\u{1F98B}",
      stickerId: "butterfly",
      skin: {
        id: "garden",
        nameHe: "\u05d2\u05bc\u05b7\u05e0\u05bc\u05b8\u05e0\u05b4\u05d9\u05ea",
        pieces: [
          { id: "flower-crown", svgPath: "M-18,-6 Q-10,-16 0,-6 Q10,-16 18,-6 Q10,4 0,0 Q-10,4 -18,-6Z", color: "#FF9F43", animateFrom: "top", x: 50, y: 6, width: 36, height: 12 },
          { id: "apron", svgPath: "M-20,0 L20,0 L16,36 Q0,44 -16,36Z", color: "#26de81", animateFrom: "right", x: 50, y: 74, width: 40, height: 44 },
          { id: "badge", svgPath: "M0,-6 L1.5,-2 L6,-2 L2.5,1 L4,5 L0,2.5 L-4,5 L-2.5,1 L-6,-2 L-1.5,-2Z", color: "#FFC312", animateFrom: "pop", x: 68, y: 76, width: 14, height: 14 },
        ],
      },
      puzzlePiece: { islandId: "math", pieceIndex: 0 },
    },
  },
  "/addition": {
    id: "addition",
    route: "/addition",
    subject: "math",
    nameHe: "\u05d7\u05b4\u05d9\u05d1\u05bc\u05d5\u05bc\u05e8 \u05d1\u05bc\u05d5\u05bc\u05e2\u05d5\u05b9\u05ea",
    totalQuestions: 5,
    rescue: {
      animal: "\u{1F430}",
      animalNameHe: "\u05d0\u05b7\u05e8\u05b0\u05e0\u05b8\u05d1",
      danger: "bubble",
      stages: makeStages(5, [
        "\u05e2\u05d5\u05b9\u05d3 4 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05d5\u05b9\u05ea!",
        "\u05e2\u05d5\u05b9\u05d3 3 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05d5\u05b9\u05ea!",
        "\u05e2\u05d5\u05b9\u05d3 2 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05d5\u05b9\u05ea!",
        "\u05e2\u05d5\u05b9\u05d3 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05b8\u05d4 \u05d0\u05b7\u05d7\u05b7\u05ea!",
        "\u05db\u05bc\u05b8\u05de\u05b0\u05e2\u05b7\u05d8 \u05d7\u05d5\u05b9\u05e4\u05b0\u05e9\u05c1\u05b4\u05d9!",
      ]),
      freedomTextHe: "\u05d4\u05b8\u05d0\u05b7\u05e8\u05b0\u05e0\u05b8\u05d1 \u05d7\u05d5\u05b9\u05e4\u05b0\u05e9\u05c1\u05b4\u05d9!",
    },
    reward: {
      cardTitleHe: "\u05d0\u05b7\u05e8\u05b0\u05e0\u05b8\u05d1 \u05d7\u05d5\u05b9\u05e4\u05b0\u05e9\u05c1\u05b4\u05d9!",
      cardSubtitleHe: "\u05e9\u05c1\u05b4\u05d7\u05b0\u05e8\u05b7\u05e8\u05b0\u05ea\u05bc\u05b0 \u05d0\u05d5\u05b9\u05ea\u05d5\u05b9 \u05de\u05b5\u05d4\u05b7\u05d1\u05bc\u05d5\u05bc\u05e2\u05b8\u05d4",
      stickerEmoji: "\u{1F430}",
      stickerId: "rabbit",
      skin: {
        id: "diver",
        nameHe: "\u05e6\u05d5\u05b9\u05dc\u05b6\u05dc\u05b6\u05ea",
        pieces: [
          { id: "goggles", svgPath: "M-14,-3 L-6,-3 L-6,3 L-14,3Z M6,-3 L14,-3 L14,3 L6,3Z M-6,0 L6,0", color: "#4ECDC4", animateFrom: "top", x: 50, y: 26, width: 32, height: 8 },
          { id: "wetsuit", svgPath: "M-20,0 L20,0 L18,42 Q0,50 -18,42Z", color: "#2C3E50", animateFrom: "right", x: 50, y: 74, width: 40, height: 50 },
        ],
      },
      puzzlePiece: { islandId: "math", pieceIndex: 1 },
    },
  },
  "/gafbon": {
    id: "gafbon",
    route: "/gafbon",
    subject: "math",
    nameHe: "\u05d2\u05bc\u05b7\u05e4\u05b0\u05d1\u05bc\u05d5\u05b9\u05df",
    totalQuestions: 5,
    rescue: {
      animal: "\u{1F438}",
      animalNameHe: "\u05e6\u05b0\u05e4\u05b7\u05e8\u05b0\u05d3\u05bc\u05b5\u05e2\u05b7",
      danger: "quicksand",
      stages: makeStages(5, [
        "\u05e2\u05d5\u05b9\u05d3 4 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05d5\u05b9\u05ea!",
        "\u05e2\u05d5\u05b9\u05d3 3 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05d5\u05b9\u05ea!",
        "\u05e2\u05d5\u05b9\u05d3 2 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05d5\u05b9\u05ea!",
        "\u05e2\u05d5\u05b9\u05d3 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05b8\u05d4 \u05d0\u05b7\u05d7\u05b7\u05ea!",
        "\u05db\u05bc\u05b8\u05de\u05b0\u05e2\u05b7\u05d8 \u05d7\u05d5\u05b9\u05e4\u05b0\u05e9\u05c1\u05b4\u05d9!",
      ]),
      freedomTextHe: "\u05d4\u05b7\u05e6\u05b0\u05bc\u05e4\u05b7\u05e8\u05b0\u05d3\u05bc\u05b5\u05e2\u05b7 \u05d7\u05d5\u05b9\u05e4\u05b0\u05e9\u05c1\u05b4\u05ea!",
    },
    reward: {
      cardTitleHe: "\u05e6\u05b0\u05e4\u05b7\u05e8\u05b0\u05d3\u05bc\u05b5\u05e2\u05b7 \u05d7\u05d5\u05b9\u05e4\u05b0\u05e9\u05c1\u05b4\u05ea!",
      cardSubtitleHe: "\u05e9\u05c1\u05b4\u05d7\u05b0\u05e8\u05b7\u05e8\u05b0\u05ea\u05bc\u05b0 \u05d0\u05d5\u05b9\u05ea\u05b8\u05d4\u05bc \u05de\u05b5\u05d4\u05b7\u05d1\u05bc\u05b9\u05e5",
      stickerEmoji: "\u{1F438}",
      stickerId: "frog",
      skin: {
        id: "explorer",
        nameHe: "\u05d7\u05d5\u05b9\u05e7\u05b6\u05e8\u05b6\u05ea",
        pieces: [
          { id: "safari-hat", svgPath: "M-20,-8 Q0,-20 20,-8 L16,0 Q0,4 -16,0Z", color: "#F9CA24", animateFrom: "top", x: 50, y: 8, width: 40, height: 10 },
          { id: "compass", svgPath: "M0,-7 L1.5,-2 L7,0 L1.5,2 L0,7 L-1.5,2 L-7,0 L-1.5,-2Z", color: "#EAB543", animateFrom: "pop", x: 30, y: 78, width: 16, height: 16 },
        ],
      },
      puzzlePiece: { islandId: "math", pieceIndex: 2 },
    },
  },
  "/subtraction": {
    id: "subtraction",
    route: "/subtraction",
    subject: "math",
    nameHe: "\u05d7\u05b4\u05d9\u05e1\u05bc\u05d5\u05bc\u05e8 \u05d1\u05bc\u05b7\u05d9\u05bc\u05b8\u05dd",
    totalQuestions: 5,
    rescue: {
      animal: "\u{1F42C}",
      animalNameHe: "\u05d3\u05bc\u05d5\u05b9\u05dc\u05b0\u05e4\u05b4\u05d9\u05df",
      danger: "net",
      stages: makeStages(5, [
        "\u05e2\u05d5\u05b9\u05d3 4 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05d5\u05b9\u05ea!",
        "\u05e2\u05d5\u05b9\u05d3 3 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05d5\u05b9\u05ea!",
        "\u05e2\u05d5\u05b9\u05d3 2 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05d5\u05b9\u05ea!",
        "\u05e2\u05d5\u05b9\u05d3 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05b8\u05d4 \u05d0\u05b7\u05d7\u05b7\u05ea!",
        "\u05db\u05bc\u05b8\u05de\u05b0\u05e2\u05b7\u05d8 \u05d7\u05d5\u05b9\u05e4\u05b0\u05e9\u05c1\u05b4\u05d9!",
      ]),
      freedomTextHe: "\u05d4\u05b7\u05d3\u05bc\u05d5\u05b9\u05dc\u05b0\u05e4\u05b4\u05d9\u05df \u05d7\u05d5\u05b9\u05e4\u05b0\u05e9\u05c1\u05b4\u05d9!",
    },
    reward: {
      cardTitleHe: "\u05d3\u05bc\u05d5\u05b9\u05dc\u05b0\u05e4\u05b4\u05d9\u05df \u05d7\u05d5\u05b9\u05e4\u05b0\u05e9\u05c1\u05b4\u05d9!",
      cardSubtitleHe: "\u05e9\u05c1\u05b4\u05d7\u05b0\u05e8\u05b7\u05e8\u05b0\u05ea\u05bc\u05b0 \u05d0\u05d5\u05b9\u05ea\u05d5\u05b9 \u05de\u05b5\u05d4\u05b8\u05e8\u05b6\u05e9\u05c1\u05b6\u05ea",
      stickerEmoji: "\u{1F42C}",
      stickerId: "dolphin",
      skin: {
        id: "sailor",
        nameHe: "\u05e7\u05b7\u05e4\u05bc\u05b4\u05d9\u05d8\u05b7\u05e0\u05b4\u05d9\u05ea",
        pieces: [
          { id: "captain-hat", svgPath: "M-18,-8 L18,-8 L20,0 L-20,0Z M-7,-8 L7,-8 L5,-18 L-5,-18Z", color: "#2C3E50", animateFrom: "top", x: 50, y: 8, width: 40, height: 20 },
          { id: "coat", svgPath: "M-22,0 L22,0 L20,44 Q0,52 -20,44Z", color: "#2980b9", animateFrom: "right", x: 50, y: 74, width: 44, height: 52 },
        ],
      },
      puzzlePiece: { islandId: "math", pieceIndex: 3 },
    },
  },
  "/reading": {
    id: "letters",
    route: "/reading",
    subject: "reading",
    nameHe: "\u05d2\u05bc\u05b7\u05df \u05d4\u05b8\u05d0\u05d5\u05b9\u05ea\u05b4\u05d9\u05bc\u05d5\u05b9\u05ea",
    totalQuestions: 5,
    rescue: {
      animal: "\u{1F989}",
      animalNameHe: "\u05d9\u05b7\u05e0\u05b0\u05e9\u05c1\u05d5\u05bc\u05e3",
      danger: "storm",
      stages: makeStages(5, [
        "\u05e2\u05d5\u05b9\u05d3 4 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05d5\u05b9\u05ea!",
        "\u05e2\u05d5\u05b9\u05d3 3 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05d5\u05b9\u05ea!",
        "\u05e2\u05d5\u05b9\u05d3 2 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05d5\u05b9\u05ea!",
        "\u05e2\u05d5\u05b9\u05d3 \u05ea\u05b0\u05e9\u05c1\u05d5\u05bc\u05d1\u05b8\u05d4 \u05d0\u05b7\u05d7\u05b7\u05ea!",
        "\u05db\u05bc\u05b8\u05de\u05b0\u05e2\u05b7\u05d8 \u05d7\u05d5\u05b9\u05e4\u05b0\u05e9\u05c1\u05b4\u05d9!",
      ]),
      freedomTextHe: "\u05d4\u05b7\u05d9\u05bc\u05b7\u05e0\u05b0\u05e9\u05c1\u05d5\u05bc\u05e3 \u05d7\u05d5\u05b9\u05e4\u05b0\u05e9\u05c1\u05b4\u05d9!",
    },
    reward: {
      cardTitleHe: "\u05d9\u05b7\u05e0\u05b0\u05e9\u05c1\u05d5\u05bc\u05e3 \u05d7\u05d5\u05b9\u05e4\u05b0\u05e9\u05c1\u05b4\u05d9!",
      cardSubtitleHe: "\u05e9\u05c1\u05b4\u05d7\u05b0\u05e8\u05b7\u05e8\u05b0\u05ea\u05bc\u05b0 \u05d0\u05d5\u05b9\u05ea\u05d5\u05b9 \u05de\u05b5\u05d4\u05b7\u05e1\u05bc\u05b7\u05e2\u05b2\u05e8\u05b8\u05d4",
      stickerEmoji: "\u{1F989}",
      stickerId: "owl",
      skin: {
        id: "wizard",
        nameHe: "\u05e7\u05d5\u05b9\u05e1\u05b6\u05de\u05b6\u05ea",
        pieces: [
          { id: "wizard-hat", svgPath: "M0,-28 L14,0 L-14,0Z", color: "#6C5CE7", animateFrom: "top", x: 50, y: 2, width: 28, height: 30 },
          { id: "robe", svgPath: "M-22,0 L22,0 L19,48 Q0,56 -19,48Z", color: "#8854d0", animateFrom: "left", x: 50, y: 74, width: 44, height: 56 },
          { id: "wand", svgPath: "M0,-18 L0,18 M-3,-21 L3,-15 M3,-21 L-3,-15", color: "#FFC312", animateFrom: "pop", x: 76, y: 76, width: 8, height: 38 },
        ],
      },
      puzzlePiece: { islandId: "reading", pieceIndex: 0 },
    },
  },
};
'''
os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Written:", path)
EOF
```

- [ ] **Step 3: Verify no TypeScript errors**

```bash
cd ~/Desktop/Stuff/Gefen\ *Tree*/learning-star && npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors from files in `src/engine/gameRegistry.ts` or `src/content/stickers.ts`.

- [ ] **Step 4: Commit**

```bash
python3 -c "
import subprocess, os
repo = os.path.expanduser('~/Desktop/Stuff/Gefen\u2019s Tree of Knowledge')
subprocess.run(['git', '-C', repo, 'add',
    'learning-star/src/engine/gameRegistry.ts',
    'learning-star/src/content/stickers.ts'], check=True)
subprocess.run(['git', '-C', repo, 'commit', '-m',
    'feat: add gameRegistry with 5 rescue/reward configs + owl sticker\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>'], check=True)
"
```

---

### Task 2: Extend RewardStore

**Files:**
- Modify: `learning-star/src/stores/rewardStore.ts`

The current store has: `stars`, `streak`, `stickersEarned`, `completedGames`, `islandTreasures`.

Add: `earnedCards`, `puzzlePieces`, `islandAlive`, `earnedSkins`, `activeSkin` + their actions. Also add `earnSticker(id)` — a direct way to add a sticker by ID (replacing the old sequential `earnNextSticker` pattern for game completions).

- [ ] **Step 1: Replace `src/stores/rewardStore.ts` with the updated version**

```bash
python3 << 'EOF'
import os
path = os.path.expanduser("~/Desktop/Stuff/Gefen\u2019s Tree of Knowledge/learning-star/src/stores/rewardStore.ts")
content = '''import { create } from "zustand";
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
  stickersEarned:    string[];          // sticker IDs from STICKERS
  completedGames:    string[];          // routes finished, e.g. ["/counting"]
  islandTreasures:   string[];          // kept for legacy compatibility

  // ── New ───────────────────────────────────────────────────────────────────
  earnedCards:       EarnedCard[];
  puzzlePieces:      { math: boolean[]; reading: boolean[] };
  islandAlive:       Array<"math" | "reading">;
  earnedSkins:       string[];          // skin IDs in earn order
  activeSkin:        string | null;     // currently equipped skin ID

  // ── Actions ───────────────────────────────────────────────────────────────
  recordCorrect:      () => { streakBonus: boolean };
  recordWrong:        () => void;
  earnNextSticker:    () => StickerDefinition | null;  // kept for legacy
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
'''
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Written:", path)
EOF
```

Note: The persistence key changed to `gefen-learning-star-v2` so old persisted data is not loaded (avoids type mismatch).

- [ ] **Step 2: Verify**

```bash
cd ~/Desktop/Stuff/Gefen\ *Tree*/learning-star && npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 new errors related to `rewardStore.ts`.

- [ ] **Step 3: Commit**

```bash
python3 -c "
import subprocess, os
repo = os.path.expanduser('~/Desktop/Stuff/Gefen\u2019s Tree of Knowledge')
subprocess.run(['git', '-C', repo, 'add', 'learning-star/src/stores/rewardStore.ts'], check=True)
subprocess.run(['git', '-C', repo, 'commit', '-m',
    'feat: extend rewardStore with cards, puzzlePieces, skins, islandAlive\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>'], check=True)
"
```

---

### Task 3: DangerScene Component

**Files:**
- Create: `learning-star/src/components/rescue/DangerScene.tsx`

SVG 200×80px component. `progress` prop (0–1) drives how much danger remains. All 5 scenes use SVG feTurbulence for continuous micro-animation plus opacity/transform-driven progress animation.

- [ ] **Step 1: Create `src/components/rescue/DangerScene.tsx`**

```bash
python3 << 'EOF'
import os
path = os.path.expanduser("~/Desktop/Stuff/Gefen\u2019s Tree of Knowledge/learning-star/src/components/rescue/DangerScene.tsx")
os.makedirs(os.path.dirname(path), exist_ok=True)
content = '''import type { GameConfig } from "../../engine/gameRegistry";

interface DangerSceneProps {
  danger: GameConfig["rescue"]["danger"];
  animal: string;
  progress: number;   // 0 = fully trapped, 1 = fully free
}

// progress 0→1 means danger fades away
function clamp(v: number) { return Math.max(0, Math.min(1, v)); }

function WebScene({ animal, progress }: { animal: string; progress: number }) {
  const opacity = clamp(1 - progress);
  return (
    <g>
      <defs>
        <filter id="web-turbulence">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise">
            <animate attributeName="baseFrequency" values="0.04;0.06;0.04" dur="3s" repeatCount="indefinite"/>
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
      {/* Web threads */}
      <g opacity={opacity} filter="url(#web-turbulence)">
        <line x1="70" y1="0" x2="100" y2="40" stroke="#C8A882" strokeWidth="1.5" opacity="0.8"/>
        <line x1="100" y1="0" x2="100" y2="40" stroke="#C8A882" strokeWidth="1.5" opacity="0.8"/>
        <line x1="130" y1="0" x2="100" y2="40" stroke="#C8A882" strokeWidth="1.5" opacity="0.8"/>
        <line x1="60" y1="20" x2="140" y2="20" stroke="#C8A882" strokeWidth="1.5" opacity="0.7"/>
        <line x1="55" y1="35" x2="145" y2="35" stroke="#C8A882" strokeWidth="1.5" opacity="0.7"/>
        <ellipse cx="100" cy="40" rx="30" ry="25" stroke="#C8A882" strokeWidth="2" fill="rgba(200,168,130,0.15)"/>
      </g>
      {/* Animal */}
      <text
        x="100" y="48"
        textAnchor="middle"
        fontSize={progress > 0.8 ? "34" : "28"}
        style={{
          transition: "font-size 0.4s",
          animation: "animalWiggle 1.4s ease-in-out infinite",
        }}
      >{animal}</text>
    </g>
  );
}

function BubbleScene({ animal, progress }: { animal: string; progress: number }) {
  const scale = clamp(1 - progress * 0.4);  // bubble shrinks as progress grows
  const crackOpacity = clamp(progress * 2 - 0.5);  // cracks appear after 50% progress
  return (
    <g transform={`translate(100,40) scale(${scale}) translate(-100,-40)`}>
      <defs>
        <radialGradient id="bubble-grad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="rgba(78,205,196,0.7)"/>
          <stop offset="60%" stopColor="rgba(78,205,196,0.2)"/>
          <stop offset="100%" stopColor="rgba(78,205,196,0.5)"/>
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="42" rx="36" ry="30" fill="url(#bubble-grad)" stroke="#4ECDC4" strokeWidth="2.5">
        <animate attributeName="rx" values="36;38;36" dur="2s" repeatCount="indefinite"/>
      </ellipse>
      {/* Cracks */}
      <g opacity={crackOpacity}>
        <path d="M88,18 L94,28 L86,36" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7"/>
        <path d="M112,20 L107,30 L115,38" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7"/>
      </g>
      {/* Shine */}
      <ellipse cx="88" cy="28" rx="8" ry="5" fill="rgba(255,255,255,0.4)" transform="rotate(-20,88,28)"/>
      <text x="100" y="50" textAnchor="middle" fontSize="28"
        style={{ animation: "animalWiggle 1.6s ease-in-out infinite" }}
      >{animal}</text>
    </g>
  );
}

function QuicksandScene({ animal, progress }: { animal: string; progress: number }) {
  const sinkDepth = clamp(1 - progress) * 24;  // animal sinks as danger increases
  return (
    <g>
      <defs>
        <filter id="sand-turbulence">
          <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="3" result="noise">
            <animate attributeName="baseFrequency" values="0.05;0.08;0.05" dur="2.5s" repeatCount="indefinite"/>
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
      {/* Sand surface */}
      <rect x="40" y="50" width="120" height="30" rx="4" fill="#C8963A" filter="url(#sand-turbulence)" opacity="0.85"/>
      <rect x="40" y="48" width="120" height="8" rx="4" fill="#E8B84A" filter="url(#sand-turbulence)" opacity="0.7"/>
      {/* Animal sinking */}
      <text
        x="100" y={48 - sinkDepth + sinkDepth * progress}
        textAnchor="middle" fontSize="30"
        style={{ animation: "animalWiggle 1.2s ease-in-out infinite" }}
      >{animal}</text>
    </g>
  );
}

function NetScene({ animal, progress }: { animal: string; progress: number }) {
  const netOpacity = clamp(1 - progress);
  const tearWidth  = clamp(progress) * 40;
  return (
    <g>
      {/* Net grid */}
      <g opacity={netOpacity}>
        {[60,75,90,105,120,135].map(x => (
          <line key={`v${x}`} x1={x} y1="8" x2={x} y2="72" stroke="#8B6340" strokeWidth="1.5"/>
        ))}
        {[15,30,45,60].map(y => (
          <line key={`h${y}`} x1="60" y1={y} x2="140" y2={y} stroke="#8B6340" strokeWidth="1.5"/>
        ))}
        <rect x="60" y="8" width="80" height="64" stroke="#8B6340" strokeWidth="2.5" fill="rgba(139,99,64,0.1)" rx="2"/>
      </g>
      {/* Tear opening */}
      {progress > 0.2 && (
        <ellipse cx="100" cy="40" rx={tearWidth / 2} ry={tearWidth * 0.4}
          fill="rgba(100,180,255,0.15)" stroke="rgba(139,99,64,0.5)" strokeWidth="1"
          strokeDasharray="3,2"
        />
      )}
      <text x="100" y="46" textAnchor="middle" fontSize="30"
        style={{ animation: "animalWiggle 1.4s ease-in-out infinite" }}
      >{animal}</text>
    </g>
  );
}

function StormScene({ animal, progress }: { animal: string; progress: number }) {
  const cloudOpacity = clamp(1 - progress);
  const lightningOpacity = clamp(1 - progress * 2);
  return (
    <g>
      <defs>
        <filter id="storm-blur">
          <feGaussianBlur stdDeviation="1.5"/>
        </filter>
      </defs>
      {/* Clouds */}
      <g opacity={cloudOpacity}>
        <ellipse cx="75" cy="25" rx="28" ry="16" fill="#8899AA" filter="url(#storm-blur)">
          <animateTransform attributeName="transform" type="translate" values="0,0;-5,2;0,0" dur="3s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="125" cy="20" rx="24" ry="14" fill="#99AABB" filter="url(#storm-blur)">
          <animateTransform attributeName="transform" type="translate" values="0,0;4,-2;0,0" dur="3.5s" repeatCount="indefinite"/>
        </ellipse>
      </g>
      {/* Lightning */}
      <polyline points="105,30 98,45 104,45 96,62" stroke="#FFD700" strokeWidth="2.5"
        fill="none" opacity={lightningOpacity}
        style={{ filter: "drop-shadow(0 0 4px #FFD700)" }}
      >
        <animate attributeName="opacity" values={`${lightningOpacity};0;${lightningOpacity}`} dur="1.5s" repeatCount="indefinite"/>
      </polyline>
      <text x="100" y="52" textAnchor="middle" fontSize="30"
        style={{ animation: "animalWiggle 1s ease-in-out infinite" }}
      >{animal}</text>
    </g>
  );
}

export function DangerScene({ danger, animal, progress }: DangerSceneProps) {
  return (
    <svg
      viewBox="0 0 200 80"
      width="200" height="80"
      style={{ overflow: "visible" }}
    >
      <style>{`
        @keyframes animalWiggle {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
        }
      `}</style>
      {danger === "web"       && <WebScene      animal={animal} progress={progress}/>}
      {danger === "bubble"    && <BubbleScene   animal={animal} progress={progress}/>}
      {danger === "quicksand" && <QuicksandScene animal={animal} progress={progress}/>}
      {danger === "net"       && <NetScene      animal={animal} progress={progress}/>}
      {danger === "storm"     && <StormScene    animal={animal} progress={progress}/>}
    </svg>
  );
}
'''
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Written:", path)
EOF
```

- [ ] **Step 2: Verify**

```bash
cd ~/Desktop/Stuff/Gefen\ *Tree*/learning-star && npx tsc --noEmit 2>&1 | grep "rescue/DangerScene" | head -10
```

Expected: no output (0 errors in this file).

- [ ] **Step 3: Commit**

```bash
python3 -c "
import subprocess, os
repo = os.path.expanduser('~/Desktop/Stuff/Gefen\u2019s Tree of Knowledge')
subprocess.run(['git', '-C', repo, 'add', 'learning-star/src/components/rescue/DangerScene.tsx'], check=True)
subprocess.run(['git', '-C', repo, 'commit', '-m',
    'feat: add DangerScene SVG (5 danger types, progress-driven)\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>'], check=True)
"
```

---

### Task 4: RescueOverlay Component

**Files:**
- Create: `learning-star/src/components/rescue/RescueOverlay.tsx`

Fixed 120px strip at top of screen. Left: wiggling animal emoji. Center: progress bar + DangerScene. Right: Hebrew stage label.

- [ ] **Step 1: Create `src/components/rescue/RescueOverlay.tsx`**

```bash
python3 << 'EOF'
import os
path = os.path.expanduser("~/Desktop/Stuff/Gefen\u2019s Tree of Knowledge/learning-star/src/components/rescue/RescueOverlay.tsx")
content = '''import { motion } from "framer-motion";
import { DangerScene } from "./DangerScene";
import type { GameConfig } from "../../engine/gameRegistry";

interface RescueOverlayProps {
  config: GameConfig;
  answersCorrect: number;
}

export function RescueOverlay({ config, answersCorrect }: RescueOverlayProps) {
  const { rescue, totalQuestions } = config;
  const progress = answersCorrect / totalQuestions;
  const stageIdx = Math.min(answersCorrect, rescue.stages.length - 1);
  const stage = rescue.stages[stageIdx];

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      height: 120,
      zIndex: 100,
      background: "rgba(10,10,26,0.88)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      borderBottom: "2px solid rgba(255,215,0,0.2)",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "0 1.2rem",
      direction: "rtl",
    }}>
      {/* Animal emoji */}
      <div style={{
        fontSize: 42,
        flexShrink: 0,
        animation: "rescueWiggle 1.4s ease-in-out infinite",
      }}>
        {rescue.animal}
      </div>

      {/* Center: progress bar + scene */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        {/* Progress bar */}
        <div style={{
          background: "rgba(255,255,255,0.12)",
          borderRadius: 999,
          height: 10,
          overflow: "hidden",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
        }}>
          <motion.div
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            style={{
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #6BCB77, #FFD700)",
              boxShadow: "0 0 8px rgba(107,203,119,0.6)",
            }}
          />
        </div>
        {/* Danger scene */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <DangerScene
            danger={rescue.danger}
            animal={rescue.animal}
            progress={progress}
          />
        </div>
      </div>

      {/* Stage label */}
      <div style={{
        flexShrink: 0,
        maxWidth: 90,
        textAlign: "center",
        fontFamily: "var(--font-primary, system-ui)",
        fontSize: 13,
        fontWeight: 700,
        color: progress >= 1 ? "#FFD700" : "rgba(255,255,255,0.85)",
        direction: "rtl",
        lineHeight: 1.4,
      }}>
        {answersCorrect === 0
          ? rescue.animalNameHe + " צָרִיךְ עֶזְרָה!"
          : stage?.labelHe ?? ""}
      </div>

      <style>{`
        @keyframes rescueWiggle {
          0%, 100% { transform: rotate(-5deg) scale(1); }
          50% { transform: rotate(5deg) scale(1.08); }
        }
      `}</style>
    </div>
  );
}
'''
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Written:", path)
EOF
```

- [ ] **Step 2: Verify**

```bash
cd ~/Desktop/Stuff/Gefen\ *Tree*/learning-star && npx tsc --noEmit 2>&1 | grep "rescue/" | head -10
```

Expected: no errors in rescue/ files.

- [ ] **Step 3: Commit**

```bash
python3 -c "
import subprocess, os
repo = os.path.expanduser('~/Desktop/Stuff/Gefen\u2019s Tree of Knowledge')
subprocess.run(['git', '-C', repo, 'add', 'learning-star/src/components/rescue/RescueOverlay.tsx'], check=True)
subprocess.run(['git', '-C', repo, 'commit', '-m',
    'feat: add RescueOverlay (120px strip with progress bar + DangerScene)\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>'], check=True)
"
```

---

### Task 5: UnicornDresser Component

**Files:**
- Create: `learning-star/src/components/rescue/UnicornDresser.tsx`

Full SVG unicorn (viewBox 0 0 100 120). Accepts optional `skin` prop. When skin is provided, each `SkinPiece` animates onto the unicorn with a staggered delay using its `animateFrom` direction.

- [ ] **Step 1: Create `src/components/rescue/UnicornDresser.tsx`**

```bash
python3 << 'EOF'
import os
path = os.path.expanduser("~/Desktop/Stuff/Gefen\u2019s Tree of Knowledge/learning-star/src/components/rescue/UnicornDresser.tsx")
content = '''import { motion, AnimatePresence } from "framer-motion";
import type { SkinConfig, SkinPiece } from "../../engine/gameRegistry";

interface UnicornDresserProps {
  skin?: SkinConfig | null;
  size?: number;           // rendered size in px (default 120)
  animate?: boolean;       // whether to animate skin pieces on (default true)
}

function getInitialTransform(piece: SkinPiece) {
  switch (piece.animateFrom) {
    case "top":   return { y: -80, opacity: 0 };
    case "right": return { x: 80,  opacity: 0 };
    case "left":  return { x: -80, opacity: 0 };
    case "pop":   return { scale: 0, opacity: 0 };
    default:      return { opacity: 0 };
  }
}

function SkinPieceLayer({ piece, index }: { piece: SkinPiece; index: number }) {
  return (
    <motion.g
      key={piece.id}
      initial={getInitialTransform(piece)}
      animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      transition={{
        delay: index * 0.35,
        type: "spring",
        stiffness: 280,
        damping: 20,
      }}
    >
      <path
        d={piece.svgPath}
        fill={piece.color}
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="0.8"
        transform={`translate(${piece.x},${piece.y})`}
      />
    </motion.g>
  );
}

export function UnicornDresser({ skin = null, size = 120, animate = true }: UnicornDresserProps) {
  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      style={{ overflow: "visible" }}
    >
      {/* ── Body ── */}
      <ellipse cx="50" cy="78" rx="30" ry="20" fill="#F0D6FF"/>
      {/* ── Tail ── */}
      <path d="M20,68 Q10,62 12,76 Q14,88 22,84" stroke="#DDB6FF" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M20,68 Q8,64 10,80" stroke="#FF9FF3" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* ── Legs ── */}
      <rect x="26" y="94" width="8" height="20" rx="4" fill="#E0C0F8"/>
      <rect x="38" y="96" width="8" height="20" rx="4" fill="#E0C0F8"/>
      <rect x="54" y="96" width="8" height="20" rx="4" fill="#E0C0F8"/>
      <rect x="66" y="94" width="8" height="20" rx="4" fill="#E0C0F8"/>
      {/* ── Neck ── */}
      <path d="M58,66 Q72,62 70,48 Q68,40 64,37" stroke="#E0C0F8" strokeWidth="13" fill="none" strokeLinecap="round"/>
      <path d="M58,66 Q72,62 70,48 Q68,40 64,37" stroke="#F0D6FF" strokeWidth="9" fill="none" strokeLinecap="round"/>
      {/* ── Head ── */}
      <circle cx="62" cy="33" r="17" fill="#F0D6FF"/>
      {/* ── Horn ── */}
      <path d="M62,16 L57,32 L67,32Z" fill="#FFD700"/>
      <line x1="62" y1="17" x2="62" y2="31" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
      {/* ── Mane ── */}
      <path d="M50,34 Q42,40 44,54 Q46,62 50,66" stroke="#FF9FF3" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M52,31 Q46,37 48,50 Q50,58 54,63" stroke="#C44FBF" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M54,29 Q50,35 52,46" stroke="#FF6BCD" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* ── Eye ── */}
      <circle cx="68" cy="33" r="3.5" fill="#5C4BD6"/>
      <circle cx="69" cy="32" r="1.2" fill="white"/>
      {/* ── Nose ── */}
      <ellipse cx="74" cy="40" rx="5.5" ry="3.5" fill="#EEB0DC"/>
      <circle cx="73" cy="39.5" r="1" fill="rgba(0,0,0,0.25)"/>
      <circle cx="76" cy="41" r="1" fill="rgba(0,0,0,0.25)"/>

      {/* ── Skin pieces ── */}
      <AnimatePresence>
        {skin && skin.pieces.map((piece, i) => (
          animate
            ? <SkinPieceLayer key={piece.id} piece={piece} index={i}/>
            : (
              <g key={piece.id}>
                <path
                  d={piece.svgPath}
                  fill={piece.color}
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="0.8"
                  transform={`translate(${piece.x},${piece.y})`}
                />
              </g>
            )
        ))}
      </AnimatePresence>
    </svg>
  );
}
'''
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Written:", path)
EOF
```

- [ ] **Step 2: Verify**

```bash
cd ~/Desktop/Stuff/Gefen\ *Tree*/learning-star && npx tsc --noEmit 2>&1 | grep "rescue/" | head -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
python3 -c "
import subprocess, os
repo = os.path.expanduser('~/Desktop/Stuff/Gefen\u2019s Tree of Knowledge')
subprocess.run(['git', '-C', repo, 'add', 'learning-star/src/components/rescue/UnicornDresser.tsx'], check=True)
subprocess.run(['git', '-C', repo, 'commit', '-m',
    'feat: add UnicornDresser SVG with animated skin pieces\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>'], check=True)
"
```

---

### Task 6: RewardSequence Component

**Files:**
- Create: `learning-star/src/components/rescue/RewardSequence.tsx`

Full-screen overlay. 4 acts auto-advance with setTimeout. Calls store actions at the right moments. Skippable after Act 1.

- [ ] **Step 1: Create `src/components/rescue/RewardSequence.tsx`**

```bash
python3 << 'EOF'
import os
path = os.path.expanduser("~/Desktop/Stuff/Gefen\u2019s Tree of Knowledge/learning-star/src/components/rescue/RewardSequence.tsx")
content = '''import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UnicornDresser } from "./UnicornDresser";
import { useRewardStore } from "../../stores/rewardStore";
import type { GameConfig } from "../../engine/gameRegistry";

// Step 0 = freedom, 1 = card, 2 = puzzle piece, 3 = skin, 4 = done (call onDismiss)
type Step = 0 | 1 | 2 | 3 | 4;

const STEP_DURATIONS: Record<number, number> = { 0: 3000, 1: 4000, 2: 3000, 3: 0 };

interface RewardSequenceProps {
  config: GameConfig;
  onDismiss: () => void;
}

function Particle({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) {
  return (
    <motion.div
      style={{
        position: "absolute", left: x, top: y,
        width: 8, height: 8, borderRadius: "50%",
        background: color, pointerEvents: "none",
      }}
      initial={{ scale: 1, opacity: 1, x: 0, y: 0 }}
      animate={{
        scale: 0,
        opacity: 0,
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
      }}
      transition={{ duration: 1.4, delay, ease: "easeOut" }}
    />
  );
}

function PuzzleBoard({ islandId, pieces, newPieceIndex }: {
  islandId: "math" | "reading";
  pieces: boolean[];
  newPieceIndex: number;
}) {
  const color = islandId === "math" ? "#7C6FEB" : "#4ECDC4";
  // 4 puzzle pieces in 2x2 grid
  const layout = [
    { x: 8,  y: 8,  tabR: true,  tabB: true  },  // top-left
    { x: 76, y: 8,  tabR: false, tabB: true  },  // top-right
    { x: 8,  y: 76, tabR: true,  tabB: false },   // bottom-left
    { x: 76, y: 76, tabR: false, tabB: false },   // bottom-right
  ];

  function piecePath(tabR: boolean, tabB: boolean): string {
    const r = tabR  ? "L60,10 Q68,4 68,20 Q68,36 60,30 L60,60" : "L60,60";
    const b = tabB  ? "L30,60 Q24,68 16,68 Q8,68 10,60 L10,60" : "L10,60";
    return `M10,10 L60,10 ${r} L60,60 ${b} L10,60 Z`;
  }

  return (
    <svg viewBox="0 0 150 150" width={150} height={150}>
      {layout.map((l, i) => (
        <motion.g key={i} transform={`translate(${l.x},${l.y})`}
          initial={i === newPieceIndex ? { scale: 0, opacity: 0 } : {}}
          animate={{ scale: 1, opacity: 1 }}
          transition={i === newPieceIndex
            ? { type: "spring", stiffness: 300, damping: 18, delay: 0.3 }
            : {}
          }
        >
          <path
            d={piecePath(l.tabR, l.tabB)}
            fill={pieces[i] ? color : "rgba(255,255,255,0.1)"}
            stroke={pieces[i] ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"}
            strokeWidth="2"
            style={i === newPieceIndex && pieces[i] ? {
              filter: "drop-shadow(0 0 8px gold)",
            } : {}}
          />
          {pieces[i] && (
            <text x="30" y="38" textAnchor="middle" fontSize="22">
              {i === newPieceIndex ? "✨" : "⭐"}
            </text>
          )}
        </motion.g>
      ))}
    </svg>
  );
}

export function RewardSequence({ config, onDismiss }: RewardSequenceProps) {
  const [step, setStep] = useState<Step>(0);
  const [canSkip, setCanSkip] = useState(false);
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      x: 80 + Math.random() * 240,
      y: 80 + Math.random() * 300,
      color: ["#FFD700","#6BCB77","#FF9FF3","#4ECDC4","#FF6B6B"][i % 5],
      delay: i * 0.06,
    }))
  );

  const { earnCard, earnSticker, earnPuzzlePiece, unlockIsland, earnSkin, puzzlePieces } =
    useRewardStore();
  const actionsCalledRef = useRef({ card: false, puzzle: false, skin: false });

  // Earn rewards at the right step
  useEffect(() => {
    if (step === 1 && !actionsCalledRef.current.card) {
      actionsCalledRef.current.card = true;
      earnCard({
        gameId: config.id,
        earnedAt: Date.now(),
        animal: config.rescue.animal,
        titleHe: config.reward.cardTitleHe,
      });
      earnSticker(config.reward.stickerId);
    }
    if (step === 2 && !actionsCalledRef.current.puzzle) {
      actionsCalledRef.current.puzzle = true;
      earnPuzzlePiece(config.reward.puzzlePiece.islandId, config.reward.puzzlePiece.pieceIndex);
      // Check if all 4 pieces are now earned
      const updated = useRewardStore.getState().puzzlePieces;
      if (updated[config.reward.puzzlePiece.islandId].every(Boolean)) {
        unlockIsland(config.reward.puzzlePiece.islandId);
      }
    }
    if (step === 3 && !actionsCalledRef.current.skin) {
      actionsCalledRef.current.skin = true;
      earnSkin(config.reward.skin.id);
    }
    if (step === 4) {
      onDismiss();
    }
  }, [step]);

  // Auto-advance
  useEffect(() => {
    const dur = STEP_DURATIONS[step];
    if (dur === undefined || dur === 0) return;
    const t = setTimeout(() => setStep(s => (s + 1) as Step), dur);
    return () => clearTimeout(t);
  }, [step]);

  // Enable skip after Act 1
  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => setCanSkip(true), 2800);
      return () => clearTimeout(t);
    }
  }, [step]);

  const currentPieces = useRewardStore(s => s.puzzlePieces);
  const islandPieces = currentPieces[config.reward.puzzlePiece.islandId];
  const isLastPiece = islandPieces.every(Boolean);

  function handleTap() {
    if (!canSkip) return;
    if (step < 3) setStep((step + 1) as Step);
    else setStep(4);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleTap}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "radial-gradient(ellipse at 50% 40%, #1A2A4A, #0a0a1a)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 24, padding: 24,
        cursor: canSkip ? "pointer" : "default",
        overflowY: "auto",
      }}
    >
      {/* Particles — Act 1 only */}
      {step === 0 && particles.map((p, i) => (
        <Particle key={i} {...p}/>
      ))}

      <AnimatePresence mode="wait">
        {/* Act 1 — Freedom */}
        {step === 0 && (
          <motion.div key="act1"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            style={{ textAlign: "center" }}
          >
            <div style={{ fontSize: 100, marginBottom: 16,
              animation: "freeJump 0.8s ease-in-out infinite" }}>
              {config.rescue.animal}
            </div>
            <div style={{
              fontFamily: "var(--font-primary, system-ui)",
              fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
              fontWeight: 800,
              color: "#FFD700",
              direction: "rtl",
              textShadow: "0 0 24px rgba(255,215,0,0.6)",
            }}>
              {config.rescue.freedomTextHe}
            </div>
          </motion.div>
        )}

        {/* Act 2 — Rescue Card */}
        {step === 1 && (
          <motion.div key="act2"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            style={{
              background: "linear-gradient(135deg, #1A4A8A, #2B7BBB)",
              borderRadius: 20,
              border: "3px solid #FFD700",
              boxShadow: "0 8px 40px rgba(255,215,0,0.4), 0 0 80px rgba(78,205,196,0.2)",
              padding: "28px 36px",
              textAlign: "center",
              minWidth: 240,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Shine */}
            <motion.div
              initial={{ left: "-60%" }}
              animate={{ left: "160%" }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              style={{
                position: "absolute", top: 0, bottom: 0, width: "40%",
                background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)",
                pointerEvents: "none",
              }}
            />
            <div style={{ fontSize: 72, marginBottom: 8 }}>{config.rescue.animal}</div>
            <div style={{
              fontFamily: "var(--font-primary, system-ui)",
              fontSize: "1.3rem", fontWeight: 800, color: "#FFD700",
              direction: "rtl", marginBottom: 8,
            }}>
              {config.reward.cardTitleHe}
            </div>
            <div style={{
              fontSize: "0.9rem", color: "rgba(255,255,255,0.75)",
              direction: "rtl", marginBottom: 12,
            }}>
              {config.reward.cardSubtitleHe}
            </div>
            <div style={{ fontSize: 22, letterSpacing: 4 }}>⭐⭐⭐⭐⭐</div>
          </motion.div>
        )}

        {/* Act 3 — Puzzle Piece */}
        {step === 2 && (
          <motion.div key="act3"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{ textAlign: "center" }}
          >
            <div style={{
              fontFamily: "var(--font-primary, system-ui)",
              fontSize: "1.4rem", fontWeight: 800,
              color: "white", direction: "rtl", marginBottom: 20,
            }}>
              {isLastPiece
                ? "\u05d4\u05d0\u05d5\u05e6\u05e8 \u05e0\u05e4\u05ea\u05d7!"  // הָאוֹצָר נִפְתַּח!
                : "\u05e2\u05d5\u05d3 \u05d7\u05dc\u05e7 \u05dc\u05d0\u05d5\u05e6\u05e8!"  // עוֹד חֵלֶק לָאוֹצָר!
              }
            </div>
            <PuzzleBoard
              islandId={config.reward.puzzlePiece.islandId}
              pieces={islandPieces}
              newPieceIndex={config.reward.puzzlePiece.pieceIndex}
            />
            {isLastPiece && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                style={{ fontSize: 64, marginTop: 12 }}
              >
                🎁
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Act 4 — Unicorn Skin */}
        {step === 3 && (
          <motion.div key="act4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center" }}
            onClick={(e) => { e.stopPropagation(); setStep(4); }}
          >
            <div style={{
              fontFamily: "var(--font-primary, system-ui)",
              fontSize: "1.5rem", fontWeight: 800,
              color: "#FFD700", direction: "rtl", marginBottom: 16,
            }}>
              \u05ea\u05bc\u05b7\u05dc\u05b0\u05d1\u05bc\u05d5\u05b9\u05e9\u05c1\u05b6\u05ea \u05d7\u05b2\u05d3\u05b8\u05e9\u05c1\u05b8\u05d4!
            </div>
            <UnicornDresser skin={config.reward.skin} size={160} animate={true}/>
            <div style={{
              marginTop: 12,
              fontFamily: "var(--font-primary, system-ui)",
              fontSize: "1.1rem", fontWeight: 700,
              color: "rgba(255,255,255,0.8)", direction: "rtl",
            }}>
              {config.reward.skin.nameHe}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep(4)}
              style={{
                marginTop: 24, padding: "12px 36px",
                background: "#FFD700", color: "#1a1a2e",
                border: "none", borderRadius: 999,
                fontFamily: "var(--font-primary, system-ui)",
                fontSize: "1.1rem", fontWeight: 800,
                cursor: "pointer", direction: "rtl",
              }}
            >
              \u05de\u05d3\u05b7\u05d4\u05b5\u05dd!
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {canSkip && step < 3 && (
        <div style={{
          position: "fixed", bottom: 24,
          fontFamily: "var(--font-primary, system-ui)",
          fontSize: "0.85rem", color: "rgba(255,255,255,0.4)",
        }}>
          הקש להמשך ←
        </div>
      )}

      <style>{`
        @keyframes freeJump {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </motion.div>
  );
}
'''
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Written:", path)
EOF
```

- [ ] **Step 2: Verify**

```bash
cd ~/Desktop/Stuff/Gefen\ *Tree*/learning-star && npx tsc --noEmit 2>&1 | grep "rescue/" | head -15
```

Expected: 0 errors in rescue/ files.

- [ ] **Step 3: Commit**

```bash
python3 -c "
import subprocess, os
repo = os.path.expanduser('~/Desktop/Stuff/Gefen\u2019s Tree of Knowledge')
subprocess.run(['git', '-C', repo, 'add', 'learning-star/src/components/rescue/RewardSequence.tsx'], check=True)
subprocess.run(['git', '-C', repo, 'commit', '-m',
    'feat: add RewardSequence (4-act: freedom, card, puzzle, unicorn skin)\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>'], check=True)
"
```

---

### Task 7: RescueSession Wrapper

**Files:**
- Create: `learning-star/src/components/rescue/RescueSession.tsx`

Render-props wrapper. Counts correct answers. Shows overlay during play. When `answersCorrect >= totalQuestions`, hides game and shows full-screen `RewardSequence`.

- [ ] **Step 1: Create `src/components/rescue/RescueSession.tsx`**

```bash
python3 << 'EOF'
import os
path = os.path.expanduser("~/Desktop/Stuff/Gefen\u2019s Tree of Knowledge/learning-star/src/components/rescue/RescueSession.tsx")
content = '''import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { RescueOverlay } from "./RescueOverlay";
import { RewardSequence } from "./RewardSequence";
import type { GameConfig } from "../../engine/gameRegistry";
import type { ReactNode } from "react";

type Phase = "playing" | "rewarding";

interface RescueSessionCallbacks {
  onCorrectAnswer: () => void;
  onComplete: () => void;
}

interface RescueSessionProps {
  config: GameConfig;
  onSessionComplete: () => void;
  children: (callbacks: RescueSessionCallbacks) => ReactNode;
}

export function RescueSession({ config, onSessionComplete, children }: RescueSessionProps) {
  const [answersCorrect, setAnswersCorrect] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");

  const onCorrectAnswer = useCallback(() => {
    setAnswersCorrect(prev => {
      const next = prev + 1;
      if (next >= config.totalQuestions) {
        // Use setTimeout to avoid setting state during render
        setTimeout(() => setPhase("rewarding"), 600);
      }
      return next;
    });
  }, [config.totalQuestions]);

  const onComplete = useCallback(() => {
    // Game\'s own completion (e.g., LetterExplorer finishing all letters)
    setPhase("rewarding");
  }, []);

  return (
    <>
      {phase === "playing" && (
        <>
          {/* Spacer so game content clears the 120px overlay */}
          <div style={{ paddingTop: 120 }}>
            {children({ onCorrectAnswer, onComplete })}
          </div>
          <RescueOverlay config={config} answersCorrect={answersCorrect}/>
        </>
      )}

      <AnimatePresence>
        {phase === "rewarding" && (
          <RewardSequence
            key="reward"
            config={config}
            onDismiss={onSessionComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
}
'''
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Written:", path)
EOF
```

- [ ] **Step 2: Verify**

```bash
cd ~/Desktop/Stuff/Gefen\ *Tree*/learning-star && npx tsc --noEmit 2>&1 | grep "rescue/" | head -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
python3 -c "
import subprocess, os
repo = os.path.expanduser('~/Desktop/Stuff/Gefen\u2019s Tree of Knowledge')
subprocess.run(['git', '-C', repo, 'add', 'learning-star/src/components/rescue/RescueSession.tsx'], check=True)
subprocess.run(['git', '-C', repo, 'commit', '-m',
    'feat: add RescueSession render-props wrapper\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>'], check=True)
"
```

---

### Task 8: Add onCorrectAnswer Prop to All 5 Games

**Files:**
- Modify: `learning-star/src/pages/activities/CountingGarden.tsx`
- Modify: `learning-star/src/pages/activities/AdditionBubbles.tsx`
- Modify: `learning-star/src/pages/activities/LetterExplorer.tsx`
- Modify: `learning-star/src/pages/activities/Gafbon.tsx`
- Modify: `learning-star/src/pages/activities/OceanSubtraction.tsx`

Each game gets an optional `onCorrectAnswer?: () => void` prop. It's called in the same place as `recordCorrect()`. The games already call `recordCorrect()` from the store — add `onCorrectAnswer?.()` right after each such call.

- [ ] **Step 1: CountingGarden.tsx — add prop and call**

Find the `CountingGardenProps` interface (around line 25) and the `recordCorrect()` call (around line 186). Make two edits:

**Edit 1** — Add prop to interface:
```typescript
// Before:
interface CountingGardenProps {
  onBack:       () => void;
  onSafeSpace:  () => void;
  onComplete?:  () => void;
  initialLevel?: number;
}

// After:
interface CountingGardenProps {
  onBack:            () => void;
  onSafeSpace:       () => void;
  onComplete?:       () => void;
  onCorrectAnswer?:  () => void;
  initialLevel?:     number;
}
```

**Edit 2** — Destructure prop (around line 131 where `onBack, onSafeSpace, onComplete` are destructured):
```typescript
// Before:
  onBack,
  onSafeSpace,
  onComplete,
  initialLevel = 3,

// After:
  onBack,
  onSafeSpace,
  onComplete,
  onCorrectAnswer,
  initialLevel = 3,
```

**Edit 3** — Call after `recordCorrect()` (around line 186):
```typescript
// Before:
      const { streakBonus } = recordCorrect();

// After:
      const { streakBonus } = recordCorrect();
      onCorrectAnswer?.();
```

- [ ] **Step 2: AdditionBubbles.tsx — add prop and call**

**Edit 1** — Add to interface (around line 24):
```typescript
// Before:
interface AdditionBubblesProps {
  onBack:       () => void;
  onSafeSpace:  () => void;
  initialLevel?: number;
}

// After:
interface AdditionBubblesProps {
  onBack:            () => void;
  onSafeSpace:       () => void;
  onCorrectAnswer?:  () => void;
  initialLevel?:     number;
}
```

**Edit 2** — Destructure prop (around line 197–201, where `onBack, onSafeSpace` are listed):
```typescript
// Before:
  onBack,
  onSafeSpace,
  initialLevel = 1,

// After:
  onBack,
  onSafeSpace,
  onCorrectAnswer,
  initialLevel = 1,
```

**Edit 3** — Call after `recordCorrect()` (around line 269):
```typescript
// Before:
      const { streakBonus } = recordCorrect();

// After:
      const { streakBonus } = recordCorrect();
      onCorrectAnswer?.();
```

- [ ] **Step 3: LetterExplorer.tsx — add prop and call**

**Edit 1** — Add to interface (around line 20):
```typescript
// Before:
interface LetterExplorerProps {
  onBack:       () => void;
  onSafeSpace:  () => void;
  onComplete?:  () => void;
}

// After:
interface LetterExplorerProps {
  onBack:            () => void;
  onSafeSpace:       () => void;
  onComplete?:       () => void;
  onCorrectAnswer?:  () => void;
}
```

**Edit 2** — Destructure prop (around line 965):
```typescript
// Before:
export function LetterExplorer({ onBack, onSafeSpace, onComplete }: LetterExplorerProps) {

// After:
export function LetterExplorer({ onBack, onSafeSpace, onComplete, onCorrectAnswer }: LetterExplorerProps) {
```

**Edit 3** — Call after `recordCorrect()` (around line 983):
```typescript
// Before:
      recordCorrect();

// After:
      recordCorrect();
      onCorrectAnswer?.();
```

- [ ] **Step 4: Gafbon.tsx — add prop and call**

Find `GafbonProps` interface and the `recordCorrect()` call. Add the same pattern.

First, find the props interface:
```bash
grep -n "interface Gafbon\|onBack\|recordCorrect" ~/Desktop/Stuff/Gefen\ *Tree*/learning-star/src/pages/activities/Gafbon.tsx | head -15
```

Add `onCorrectAnswer?: () => void` to the interface, destructure it, and call `onCorrectAnswer?.()` after `recordCorrect()`.

- [ ] **Step 5: OceanSubtraction.tsx — add prop and call**

Same pattern as Gafbon. Find the interface and the `recordCorrect()` call:
```bash
grep -n "interface Ocean\|onBack\|recordCorrect" ~/Desktop/Stuff/Gefen\ *Tree*/learning-star/src/pages/activities/OceanSubtraction.tsx | head -15
```

Add `onCorrectAnswer?: () => void` to the interface, destructure it, call `onCorrectAnswer?.()` after `recordCorrect()`.

- [ ] **Step 6: Verify all 5 files compile**

```bash
cd ~/Desktop/Stuff/Gefen\ *Tree*/learning-star && npx tsc --noEmit 2>&1 | grep -E "CountingGarden|AdditionBubbles|LetterExplorer|Gafbon|OceanSubtraction" | head -20
```

Expected: 0 errors in these files.

- [ ] **Step 7: Commit**

```bash
python3 -c "
import subprocess, os
repo = os.path.expanduser('~/Desktop/Stuff/Gefen\u2019s Tree of Knowledge')
subprocess.run(['git', '-C', repo, 'add',
    'learning-star/src/pages/activities/CountingGarden.tsx',
    'learning-star/src/pages/activities/AdditionBubbles.tsx',
    'learning-star/src/pages/activities/LetterExplorer.tsx',
    'learning-star/src/pages/activities/Gafbon.tsx',
    'learning-star/src/pages/activities/OceanSubtraction.tsx',
], check=True)
subprocess.run(['git', '-C', repo, 'commit', '-m',
    'feat: add onCorrectAnswer prop to all 5 game components\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>'], check=True)
"
```

---

### Task 9: Wire App.tsx with RescueSession

**Files:**
- Modify: `learning-star/src/App.tsx`

Replace each game route with a `RescueSession` wrapper. Add `handleSessionComplete` function. Remove the now-unused `awardSticker` state (the reward sequence handles sticker display).

- [ ] **Step 1: Add imports to App.tsx**

At the top of `src/App.tsx`, add two imports after the existing imports:

```typescript
import { RescueSession }   from "./components/rescue/RescueSession";
import { GAME_CONFIGS }    from "./engine/gameRegistry";
```

- [ ] **Step 2: Add handleSessionComplete function**

Add this function after `handleActivityBack` (around line 113):

```typescript
  // ── Session completed with reward (from RescueSession) ───────────────────
  function handleSessionComplete() {
    markGameCompleted(location.pathname);
    finishSession();
    refreshCurriculum();
    navigate("/map");
  }
```

- [ ] **Step 3: Remove awardSticker state**

Delete these lines (around line 34–37):
```typescript
  const [awardSticker, setAwardSticker] = useState<
    ReturnType<ReturnType<typeof useRewardStore.getState>["earnNextSticker"]>
  >(null);
```

Also remove the `StickerAward` JSX block at the bottom of the return (the `AnimatePresence` block containing `{awardSticker && <StickerAward ...`).

Also remove `StickerAward` from the import at the top if it's no longer used.

- [ ] **Step 4: Wrap each game route with RescueSession**

Replace the 5 game routes. The `onBack` prop stays as `handleActivityBack` (early exit, no reward). The new `onSessionComplete` on `RescueSession` is `handleSessionComplete`.

```typescript
            <Route path="/counting" element={
              GAME_CONFIGS["/counting"] ? (
                <RescueSession
                  config={GAME_CONFIGS["/counting"]}
                  onSessionComplete={handleSessionComplete}
                >
                  {({ onCorrectAnswer, onComplete }) => (
                    <CountingGarden
                      onBack={handleActivityBack}
                      onSafeSpace={() => navigate("/safe-space")}
                      initialLevel={mathLevel}
                      onCorrectAnswer={onCorrectAnswer}
                      onComplete={onComplete}
                    />
                  )}
                </RescueSession>
              ) : (
                <CountingGarden
                  onBack={handleActivityBack}
                  onSafeSpace={() => navigate("/safe-space")}
                  initialLevel={mathLevel}
                />
              )
            } />

            <Route path="/addition" element={
              GAME_CONFIGS["/addition"] ? (
                <RescueSession
                  config={GAME_CONFIGS["/addition"]}
                  onSessionComplete={handleSessionComplete}
                >
                  {({ onCorrectAnswer, onComplete }) => (
                    <AdditionBubbles
                      onBack={handleActivityBack}
                      onSafeSpace={() => navigate("/safe-space")}
                      initialLevel={additionLevel}
                      onCorrectAnswer={onCorrectAnswer}
                      onComplete={onComplete}
                    />
                  )}
                </RescueSession>
              ) : (
                <AdditionBubbles
                  onBack={handleActivityBack}
                  onSafeSpace={() => navigate("/safe-space")}
                  initialLevel={additionLevel}
                />
              )
            } />

            <Route path="/gafbon" element={
              GAME_CONFIGS["/gafbon"] ? (
                <RescueSession
                  config={GAME_CONFIGS["/gafbon"]}
                  onSessionComplete={handleSessionComplete}
                >
                  {({ onCorrectAnswer, onComplete }) => (
                    <Gafbon
                      onBack={handleActivityBack}
                      onSafeSpace={() => navigate("/safe-space")}
                      onComplete={onComplete}
                      initialLevel={gafbonLevel}
                      onCorrectAnswer={onCorrectAnswer}
                    />
                  )}
                </RescueSession>
              ) : (
                <Gafbon
                  onBack={handleActivityBack}
                  onSafeSpace={() => navigate("/safe-space")}
                  onComplete={handleActivityBack}
                  initialLevel={gafbonLevel}
                />
              )
            } />

            <Route path="/subtraction" element={
              GAME_CONFIGS["/subtraction"] ? (
                <RescueSession
                  config={GAME_CONFIGS["/subtraction"]}
                  onSessionComplete={handleSessionComplete}
                >
                  {({ onCorrectAnswer, onComplete }) => (
                    <OceanSubtraction
                      onBack={handleActivityBack}
                      onSafeSpace={() => navigate("/safe-space")}
                      onComplete={onComplete}
                      initialLevel={oceanSubLevel}
                      onCorrectAnswer={onCorrectAnswer}
                    />
                  )}
                </RescueSession>
              ) : (
                <OceanSubtraction
                  onBack={handleActivityBack}
                  onSafeSpace={() => navigate("/safe-space")}
                  onComplete={handleActivityBack}
                  initialLevel={oceanSubLevel}
                />
              )
            } />

            <Route path="/reading" element={
              GAME_CONFIGS["/reading"] ? (
                <RescueSession
                  config={GAME_CONFIGS["/reading"]}
                  onSessionComplete={handleSessionComplete}
                >
                  {({ onCorrectAnswer, onComplete }) => (
                    <LetterExplorer
                      onBack={handleActivityBack}
                      onSafeSpace={() => navigate("/safe-space")}
                      onCorrectAnswer={onCorrectAnswer}
                      onComplete={onComplete}
                    />
                  )}
                </RescueSession>
              ) : (
                <LetterExplorer
                  onBack={handleActivityBack}
                  onSafeSpace={() => navigate("/safe-space")}
                />
              )
            } />
```

- [ ] **Step 5: Verify build**

```bash
cd ~/Desktop/Stuff/Gefen\ *Tree*/learning-star && npx tsc --noEmit 2>&1 | grep "App.tsx" | head -10
```

Expected: 0 errors in App.tsx.

- [ ] **Step 6: Commit**

```bash
python3 -c "
import subprocess, os
repo = os.path.expanduser('~/Desktop/Stuff/Gefen\u2019s Tree of Knowledge')
subprocess.run(['git', '-C', repo, 'add', 'learning-star/src/App.tsx'], check=True)
subprocess.run(['git', '-C', repo, 'commit', '-m',
    'feat: wire App.tsx with RescueSession for all 5 game routes\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>'], check=True)
"
```

---

### Task 10: IslandView Puzzle Board + Unicorn Avatar

**Files:**
- Modify: `learning-star/src/components/ui/IslandView.tsx`

Add a small puzzle board (bottom-left corner) and a small unicorn avatar (bottom-right corner, currently shows 🏠). The puzzle board shows progress toward the island treasure. The unicorn shows the currently equipped skin.

- [ ] **Step 1: Add imports to IslandView.tsx**

Add these two imports at the top of `src/components/ui/IslandView.tsx`:

```typescript
import { UnicornDresser } from "./UnicornDresser";
import { GAME_CONFIGS }   from "../../engine/gameRegistry";
```

- [ ] **Step 2: Add store fields to the destructure**

The current destructure is:
```typescript
  const { completedGames, islandTreasures, unlockTreasure, earnNextSticker } = useRewardStore();
```

Change to:
```typescript
  const { completedGames, islandTreasures, unlockTreasure, puzzlePieces, activeSkin } = useRewardStore();
```

Also get the skin config for the active skin by looking up GAME_CONFIGS:
```typescript
  const activeSkinConfig = activeSkin
    ? Object.values(GAME_CONFIGS).find(g => g.reward.skin.id === activeSkin)?.reward.skin ?? null
    : null;
```

- [ ] **Step 3: Fix handleTreasureClick**

The current code calls `earnNextSticker()` which no longer exists in the destructure. Replace the call:

```typescript
  // Before:
  function handleTreasureClick() {
    if (!treasureReady || treasureOpen) return;
    unlockTreasure(subject);
    earnNextSticker();
  }

  // After:
  function handleTreasureClick() {
    if (!treasureReady || treasureOpen) return;
    unlockTreasure(subject);
    // Sticker is now earned via RewardSequence when the last puzzle piece is collected
  }
```

- [ ] **Step 4: Add puzzle board to the JSX**

Find the existing progress bar div (position: absolute, bottom: 1rem, left: 50%, transform: translateX(-50%)). Before it, add a puzzle board in the bottom-left:

```typescript
      {/* Puzzle board — bottom left */}
      <div style={{
        position: "absolute",
        bottom: "1rem",
        left: "1rem",
        zIndex: 6,
        background: "rgba(0,0,0,0.45)",
        borderRadius: 12,
        padding: "6px 8px",
        backdropFilter: "blur(6px)",
      }}>
        <div style={{ display: "flex", gap: 4 }}>
          {puzzlePieces[subject].map((earned, i) => (
            <div key={i} style={{
              width: 22, height: 22,
              background: earned ? "#FFD700" : "rgba(255,255,255,0.15)",
              borderRadius: 4,
              border: earned ? "1px solid rgba(255,215,0,0.6)" : "1px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12,
              boxShadow: earned ? "0 0 6px rgba(255,215,0,0.5)" : "none",
              transition: "all 0.3s",
            }}>
              {earned ? "⭐" : ""}
            </div>
          ))}
        </div>
        <div style={{
          fontSize: 9, color: "rgba(255,255,255,0.5)",
          textAlign: "center", marginTop: 3,
          fontFamily: "var(--font-primary)",
          direction: "rtl",
        }}>
          חֵלְקֵי הָאוֹצָר
        </div>
      </div>
```

- [ ] **Step 5: Replace the safe-space 🏠 button with unicorn avatar**

Find the safe-space button (position: absolute, bottom: 1rem, insetInlineEnd: 1rem). Replace it with a unicorn avatar that navigates to safe space:

```typescript
      {/* Unicorn avatar — bottom right (also navigates to safe space on tap) */}
      <button
        onClick={onSafeSpace}
        aria-label="פִּינַת הַשֶּׁקֶט"
        style={{
          position: "absolute",
          bottom: "1rem",
          insetInlineEnd: "1rem",
          zIndex: 10,
          width: 64, height: 64,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.85)",
          border: "2px solid rgba(255,255,255,0.9)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
          overflow: "hidden",
          padding: 0,
        }}
      >
        <UnicornDresser skin={activeSkinConfig} size={52} animate={false}/>
      </button>
```

- [ ] **Step 6: Verify**

```bash
cd ~/Desktop/Stuff/Gefen\ *Tree*/learning-star && npx tsc --noEmit 2>&1 | grep "IslandView" | head -10
```

Expected: 0 errors.

- [ ] **Step 7: Full build check**

```bash
cd ~/Desktop/Stuff/Gefen\ *Tree*/learning-star && npm run build 2>&1 | tail -20
```

Expected: build succeeds (pre-existing errors in other files are OK — look for "built in X" at the end, or 0 new errors).

- [ ] **Step 8: Commit**

```bash
python3 -c "
import subprocess, os
repo = os.path.expanduser('~/Desktop/Stuff/Gefen\u2019s Tree of Knowledge')
subprocess.run(['git', '-C', repo, 'add', 'learning-star/src/components/ui/IslandView.tsx'], check=True)
subprocess.run(['git', '-C', repo, 'commit', '-m',
    'feat: add puzzle board + unicorn avatar to IslandView\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>'], check=True)
"
```

---

## Smoke Test

After all tasks are complete, open http://localhost:5173 (dev server on port 5173), navigate to the math island, tap Counting Garden. Verify:

1. The 120px rescue overlay appears at the top showing 🦋 in a web
2. Each correct answer advances the progress bar and clears the web slightly
3. After 5 correct answers, the reward sequence plays (freedom → card → puzzle → unicorn)
4. After dismissing, you return to the island map
5. In the island, the puzzle board shows 1 gold piece
6. The unicorn avatar in the bottom-right shows the Garden skin

// gameRegistry.ts — single source of truth for all game rescue + reward configs

export interface RescueStage {
  labelHe: string;
  progress: number;  // 0–1, drives DangerScene animation
}

export interface SkinPiece {
  id: string;
  svgPath: string;
  color: string;
  animateFrom: "top" | "right" | "left" | "pop";
  x: number;
  y: number;
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
    stages: RescueStage[];
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
    labelHe: labels[i] ?? `\u05E2\u05D5\u05B9\u05D3 ${total - i - 1} \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05D5\u05B9\u05EA!`,
    progress: (i + 1) / total,
  }));
}

export const GAME_CONFIGS: Record<string, GameConfig> = {
  "/counting": {
    id: "counting",
    route: "/counting",
    subject: "math",
    nameHe: "\u05D2\u05B7\u05DF \u05D4\u05B7\u05E1\u05B0\u05BC\u05E4\u05B4\u05D9\u05E8\u05B8\u05D4",
    totalQuestions: 5,
    rescue: {
      animal: "\U0001F98B",
      animalNameHe: "\u05E4\u05B7\u05BC\u05E8\u05B0\u05E4\u05B7\u05BC\u05E8",
      danger: "web",
      stages: makeStages(5, [
        "\u05E2\u05D5\u05B9\u05D3 4 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05D5\u05B9\u05EA!",
        "\u05E2\u05D5\u05B9\u05D3 3 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05D5\u05B9\u05EA!",
        "\u05E2\u05D5\u05B9\u05D3 2 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05D5\u05B9\u05EA!",
        "\u05E2\u05D5\u05B9\u05D3 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05B8\u05D4 \u05D0\u05B7\u05D7\u05B7\u05EA!",
        "\u05DB\u05B8\u05BC\u05DE\u05B0\u05E2\u05B7\u05D8 \u05D7\u05D5\u05B9\u05E4\u05B0\u05E9\u05C1\u05B4\u05D9!",
      ]),
      freedomTextHe: "\u05D4\u05B7\u05E4\u05B7\u05BC\u05E8\u05B0\u05E4\u05B7\u05BC\u05E8 \u05D7\u05D5\u05B9\u05E4\u05B0\u05E9\u05C1\u05B4\u05D9!",
    },
    reward: {
      cardTitleHe: "\u05E4\u05B7\u05BC\u05E8\u05B0\u05E4\u05B7\u05BC\u05E8 \u05D7\u05D5\u05B9\u05E4\u05B0\u05E9\u05C1\u05B4\u05D9!",
      cardSubtitleHe: "\u05E9\u05C1\u05B4\u05D7\u05B0\u05E8\u05B7\u05E8\u05B0\u05EA\u05B0\u05BC \u05D0\u05D5\u05B9\u05EA\u05D5\u05B9 \u05DE\u05B5\u05D4\u05B8\u05E8\u05B6\u05E9\u05C1\u05B6\u05EA",
      stickerEmoji: "\U0001F98B",
      stickerId: "butterfly",
      skin: {
        id: "garden",
        nameHe: "\u05D2\u05B7\u05E0\u05B8\u05BC\u05E0\u05B4\u05D9\u05EA",
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
    nameHe: "\u05D7\u05B4\u05D1\u05BC\u05D5\u05BC\u05E8 \u05D1\u05BC\u05D5\u05BC\u05E2\u05D5\u05B9\u05EA",
    totalQuestions: 5,
    rescue: {
      animal: "\U0001F430",
      animalNameHe: "\u05D0\u05B7\u05E8\u05B0\u05E0\u05B8\u05D1",
      danger: "bubble",
      stages: makeStages(5, [
        "\u05E2\u05D5\u05B9\u05D3 4 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05D5\u05B9\u05EA!",
        "\u05E2\u05D5\u05B9\u05D3 3 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05D5\u05B9\u05EA!",
        "\u05E2\u05D5\u05B9\u05D3 2 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05D5\u05B9\u05EA!",
        "\u05E2\u05D5\u05B9\u05D3 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05B8\u05D4 \u05D0\u05B7\u05D7\u05B7\u05EA!",
        "\u05DB\u05B8\u05BC\u05DE\u05B0\u05E2\u05B7\u05D8 \u05D7\u05D5\u05B9\u05E4\u05B0\u05E9\u05C1\u05B4\u05D9!",
      ]),
      freedomTextHe: "\u05D4\u05B8\u05D0\u05B7\u05E8\u05B0\u05E0\u05B8\u05D1 \u05D7\u05D5\u05B9\u05E4\u05B0\u05E9\u05C1\u05B4\u05D9!",
    },
    reward: {
      cardTitleHe: "\u05D0\u05B7\u05E8\u05B0\u05E0\u05B8\u05D1 \u05D7\u05D5\u05B9\u05E4\u05B0\u05E9\u05C1\u05B4\u05D9!",
      cardSubtitleHe: "\u05E9\u05C1\u05B4\u05D7\u05B0\u05E8\u05B7\u05E8\u05B0\u05EA\u05B0\u05BC \u05D0\u05D5\u05B9\u05EA\u05D5\u05B9 \u05DE\u05B5\u05D4\u05B7\u05D1\u05BC\u05D5\u05BC\u05E2\u05B8\u05D4",
      stickerEmoji: "\U0001F430",
      stickerId: "rabbit",
      skin: {
        id: "diver",
        nameHe: "\u05E6\u05D5\u05B9\u05DC\u05B6\u05DC\u05B6\u05EA",
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
    nameHe: "\u05D2\u05B7\u05E4\u05B0\u05D1\u05BC\u05D5\u05B9\u05DF",
    totalQuestions: 5,
    rescue: {
      animal: "\U0001F438",
      animalNameHe: "\u05E6\u05B0\u05E4\u05B7\u05E8\u05B0\u05D3\u05B5\u05BC\u05E2\u05B7",
      danger: "quicksand",
      stages: makeStages(5, [
        "\u05E2\u05D5\u05B9\u05D3 4 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05D5\u05B9\u05EA!",
        "\u05E2\u05D5\u05B9\u05D3 3 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05D5\u05B9\u05EA!",
        "\u05E2\u05D5\u05B9\u05D3 2 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05D5\u05B9\u05EA!",
        "\u05E2\u05D5\u05B9\u05D3 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05B8\u05D4 \u05D0\u05B7\u05D7\u05B7\u05EA!",
        "\u05DB\u05B8\u05BC\u05DE\u05B0\u05E2\u05B7\u05D8 \u05D7\u05D5\u05B9\u05E4\u05B0\u05E9\u05C1\u05B4\u05D9!",
      ]),
      freedomTextHe: "\u05D4\u05B7\u05E6\u05B0\u05BC\u05E4\u05B7\u05E8\u05B0\u05D3\u05B5\u05BC\u05E2\u05B7 \u05D7\u05D5\u05B9\u05E4\u05B0\u05E9\u05C1\u05B4\u05D9!",
    },
    reward: {
      cardTitleHe: "\u05E6\u05B0\u05E4\u05B7\u05E8\u05B0\u05D3\u05B5\u05BC\u05E2\u05B7 \u05D7\u05D5\u05B9\u05E4\u05B0\u05E9\u05C1\u05B4\u05D9!",
      cardSubtitleHe: "\u05E9\u05C1\u05B4\u05D7\u05B0\u05E8\u05B7\u05E8\u05B0\u05EA\u05B0\u05BC \u05D0\u05D5\u05B9\u05EA\u05B8\u05D4\u05BC \u05DE\u05B5\u05D4\u05B7\u05D1\u05B9\u05E5",
      stickerEmoji: "\U0001F438",
      stickerId: "frog",
      skin: {
        id: "explorer",
        nameHe: "\u05D7\u05D5\u05B9\u05E7\u05B6\u05E8\u05B6\u05EA",
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
    nameHe: "\u05D7\u05B4\u05E1\u05BC\u05D5\u05BC\u05E8 \u05D1\u05B7\u05D9\u05B8\u05BC\u05DD",
    totalQuestions: 5,
    rescue: {
      animal: "\U0001F42C",
      animalNameHe: "\u05D3\u05BC\u05D5\u05B9\u05DC\u05B0\u05E4\u05B4\u05D9\u05DF",
      danger: "net",
      stages: makeStages(5, [
        "\u05E2\u05D5\u05B9\u05D3 4 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05D5\u05B9\u05EA!",
        "\u05E2\u05D5\u05B9\u05D3 3 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05D5\u05B9\u05EA!",
        "\u05E2\u05D5\u05B9\u05D3 2 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05D5\u05B9\u05EA!",
        "\u05E2\u05D5\u05B9\u05D3 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05B8\u05D4 \u05D0\u05B7\u05D7\u05B7\u05EA!",
        "\u05DB\u05B8\u05BC\u05DE\u05B0\u05E2\u05B7\u05D8 \u05D7\u05D5\u05B9\u05E4\u05B0\u05E9\u05C1\u05B4\u05D9!",
      ]),
      freedomTextHe: "\u05D4\u05B7\u05D3\u05BC\u05D5\u05B9\u05DC\u05B0\u05E4\u05B4\u05D9\u05DF \u05D7\u05D5\u05B9\u05E4\u05B0\u05E9\u05C1\u05B4\u05D9!",
    },
    reward: {
      cardTitleHe: "\u05D3\u05BC\u05D5\u05B9\u05DC\u05B0\u05E4\u05B4\u05D9\u05DF \u05D7\u05D5\u05B9\u05E4\u05B0\u05E9\u05C1\u05B4\u05D9!",
      cardSubtitleHe: "\u05E9\u05C1\u05B4\u05D7\u05B0\u05E8\u05B7\u05E8\u05B0\u05EA\u05B0\u05BC \u05D0\u05D5\u05B9\u05EA\u05D5\u05B9 \u05DE\u05B5\u05D4\u05B8\u05E8\u05B6\u05E9\u05C1\u05B6\u05EA",
      stickerEmoji: "\U0001F42C",
      stickerId: "dolphin",
      skin: {
        id: "sailor",
        nameHe: "\u05E7\u05B7\u05E4\u05BC\u05B4\u05D9\u05D8\u05B7\u05E0\u05B4\u05D9\u05EA",
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
    nameHe: "\u05D2\u05B7\u05DF \u05D4\u05B8\u05D0\u05D5\u05B9\u05EA\u05B4\u05D9\u05BC\u05D5\u05B9\u05EA",
    totalQuestions: 5,
    rescue: {
      animal: "\U0001F989",
      animalNameHe: "\u05D9\u05B7\u05E0\u05B0\u05E9\u05C1\u05D5\u05BC\u05E3",
      danger: "storm",
      stages: makeStages(5, [
        "\u05E2\u05D5\u05B9\u05D3 4 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05D5\u05B9\u05EA!",
        "\u05E2\u05D5\u05B9\u05D3 3 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05D5\u05B9\u05EA!",
        "\u05E2\u05D5\u05B9\u05D3 2 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05D5\u05B9\u05EA!",
        "\u05E2\u05D5\u05B9\u05D3 \u05EA\u05B0\u05E9\u05C1\u05D5\u05BC\u05D1\u05B8\u05D4 \u05D0\u05B7\u05D7\u05B7\u05EA!",
        "\u05DB\u05B8\u05BC\u05DE\u05B0\u05E2\u05B7\u05D8 \u05D7\u05D5\u05B9\u05E4\u05B0\u05E9\u05C1\u05B4\u05D9!",
      ]),
      freedomTextHe: "\u05D4\u05B7\u05D9\u05B7\u05BC\u05E0\u05B0\u05E9\u05C1\u05D5\u05BC\u05E3 \u05D7\u05D5\u05B9\u05E4\u05B0\u05E9\u05C1\u05B4\u05D9!",
    },
    reward: {
      cardTitleHe: "\u05D9\u05B7\u05E0\u05B0\u05E9\u05C1\u05D5\u05BC\u05E3 \u05D7\u05D5\u05B9\u05E4\u05B0\u05E9\u05C1\u05B4\u05D9!",
      cardSubtitleHe: "\u05E9\u05C1\u05B4\u05D7\u05B0\u05E8\u05B7\u05E8\u05B0\u05EA\u05B0\u05BC \u05D0\u05D5\u05B9\u05EA\u05D5\u05B9 \u05DE\u05B5\u05D4\u05B7\u05E1\u05B7\u05BC\u05E2\u05B2\u05E8\u05B8\u05D4",
      stickerEmoji: "\U0001F989",
      stickerId: "owl",
      skin: {
        id: "wizard",
        nameHe: "\u05E7\u05D5\u05B9\u05E1\u05B6\u05DE\u05B6\u05EA",
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

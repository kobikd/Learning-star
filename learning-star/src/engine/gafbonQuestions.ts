/**
 * gafbonQuestions.ts — Dynamic question generator for גַּפְבּוֹן (addition + subtraction up to 20).
 *
 * Pure function, no React. Accepts difficulty 1–5 from the adaptive engine.
 * Every call returns a fresh, randomised question — never hardcoded sets.
 *
 * Difficulty scaling:
 *   1 → addition only, sums ≤ 5, 2 far-apart choices
 *   2 → addition only, sums ≤ 10, 2 choices, closer distractors
 *   3 → addition + subtraction, range ≤ 10, 3 choices
 *   4 → addition + subtraction, range ≤ 15, 3 choices, close distractors
 *   5 → addition + subtraction, range ≤ 20, 4 choices, very close distractors
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type Operation = 'add' | 'sub';

export interface GafbonQuestion {
  a:         number;
  b:         number;
  op:        Operation;
  answer:    number;
  options:   number[];
  /** Hebrew instruction with nikud, e.g. "כַּמָּה זֶה שָׁלוֹשׁ וְעוֹד אַרְבַּע?" */
  hebrewText: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Hebrew number words with full nikud (feminine form, as we address Gefen)
const HEB_NUMS: Record<number, string> = {
  0:  'אֶפֶס',
  1:  'אֶחָד',
  2:  'שְׁתַּיִם',
  3:  'שָׁלוֹשׁ',
  4:  'אַרְבַּע',
  5:  'חָמֵשׁ',
  6:  'שֵׁשׁ',
  7:  'שֶׁבַע',
  8:  'שְׁמוֹנֶה',
  9:  'תֵּשַׁע',
  10: 'עֶשֶׂר',
  11: 'אַחַת עֶשְׂרֵה',
  12: 'שְׁתֵּים עֶשְׂרֵה',
  13: 'שְׁלוֹשׁ עֶשְׂרֵה',
  14: 'אַרְבַּע עֶשְׂרֵה',
  15: 'חֲמֵשׁ עֶשְׂרֵה',
  16: 'שֵׁשׁ עֶשְׂרֵה',
  17: 'שְׁבַע עֶשְׂרֵה',
  18: 'שְׁמוֹנֶה עֶשְׂרֵה',
  19: 'תְּשַׁע עֶשְׂרֵה',
  20: 'עֶשְׂרִים',
};

function hebrewNum(n: number): string {
  return HEB_NUMS[n] ?? String(n);
}

function buildHebrew(a: number, b: number, op: Operation): string {
  const aH = hebrewNum(a);
  const bH = hebrewNum(b);
  if (op === 'add') {
    return `כַּמָּה זֶה ${aH} וְעוֹד ${bH}?`;
  }
  return `כַּמָּה זֶה ${aH} פָּחוֹת ${bH}?`;
}

// ─── Distractor generation ───────────────────────────────────────────────────

function generateDistractors(
  correct: number,
  count: number,
  maxVal: number,
  closeRange: number,
): number[] {
  const distractors = new Set<number>();

  // Prefer distractors within ±closeRange of correct answer
  const candidates = [];
  for (let d = -closeRange; d <= closeRange; d++) {
    const v = correct + d;
    if (v >= 0 && v <= maxVal && v !== correct) candidates.push(v);
  }

  for (const c of shuffle(candidates)) {
    if (distractors.size >= count) break;
    distractors.add(c);
  }

  // Fill remaining with any valid number
  let safety = 0;
  while (distractors.size < count && safety < 80) {
    const v = randInt(0, maxVal);
    if (v !== correct) distractors.add(v);
    safety++;
  }

  return [...distractors].slice(0, count);
}

// ─── Difficulty configs ──────────────────────────────────────────────────────

interface DifficultyConfig {
  ops:            Operation[];
  maxA:           number;
  maxB:           number;
  maxSum:         number;
  numOptions:     number;
  distractorRange: number;   // ± range for close distractors
}

const CONFIGS: Record<number, DifficultyConfig> = {
  1: { ops: ['add'],         maxA: 3,  maxB: 3,  maxSum: 5,  numOptions: 2, distractorRange: 5 },
  2: { ops: ['add'],         maxA: 5,  maxB: 5,  maxSum: 10, numOptions: 2, distractorRange: 3 },
  3: { ops: ['add', 'sub'],  maxA: 7,  maxB: 7,  maxSum: 10, numOptions: 3, distractorRange: 3 },
  4: { ops: ['add', 'sub'],  maxA: 9,  maxB: 9,  maxSum: 15, numOptions: 3, distractorRange: 2 },
  5: { ops: ['add', 'sub'],  maxA: 12, maxB: 9,  maxSum: 20, numOptions: 4, distractorRange: 2 },
};

// ─── Main generator ──────────────────────────────────────────────────────────

export function generateQuestion(difficulty: number): GafbonQuestion {
  const level = Math.max(1, Math.min(5, Math.round(difficulty)));
  const cfg = CONFIGS[level];

  const op = cfg.ops[Math.floor(Math.random() * cfg.ops.length)];

  let a: number, b: number, answer: number;

  if (op === 'add') {
    // a + b ≤ maxSum
    a = randInt(1, cfg.maxA);
    const bMax = Math.min(cfg.maxB, cfg.maxSum - a);
    b = randInt(1, Math.max(1, bMax));
    answer = a + b;
  } else {
    // subtraction: a - b ≥ 0, a ≤ maxSum
    a = randInt(2, Math.min(cfg.maxA, cfg.maxSum));
    b = randInt(1, Math.min(cfg.maxB, a));
    answer = a - b;
  }

  const distractors = generateDistractors(
    answer,
    cfg.numOptions - 1,
    cfg.maxSum,
    cfg.distractorRange,
  );

  const options = shuffle([answer, ...distractors]);
  const hebrewText = buildHebrew(a, b, op);

  return { a, b, op, answer, options, hebrewText };
}

/**
 * subtractionQuestions — generates subtraction questions for חִיסּוּר בַּיָּם.
 *
 * Difficulty 1–5:
 *   1 → a ≤ 5, result ≥ 0, 2 choices, far distractors
 *   2 → a ≤ 10, 2 choices
 *   3 → a ≤ 10, 3 choices, closer distractors
 *   4 → a ≤ 15, 3 choices (may cross 10)
 *   5 → a ≤ 20, 3 choices, close distractors
 */

const HEBREW_NUMBERS = [
  "", "אֶחָד", "שְׁתַּיִם", "שָׁלוֹשׁ", "אַרְבַּע", "חָמֵשׁ",
  "שֵׁשׁ", "שֶׁבַע", "שְׁ��וֹנֶה", "תֵּשַׁע", "עֶשֶׂר",
  "אַחַת עֶשְׂרֵה", "שְׁתֵּים עֶ��ְׂרֵה", "שְׁלוֹשׁ עֶשְׂרֵה",
  "אַרְבַּע עֶשְׂרֵה", "חֲמֵשׁ עֶשְׂרֵה", "שֵׁשׁ עֶשְׂרֵה",
  "שְׁבַ�� עֶשְׂרֵה", "שְׁמוֹנֶה עֶשְׂרֵה", "תְּשַׁע עֶשְׂרֵה", "עֶשְׂרִים",
];

export interface SubtractionQuestion {
  a: number;
  b: number;
  answer: number;
  options: number[];
  hebrewText: string;
}

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

function generateDistractors(
  correct: number,
  count: number,
  maxVal: number,
  close: boolean,
): number[] {
  const distractors = new Set<number>();

  if (close) {
    const candidates = [correct - 2, correct - 1, correct + 1, correct + 2]
      .filter(n => n >= 0 && n <= maxVal && n !== correct);
    for (const c of shuffle(candidates)) {
      if (distractors.size >= count) break;
      distractors.add(c);
    }
  } else {
    // Far distractors for easy levels
    const candidates = [correct + 3, correct - 3, correct + 4, correct - 4]
      .filter(n => n >= 0 && n <= maxVal && n !== correct);
    for (const c of shuffle(candidates)) {
      if (distractors.size >= count) break;
      distractors.add(c);
    }
  }

  // Fill remaining
  let attempts = 0;
  while (distractors.size < count && attempts < 50) {
    const d = randInt(0, maxVal);
    if (d !== correct) distractors.add(d);
    attempts++;
  }
  return [...distractors].slice(0, count);
}

export function generateSubtractionQuestion(difficulty: number): SubtractionQuestion {
  let a: number, b: number, numOptions: number, maxVal: number, close: boolean;

  switch (difficulty) {
    case 1:
      a = randInt(2, 5);
      b = randInt(1, a);
      numOptions = 2;
      maxVal = 5;
      close = false;
      break;
    case 2:
      a = randInt(3, 10);
      b = randInt(1, a);
      numOptions = 2;
      maxVal = 10;
      close = false;
      break;
    case 3:
      a = randInt(4, 10);
      b = randInt(1, a);
      numOptions = 3;
      maxVal = 10;
      close = true;
      break;
    case 4:
      a = randInt(6, 15);
      b = randInt(1, a);
      numOptions = 3;
      maxVal = 15;
      close = true;
      break;
    default: // 5+
      a = randInt(10, 20);
      b = randInt(1, a);
      numOptions = 3;
      maxVal = 20;
      close = true;
      break;
  }

  const answer = a - b;
  const distractors = generateDistractors(answer, numOptions - 1, maxVal, close);
  const options = shuffle([answer, ...distractors]);
  const hebrewA = HEBREW_NUMBERS[a] ?? String(a);
  const hebrewB = HEBREW_NUMBERS[b] ?? String(b);
  const hebrewText = `כַּמָּה זֶה ${hebrewA} פָּחוֹת ${hebrewB}?`;

  return { a, b, answer, options, hebrewText };
}

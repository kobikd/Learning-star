// ─── Letter data for א, ב, ג ──────────────────────────────────────────────────
// Used by LetterExplorer activity (Multisensory Structured Literacy)

export interface TraceDot {
  id: number;
  x: number;   // SVG coordinate (viewBox 0 0 200 220)
  y: number;
}

export interface LetterData {
  id: string;
  char: string;           // plain letter
  charNikud: string;      // letter with vowel mark
  name: string;           // letter name with nikud
  nameTTS: string;        // plain for TTS
  phoneme: string;        // short Hebrew description
  exampleWord: string;    // example word with nikud
  exampleWordTTS: string; // example word for TTS
  exampleMeaning: string; // Hebrew meaning label
  exampleEmoji: string;
  traceDots: TraceDot[];  // ordered trace dots in 200×220 SVG space
  distractors: string[];  // 2 other letters for hear/choice phases
  connectChar: string;    // letter to connect with in syllable phase
  syllable: string;       // syllable with nikud
  syllableTTS: string;    // syllable plain text for TTS
  syllableMeaning: string;
  color: string;          // CSS custom-property ref
}

export const LETTERS: LetterData[] = [
  {
    id: "alef",
    char: "א",
    charNikud: "אָ",
    name: "אָלֶף",
    nameTTS: "אלף",
    phoneme: "אָ — כמו בְּ'אָבָּא'",
    exampleWord: "אַרְנָב",
    exampleWordTTS: "ארנב",
    exampleMeaning: "ארנב",
    exampleEmoji: "🐰",
    // Diagonal stroke: top-right → center → bottom-left (simplified alef shape)
    traceDots: [
      { id: 1, x: 138, y: 62 },
      { id: 2, x: 100, y: 110 },
      { id: 3, x: 62,  y: 158 },
    ],
    distractors: ["ע", "ה"],
    connectChar: "מ",
    syllable: "אֵם",
    syllableTTS: "אם",
    syllableMeaning: "אמא",
    color: "var(--color-reading)",
  },
  {
    id: "bet",
    char: "ב",
    charNikud: "בַּ",
    name: "בֵּית",
    nameTTS: "בית",
    phoneme: "בּ — כמו בְּ'בַּיִת'",
    exampleWord: "בַּיִת",
    exampleWordTTS: "בית",
    exampleMeaning: "בית",
    exampleEmoji: "🏠",
    // Box open on right (RTL): start top-right, across, down, back
    traceDots: [
      { id: 1, x: 138, y: 65 },
      { id: 2, x: 62,  y: 65 },
      { id: 3, x: 62,  y: 155 },
      { id: 4, x: 138, y: 155 },
    ],
    distractors: ["כ", "פ"],
    connectChar: "ן",
    syllable: "בֵּן",
    syllableTTS: "בן",
    syllableMeaning: "בן",
    color: "var(--color-math)",
  },
  {
    id: "gimel",
    char: "ג",
    charNikud: "גַּ",
    name: "גִּימֶל",
    nameTTS: "גימל",
    phoneme: "גּ — כמו בְּ'גַּן'",
    exampleWord: "גַּן",
    exampleWordTTS: "גן",
    exampleMeaning: "גן ילדים",
    exampleEmoji: "🌷",
    // Γ shape: top-left → top-right → bottom-right
    traceDots: [
      { id: 1, x: 62,  y: 65 },
      { id: 2, x: 138, y: 65 },
      { id: 3, x: 138, y: 155 },
    ],
    distractors: ["ד", "ר"],
    connectChar: "ן",
    syllable: "גַּן",
    syllableTTS: "גן",
    syllableMeaning: "גן",
    color: "var(--color-games)",
  },
];

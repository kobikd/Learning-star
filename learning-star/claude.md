# CLAUDE.md — כוכב הלמידה (Learning Star)

## Project Overview

An adaptive learning web application (PWA) for an 8-year-old Israeli girl (2nd grade) with:
- Dyspraxia (fine motor and coordination difficulties)
- High-Functioning Autism (HFA)
- Mild Intellectual Disability
- Functional dyscalculia and reading/writing difficulties

The app is fully in Hebrew, RTL, with nikud (vowel marks) on all text.

## Tech Stack

- **Frontend**: React 18+ with TypeScript (Vite)
- **Styling**: Tailwind CSS with RTL support + Framer Motion for animations
- **State Management**: Zustand
- **Audio**: Howler.js for sounds + Web Speech API (Hebrew) for TTS
- **Backend**: Node.js + Express (later phase)
- **Database**: SQLite with Prisma ORM (local first, migrate to PostgreSQL later)
- **Deployment**: PWA — works offline, installable on tablet

## Core Architecture

### 1. Adaptive Learning Engine

The engine manages a dynamic learner profile:

```typescript
interface LearnerProfile {
  skillMastery: Record<SkillId, MasteryLevel>;
  avgResponseTime: Record<SkillId, number>;
  streaks: { successes: number; failures: number };
  preferredModality: 'visual' | 'auditory' | 'kinesthetic';
  engagementScore: number;
  errorPatterns: ErrorPattern[];
}

interface MasteryLevel {
  score: number;          // 0.0-1.0
  attempts: number;
  lastPracticed: Date;
  consecutiveCorrect: number;
  needsReview: boolean;   // spaced repetition flag
}
```

**Difficulty adjustment algorithm (Zone of Proximal Development):**
- Success > 85% → gradually increase difficulty
- Success < 60% → decrease difficulty + add scaffolding
- Success 60-70% → add hints without lowering level
- Success 70-85% → optimal zone, maintain current level
- Always track response time as secondary difficulty indicator

### 2. Pedagogical Methodologies

#### Math — CRA Method (Concrete → Representational → Abstract)
Every math concept goes through 3 stages:
1. **Concrete**: Interactive draggable objects (fruits, stars, animals)
2. **Representational**: Pictures/icons representing quantities (dots on number line, base-10 blocks)
3. **Abstract**: Digits and math symbols only

**Additional math principles:**
- Interactive number line as permanent anchor
- 5 and 10 as counting bases (Rekenrek method)
- Number decomposition with visualization
- NO multiplication table memorization — learn through visual patterns
- Short frequent practice (5-7 min) with spaced repetition
- Real-world connections: money, candy, toys
- Touch Math: dots on digits for counting
- Number Bonds: decomposing numbers (7 = 5+2, 7 = 4+3)

#### Reading & Writing — Multisensory Structured Literacy (Orton-Gillingham adapted for Hebrew)
1. **Phonology**: Sound recognition → sound-letter connection → syllables → words
2. **Morphology**: Root recognition and word families (unique to Hebrew!)
3. **Syntax**: Words → sentences → short paragraphs
4. **Comprehension**: Questions about pictures → sentences → paragraphs

**Hebrew-specific principles:**
- Full nikud (vowel marks) — 2nd grade standard
- Distinguish similar letters: ב/כ, ד/ר, ג/נ, ח/ה, ו/ז
- Color-highlight word roots (shoresh)
- Clear RTL directionality with visual guides
- Phonemic awareness: identify opening sound, rhymes, syllable clapping

#### Speech-Language Therapy Techniques
- Full visual support (image + text + audio always together)
- Step-by-step instructions with visual breakdowns
- Immediate positive reinforcement — NEVER negative "wrong" messages
- Social Stories as framework for each activity
- Visual schedules — clear activity board
- Errorless Learning: start with 2 choices (1 correct, 1 very different), gradually increase
- PECS-style visual choice boards

### 3. UI/UX Design Principles

#### Dyspraxia — Motor Adaptations:
- **Huge buttons**: minimum 64px × 64px, preferably 80px+
- **Large touch targets**: 16px+ padding around every interactive element
- **No precise drag**: drag-and-drop with wide snap-to-target (150%+ hit area)
- **No double-click or long-press**: single tap only
- **No free typing**: select from options / tap on letters
- **Movement tolerance**: slight finger movement during tap still counts
- **Magnet animation**: when dragging near target, item snaps automatically

#### Autism — Sensory & Cognitive Adaptations:
- **Absolute consistency**: same layout, colors, music every session
- **Clear routine**: always same order — greeting → choose activity → learn → summary
- **Smooth transitions**: soft fade animations (300ms+), no jumps or flashes
- **No surprises**: every change announced with visual countdown
- **Stimulus reduction**: "quiet mode" that reduces animations and sounds
- **Predictable structure**: Visual schedule always visible on screen side
- **Exit option**: "Break" button always available — never trap the child
- **Safe space**: quiet virtual room with calming animations when overwhelmed

#### Mild Intellectual Disability — Cognitive Adaptations:
- **Minimal instructions**: one sentence + one picture, no more
- **Heavy repetition**: every concept repeated 5-7+ times in different contexts
- **Built-in success**: 70-80% of tasks at already-mastered level
- **Graduated scaffolding**: hint → stronger hint → demonstration → guided action
- **Simple language**: short words, short sentences, easy Hebrew

### 4. Sound System

```typescript
interface SoundSystem {
  categories: {
    ui: {
      click: 'soft-pop',
      transition: 'whoosh-gentle',
      open: 'sparkle'
    };
    feedback: {
      correct: 'happy-chime',
      almostCorrect: 'gentle-bell',
      tryAgain: 'soft-nudge',       // encouraging, not critical
      streak: 'celebration-short',
      levelUp: 'fanfare-gentle'
    };
    narration: {
      instructions: AudioFile[];    // pre-recorded Hebrew explanations
      letters: AudioFile[];         // letter sounds
      numbers: AudioFile[];         // number names
      words: AudioFile[];
      encouragement: string[];      // "!יופי", "!כל הכבוד", "!את מדהימה"
    };
    ambient: {
      calm: 'gentle-melody',
      playful: 'light-bounce',
      focus: 'soft-concentration'
    };
  };
}
```

**Sound rules:**
- Narration always available — speaker button next to every text
- Success sounds: positive, short (< 2 sec), not too loud
- NO failure sounds: only encouraging "let's try again" tone
- Background music: soft, no sudden changes, can be turned off
- Every sound independently toggleable (parent settings)

### 5. Reward System & Gamification

```typescript
interface RewardSystem {
  stars: {
    earnedPer: 'correct_answer';
    bonusFor: 'streak_of_3';
  };
  stickers: {
    earnedPer: 'completed_activity';
    collection: 'sticker_album';
    themes: ['animals', 'space', 'ocean', 'flowers', 'food'];
  };
  companion: {
    type: 'cat' | 'dog' | 'bunny' | 'unicorn' | 'dragon';
    reactions: { happy, encouraging, celebrating, sleeping };
    growth: 'evolves_with_progress';
  };
  // NEVER:
  // - Rankings / comparisons to others
  // - Losing stars on mistakes
  // - Time pressure (unless optional advanced game)
  // - Negative messages of any kind
}
```

### 6. Math Curriculum (Israeli 2nd Grade)

```typescript
const mathCurriculum = {
  domain1_numberSense: {
    name: 'הכרת מספרים',
    levels: [
      { id: 'ns1', name: 'מספרים 1-10', skills: ['counting', 'recognition', 'ordering'] },
      { id: 'ns2', name: 'מספרים 11-20', skills: ['teen_numbers', 'place_value_intro'] },
      { id: 'ns3', name: 'מספרים עד 100', skills: ['tens', 'ones', 'place_value'] },
    ]
  },
  domain2_addition: {
    name: 'חיבור',
    levels: [
      { id: 'add1', name: 'חיבור עד 10', skills: ['add_objects', 'add_numberline', 'add_abstract'] },
      { id: 'add2', name: 'חיבור עד 20', skills: ['add_with_crossing_10', 'make_10_strategy'] },
      { id: 'add3', name: 'חיבור עשרות', skills: ['add_tens', 'add_2digit_no_carry'] },
    ]
  },
  domain3_subtraction: {
    name: 'חיסור',
    levels: [
      { id: 'sub1', name: 'חיסור עד 10', skills: ['sub_objects', 'sub_numberline', 'sub_abstract'] },
      { id: 'sub2', name: 'חיסור עד 20', skills: ['sub_crossing_10'] },
    ]
  },
  domain4_geometry: {
    name: 'צורות',
    levels: [
      { id: 'geo1', name: 'צורות בסיסיות', skills: ['circle', 'square', 'triangle', 'rectangle'] },
      { id: 'geo2', name: 'תכונות צורות', skills: ['sides', 'corners', 'size_compare'] },
    ]
  },
  domain5_measurement: {
    name: 'מדידה',
    levels: [
      { id: 'meas1', name: 'השוואת גדלים', skills: ['longer_shorter', 'heavier_lighter'] },
      { id: 'meas2', name: 'שעון', skills: ['full_hour', 'half_hour'] },
    ]
  },
};
```

### 7. Hebrew Literacy Curriculum (Israeli 2nd Grade)

```typescript
const hebrewLiteracyCurriculum = {
  domain1_phonology: {
    name: 'צלילים ואותיות',
    levels: [
      { id: 'ph1', name: 'אותיות א-י', skills: ['letter_recognition', 'letter_sound', 'letter_writing'] },
      { id: 'ph2', name: 'אותיות כ-ת', skills: ['letter_recognition', 'letter_sound', 'letter_writing'] },
      { id: 'ph3', name: 'אותיות סופיות', skills: ['final_letters'] },
      { id: 'ph4', name: 'ניקוד', skills: ['kamatz', 'patach', 'tseire', 'segol', 'hirik', 'holam', 'kubutz', 'shuruk'] },
    ]
  },
  domain2_decoding: {
    name: 'קריאת מילים',
    levels: [
      { id: 'dec1', name: 'הברות פתוחות', skills: ['cv_syllables'] },
      { id: 'dec2', name: 'הברות סגורות', skills: ['cvc_syllables'] },
      { id: 'dec3', name: 'מילים בנות 2 הברות', skills: ['two_syllable_words'] },
      { id: 'dec4', name: 'מילים ארוכות', skills: ['multi_syllable', 'common_words'] },
    ]
  },
  domain3_reading: {
    name: 'קריאה',
    levels: [
      { id: 'read1', name: 'משפטים קצרים', skills: ['3_word_sentences', 'with_pictures'] },
      { id: 'read2', name: 'קטעים קצרים', skills: ['2_3_sentences', 'comprehension_pictures'] },
      { id: 'read3', name: 'סיפורים קצרים', skills: ['short_stories', 'comprehension_questions'] },
    ]
  },
  domain4_writing: {
    name: 'כתיבה',
    levels: [
      { id: 'wr1', name: 'העתקת אותיות', skills: ['tracing', 'copying_letters'] },
      { id: 'wr2', name: 'כתיבת מילים', skills: ['spelling_cv', 'spelling_cvc'] },
      { id: 'wr3', name: 'השלמת משפטים', skills: ['fill_in_word', 'choose_word'] },
    ]
  },
};
```

### 8. Activity Types / Mini-Games

```typescript
const activityTypes = {
  // === Math ===
  countingGarden: { type: 'counting', interaction: 'tap_to_count' },
  numberLineFrog: { type: 'number_line', interaction: 'tap_target' },
  mathBubbles: { type: 'choose_answer', interaction: 'tap_choice' },
  balanceScale: { type: 'comparison', interaction: 'drag_and_drop_easy' },
  shopGame: { type: 'money_math', interaction: 'drag_coins' },
  
  // === Reading ===
  letterExplorer: { type: 'letter_learning', interaction: 'see_hear_trace' },
  syllableBuilder: { type: 'syllable_blending', interaction: 'drag_combine' },
  wordMatch: { type: 'word_recognition', interaction: 'tap_match' },
  sentenceBuilder: { type: 'sentence_construction', interaction: 'drag_order' },
  storyTime: { type: 'guided_reading', interaction: 'tap_to_read' },
  
  // === Shared ===
  memoryGame: { type: 'memory_matching', interaction: 'tap_pair' },
  puzzleWorld: { type: 'sequencing', interaction: 'drag_order' },
};
```

### 9. Screens

1. **Welcome Screen** — greeting with companion character, stars/streak display
2. **World Map** — adventure map with islands (Math, Reading, Games, Stars Tower)
3. **Visual Schedule** — sidebar showing today's plan (always visible)
4. **Math Activities** — CRA-based mini-games
5. **Reading Activities** — MSL-based mini-games
6. **Break Screen** — appears every 10-15 min, shows progress summary
7. **Parent Dashboard** — PIN-protected, detailed progress & error analysis
8. **Sticker Album** — collection by theme, visual celebration
9. **Safe Space** — quiet room with calming elements, no tasks
10. **Settings** — parent-controlled sound, animation, time limits

### 10. Parent Dashboard

```typescript
interface ParentDashboard {
  weeklySummary: { totalTime, sessions, avgSessionLength };
  mathProgress: { currentLevel, mastered, inProgress, challenging, trend };
  readingProgress: { /* same structure */ };
  errorAnalysis: { commonMistakes, recommendations };
  adaptations: { difficultyChanges, scaffoldingUsed };
  settings: { dailyTimeLimit, breakReminder, soundEnabled, animationLevel };
  exportReport: 'PDF';
}
```

### 11. Color Palette

```css
:root {
  --bg-primary: #F0F4FF;        /* light lavender */
  --bg-secondary: #FFF8F0;      /* warm cream */
  --color-math: #7C6FEB;        /* soft purple */
  --color-reading: #4ECDC4;     /* turquoise */
  --color-games: #FFB347;       /* warm orange */
  --color-stars: #FFD700;       /* gold */
  --color-success: #6BCB77;     /* soft green */
  --color-try-again: #FFA07A;   /* salmon, NOT red */
  --text-primary: #2D3748;      /* dark but not black */
}
```

### 12. Typography

```css
font-family: 'Assistant', 'Rubik', sans-serif;
/* All text with nikud. High line-height for nikud comfort */
line-height: 2;
/* Sizes: instructions 28px, content 24px, buttons 26px, numbers/letters 48px, titles 36px */
```

## Folder Structure

```
learning-star/
├── src/
│   ├── pages/                   # Route pages
│   ├── components/
│   │   ├── ui/                  # Buttons, cards, modals
│   │   ├── activities/          # Activity components
│   │   ├── feedback/            # Reward animations
│   │   ├── navigation/          # Nav, visual schedule
│   │   └── accessibility/       # Accessibility helpers
│   ├── engine/
│   │   ├── adaptive.ts          # Adaptive engine
│   │   ├── curriculum.ts        # Curriculum data
│   │   ├── progress.ts          # Progress tracking
│   │   └── spaced-repetition.ts # Spaced repetition
│   ├── audio/
│   │   ├── manager.ts           # Sound management
│   │   └── tts.ts               # Text-to-Speech
│   ├── stores/                  # Zustand stores
│   ├── content/                 # JSON content files
│   ├── types/                   # TypeScript types
│   └── utils/
├── public/
│   ├── audio/                   # Sound files
│   ├── images/                  # Illustrations
│   └── fonts/
└── tests/
```


## Sound Design

**Always use the `/gentle-learning-sfx` skill when working on any audio for this app.**

This includes:
- UI feedback sounds (taps, toggles, selections)
- Reward / success / encouragement sounds
- Ambient background loops
- Character reaction sounds
- Screen transition sounds
- Any ElevenLabs Sound Effects API prompts

The skill enforces sensory-safe design rules critical for Gefen (dyspraxia, HFA) — no harsh transients, no sudden volume spikes, warm timbres only. Never design sounds for this app without it.

## Math Game Creator

**Always use the `/math-game-creator` skill when creating any new math activity or interactive math game for this app.**

This includes:
- New math activity components (like AdditionBubbles, CountingGarden, etc.)
- Updating difficulty levels or CRA progression in existing activities
- Designing new interaction patterns for math concepts
- Planning scaffolding and errorless learning progressions

The skill enforces the full pedagogical framework for Gefen (dyspraxia, HFA, mild ID):
- Errorless learning — NEVER show negative feedback or "wrong" text
- Hebrew RTL with full nikud on every text string
- CRA progression (Concrete → Representational → Abstract)
- Huge touch targets (80px+ for answer buttons)
- Adaptive scaffolding: dim wrong options → verbal hint → full demo with dot counting
- Stars only go up, streaks trigger butterfly celebration

**When building a new math activity**, follow CountingGarden and AdditionBubbles as the reference patterns:
- Props: `{ onBack, onSafeSpace, onComplete, initialLevel }`
- Phase machine: `"instruction" | "answering" | "correct" | "wrong" | "demo"`
- Hooks: `useAdaptive(skillId)`, `useRewardStore()`
- Initial phase must be `"answering"` (not `"instruction"`) so buttons work on mount

## Development Rules

1. **RTL first**: All CSS starts with direction: rtl. Use logical properties (margin-inline-start not margin-right).
2. **Mobile-first**: Design for tablet/phone first. Min touch target: 64px.
3. **Performance**: Lazy load images/sounds. Preload next activity. Service Worker for offline.
4. **Accessibility**: Hebrew alt text on all images. Large focus indicators. aria-labels in Hebrew. Never rely on color alone.
5. **Child safety**: No external links. No ads. No social media. Parent settings behind PIN. No PII collection.
6. **Code**: TypeScript strict mode. Component per file. All text in i18n files. Unit tests for adaptive engine.

## MVP Features (Build Order)

1. Welcome screen with personalized greeting
2. World map with 2 islands (Math + Reading)
3. 3 math activities (counting, number line, choose answer)
4. 3 reading activities (letter explorer, syllable builder, word-picture match)
5. Basic adaptive engine (ZPD + difficulty adjustment)
6. Stars + stickers + companion character
7. Sounds: feedback + instruction narration + TTS
8. Parent dashboard with PIN
9. Visual schedule
10. Safe space / quiet room
11. Screen time limit
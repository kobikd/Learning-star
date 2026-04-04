# CLAUDE.md — כוכב הלמידה (Learning Star)

An adaptive learning web app for an 8-year-old Israeli girl (2nd grade) with dyspraxia, HFA, and mild intellectual disability. Fully in Hebrew, RTL, with nikud on all text.

**Reference docs** (read before working on a specific area):
- `docs/pedagogy.md` — CRA, Orton-Gillingham, UI/UX principles, sound rules, reward system
- `docs/curriculum.md` — full math & Hebrew literacy curriculum with skill IDs
- `docs/data-schema.md` — all TypeScript interfaces and localStorage shapes

---

## Architecture

**Frontend-only. No backend. Ever.**

- React 18 + TypeScript (Vite)
- Tailwind CSS (RTL) + Framer Motion
- Zustand for runtime state, localStorage for persistence
- Howler.js for audio (pre-generated ElevenLabs TTS + SFX)
- Static site deployment (Netlify / Vercel)
- Sounds and images served from `public/` as static assets

Do NOT create: API routes, Express servers, Node backends, or any server-side code.

---

## Data Persistence

All data lives in localStorage. See `docs/data-schema.md` for full type definitions.

**Keys:** `learner-profile`, `reward-state`, `app-settings`, `session-log`

**Rules:**
- Save `learner-profile` after every completed activity (not after every answer)
- Save `reward-state` immediately when stars/stickers are earned
- Save `session-log` on session end or `beforeunload`
- On app load: read all keys, initialize missing ones with defaults
- **Never call localStorage directly from components** — always use `src/services/storage.ts`

---

## Adaptive Engine

**ZPD difficulty adjustment** (over a sliding window of last 10 attempts per skill):
- > 85% correct → increase difficulty
- 60–70% → add hints, keep level
- 70–85% → optimal zone, hold
- < 60% → decrease difficulty + add scaffolding
- Response time is a secondary indicator (tracked silently, never shown to child)

**Spaced repetition:** Flag `needsReview: true` when a mastered skill (score ≥ 0.8) hasn't been practiced in 3+ days, or when the child gets 2+ wrong answers in a previously mastered skill. Mix 20% review / 80% new in each session.

**Skill dependencies:** A skill only unlocks when its prerequisites reach score ≥ 0.7. Full dependency graph in `docs/curriculum.md`.

---

## Activity Component Pattern

Every activity MUST follow this exact pattern. Reference implementations: `CountingGarden`, `AdditionBubbles`.

```typescript
// Props — always exactly these
interface ActivityProps {
  onBack: () => void;
  onSafeSpace: () => void;
  onComplete: () => void;
  initialLevel?: number;
}

// Phase machine — initial phase MUST be 'answering' (not 'instruction')
type Phase = 'answering' | 'correct' | 'wrong' | 'demo';
const [phase, setPhase] = useState<Phase>('answering');

// Required hooks in every activity
const { getNextQuestion, recordAnswer, currentDifficulty } = useAdaptive(skillId);
const { addStar, addSticker, streak } = useRewardStore();
const { playCorrect, playTryAgain, playInstruction } = useSound();
```

**Scaffolding escalation (errorless learning) — strictly in this order:**
1. Wrong attempt 1 → dim wrong option, play `tryAgain` sound, show "!נַסִּי שׁוּב"
2. Wrong attempt 2 → add verbal hint (audio + text) pointing to correct answer
3. Wrong attempt 3 → enter `demo` phase, show full worked example, auto-advance

---

## Folder Structure

```
src/
  pages/              # Route pages (Welcome, WorldMap, ParentDashboard...)
  components/
    ui/               # BigButton, Card, Modal, ProgressBar
    activities/       # CountingGarden, MathBubbles, LetterExplorer...
    feedback/         # Star burst, sticker reveal, celebration animations
    navigation/       # WorldMap, VisualSchedule, BackButton, BreakButton
    accessibility/    # SafeSpace, QuietMode, BreakScreen
  hooks/              # useAdaptive, useRewardStore, useSound, useHints, useTimer
  services/           # storage.ts, audioPreloader.ts, spacedRepetition.ts, analytics.ts
  engine/             # adaptive.ts, curriculum.ts, progress.ts (pure functions, no React)
  stores/             # learnerStore.ts, rewardStore.ts, settingsStore.ts
  types/              # learner.ts, curriculum.ts, activities.ts, rewards.ts
  utils/              # hebrew.ts (nikud helpers), random.ts

public/
  audio/              # sfx/, narration/, letters/, numbers/, ambient/
  images/             # characters/, stickers/, activities/, ui/
  fonts/
```

**File placement rules:**
- New activity → `src/components/activities/`
- Logic shared across activities → `src/hooks/`
- Pure functions (no React) → `src/services/` or `src/engine/`
- Types → `src/types/`

---

## DO / DON'T

### Always DO:
1. RTL first — use logical CSS properties (`margin-inline-start`, not `margin-right`)
2. **Nikud on every Hebrew string** — `"חִיבּוּר"` not `"חיבור"`. No exceptions.
3. Min touch target: 64×64px (prefer 80px+)
4. TypeScript strict mode — no `any`
5. One component per file
6. Hebrew `alt` text and `aria-label` on all interactive/image elements
7. Save rewards to localStorage immediately when earned

### Never DO:
1. Create backend code of any kind
2. Show negative feedback — no "שגיאה", "לא נכון", "wrong", "incorrect"
3. Use `margin-right` / `padding-left` (breaks RTL)
4. Use `any` type
5. Add external links, ads, or social media
6. Collect PII beyond the learning profile
7. Show a timer or time pressure to the child
8. Call localStorage directly from components (use `src/services/storage.ts`)
9. Use red for errors (use `--color-try-again: #FFA07A` instead)
10. Write Hebrew without nikud

---

## Skills to Use

- **`/math-game-creator`** — for any new math activity or game
- **`/gentle-learning-sfx`** — for any audio design or ElevenLabs SFX prompts

---

## Color Palette

```css
--bg-primary: #F0F4FF;       /* light lavender */
--bg-secondary: #FFF8F0;     /* warm cream */
--color-math: #7C6FEB;       /* soft purple */
--color-reading: #4ECDC4;    /* turquoise */
--color-games: #FFB347;      /* warm orange */
--color-stars: #FFD700;      /* gold */
--color-success: #6BCB77;    /* soft green */
--color-try-again: #FFA07A;  /* salmon — for wrong answers, NOT red */
--text-primary: #2D3748;
```

## Typography

```css
font-family: 'Assistant', 'Rubik', sans-serif;
line-height: 2; /* required for nikud comfort */
/* instructions: 28px | content: 24px | buttons: 26px | letters/numbers: 48px | titles: 36px */
```

---

## MVP Build Order

1. Welcome screen + companion character
2. World map (Math + Reading islands)
3. 3 math activities (counting, number line, choose-answer)
4. 3 reading activities (letter explorer, syllable builder, word-picture match)
5. Adaptive engine (ZPD + difficulty)
6. Stars + stickers + companion growth
7. Sounds: feedback + narration
8. Parent dashboard (PIN-protected)
9. Visual schedule
10. Safe space / quiet room
11. Screen time limit
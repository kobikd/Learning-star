# Pedagogy — כוכב הלמידה

Read this file when designing or building any activity, animation, sound, or UI element.

---

## Math — CRA Method (Concrete → Representational → Abstract)

Every math concept must pass through 3 stages:

1. **Concrete** — interactive draggable objects (fruits, stars, animals)
2. **Representational** — pictures/icons for quantities (dots on number line, base-10 blocks)
3. **Abstract** — digits and symbols only

Additional math principles:
- Interactive number line as permanent anchor in all relevant activities
- 5 and 10 as counting bases (Rekenrek method)
- Number decomposition with visualization
- NO multiplication table memorization — use visual patterns
- Short practice sessions (5–7 min) with spaced repetition
- Real-world connections: money, candy, toys
- Touch Math: dots on digits for counting support
- Number Bonds: decomposing numbers visually (7 = 5+2 = 4+3)

---

## Reading & Writing — Multisensory Structured Literacy (Orton-Gillingham, Hebrew-adapted)

Four stages, always in order:
1. **Phonology** — sound recognition → sound-letter connection → syllables → words
2. **Morphology** — root (shoresh) recognition and word families
3. **Syntax** — words → sentences → short paragraphs
4. **Comprehension** — questions about pictures → sentences → paragraphs

Hebrew-specific rules:
- Full nikud on all text (2nd grade standard)
- Distinguish similar-looking letters: ב/כ, ד/ר, ג/נ, ח/ה, ו/ז
- Color-highlight word roots (shoresh) in a consistent color
- Clear RTL directionality with visual guide arrows where needed
- Phonemic awareness: identify opening sound, find rhymes, clap syllables

---

## Speech-Language Therapy Principles (applies to every screen)

- Full visual support: image + text + audio always together, never one alone
- Step-by-step instructions with visual breakdowns — one step at a time
- Immediate positive reinforcement — NEVER show negative messages
- Social Stories format: each activity has a clear narrative arc
- Visual schedule always visible (sidebar) — what we did, what's next
- Errorless Learning: begin with 2 choices (1 correct, 1 very different), increase gradually
- PECS-style visual choice boards for activity selection

---

## UI/UX — Dyspraxia Motor Adaptations

- **Minimum button size**: 64×64px — prefer 80px+
- **Touch target padding**: 16px+ around every interactive element
- **No precise drag**: snap-to-target zones at 150%+ of the target's actual size
- **No double-click or long-press**: single tap only everywhere
- **No free typing**: always select from options or tap individual letters
- **Movement tolerance**: slight finger drift during tap must still register as a tap
- **Magnet animation**: when dragging near a target, item snaps automatically before release

---

## UI/UX — Autism Sensory & Cognitive Adaptations

- **Absolute consistency**: same layout, same colors, same music every single session
- **Clear routine**: always the same order — greeting → choose activity → learn → summary
- **Smooth transitions only**: fade animations, minimum 300ms — no jumps, no flashes
- **No surprises**: every screen change announced with a brief visual countdown or cue
- **Quiet mode**: toggle that reduces animations to minimal and lowers sound volume
- **Visual schedule**: always visible in sidebar, showing today's plan
- **Break button**: always visible — the child can exit any activity at any time
- **Safe Space**: a calm, task-free virtual room available at all times (calming animations only)

---

## UI/UX — Mild Intellectual Disability Cognitive Adaptations

- **Minimal instructions**: one short sentence + one picture per instruction. Nothing more.
- **Heavy repetition**: every concept appears 5–7+ times across different contexts
- **Built-in success**: 70–80% of each session's tasks at already-mastered skill level
- **Graduated scaffolding** (strictly in this order):
  1. Subtle hint (dim wrong options)
  2. Stronger hint (audio + text pointing toward correct answer)
  3. Full demonstration (show the worked solution with animation)
- **Simple Hebrew**: short words, short sentences — no complex grammar

---

## Sound System

```typescript
interface SoundSystem {
  ui: {
    click: 'soft-pop',
    transition: 'whoosh-gentle',
    open: 'sparkle'
  };
  feedback: {
    correct: 'happy-chime',
    almostCorrect: 'gentle-bell',
    tryAgain: 'soft-nudge',        // encouraging, NOT a failure sound
    streak: 'celebration-short',
    levelUp: 'fanfare-gentle'
  };
  narration: {
    instructions: AudioFile[];     // pre-recorded Hebrew explanations
    letters: AudioFile[];          // individual letter sounds
    numbers: AudioFile[];          // number names
    words: AudioFile[];
    encouragement: string[];       // "!יוֹפִי", "!כָּל הַכָּבוֹד", "!אַתְּ מַדְהִימָה"
  };
  ambient: {
    calm: 'gentle-melody',
    playful: 'light-bounce',
    focus: 'soft-concentration'
  };
}
```

Sound rules:
- Speaker button next to every piece of text so the child can re-hear narration
- Success sounds: positive, short (< 2 sec), not too loud
- NO failure sounds — only encouraging "try again" tones
- Background music: soft, no sudden changes, can be turned off
- Every sound category independently toggleable from parent settings
- All audio files live in `public/audio/` subfolders (sfx, narration, letters, numbers, ambient)
- **Always use the `/gentle-learning-sfx` skill for any audio design work**

---

## Reward System

```typescript
interface RewardSystem {
  stars: {
    earnedPer: 'correct_answer';
    bonusFor: 'streak_of_3';
    // Stars ONLY go up. Never removed on mistakes.
  };
  stickers: {
    earnedPer: 'completed_activity';
    collection: 'sticker_album';
    themes: ['animals', 'space', 'ocean', 'flowers', 'food'];
  };
  companion: {
    type: 'cat' | 'dog' | 'bunny' | 'unicorn' | 'dragon';
    reactions: 'happy' | 'encouraging' | 'celebrating' | 'sleeping';
    growth: 'evolves_with_progress';
  };
}
```

Absolute rules:
- No rankings or comparisons to others — ever
- Stars never decrease on mistakes
- No time pressure (response time is tracked silently for the engine only)
- No negative messages of any kind — only encouragement
- Streak of 3+ correct answers → butterfly celebration animation

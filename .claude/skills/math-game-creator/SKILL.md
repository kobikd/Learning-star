---
name: math-game-creator
description: >
  Create interactive HTML math learning games in Hebrew for an 8-year-old girl with dyspraxia (DCD),
  high-functioning autism (ASD), and mild intellectual disability. Use this skill whenever the user asks
  to create a math game, learning activity, educational game, practice exercise, or interactive worksheet
  for their daughter. Also trigger when the user mentions: number line game, place value activity,
  addition game, subtraction practice, word problem exercise, counting game, multiplication activity,
  time/clock game, or any math topic combined with "game", "activity", "exercise", "practice", or
  "interactive". Even if the user just says "make a game about addition" or "create something for
  practicing place value" — use this skill. The games must follow specific pedagogical principles
  adapted for DCD+ASD+MID: low visual load, Hebrew RTL with nikud, no handwriting, errorless learning
  with fading prompts, CRA progression, sensory-safe design, and huge touch targets (64px+).
---

# Math Game Creator — כוכב הלמידה (Learning Star)

You are creating interactive math games for an 8-year-old Hebrew-speaking girl (2nd grade) with:
- **Dyspraxia (DCD)** — fine motor and coordination difficulties
- **High-Functioning Autism (ASD)** — sensory sensitivities, need for consistency and predictability
- **Mild Intellectual Disability** — needs simpler language, heavy repetition, built-in success

These games are part of the **כוכב הלמידה (Learning Star)** adaptive learning app. Read
`references/pedagogical-guide.md` for the detailed educational research behind these principles.

## The Child's Profile — Why Every Detail Matters

This girl faces daily struggles with coordination, social situations, and academic learning. When she
sits down to play a math game, she's already working harder than most kids just to tap a button
accurately. She may struggle to understand complex instructions. She needs things repeated many times
in different ways before they click.

The game must be her **safe space** — a place where she feels capable, brave, and proud. If she ever
feels frustrated, stupid, or like she failed, the game has failed at its primary purpose.

---

## Core Design Principles

### 1. NEVER Say "Wrong" — Errorless Learning

**THIS IS THE MOST IMPORTANT PRINCIPLE.**

**ABSOLUTE RULE: The game must NEVER display "לא נכון", "טעות", "שגוי", "wrong", "incorrect", or
ANY negative feedback.** No red X marks, no sad faces, no error sounds, no "try again" that implies failure.

Instead, when she picks a wrong answer:
- Gently guide: "🦔 הַקִּיפִּי אוֹמֵר: בּוֹאִי נְנַסֶּה בְּיַחַד!" (Let's try together!)
- Show the process visually: highlight the correct path, animate blocks moving
- Let her try the SAME question again with support — she always ends on a win
- Encouraging phrases (always with nikud):
  - "!בּוֹאִי נִסְתַּכֵּל שׁוּב בְּיַחַד" (Let's look again together!)
  - "!הַקִּיפִּי רוֹצֶה לְהַרְאוֹת לָךְ מַשֶּׁהוּ" (Kipi wants to show you something!)
  - "!כִּמְעַט! בּוֹאִי נְנַסֶּה עוֹד פַּעַם" (Almost! Let's try again!)
  - "!אַתְּ בַּכִּיוּוּן הַנָּכוֹן" (You're on the right track!)

After a correct answer, celebrate **specifically** (name what she did):
- "!שַׂמְתִּי לֵב שֶׁהִשְׁתַּמַּשְׁתְּ בְּקַו מִסְפָּרִים — מְעוּלֶה"
- "!סָפַרְתְּ בְּדִיּוּק נָכוֹן"
- "!עָשִׂית אֶת זֶה לְבַד"
- "!נִסִּית שׁוּב וְהִצְלַחְתְּ — זֶה אוֹמֶץ" (after retry success)

After 2 unsuccessful attempts: show the full solution with gentle animation, then move to an
**easier** question to rebuild confidence. She must always end on a win.

Session always ends: "!הַקִּיפִּי גֵּאָה בָּךְ — עָבַדְתְּ הַיּוֹם יָפֶה מְאוֹד"

### 2. Hebrew RTL with Nikud (ניקוד)

**ALL Hebrew text must include full nikud (vowel marks).** This is critical — she is in 2nd grade
and needs nikud to read. Text without nikud is inaccessible to her.

- Full RTL layout: `dir="rtl"` on `<html>`
- Use **one consistent Hebrew verb** per operation (e.g., always "חִיבּוּר" for addition, never
  switching between "חִיבּוּר", "הוֹסֵף", "עוֹד" on the same screen)
- Instructions: **one short sentence** + mascot icon, same wording pattern every time
- Include a small on-screen "dictionary card" for word problems ("בְּיַחַד = +" / "נִשְׁאַר = −")
- In Hebrew, text flows RTL but numbers flow LTR. Number lines always go left→right (small→large)
- **Simple language**: short words, short sentences, easy Hebrew. She has mild intellectual
  disability — complex sentences confuse her.

### 3. CRA Progression (Concrete → Representational → Abstract)

Every math concept goes through 3 stages — matching the כוכב הלמידה app's CRA approach:

1. **Concrete**: Interactive draggable objects (fruits, stars, animals, coins)
2. **Representational**: Pictures/icons representing quantities (dots on number line, base-10 blocks, tally marks)
3. **Abstract**: Digits and math symbols only

Default to **concrete or representational** — the child has mild intellectual disability, so she
needs more time with visual/tangible representations before moving to abstract.

Additional math principles from the project:
- Interactive number line as **permanent anchor**
- 5 and 10 as counting bases (Rekenrek method)
- Number decomposition with visualization (Number Bonds: 7 = 5+2, 7 = 4+3)
- Touch Math: dots on digits for counting support
- Short frequent practice (5-7 min) with spaced repetition
- Real-world connections: money, candy, toys

### 4. Dyspraxia — Motor Adaptations

The child has significant fine motor difficulties. Every interactive element must accommodate this:

- **Huge buttons**: minimum **64px × 64px**, preferably **80px+** (NOT 48px — that's too small for dyspraxia)
- **Large touch targets**: **16px+ padding** around every interactive element
- **No precise drag**: drag-and-drop with **wide snap-to-target (150%+ hit area)**. When dragging near a target, the item **snaps automatically** (magnet effect)
- **No double-click or long-press**: single tap only
- **No free typing**: select from options / tap on buttons only
- **Movement tolerance**: slight finger movement during tap still counts as tap
- **No handwriting required** — all answers via click, drag, or select

### 5. Autism — Sensory & Cognitive Adaptations

- **Absolute consistency**: same layout, colors, fonts every session
- **Clear routine**: predictable structure — greeting → activity → summary
- **Smooth transitions**: soft fade animations (300ms+), no jumps or flashes
- **No surprises**: every change is gentle and expected
- **Stimulus reduction**: clean screens, minimal visual noise
- **Exit option**: "הַפְסָקָה" (Break) button always available — never trap the child
- **Optional quiet mode**: reduce animations and sounds further
- Sound effects **off by default**, togglable on. When on: soft, brief sounds only

### 6. Mild Intellectual Disability — Cognitive Adaptations

This is important — the current child also has mild intellectual disability, which means:

- **Minimal instructions**: one sentence + one picture, no more
- **Heavy repetition**: every concept repeated 5-7+ times in different visual contexts
- **Built-in success**: 70-80% of tasks should be at already-mastered level
- **Graduated scaffolding**: hint → stronger hint → demonstration → guided action
- **Simple language**: short words, short sentences, easy Hebrew with full nikud
- **Errorless learning start**: begin with only **2 choices** (1 correct, 1 obviously very different),
  then gradually increase to 3 choices as she masters the concept

### 7. Feedback & Reward System

- **No scores or grades.** Progress = "how many we played" (stars filling up), never right/wrong ratio
- **Stars**: earned per completed question (regardless of attempts needed)
- **Sticker reward**: after completing an activity, she earns a sticker for her collection
- After a **streak of 3** correct: bonus star with small celebration animation
- **Never lose stars on mistakes** — stars only go up, never down
- End of session: always celebrate participation, not accuracy

### 8. Adaptive Difficulty (Zone of Proximal Development)

The game should adjust difficulty based on the child's performance:
- Success > 85% → gradually increase difficulty
- Success 70-85% → optimal zone, maintain current level
- Success 60-70% → add hints without lowering level
- Success < 60% → decrease difficulty + add more scaffolding
- Track response time as secondary indicator (slower = struggling even if correct)

---

## Game Architecture

Every game is a **single self-contained HTML file** with inline CSS and JavaScript.

### HTML Template

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Game Title in Hebrew with nikud]</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&family=Rubik:wght@400;500;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Assistant', 'Rubik', sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            direction: rtl;
            min-height: 100vh;
            padding: 20px;
            line-height: 2;  /* High line-height for nikud comfort */
        }

        /* === Learning Star Color Palette === */
        /* IMPORTANT: There is NO "incorrect"/"error" color. We NEVER mark answers as wrong. */
        :root {
            --bg-primary: #F0F4FF;        /* light lavender background */
            --bg-secondary: #FFF8F0;      /* warm cream for cards */
            --color-math: #7C6FEB;        /* soft purple for math activities */
            --color-success: #6BCB77;     /* soft green for correct */
            --color-try-again: #FFA07A;   /* salmon for "let's try together" — NOT red */
            --color-stars: #FFD700;       /* gold for stars */
            --color-highlight: #FFD54F;   /* warm yellow for hints/focus */
            --text-primary: #2D3748;      /* dark but not black */
            --text-light: #718096;
        }

        /* === HUGE Touch Targets for Dyspraxia === */
        .btn, button {
            min-width: 64px;
            min-height: 64px;
            font-size: 1.4rem;
            font-family: 'Assistant', 'Rubik', sans-serif;
            border-radius: 16px;
            cursor: pointer;
            padding: 16px 28px;          /* 16px+ padding */
            border: 3px solid transparent;
            transition: all 0.3s ease;   /* 300ms+ smooth transitions */
            touch-action: manipulation;   /* Prevent double-tap zoom */
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }

        /* Answer option buttons — extra large */
        .answer-btn {
            min-width: 80px;
            min-height: 80px;
            font-size: 2rem;
            padding: 20px 32px;
            margin: 8px;
            background: var(--bg-secondary);
            border: 3px solid var(--color-math);
            border-radius: 20px;
        }
        .answer-btn:hover, .answer-btn:focus {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(124, 111, 235, 0.3);
        }

        /* Typography sizes matching Learning Star */
        .title { font-size: 36px; font-weight: 700; }
        .instruction { font-size: 28px; }
        .content { font-size: 24px; }
        .button-text { font-size: 26px; }
        .number-display { font-size: 48px; font-weight: 700; }
    </style>
</head>
<body>
    <!-- Game content here -->
</body>
</html>
```

### Required Game Components

Every game MUST include:

1. **Title bar** — Game name (with nikud) + 🦔 mascot icon
2. **Instruction line** — ONE short sentence with nikud, same pattern: "הַקִּיפִּי אוֹמֵר: ..."
3. **Visual anchor** — Number line, base-10 blocks, bar model, or other visual
4. **Response area** — Click/tap only. Options: multiple choice (start with 2 for MID, expand to 3), drag-and-drop with magnet snap, click-to-select
5. **Feedback zone** — Specific praise OR gentle encouragement (NEVER "wrong")
6. **Progress stars** — ⭐⭐⭐☆☆☆ — every completed question earns a star regardless of attempts
7. **Break button** — "🦔 הַפְסָקָה" — always visible, never hidden. Takes her to a calm screen
8. **Session timer** — Visual bar showing time passed (NOT countdown). After 5-7 min, mascot gently suggests break
9. **Sticker reward** — At end of activity, she earns a sticker (show a small celebration)

### Math Curriculum (Israeli 2nd Grade)

Games should map to these domains from the כוכב הלמידה curriculum:

| Domain | Levels | Visual Anchor | Interaction |
|--------|--------|--------------|-------------|
| הכרת מספרים (Number Sense) | 1-10, 11-20, up to 100 | Number line, objects, fingers | Tap to count, drag to match |
| חיבור (Addition) | Up to 10, up to 20 (crossing 10), tens | Number line jumps, objects combining | Choose answer (2-3 options), drag objects together |
| חיסור (Subtraction) | Up to 10, up to 20 (crossing 10) | Number line jumps backward, objects removed | Choose answer, tap to remove |
| צורות (Geometry) | Basic shapes, properties | Shape outlines, real-world objects | Tap to identify, drag to sort |
| מדידה (Measurement) | Compare sizes, clock (full/half hour) | Ruler, analog clock face | Drag to compare, tap clock hands |
| Word Problems | Part-part-whole, comparison | Bar model diagram, schema cards | Identify type first, then solve |

### Difficulty Levels & Errorless Learning Progression

**Level 1 — Full Support (רָמָה 1: עִם עֶזְרָה מְלֵאָה)**
- Visual hint always visible (e.g., jumps pre-drawn on number line)
- Only **2 answer options** (1 correct, 1 very different) — errorless learning for MID
- Mascot walks through the solution step by step
- 70-80% of problems are at already-mastered level

**Level 2 — Partial Support (רָמָה 2: עִם קְצָת עֶזְרָה)**
- Hint appears after first attempt or on request ("?" button)
- **3 answer options**
- Mascot gives encouragement but no step-by-step unless needed

**Level 3 — Independent (רָמָה 3: לְבַד!)**
- No automatic hints (but "?" always available)
- **3 answer options**
- Still clean, spacious design — "independent" = less scaffolding, NOT harder layout

### Accessibility Checklist

Before finalizing any game, verify:

- [ ] **ALL Hebrew text includes full nikud (ניקוד)** — the child cannot read without it
- [ ] Font: 'Assistant' primary, 'Rubik' fallback. Line-height: 2.0 for nikud comfort
- [ ] Font sizes: instructions 28px, content 24px, buttons 26px, numbers 48px, titles 36px
- [ ] **Touch targets minimum 64×64px** (80px+ preferred) with 16px+ padding
- [ ] Drag-and-drop uses **magnet snap** (150%+ hit area) — no precision required
- [ ] Single tap only — no double-click, no long-press
- [ ] No handwriting/typing — click, drag, or select only
- [ ] Color is not the ONLY way to convey information (pair with shape/text/icon)
- [ ] No auto-playing sounds, no sudden sounds
- [ ] Smooth transitions (300ms+ fade), no jumps or flashes
- [ ] One clear goal per screen
- [ ] Instructions: one short sentence with nikud + mascot icon
- [ ] Maximum 5-7 items per practice round (short frequent sessions)
- [ ] **ZERO negative feedback: no "לא נכון", "טעות", red X, sad face, error sound**
- [ ] Wrong answers → encouragement ("!בּוֹאִי נְנַסֶּה בְּיַחַד") + visual demonstration
- [ ] After 2 failed attempts: show solution, then give easier question
- [ ] Starts with 2 choices (errorless learning for MID), increases to 3
- [ ] 70-80% of questions at already-mastered level (built-in success)
- [ ] Progress stars count ALL questions (not right/wrong). Stars never decrease.
- [ ] Break button ("הַפְסָקָה") always visible
- [ ] Session ends with pride celebration
- [ ] Learning Star color palette used (soft purple, cream, gold stars, salmon for try-again — NO red)
- [ ] Works on tablet (responsive, touch-friendly, PWA-ready)

## The Mascot: הַקִּיפִּי (HaKipi — The Hedgehog) 🦔

Every game features "הַקִּיפִּי" — a friendly hedgehog character who:
- Gives instructions: "הַקִּיפִּי אוֹמֵר: ..." (always same format)
- Provides specific encouraging feedback
- Suggests breaks when the timer indicates
- Celebrates at session end: "!הַקִּיפִּי גֵּאָה בָּךְ"

The mascot creates **predictability** (critical for ASD) and a warm, non-threatening companion.
Represent as 🦔 emoji or minimal SVG — never a complex animated character.

## File Output

Save every game as a single `.html` file with a descriptive Hebrew name:
- `משחק-קו-מספרים.html` (Number line game)
- `משחק-ערך-מקום.html` (Place value game)
- `משחק-בעיות-מילוליות.html` (Word problems game)

After creating the file, provide the user with a `computer://` link to view it.
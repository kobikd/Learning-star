# Implementation Patterns — כוכב הלמידה Math Games

This file contains concrete implementation details for when you move from a game design blueprint
to actual code. **Only read this file when the user explicitly asks you to build/code a game**
after a blueprint has been approved.

## Table of Contents
1. [HTML Template](#html-template)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Touch Targets & Motor Adaptations](#touch-targets)
5. [Required UI Components](#required-components)
6. [Mascot Integration](#mascot)
7. [Hebrew Copy Library](#hebrew-copy)
8. [Sound System](#sound-system)
9. [File Output Conventions](#file-output)
10. [Accessibility Checklist](#accessibility-checklist)

---

## HTML Template {#html-template}

Every game is a **single self-contained HTML file** with inline CSS and JavaScript.

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
            --bg-primary: #F0F4FF;
            --bg-secondary: #FFF8F0;
            --color-math: #7C6FEB;
            --color-success: #6BCB77;
            --color-try-again: #FFA07A;   /* salmon — NOT red */
            --color-stars: #FFD700;
            --color-highlight: #FFD54F;
            --text-primary: #2D3748;
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
            padding: 16px 28px;
            border: 3px solid transparent;
            transition: all 0.3s ease;
            touch-action: manipulation;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }

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

## Color Palette {#color-palette}

| Variable | Value | Purpose |
|----------|-------|---------|
| `--bg-primary` | `#F0F4FF` | Light lavender background |
| `--bg-secondary` | `#FFF8F0` | Warm cream for cards |
| `--color-math` | `#7C6FEB` | Soft purple for math activities |
| `--color-success` | `#6BCB77` | Soft green for correct answers |
| `--color-try-again` | `#FFA07A` | Salmon for encouragement (NOT red) |
| `--color-stars` | `#FFD700` | Gold for stars |
| `--color-highlight` | `#FFD54F` | Warm yellow for hints/focus |
| `--text-primary` | `#2D3748` | Dark but not black |
| `--text-light` | `#718096` | Secondary text |

**There is NO error/incorrect color. We never mark answers as wrong.**

## Typography {#typography}

- Primary font: `'Assistant'`, fallback: `'Rubik'`, `sans-serif`
- Line-height: `2.0` (high for nikud comfort)
- Sizes: instructions 28px, content 24px, buttons 26px, numbers 48px, titles 36px
- ALL text with full nikud

## Touch Targets & Motor Adaptations {#touch-targets}

- Minimum button size: **64x64px** (80px+ preferred)
- **16px+ padding** around every interactive element
- Drag-and-drop: **150%+ hit area** with magnet snap effect
- Single tap only — no double-click, no long-press
- Movement tolerance: slight finger movement during tap still counts
- No handwriting/typing — click, drag, or select only

## Required UI Components {#required-components}

Every game MUST include:

1. **Title bar** — Game name (with nikud) + hedgehog mascot icon
2. **Instruction line** — ONE short sentence with nikud: "...הַקִּיפִּי אוֹמֵר:"
3. **Visual anchor** — Number line, base-10 blocks, bar model, or other visual
4. **Response area** — Click/tap only. Start with 2 choices (errorless), expand to 3
5. **Feedback zone** — Specific praise OR gentle encouragement (NEVER "wrong")
6. **Progress stars** — Every completed question earns a star regardless of attempts
7. **Break button** — "הַפְסָקָה 🦔" — always visible, never hidden
8. **Session timer** — Visual bar showing time passed (NOT countdown). After 5-7 min, suggest break
9. **Sticker reward** — At end of activity, earned sticker with small celebration

## Mascot Integration {#mascot}

The mascot is **הַקִּיפִּי (HaKipi — The Hedgehog)** represented as 🦔 emoji or minimal SVG.

- Gives instructions: "...הַקִּיפִּי אוֹמֵר:" (always same format)
- Provides specific encouraging feedback
- Suggests breaks when timer indicates
- Celebrates at session end: "!הַקִּיפִּי גֵּאָה בָּךְ"

The mascot creates **predictability** (critical for ASD) and a warm, non-threatening companion.

## Hebrew Copy Library {#hebrew-copy}

### Encouragement (wrong answer — NEVER say "wrong"):
- "!בּוֹאִי נִסְתַּכֵּל שׁוּב בְּיַחַד" (Let's look again together!)
- "!הַקִּיפִּי רוֹצֶה לְהַרְאוֹת לָךְ מַשֶּׁהוּ" (Kipi wants to show you something!)
- "!כִּמְעַט! בּוֹאִי נְנַסֶּה עוֹד פַּעַם" (Almost! Let's try again!)
- "!אַתְּ בַּכִּיוּוּן הַנָּכוֹן" (You're on the right track!)
- "!בּוֹאִי נְנַסֶּה בְּיַחַד" (Let's try together!)

### Celebration (correct answer — be specific about what she did):
- "!שַׂמְתִּי לֵב שֶׁהִשְׁתַּמַּשְׁתְּ בְּקַו מִסְפָּרִים — מְעוּלֶה"
- "!סָפַרְתְּ בְּדִיּוּק נָכוֹן"
- "!עָשִׂית אֶת זֶה לְבַד"
- "!נִסִּית שׁוּב וְהִצְלַחְתְּ — זֶה אוֹמֶץ" (after retry success)

### Session end:
- "!הַקִּיפִּי גֵּאָה בָּךְ — עָבַדְתְּ הַיּוֹם יָפֶה מְאוֹד"

## Sound System {#sound-system}

- UI feedback: soft-pop (click), whoosh-gentle (transition), sparkle (open)
- Correct answer: happy-chime (short, positive, < 2 sec)
- Try again: soft-nudge (encouraging, NOT critical)
- Streak of 3: celebration-short
- NO failure/error sounds ever
- All sounds off by default, togglable
- Use the `/gentle-learning-sfx` skill for sound design

## File Output Conventions {#file-output}

Save every game as a single `.html` file with a descriptive Hebrew name:
- `משחק-קו-מספרים.html` (Number line game)
- `משחק-ערך-מקום.html` (Place value game)
- `משחק-בעיות-מילוליות.html` (Word problems game)

## Accessibility Checklist {#accessibility-checklist}

Before finalizing any game implementation, verify:

- [ ] ALL Hebrew text includes full nikud
- [ ] Font: 'Assistant' primary, 'Rubik' fallback. Line-height: 2.0
- [ ] Font sizes match typography spec above
- [ ] Touch targets minimum 64x64px (80px+ preferred) with 16px+ padding
- [ ] Drag-and-drop uses magnet snap (150%+ hit area)
- [ ] Single tap only — no double-click, no long-press
- [ ] No handwriting/typing — click, drag, or select only
- [ ] Color is not the ONLY way to convey information (pair with shape/text/icon)
- [ ] No auto-playing sounds, no sudden sounds
- [ ] Smooth transitions (300ms+ fade), no jumps or flashes
- [ ] One clear goal per screen
- [ ] Instructions: one short sentence with nikud + mascot icon
- [ ] Maximum 5-7 items per practice round
- [ ] ZERO negative feedback: no "לא נכון", "טעות", red X, sad face, error sound
- [ ] Wrong answers -> encouragement + visual demonstration
- [ ] After 2 failed attempts: show solution, then give easier question
- [ ] Starts with 2 choices, increases to 3
- [ ] 70-80% of questions at already-mastered level
- [ ] Progress stars count ALL questions. Stars never decrease.
- [ ] Break button always visible
- [ ] Session ends with pride celebration
- [ ] Learning Star color palette used (no red)
- [ ] Works on tablet (responsive, touch-friendly)

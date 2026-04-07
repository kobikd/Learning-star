# Template A — Underwater Ocean (בּוּעוֹת בַּיָּם)

A calming underwater coral reef world. Bubbles are literal water bubbles — translucent,
iridescent, rising gently. Small fish and seahorses drift in the background. The scene
feels safe, magical, and peaceful.

---

## Scene Description

The screen is an underwater view. Gradient goes from deep blue at the top to turquoise
shallows at the bottom. A soft coral reef sits at the bottom edge. Tiny fish (2-3) swim
slowly across the background. Small bubble particles drift upward continuously.
Everything moves slowly and predictably — no sudden movements.

---

## Color Palette

Extends the base CLAUDE.md palette with ocean-specific colors:

```css
/* ── Ocean theme ── */
--ocean-deep:      #2B6CB0;     /* deep water — top of gradient */
--ocean-mid:       #63B3ED;     /* mid water */
--ocean-light:     #BEE3F8;     /* shallow water — bottom of gradient */
--sand:            #F6E6C8;     /* sandy instruction card */
--coral:           #FC8181;     /* coral accents (NOT for errors) */
--coral-soft:      #FEB2B2;     /* lighter coral */
--seaweed:         #68D391;     /* green accents */
--bubble-sheen:    rgba(255,255,255,0.35);  /* bubble highlight */
--bubble-border:   rgba(255,255,255,0.5);   /* bubble edge */
--bubble-fill:     rgba(200,230,255,0.25);  /* bubble interior */

/* ── Background gradient ── */
background: linear-gradient(180deg,
  var(--ocean-deep) 0%,
  var(--ocean-mid) 40%,
  var(--ocean-light) 75%,
  var(--sand) 100%
);
```

---

## Screen Layout (top → bottom)

### 1. Top Bar
```
Style: frosted glass with blue tint
Background: rgba(43, 108, 176, 0.65)
Backdrop-filter: blur(10px)
Border-bottom: 1px solid rgba(255,255,255,0.3)
Direction: rtl

Contents (right to left):
  [← Back] | [🐠 Title with nikud] | [⭐ Star counter]
```

Title format: `🐠 {game name with nikud}`
Example: `🐠 בּוּעוֹת בַּיָּם`

### 2. Instruction Card
```
Shape: rounded rectangle (border-radius: var(--radius-lg))
Background: var(--sand) with 85% opacity
Border: 2px solid rgba(246, 230, 200, 0.8)
Box-shadow: 0 4px 16px rgba(0,0,0,0.12)
Padding: 0.9rem 1.5rem
Max-width: 90%

Text: Hebrew with nikud, var(--text-instruction) size
```

Feels like a message in a bottle or a sign on the sea floor.

### 3. Equation Row
```
Layout: flex, center, gap 0.6rem, wrap
Direction: ltr (numbers always left-to-right)

Components:
  [Bubble A] [operator] [Bubble B] [=] [? Bubble]

Operator & equals sign:
  Color: var(--coral)
  Font-size: var(--text-number, 48px)
  Font-weight: bold
```

### 4. Cat Companion
```
Size: 130px
Costume: tiny diving mask (SVG overlay on CatCharacter)
Position: centered below equation
Speech bubble: clamshell shape (border-radius with pointed bottom)
  Background: var(--sand)
  Border: 2px solid var(--coral-soft)
```

### 5. Answer Area
```
Layout: flex, center, gap 1.2rem, wrap
Padding: 0 1rem

Label above answers:
  Text: "לַחְצִי עַל הַתְּשׁוּבָה:"
  Color: rgba(255,255,255,0.8)
  Font-size: var(--text-label)
```

---

## Bubble Component Styling

### Operand Bubbles (showing the numbers in the equation)
```css
width: 100px;
height: 100px;
border-radius: 50%;
background: radial-gradient(
  circle at 35% 35%,
  rgba(255,255,255,0.5) 0%,
  var(--bubble-fill) 40%,
  rgba(150,200,240,0.15) 100%
);
border: 2px solid var(--bubble-border);
box-shadow:
  inset 0 -4px 8px rgba(0,0,0,0.06),
  0 4px 12px rgba(43,108,176,0.15);

/* Sheen highlight (top-left) */
&::before {
  content: '';
  position: absolute;
  top: 12%; left: 18%;
  width: 30%; height: 20%;
  border-radius: 50%;
  background: rgba(255,255,255,0.6);
  filter: blur(2px);
}
```

Number inside:
```css
font-family: var(--font-primary);
font-size: var(--text-number, 48px);
font-weight: var(--font-bold);
color: var(--ocean-deep);
text-shadow: 0 1px 2px rgba(255,255,255,0.5);
```

### Answer Bubbles (tappable choices)
```css
/* Same as operand but slightly smaller and with hover/tap effects */
width: 90px;
height: 90px;
/* Same gradient and sheen as operand */
cursor: pointer;
touch-action: manipulation;
-webkit-tap-highlight-color: transparent;

/* States */
&:hover { transform: scale(1.06); }
&:active { transform: scale(0.92); }

/* Dimmed (wrong answer after scaffold 1) */
&.dimmed { opacity: 0.4; filter: grayscale(0.3); }

/* Highlighted (demo auto-select) */
&.highlighted {
  border: 3px solid var(--color-success);
  box-shadow: 0 0 20px rgba(107,203,119,0.4);
}
```

### Question Bubble (the "?" in the equation)
```css
/* Same as operand but with pulsing animation */
animation: jellyfish-pulse 3s ease-in-out infinite;

@keyframes jellyfish-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

---

## Background Elements

### Fish (2-3 background fish)
```
Type: simple SVG fish silhouettes (3 variants)
Colors: rgba(255,255,255,0.15) — very subtle, not distracting
Size: 20-30px
Movement: swim left-to-right (or right-to-left), 15-25s duration
  translateX(-100px → calc(100vw + 100px))
  with subtle sine-wave Y motion (±10px)
Repeat: infinite, staggered delays
z-index: 1 (behind all game content)
```

### Bubble Particles (ambient)
```
Count: 5-8 small circles
Size: 4-8px
Color: rgba(255,255,255,0.25)
Movement: float upward from random X positions
  translateY(100vh → -20px), 8-15s duration
  with slight X wobble (±15px sine wave)
Repeat: infinite, random delays 0-10s
z-index: 1
```

### Coral Reef (bottom decoration)
```
Position: fixed bottom, full width
Height: 60-80px
Style: SVG silhouette of coral shapes
Colors: var(--coral-soft) at 30% opacity
z-index: 0
```

---

## Animations

### Idle Loops (always running)
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Operand bubbles | scale 0.98→1.02 | 3s | ease-in-out |
| Answer bubbles | translateY -4→4px | 2.5s, staggered 0.3s each | ease-in-out |
| Question bubble | scale 1→1.05 (jellyfish) | 3s | ease-in-out |
| Background fish | translateX full screen | 15-25s | linear |
| Bubble particles | translateY upward | 8-15s | linear |

### Correct Answer
```
Sequence (total ~2.2s):
1. Answer bubble: scale up to 1.3 (0.2s spring)
2. Bubble pops: opacity → 0, replaced by sparkle particles
   - 6-8 small circles fly outward (radial, 0.6s)
   - Each circle: scale 1→0, opacity 1→0
3. Splash ring: expanding circle outline (0.4s)
   - stroke: var(--bubble-border)
   - scale 0.5→2, opacity 1→0
4. Fish do a happy loop (one fish swims in a small circle, 1s)
5. Cat: pose → "wave", speech → encouragement with nikud

Color: var(--color-success) for the sparkle burst
Sound: playCorrect()
```

### Wrong Answer
```
Sequence (total ~1.2s):
1. Answer bubble dims to 40% opacity (0.3s ease)
2. Gentle wobble: rotate -3°→3°→0° (0.4s)
3. Cat: pose → "point-right", speech → "!נַסִּי שׁוּב"
4. After 1.2s → return to 'answering' phase

NO: red, X marks, frowns, error sounds, negative text
Color: var(--color-try-again) for feedback overlay
Sound: playTryAgain()
```

### Demo Mode
```
Sequence:
1. Cat speech: "!בּוֹאִי נִסְפּוֹר יַחַד"
2. A small fish swims from operand A bubble
3. Fish makes B jumps toward operand B (each jump = 600ms + 300ms pause)
   - On each jump: playDemoPing(), small splash at jump point
4. Fish arrives at correct answer bubble
5. Answer bubble highlights (green border glow, 1.5s)
6. Auto-tap: answer selected, flows into correct sequence

Fish path: horizontal arc between bubbles, slight sine wave
```

---

## Encouragement Lines (Hebrew with nikud)

### Correct answer praise (pick random):
```
"!כָּל הַכָּבוֹד"
"!יוֹפִי, עָשִׂית אֶת זֶה"
"!מְעוּלֶה"
"!אַתְּ מַדְהִימָה"
"!סָפַרְתְּ מְצוּיָן"
"!אֵיזוֹ כוֹכָבָה"
```

### Wrong answer encouragement:
- Attempt 1: `"!נַסִּי שׁוּב"` (cat: `"!אֲנִי כָּאן אִתָּךְ 💛"`)
- Attempt 2: `"{a} {op} {b} זֶה {answer}. נְנַסֶּה שׁוּב!"` + show visual hint
- Attempt 3: `"!בּוֹאִי נִפְתּוֹר יַחַד"` → enter demo

### Streak bonus (3 in a row):
```
"!שָׁלוֹשׁ בְּרֶצֶף! מַדְהִים"
```

---

## Sound Design Notes

| Moment | SFX | Character |
|--------|-----|-----------|
| Bubble tap | Soft underwater "blub" | Muffled, warm |
| Correct pop | Gentle splash + sparkle | Water + magic |
| Wrong wobble | Soft low "bloop" | Gentle, not sad |
| Demo jump | Light "plip" per hop | Playful, counting |
| Streak bonus | Rising bubble cascade | Exciting but calm |
| Background ambient | Very faint ocean hum | Barely audible, optional |

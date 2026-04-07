# Template B — Sky & Clouds (בּוּעוֹת בָּשָׁמַיִם)

A dreamy pastel sky world. Soap bubbles float among fluffy clouds with rainbow sheens.
Butterflies drift gently. A faint rainbow arc in the distance. Everything feels light,
airy, and magical — like a daydream.

---

## Scene Description

The screen is a soft sky at dawn/sunset. Gradient goes from lavender at top through
peach to baby blue at bottom. Multiple cloud layers move at different speeds (parallax).
A very faint rainbow arc is visible in the upper portion. Butterflies (2-3) drift across
the screen occasionally. Bubbles are iridescent soap bubbles with rainbow reflections.

---

## Color Palette

Extends the base CLAUDE.md palette with sky-specific colors:

```css
/* ── Sky theme ── */
--sky-top:         #E8DAEF;     /* lavender — top of gradient */
--sky-mid:         #FADBD8;     /* peach — middle */
--sky-bottom:      #D6EAF8;     /* baby blue — bottom */
--cloud-white:     #FDFEFE;     /* bright cloud */
--cloud-shadow:    #E8E8E8;     /* cloud underside */
--cloud-glow:      rgba(255,255,255,0.9);
--rainbow-1:       #FF9AA2;     /* red-pink */
--rainbow-2:       #FFB7B2;     /* peach */
--rainbow-3:       #FFDAC1;     /* orange */
--rainbow-4:       #E2F0CB;     /* yellow-green */
--rainbow-5:       #B5EAD7;     /* mint */
--rainbow-6:       #C7CEEA;     /* lavender */
--gold-accent:     #F6D365;     /* warm gold for operators */
--bubble-rainbow:  linear-gradient(135deg, #FF9AA2, #FFB7B2, #FFDAC1, #E2F0CB, #B5EAD7, #C7CEEA);

/* ── Background gradient ── */
background: linear-gradient(180deg,
  var(--sky-top) 0%,
  var(--sky-mid) 45%,
  var(--sky-bottom) 100%
);
```

---

## Screen Layout (top → bottom)

### 1. Top Bar
```
Style: white cloud-like frosted glass
Background: rgba(253, 254, 254, 0.8)
Backdrop-filter: blur(12px)
Border-bottom: 1px solid rgba(255,255,255,0.6)
Box-shadow: 0 2px 8px rgba(0,0,0,0.04)
Direction: rtl

Contents (right to left):
  [← Back] | [🦋 Title with nikud] | [⭐ Star counter]
```

Title format: `🦋 {game name with nikud}`
Example: `🦋 בּוּעוֹת בָּשָׁמַיִם`

### 2. Instruction Card
```
Shape: cloud-like (large border-radius, slightly irregular)
  border-radius: 24px 28px 26px 22px (subtle organic feel)
Background: var(--cloud-white)
Border: 2px solid rgba(199, 206, 234, 0.5)  /* soft lavender border */
Box-shadow:
  0 4px 16px rgba(0,0,0,0.06),
  inset 0 -2px 4px rgba(0,0,0,0.02)
Padding: 1rem 1.6rem
Max-width: 90%

Text: Hebrew with nikud, var(--text-instruction) size
Color: var(--text-primary)
```

### 3. Equation Row
```
Layout: flex, center, gap 0.6rem, wrap
Direction: ltr (numbers always left-to-right)

Components:
  [Bubble A on cloud] [operator] [Bubble B on cloud] [=] [? Bubble]

Operator & equals sign:
  Color: var(--gold-accent)
  Font-size: var(--text-number, 48px)
  Font-weight: bold
  Text-shadow: 0 1px 3px rgba(0,0,0,0.1)
```

Each operand bubble sits on a small cloud platform:
```css
.cloud-platform {
  background: radial-gradient(ellipse, var(--cloud-white) 60%, transparent 100%);
  padding: 8px;
  border-radius: 50%;
  filter: blur(1px);  /* soft cloud edge */
}
```

### 4. Cat Companion
```
Size: 130px
Costume: tiny angel wings (two small wing SVGs behind the cat body)
Position: centered, sitting on a cloud
Speech bubble:
  Shape: small cloud (border-radius with bumpy edge)
  Background: var(--cloud-white)
  Border: 2px solid var(--cloud-shadow)
  Box-shadow: 0 2px 8px rgba(0,0,0,0.06)
```

### 5. Answer Area
```
Layout: flex, center, gap 1.2rem, wrap
Padding: 0 1rem

Label above answers:
  Text: "לַחְצִי עַל הַתְּשׁוּבָה:"
  Color: var(--text-secondary)
  Font-size: var(--text-label)
```

---

## Bubble Component Styling

### Operand Bubbles
```css
width: 100px;
height: 100px;
border-radius: 50%;
background: radial-gradient(
  circle at 30% 30%,
  rgba(255,255,255,0.7) 0%,
  rgba(255,230,240,0.2) 40%,
  rgba(200,210,240,0.15) 100%
);
border: 2px solid rgba(255,255,255,0.6);
box-shadow:
  inset 0 -4px 8px rgba(0,0,0,0.04),
  0 4px 16px rgba(0,0,0,0.08);

/* Rainbow sheen — subtle rotating gradient overlay */
&::before {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 50%;
  background: var(--bubble-rainbow);
  opacity: 0.12;
  animation: rainbow-rotate 8s linear infinite;
}

/* Highlight shine (top-left) */
&::after {
  content: '';
  position: absolute;
  top: 10%; left: 15%;
  width: 35%; height: 22%;
  border-radius: 50%;
  background: rgba(255,255,255,0.65);
  filter: blur(2px);
}

@keyframes rainbow-rotate {
  from { filter: hue-rotate(0deg); }
  to { filter: hue-rotate(360deg); }
}
```

Number inside:
```css
font-family: var(--font-primary);
font-size: var(--text-number, 48px);
font-weight: var(--font-bold);
color: var(--text-primary);
text-shadow: 0 1px 3px rgba(255,255,255,0.6);
```

### Answer Bubbles
```css
/* Same as operand but 90px and interactive */
width: 90px;
height: 90px;
cursor: pointer;
touch-action: manipulation;
-webkit-tap-highlight-color: transparent;

&:hover { transform: scale(1.06); }
&:active { transform: scale(0.92); }

/* Dimmed state */
&.dimmed { opacity: 0.4; filter: grayscale(0.4); }

/* Highlighted (demo) */
&.highlighted {
  border: 3px solid var(--color-success);
  box-shadow: 0 0 24px rgba(107,203,119,0.35);
}
```

### Question Bubble
```css
/* Same as operand with gentle shimmer pulse */
animation: shimmer-pulse 3s ease-in-out infinite;

@keyframes shimmer-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.04); opacity: 0.95; }
}
```

---

## Background Elements

### Cloud Layers (parallax)
```
3 layers, back to front:

Layer 1 (furthest):
  Clouds: 2-3 large, soft, very faint
  Color: rgba(255,255,255,0.3)
  Size: 200-300px wide
  Speed: translateX across screen in 40s
  Y position: top 10-25%

Layer 2 (middle):
  Clouds: 2-3 medium
  Color: rgba(255,255,255,0.5)
  Size: 120-180px wide
  Speed: translateX in 30s
  Y position: top 20-40%

Layer 3 (nearest):
  Clouds: 1-2 small, bright
  Color: var(--cloud-white) at 70% opacity
  Size: 80-120px wide
  Speed: translateX in 20s
  Y position: top 35-55%

All layers: infinite loop, seamless (200% width trick)
z-index: 1 (behind game content)
```

Cloud SVG shape:
```svg
<ellipse cx="60" cy="30" rx="60" ry="25" fill="currentColor" />
<ellipse cx="35" cy="35" rx="35" ry="20" fill="currentColor" />
<ellipse cx="85" cy="35" rx="40" ry="22" fill="currentColor" />
```

### Butterflies (2-3)
```
Style: simple SVG butterfly (two wing ellipses + body line)
Colors: var(--rainbow-1), var(--rainbow-5), var(--rainbow-6) — one per butterfly
Size: 18-25px
Movement: drift across screen, 10-15s
  Path: gentle sine wave (±30px Y, ±20px X wobble)
  Wings: scaleX 1→0.3→1 (flapping, 0.8s loop)
Frequency: one butterfly crosses screen every ~10s
z-index: 1
```

### Rainbow Arc (background)
```
Position: top 5%, centered
Style: SVG arc (semi-circle)
Size: 60% of viewport width
Opacity: 0.08 — barely visible, atmospheric
Colors: 6 concentric arcs using rainbow-1 through rainbow-6
Stroke-width: 3px each, 4px gap between
No animation (static, serene)
z-index: 0
```

---

## Animations

### Idle Loops
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Operand bubbles | translateY -3→3px + rainbow-rotate | 3s float, 8s rotate | ease-in-out, linear |
| Answer bubbles | translateY -4→4px (staggered 0.3s) | 2.5s | ease-in-out |
| Question bubble | shimmer-pulse scale 1→1.04 | 3s | ease-in-out |
| Cloud layer 1 | translateX seamless | 40s | linear |
| Cloud layer 2 | translateX seamless | 30s | linear |
| Cloud layer 3 | translateX seamless | 20s | linear |
| Butterflies | drift path + wing flap | 10-15s drift, 0.8s flap | linear, ease-in-out |

### Correct Answer
```
Sequence (total ~2.2s):
1. Bubble pops: scale 1→1.3→0 (0.3s spring)
2. Rainbow sparkle burst: 8 small circles in rainbow colors
   - Fly outward radially (0.5s)
   - Each: scale 1→0, opacity 1→0
   - Colors cycle through rainbow-1 to rainbow-6
3. Sparkle cloud: soft white puff expands (scale 0→1.5, opacity 0.8→0)
4. A butterfly lands briefly on the cat (flies in, lands 0.5s, flies away)
5. Cat: pose → "wave", speech → encouragement with nikud

Color: var(--color-success) tinted rainbow sparkles
Sound: playCorrect()
```

### Wrong Answer
```
Sequence (total ~1.2s):
1. Bubble sinks slightly: translateY +8px (0.3s ease)
2. Dims to 40% opacity (0.3s)
3. Floats back up to original position (0.4s ease-out)
4. Cat: pose → "point-right", speech → encouragement

NO: red, X marks, frowns, error sounds, shaking
Color: var(--color-try-again) for feedback overlay
Sound: playTryAgain()
```

### Demo Mode
```
Sequence:
1. Cat speech: "!בּוֹאִי נִסְפּוֹר יַחַד"
2. A butterfly flies from operand A
3. Butterfly makes B hops through the air (each hop = 700ms)
   - On each hop: playDemoPing(), small sparkle puff at hop point
   - Butterfly wings flap faster during hops
4. Butterfly lands on correct answer bubble
5. Answer bubble glows with rainbow border (1.5s)
6. Auto-tap: flows into correct animation

Butterfly path: gentle arc between bubbles
```

---

## Encouragement Lines (Hebrew with nikud)

Same as shared set in README.md. Template-specific additions:

### Correct (sky-themed):
```
"!אַתְּ עָפָה גָּבוֹהַּ"        (You're flying high!)
"!כְּמוֹ פַּרְפַּר יָפֶה"       (Like a beautiful butterfly!)
```

### Demo intro:
```
"!בּוֹאִי נַעוּף יַחַד"          (Let's fly together!)
```

---

## Sound Design Notes

| Moment | SFX | Character |
|--------|-----|-----------|
| Bubble tap | Soft airy "pop" | Light, breathy |
| Correct pop | Wind chime sparkle | Magical, ascending |
| Wrong sink | Soft low whistle (descending) | Gentle, not sad |
| Demo hop | Light bell "ting" per hop | Clear, counting |
| Streak bonus | Wind chime cascade ascending | Uplifting |
| Background ambient | Very faint wind/breeze | Barely audible, optional |

# Template C — Garden (בּוּעוֹת בַּגָּן)

A warm, sunny garden scene. Bubbles are dewdrops on leaves or soap bubbles blown by
the wind. Flowers bloom, ladybugs crawl, and soft sunlight warms everything. The scene
feels earthy, natural, and nurturing — like playing outside on a perfect spring day.

---

## Scene Description

The screen is a garden view. Gradient goes from warm sunny sky at the top to grass-green
at the bottom. A wooden fence is visible in the far background. Scattered flowers and
grass blades at the bottom edge. A soft sunlight glow pulses gently from the top-right.
A ladybug crawls across the bottom occasionally. Everything feels warm and grounded.

---

## Color Palette

Extends the base CLAUDE.md palette with garden-specific colors:

```css
/* ── Garden theme ── */
--garden-sky:      #FFF8E7;     /* warm sunny sky */
--garden-mid:      #E8F5E9;     /* light green midground */
--garden-grass:    #A5D6A7;     /* grass green */
--grass-dark:      #66BB6A;     /* darker grass blades */
--earth:           #C4A882;     /* soil/earth tone */
--wood:            #A0784C;     /* wooden fence/sign */
--wood-light:      #C9A96E;     /* lighter wood */
--sunlight:        #FEFCBF;     /* warm glow */
--sunlight-strong: #F6D365;     /* brighter sun accent */
--leaf:            #48BB78;     /* leaf green */
--leaf-light:      #9AE6B4;     /* lighter leaf */
--petal-pink:      #FBB6CE;     /* flower petal */
--petal-yellow:    #FEFCBF;     /* flower center */
--dewdrop:         rgba(200,235,255,0.55);  /* dewdrop fill */
--dewdrop-border:  rgba(180,220,250,0.6);   /* dewdrop edge */
--ladybug-red:     #E53E3E;     /* ladybug (decorative only, NOT for errors) */

/* ── Background gradient ── */
background: linear-gradient(180deg,
  var(--garden-sky) 0%,
  var(--garden-mid) 55%,
  var(--garden-grass) 85%,
  var(--grass-dark) 100%
);
```

---

## Screen Layout (top → bottom)

### 1. Top Bar
```
Style: warm cream with leaf accents
Background: rgba(255, 248, 231, 0.85)
Backdrop-filter: blur(10px)
Border-bottom: 2px solid rgba(72, 187, 120, 0.2)
Direction: rtl

Contents (right to left):
  [← Back] | [🌻 Title with nikud] | [⭐ Star counter]
```

Title format: `🌻 {game name with nikud}`
Example: `🌻 בּוּעוֹת בַּגָּן`

### 2. Instruction Card
```
Shape: wooden sign board
  border-radius: 12px
  Background: var(--wood-light)
  Border: 3px solid var(--wood)
  Inner content area:
    Background: var(--sunlight) at 90% opacity
    border-radius: 8px
    margin: 4px
    padding: 0.8rem 1.4rem
Box-shadow:
  0 4px 12px rgba(0,0,0,0.1),
  inset 0 1px 0 rgba(255,255,255,0.3)
Max-width: 90%

Text: Hebrew with nikud, var(--text-instruction) size
Color: var(--wood) — dark brown text on cream
```

### 3. Equation Row
```
Layout: flex, center, gap 0.6rem, wrap
Direction: ltr

Components:
  [Dewdrop A in pot] [operator] [Dewdrop B in pot] [=] [Flower bud]

Operator & equals sign:
  Color: var(--grass-dark)
  Font-size: var(--text-number, 48px)
  Font-weight: bold
```

Each operand sits in a small flower pot or on a leaf:
```css
.leaf-platform {
  position: relative;
  /* Simple leaf shape behind the dewdrop */
}
.leaf-platform::after {
  content: '';
  position: absolute;
  bottom: -8px; left: 50%;
  transform: translateX(-50%);
  width: 70%; height: 16px;
  background: var(--leaf);
  border-radius: 50%;
  opacity: 0.6;
}
```

### 4. Cat Companion
```
Size: 130px
Costume: small flower crown (3 simple flower SVGs on head)
  Or: ladybug sitting on cat's ear
Position: centered, sitting in the grass
Speech bubble:
  Shape: leaf-like (pointed at one end)
  Background: var(--leaf-light)
  Border: 2px solid var(--leaf)
  Color: var(--text-primary)
```

### 5. Answer Area
```
Layout: flex, center, gap 1.2rem, wrap
Padding: 0 1rem

Label above answers:
  Text: "לַחְצִי עַל הַתְּשׁוּבָה:"
  Color: var(--wood)
  Font-size: var(--text-label)
```

---

## Bubble Component Styling (Dewdrop Style)

### Operand Dewdrops
```css
width: 100px;
height: 100px;
border-radius: 50%;
background: radial-gradient(
  circle at 30% 30%,
  rgba(255,255,255,0.6) 0%,
  var(--dewdrop) 50%,
  rgba(150,210,180,0.2) 100%
);
border: 2px solid var(--dewdrop-border);
box-shadow:
  inset 0 -6px 10px rgba(0,0,0,0.05),
  0 6px 16px rgba(72,187,120,0.12);

/* Light refraction (top-left shine) */
&::before {
  content: '';
  position: absolute;
  top: 12%; left: 16%;
  width: 28%; height: 18%;
  border-radius: 50%;
  background: rgba(255,255,255,0.7);
  filter: blur(2px);
}

/* Tiny leaf reflection (bottom) */
&::after {
  content: '';
  position: absolute;
  bottom: 15%; right: 20%;
  width: 15%; height: 10%;
  border-radius: 50%;
  background: rgba(72,187,120,0.15);
  filter: blur(3px);
}
```

Number inside:
```css
font-family: var(--font-primary);
font-size: var(--text-number, 48px);
font-weight: var(--font-bold);
color: var(--wood);
text-shadow: 0 1px 2px rgba(255,255,255,0.5);
```

### Answer Dewdrops
```css
width: 90px;
height: 90px;
/* Same gradient as operand */
cursor: pointer;
touch-action: manipulation;
-webkit-tap-highlight-color: transparent;

&:hover { transform: scale(1.06); }
&:active { transform: scale(0.92); }

/* Dimmed */
&.dimmed { opacity: 0.4; filter: grayscale(0.3); }

/* Highlighted */
&.highlighted {
  border: 3px solid var(--color-success);
  box-shadow: 0 0 20px rgba(107,203,119,0.4);
}
```

### Question Bubble (Flower Bud)
```css
/* A closed flower bud shape instead of a plain circle */
/* Option 1: keep circle but add petal hints around it */
width: 100px;
height: 100px;
border-radius: 50%;
background: radial-gradient(circle, var(--petal-yellow) 30%, var(--petal-pink) 100%);
border: 2px solid rgba(251,182,206,0.6);

/* Gentle breathing animation — bud wants to bloom */
animation: bud-breathe 3s ease-in-out infinite;

@keyframes bud-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

On correct answer, the bud blooms into a flower (see Correct Animation below).

---

## Background Elements

### Grass Blades (bottom)
```
Position: fixed bottom, full width
Height: 40-60px
Style: SVG grass blade shapes — 15-20 thin triangles of varying height
Colors: var(--garden-grass), var(--grass-dark), var(--leaf) — alternating
Animation: gentle sway (rotate -2°→2° from bottom pivot, 4s ease-in-out, staggered)
z-index: 1
```

### Flowers (scattered, decorative)
```
Count: 4-6 small flowers at bottom among grass
Style: simple 5-petal SVG flowers
Colors: var(--petal-pink), var(--sunlight-strong), white — variety
Size: 20-35px
No animation (static, grounding)
z-index: 1
```

### Wooden Fence (far background)
```
Position: bottom 25-35%
Style: simple brown picket fence SVG silhouette
Color: var(--wood) at 15% opacity — very subtle
z-index: 0
```

### Sunlight Glow
```
Position: top-right corner
Style: radial gradient circle
  Background: radial-gradient(circle, var(--sunlight) 0%, transparent 70%)
Size: 300px × 300px
Opacity: 0.3
Animation: opacity 0.25→0.35 (5s ease-in-out loop) — gentle pulsing warmth
z-index: 0
```

### Ladybug (occasional)
```
Style: simple SVG ladybug (red circle, black dots, legs)
Size: 16px
Movement: crawl across bottom of screen, L→R, 20-30s
  translateX(-30px → calc(100vw + 30px))
  slight Y wobble (±3px)
Frequency: one ladybug every ~25s
z-index: 1
```

---

## Animations

### Idle Loops
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Operand dewdrops | skewX -1°→1° (wobble) | 2.5s | ease-in-out |
| Answer dewdrops | rotate -2°→2° (swing on leaf) | 3s, staggered | ease-in-out |
| Question bud | scale 1→1.05 (breathe) | 3s | ease-in-out |
| Grass blades | rotate -2°→2° from base | 4s, staggered | ease-in-out |
| Sunlight glow | opacity 0.25→0.35 | 5s | ease-in-out |
| Ladybug | translateX across screen | 20-30s | linear |

### Correct Answer
```
Sequence (total ~2.5s):
1. Dewdrop pops: scale 1→1.2→0 (0.3s spring)
2. In its place, a FLOWER BLOOMS:
   - 5 petals expand from center (scale 0→1, rotate, staggered 0.05s each)
   - Petal colors: var(--petal-pink) with var(--petal-yellow) center
   - Total bloom: 0.6s spring animation
3. Small leaf confetti: 4-6 tiny leaf shapes flutter down (0.8s)
   - Colors: var(--leaf), var(--leaf-light)
   - Each: translateY downward + rotate + opacity fade
4. A bee flies in, circles the new flower once (1s), flies away
5. Cat: flower crown gets +1 flower (visual growth), pose → "wave"

The question bud also blooms into the answer number.
Color: var(--color-success) accent
Sound: playCorrect()
```

### Wrong Answer
```
Sequence (total ~1.2s):
1. Dewdrop slides slightly off its leaf: translateY +6px, rotate 3° (0.3s)
2. Dims to 40% opacity (0.3s)
3. Slides back onto leaf: translateY 0, rotate 0° (0.4s ease-out)
4. Cat: pose → "point-right", speech → encouragement

NO: red, wilting, dead flowers, negative imagery
Color: var(--color-try-again) for feedback overlay
Sound: playTryAgain()
```

### Demo Mode
```
Sequence:
1. Cat speech: "!בּוֹאִי נִסְפּוֹר יַחַד"
2. A ladybug starts at operand A
3. Ladybug walks B steps along a leaf path (each step = 700ms)
   - On each step: playDemoPing(), small leaf appears at step point
   - Ladybug bobbles slightly on each step
4. Ladybug arrives at correct answer dewdrop
5. Answer dewdrop glows green, ladybug crawls onto it
6. Auto-tap: dewdrop pops → flower blooms (correct animation)

Ladybug path: gentle curve along a drawn vine/branch between items
```

---

## Encouragement Lines (Hebrew with nikud)

Same as shared set in README.md. Template-specific additions:

### Correct (garden-themed):
```
"!פָּרַח לָךְ"                    (A flower bloomed for you!)
"!הַגָּן שֶׁלָּךְ גָּדֵל"        (Your garden is growing!)
```

### Demo intro:
```
"!בּוֹאִי נִטַּע יַחַד"           (Let's plant together!)
```

---

## Sound Design Notes

| Moment | SFX | Character |
|--------|-----|-----------|
| Dewdrop tap | Soft water "drip" | Fresh, natural |
| Correct bloom | Gentle chime + rustling leaves | Organic, magical |
| Wrong slide | Soft low "bloop" | Gentle, earthy |
| Demo step | Light wooden tap per hop | Natural, counting |
| Streak bonus | Bird song cascade (ascending) | Cheerful |
| Background ambient | Very faint birdsong + wind | Barely audible, optional |

---
name: math-game-creator
description: >
  Guide the design of adaptive math learning games for כוכב הלמידה (Learning Star) by producing
  a structured game blueprint, pedagogical rationale, and implementation brief. The default output
  is a design document, NOT code. Use this skill whenever the user asks to create, design, or plan
  a math game, learning activity, educational game, practice exercise, or interactive worksheet
  for their daughter — an 8-year-old Hebrew-speaking girl with dyspraxia (DCD), high-functioning
  autism (ASD), and mild intellectual disability. Also trigger when the user mentions: number line
  game, place value activity, addition game, subtraction practice, word problem exercise, counting
  game, multiplication activity, time/clock game, or any math topic combined with "game", "activity",
  "exercise", "practice", or "interactive". Even if the user just says "make a game about addition"
  or "create something for practicing place value" — use this skill to design the game first.
---

# Math Game Designer — כוכב הלמידה (Learning Star)

This skill guides you through **designing** math learning games, not building them directly.
The output is a game design blueprint that can then be implemented in a separate step if the
user asks for it.

## The Child

An 8-year-old Hebrew-speaking girl (2nd grade, Israeli curriculum) with:
- **Dyspraxia (DCD)** — fine motor and coordination difficulties
- **High-Functioning Autism (ASD)** — sensory sensitivities, need for consistency and predictability
- **Mild Intellectual Disability (MID)** — needs simpler language, heavy repetition, built-in success

When she sits down to play a math game, she's already working harder than most kids just to tap
a button accurately. The game must be her **safe space** — a place where she feels capable, brave,
and proud. If she ever feels frustrated, stupid, or like she failed, the game has failed.

Read `references/pedagogical-guide.md` for the full educational research behind these principles.

---

## Design Workflow

Follow these steps in order. Present each step's output to the user before moving on.

### Step 1: Intake — Understand What's Being Asked

Clarify with the user:
- **Math topic**: What concept? (addition, subtraction, place value, word problems, etc.)
- **Scope**: Which number range? (up to 10, up to 20, crossing 10, up to 100)
- **Current level**: Is this new material or review? Where is the child in CRA progression?
- **Context**: Standalone practice? Reinforcement after a lesson? Assessment?

Map the request to the Israeli 2nd-grade math curriculum:

| Domain | Skill IDs | Typical Number Range |
|--------|-----------|---------------------|
| Number Sense (הכרת מספרים) | ns1 (1-10), ns2 (11-20), ns3 (up to 100) | Varies |
| Addition (חיבור) | add1 (up to 10), add2 (up to 20, crossing 10), add3 (tens) | Depends on skill |
| Subtraction (חיסור) | sub1 (up to 10), sub2 (up to 20, crossing 10) | Depends on skill |
| Geometry (צורות) | geo1 (basic shapes), geo2 (properties) | N/A |
| Measurement (מדידה) | meas1 (compare sizes), meas2 (clock) | N/A |
| Word Problems | Part-part-whole, comparison | Varies |

### Step 2: Define Learning Objective

Write a single, clear learning objective in the format:
> "After this activity, the child will be able to [verb] [what] [using what support]."

Example: "After this activity, the child will be able to solve addition problems up to 20
(crossing 10) using jumps on a number line."

The objective determines everything that follows. If the objective is fuzzy, the game will be too.

### Step 3: Select Core Mechanic

Choose the primary interaction pattern. The mechanic must match both the math concept AND the
child's motor/cognitive profile.

#### Decision Heuristics

**Visual anchor — which representation fits?**

| If the concept involves... | Use... | Because... |
|---------------------------|--------|-----------|
| Counting, ordering, comparison | **Number line** | Linear visual, consistent directional cue, builds number sense |
| Place value, grouping | **Base-10 blocks** | Concrete grouping visible, supports CRA stage 1-2 |
| Part-whole relationships | **Bar model** | Schema-based, reduces word problem load |
| Addition/subtraction process | **Objects combining/separating** | Concrete, tangible, matches CRA stage 1 |
| Shapes, properties | **Shape outlines + real-world photos** | Visual matching, categorization |
| Measurement, time | **Ruler / analog clock** | Domain-specific tools |

**Interaction — which input method?**

| If the child needs... | Use... | Avoid... |
|----------------------|--------|----------|
| Maximum success (new concept, low confidence) | **2-choice tap** | Drag, free input |
| Moderate challenge (practiced concept) | **3-choice tap** | More than 3 options |
| Concrete manipulation (CRA stage 1) | **Drag-and-drop with magnet snap** | Precise positioning |
| Counting/sequencing | **Tap-to-count** (tap objects, they light up) | Typing numbers |
| Sorting/categorizing | **Drag-to-zone** (large zones, magnet snap) | Small target areas |

**When to use 2 choices vs 3:**
- **2 choices**: New concept, first exposure, confidence is low, errorless learning phase.
  The wrong option should be very obviously wrong (answer is 7? wrong option is 20, not 8).
- **3 choices**: Child has had 5+ successful sessions with 2 choices on this concept.
  Distractors can be closer to correct answer.
- **Never use 4+ choices** — too overwhelming for MID.

**When to prefer tap vs drag:**
- **Tap**: Default. Lower motor demand, higher success rate, works for most concepts.
- **Drag**: Only when physical manipulation IS the learning (e.g., building a number from
  base-10 blocks, placing objects on a number line). Always with 150%+ hit area magnet snap.

### Step 4: Map to CRA Progression

Define how the game moves through CRA stages for this specific concept:

1. **Concrete** (default starting point): What objects/manipulatives? How does the child
   interact with them? (e.g., drag fruit into a basket to add)
2. **Representational**: What pictures/diagrams replace the objects? (e.g., dots on a number
   line replacing actual fruit)
3. **Abstract**: Digits and symbols only (e.g., "5 + 3 = ?")

For this child, **default to concrete or representational**. She needs more time with
visual/tangible representations before moving to abstract. The game should not rush to
abstract — that's a progression decision the adaptive engine makes over many sessions.

### Step 5: Design Scaffolding & Hint Fading

Define the support levels. Scaffolding fades gradually — never jump from "full support" to
"no support."

**Level 1 — Full Support (רָמָה 1)**
- Visual hint always visible (e.g., jumps pre-drawn on number line)
- Only 2 answer options (errorless learning)
- Mascot walks through solution step by step
- 70-80% of problems at already-mastered level

**Level 2 — Partial Support (רָמָה 2)**
- Hint appears after first attempt or on request ("?" button)
- 3 answer options
- Mascot encourages but no step-by-step unless needed

**Level 3 — Independent (רָמָה 3)**
- No automatic hints ("?" always available)
- 3 answer options
- Less scaffolding, NOT harder layout — still clean and spacious

For each level, describe: what the child sees, what hints are available, how many choices,
what happens on incorrect selection.

### Step 6: Define Feedback Plan

**Absolute rule: The game must NEVER display negative feedback.** No "לא נכון", "טעות",
"שגוי", red X, sad faces, error sounds, or anything that implies failure.

Design the feedback flow:
- **Correct answer**: Specific praise naming what she did (not just "!כל הכבוד")
- **Incorrect answer (attempt 1)**: Gentle encouragement + visual support
- **Incorrect answer (attempt 2)**: Stronger hint + guided demonstration
- **After 2 failed attempts**: Show full solution with animation, then give an **easier**
  question to rebuild confidence
- **Session end**: Always celebrate participation, not accuracy

Describe the exact feedback moments for this specific game concept.

### Step 7: Define Session Structure & Difficulty Progression

- **Session length**: 5-7 minutes (short, frequent practice)
- **Items per session**: 5-7 problems
- **Warm-up**: 2-3 easy problems at mastered level
- **Core practice**: 3-4 problems at target level
- **Cool-down**: End on an easy win

**Adaptive difficulty** (Zone of Proximal Development):
- Success > 85% -> gradually increase difficulty
- Success 70-85% -> optimal zone, maintain
- Success 60-70% -> add hints without lowering level
- Success < 60% -> decrease difficulty + more scaffolding
- Track response time as secondary indicator

### Step 8: Accessibility & Sensory Review

Run through these checks for your design:

**Motor (DCD)**
- [ ] All interactions use large targets (64px+ buttons, 80px+ preferred)
- [ ] No precision required — magnet snap on all drag interactions
- [ ] Single tap only — no double-click, long-press, or typing
- [ ] No handwriting required

**Sensory (ASD)**
- [ ] Consistent layout — same structure every session
- [ ] Predictable routine: greeting -> activity -> summary
- [ ] Smooth transitions (300ms+ fade), no jumps or flashes
- [ ] No surprises — every change is gentle
- [ ] Minimal visual noise — clean screens
- [ ] Break button always available
- [ ] Sounds off by default, togglable

**Cognitive (MID)**
- [ ] One instruction sentence + one picture, no more
- [ ] Simple Hebrew with full nikud
- [ ] Heavy repetition (5-7+ times per concept)
- [ ] 70-80% at mastered level (built-in success)
- [ ] Graduated scaffolding (hint -> stronger hint -> demo -> guided)
- [ ] Starts with 2 choices, expands to 3

**Language (Hebrew)**
- [ ] Full RTL layout
- [ ] All text with nikud
- [ ] One consistent Hebrew verb per operation
- [ ] Number lines go left-to-right (small to large)
- [ ] Vocabulary card for word problems

**Reward System**
- [ ] Stars earned per completed question (not per correct answer)
- [ ] Stars never decrease
- [ ] No scores, grades, or right/wrong ratios
- [ ] Sticker earned at activity completion
- [ ] Zero negative feedback of any kind

---

## Blueprint Output Format

After completing all steps, present the blueprint as:

```
# Game Blueprint: [Name in Hebrew with nikud]

## Learning Objective
[One sentence]

## Target Curriculum
[Domain, skill ID, number range]

## Core Mechanic
[Visual anchor + interaction pattern + rationale]

## CRA Stages
[Concrete -> Representational -> Abstract descriptions]

## Scaffolding Levels
[Level 1/2/3 details]

## Feedback Moments
[Correct / incorrect-1 / incorrect-2 / after-2-fails / session-end]

## Session Flow
[Warm-up -> core -> cool-down, with example problems]

## Difficulty Progression
[How the adaptive engine adjusts across sessions]

## Accessibility Notes
[Any specific concerns for this game concept]
```

---

## Escalation: Moving to Implementation

**Only generate code or HTML files if the user explicitly asks for implementation** after
reviewing the blueprint. When they do:

1. Read `references/implementation-patterns.md` for the HTML template, color palette, UI
   component specs, Hebrew copy library, and accessibility checklist
2. Build the game following the approved blueprint
3. Run through the implementation accessibility checklist before delivering

The blueprint-first approach ensures the pedagogical design is sound before any code is written.
It's much easier to fix a design on paper than to refactor a built game.

# Game Templates — כוכב הלמידה

Visual game templates for activity screens. Each template defines a complete visual world
with backgrounds, animations, color palettes, component styles, and interaction feedback.

**All templates share the same game mechanics** (phase machine, scaffolding, adaptive engine).
The template only controls how the game *looks and feels*.

## Available Templates

| Template | File | Theme | Best for |
|----------|------|-------|----------|
| **A — Ocean** | [template-ocean.md](template-ocean.md) | Underwater coral reef, bubbles, fish | Math activities (addition, subtraction) |
| **B — Sky** | [template-sky.md](template-sky.md) | Clouds, butterflies, rainbow soap bubbles | Reading activities, lighter topics |
| **C — Garden** | [template-garden.md](template-garden.md) | Sunny garden, flowers, dewdrops, ladybugs | Counting, nature-themed activities |

## How to use

When creating a new activity, specify which template to use:
> "Create a subtraction game using **Template A (Ocean)**"

The template doc contains everything needed:
1. Background scene & layers
2. Color palette (extends the base CLAUDE.md palette)
3. Component styling (answer buttons, equation display, instruction card)
4. Animation specs (idle loops, correct/wrong feedback, demo mode)
5. Cat companion adaptations
6. Sound design notes

## Common rules (all templates)

These are non-negotiable regardless of template. See CLAUDE.md for full details.

- **Touch targets**: answer buttons ≥ 80px, all buttons ≥ 64px
- **RTL**: `direction: rtl`, logical CSS properties only (`insetInlineStart`, not `left`)
- **Nikud**: every Hebrew string has full vowel marks
- **No negative feedback**: wrong = dim + encourage. Never "wrong", "incorrect", or red
- **Try-again color**: `#FFA07A` (salmon), never red
- **Scaffolding**: 3 wrong → dim options → verbal hint → demo phase
- **Phase machine**: `'answering' | 'correct' | 'wrong' | 'demo'`
- **Predictability (HFA)**: identical layout every session, gentle looping animations, no surprises
- **Motor (dyspraxia)**: single tap only, large targets, generous spacing, no drag required
- **Typography**: `'Assistant', 'Rubik', sans-serif`, `line-height: 2`
- **Font sizes**: instructions 28px, content 24px, buttons 26px, numbers 48px, titles 36px

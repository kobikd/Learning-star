# Game Mechanics Redesign — Implementation Spec

## Overview

Redesign the game session experience so every game has a unique animal rescue narrative, a post-game reward sequence (rescue card + sticker), a puzzle piece toward an island treasure, and a unicorn skin costume. The system must be data-driven to support unlimited future games.

## Architecture

A single **** component wraps any game. The game reports progress via two callbacks (, ).  owns the rescue overlay, the reward sequence, and all store updates.



After ,  triggers the 4-act **RewardSequence** full-screen.

## File Map

### New files
| File | Responsibility |
|------|---------------|
|  | Single source of truth: all game configs with rescue + reward data |
|  | Wrapper: coordinates game + overlay + reward sequence |
|  | Fixed 120px strip at top during gameplay |
|  | SVG scenes for 5 danger types, driven by  prop |
|  | 4-act full-screen post-game celebration |
|  | SVG unicorn avatar with costume pieces animating on |

### Modified files
| File | Changes |
|------|---------|
|  | Add earnedCards, puzzlePieces, islandAlive, earnedSkins, activeSkin + actions |
|  | Import GameConfig from gameRegistry instead of defining inline |
|  | Wrap each game route with RescueSession using the matching config |
|  | Add  and  props |
|  | Same |
|  | Same |
|  | Show puzzle board progress + treasure chest state |

## Data Model

### GameConfig (in )



### Launch game registry

| Game | Animal | Danger | Skin | Island | Piece |
|------|--------|--------|------|--------|-------|
| Counting Garden () | 🦋 Butterfly | web | Garden (flower crown + apron + sunflower badge) | math | 0 |
| Addition Bubbles () | 🐰 Rabbit | bubble | Diver (goggles + wetsuit + fins) | math | 1 |
| Gafbon () | 🐸 Frog | quicksand | Explorer (safari hat + boots + compass) | math | 2 |
| Subtraction () | 🐬 Dolphin | net | Sailor (captain hat + coat + anchor badge) | math | 3 |
| Letter Explorer () | 🦉 Owl | storm | Wizard (pointy hat + robe + wand) | reading | 0 |

### RewardStore additions (merged into )



**Star earning**: unchanged — per correct answer inside each game.  
**Sticker earning**:  now also pushes  from the game's config.

## Components

### RescueSession

Props:


Internal state:


Renders  (the game) + . On  callback from game: sets phase to celebrating, then rewarding, then calls  which navigates back to island map.

Calls store actions:  per correct answer, then on complete: , , ,  (+  if 4th piece).

### RescueOverlay

Fixed strip at top of screen (120px tall, full width). Shows:
- Left: animal emoji wiggling (CSS keyframes)
- Center: progress bar filling left-to-right + DangerScene SVG below it
- Right: Hebrew encouragement label from current stage

Props: 

### DangerScene

SVG 200×80px. Accepts  prop (0–1). Each danger type is a separate SVG branch:
- **web**: threads dissolve as progress increases (opacity + scale transforms)
- **bubble**: bubble cracks and shrinks
- **quicksand**: sand level drops
- **net**: net tears open
- **storm**: clouds disperse, lightning fades

All scenes use  +  for continuous living micro-animations regardless of progress state.

### RewardSequence

Full-screen overlay, AnimatePresence-driven. 4 acts:

**Act 1 — Freedom (3s)**
DangerScene at . Particle burst (CSS keyframes).  fades in. Auto-advances.

**Act 2 — Rescue Card (4s)**
Card slides up (Framer Motion spring). Shows animal + title + 5 stars + shimmer. Pulses then shrinks to corner. Auto-advances.

**Act 3 — Puzzle Piece (3s)**
4-piece SVG puzzle board. New piece glows gold and snaps in with spring animation. If 4th piece → Treasure Unlock interstitial (chest opens, island-comes-alive scene, 5 bonus stars). Auto-advances.

**Act 4 — Unicorn Skin (4s)**
Plain unicorn SVG center-screen. Skin pieces animate on one-by-one (slideFromTop/Right/pop keyframes with cubic-bezier spring).  text. Tap anywhere to dismiss → .

Skippable by tapping after Act 1 completes.

### UnicornDresser

Full SVG unicorn (body/neck/head/horn/mane/legs/tail). Accepts . When skin changes, each  animates on with a staggered delay using its  direction.

Used in Act 4 of RewardSequence and (static, no animation) on the unicorn avatar displayed on IslandView.

## IslandView Changes

- Shows a small 4-piece puzzle board in the corner (from )
- Treasure chest icon replaces puzzle board when  includes this island
- Unicorn avatar in corner shows 

## Animations

No new libraries. Stack:
- **Framer Motion 12**: component enter/exit, spring physics for card/skin/puzzle-piece reveals
- **CSS keyframes**: particle burst, animal wiggle, continuous danger micro-animations
- **SVG feTurbulence + feDisplacementMap**: water shimmer, quicksand ripple, web threads
- **SVG SMIL (animate/animateTransform)**: continuous small movements (tail swish, wing beat)

## Out of Scope

- Gafbon and Subtraction games are not yet built —  will wrap them when they exist. The registry entries are defined now as placeholders.
- Sound effects for the reward sequence — existing audio hooks handle this.
- Album screen showing all earned rescue cards — future feature.

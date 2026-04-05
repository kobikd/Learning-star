# World Map Redesign — Design Spec
**Date:** 2026-04-05  
**Status:** Approved  

---

## Summary

Replace the current `WorldMapScreen` (a flat flex-row of 5 blob-shaped IslandButton components) with a full treasure-map experience:

1. **World Map view** — a parchment-style SVG treasure map with real island shapes
2. **Island view** — zoom into a specific island showing a unique landscape with a winding path and game pinpoints
3. **Treasure system** — complete all games on an island to unlock a treasure chest

---

## Design Decisions

| Question | Decision |
|----------|----------|
| Layout of games | Grouped by subject (Math Island, Reading Island) |
| How games appear | Tap island → zooms in, shows island landscape with pinpoints on path |
| Map theme | Ocean/nautical (existing OceanBackground reused on world map) |
| Pinpoint style | Flag markers with 3 states: completed (green), current (gold glow), locked (grey) |
| Treasure system | Complete all games → treasure chest opens + sticker + 5 bonus stars |

---

## Screen 1: World Map

### Visual

- **Background**: Parchment texture (`#D4B87A` warm beige), SVG `viewBox="0 0 800 500"` scales to any screen
- **Math Island** (upper-right): tropical volcanic island shape — green terrain, mountain, palm trees
- **Reading Island** (lower-left): enchanted forest crescent — round magical trees, sparkles
- **Dotted sea route**: SVG dashed path connecting the two islands through center
- **Decorations**: compass rose (bottom-right), anchor, sea creatures — low opacity (0.2–0.3)
- **Cat on boat** (center-sea): `🐱⛵` with speech bubble pointing at recommended island

### Header (fixed top bar)

- Title: `🗺️ מַפַּת הַהַרְפַּתְקָאוֹת` (RTL)
- Stars counter + Stickers badge (top-left in RTL)
- Semi-transparent with blur backdrop

### Island Labels on Map

Each island shows: large emoji, Hebrew name (nikud), game count ("4 מִשְׂחָקִים")  
Completed islands show a golden glow border.  
Recommended island shows `✨ מוּמְלָץ עַכְשָׁו` badge.

### Interaction

- Tap island → `view` transitions to `'island'` with smooth zoom animation
- No other tappable elements except the safe space button (always visible, bottom-end corner)

---

## Screen 2: Island View

### Zoom Transition

When island is tapped:
1. Map scales and translates so the tapped island zooms to fill the viewport (Framer Motion `layoutId` or manual transform)
2. Other island and decorations fade to `opacity: 0` (300ms)
3. Island landscape cross-fades in (400ms spring)
4. Header updates: back button appears + island name replaces map title

### Island Landscape — Math Island (`🏝️ אִי הַמִּסְפָּרִים`)

- Sky gradient: `#87CEEB → #B8E4F0`
- Ocean at bottom: `#4FA8D4 → #2B7BBB`
- Island land: organic green SVG path, sandy beach edge
- Volcano mountain (center), palm trees (sides)
- Winding dirt path: `stroke="#D4A055"` with dashed overlay

### Island Landscape — Reading Island (`📚 אִי הַסִּפּוּרִים`)

- Sky gradient: `#E8D5F5 → #C8E6C9` (purple-green magical)
- Ground: dark forest green
- Round magical trees (clusters of circles in green shades)
- Sparkles / fireflies: `✨` emoji + small gold circles
- Glowing path: `stroke="#C8A2FF"` with lighter dashed overlay

### Pinpoints

Each game is a pinpoint on the island's winding path.

| State | Visual | Interaction |
|-------|--------|-------------|
| **Completed** | Green flag `🏳️` with checkmark, full opacity | Tappable (replay) |
| **Current** | Gold flag with animated glow ring, `✨ מוּמְלָץ` badge above | Tappable (enter game) |
| **Locked** | Grey flag, lock icon, 0.6 opacity | Tap → cat says "!קוֹדֶם נְסַיֵּם אֶת הַמִּשְׂחָק הַקּוֹדֵם" |

Touch target: invisible 64×64px hit area around each pin, regardless of pin visual size.

### Pinpoint Positions

Hardcoded per island (not calculated dynamically). Each island's pinpoints are positioned to look natural along the path. For Math Island:

```
counting:    translate(160, 350)  — start of path
addition:    translate(300, 285)  — mid-left
gafbon:      translate(470, 275)  — mid-right  
subtraction: translate(600, 265)  — near end
```

### Winding Path

SVG `<path>` with cubic bezier curves connecting all pinpoints in dependency order (same as `skillDependencies` in curriculum.md). Path segments between pinpoints can be colored differently: completed segment = green, current = gold, locked = grey.

### Treasure Chest

- Position: end of the path (past the last pinpoint)
- Locked state: `📦🔒` with label "אוֹצָר!"
- Unlocked state: `📦✨` gold glow, `onComplete` called from adaptive engine

### Progress Bar

Bottom of island view: `"X/N מִשְׂחָקִים הוּשְׁלְמוּ"` — thin bar, fills green left to right.

### Cat Companion

- Positioned near the current/recommended pinpoint
- Speech bubble content:
  - On entry: `"!בַּחֲרִי מִשְׂחָק"` 
  - After completing one: `"!יֹפִי, תַּמְשִׁיכִי"`
  - All complete: `"!מַדְהִים! פִּתְחִי אֶת הָאוֹצָר"`
- **Costume per island**: explorer hat on Math Island, wizard hat on Reading Island

---

## Treasure System

When all games on an island reach `masteryScore ≥ 0.7`:

1. Treasure chest animation: shake → glow → open (`📦` → `🎁`)
2. 5 bonus stars added to `rewardStore`
3. A unique island sticker unlocked (Math Island = `🏝️` sticker, Reading = `📚` sticker)
4. Big celebration: existing `StarBurst` + `StickerReveal` components
5. Island marked `treasureUnlocked: true` in a new `islandProgress` store key
6. On world map, island gains golden border

---

## Component Architecture

### New Files

| File | Purpose |
|------|---------|
| `src/pages/WorldMapScreen.tsx` | **Rewrite** — state machine, zoom logic, parchment map |
| `src/components/ui/MapIsland.tsx` | **Rewrite of IslandButton** — island shape SVG, positioned on map |
| `src/components/ui/IslandView.tsx` | **New** — island landscape + path + pinpoints |
| `src/components/ui/GamePin.tsx` | **New** — individual game pinpoint (flag or circle), 3 states |
| `src/components/ui/IslandLandscape.tsx` | **New** — renders Math or Reading island background SVG |
| `src/engine/islandProgress.ts` | **New** — pure functions: which games unlocked, treasure status |

### Deleted Files

- `src/components/ui/IslandButton.tsx` — replaced by `MapIsland.tsx`

### Modified Files

- `src/App.tsx` — simplify to `onSelectGame(route)` callback; remove per-game callbacks
- `src/stores/rewardStore.ts` — add `islandProgress` record

### State Machine

```typescript
type MapView =
  | { mode: 'map' }
  | { mode: 'island'; subject: 'math' | 'reading' }

const [view, setView] = useState<MapView>({ mode: 'map' });
```

### Game Registry

```typescript
const GAME_REGISTRY: Record<'math' | 'reading', GameEntry[]> = {
  math: [
    { id: 'counting',    route: '/counting',    icon: '🔢', name: 'סְפִירָה',         skillId: 'counting' },
    { id: 'addition',    route: '/addition',    icon: '🫧', name: 'חִיבּוּר בּוּעוֹת', skillId: 'add_objects' },
    { id: 'gafbon',      route: '/gafbon',      icon: '🧮', name: 'גַּפְבּוֹן',        skillId: 'add_abstract' },
    { id: 'subtraction', route: '/subtraction', icon: '🐠', name: 'חִיסּוּר בַּיָּם',   skillId: 'sub_objects' },
  ],
  reading: [
    { id: 'letters',    route: '/reading',     icon: '📖', name: 'אוֹתִיּוֹת',      skillId: 'letter_recognition' },
  ],
};
```

A game is **unlocked** when its `skillId`'s prerequisites in `skillDependencies` all have `masteryScore ≥ 0.7`.  
The **current/recommended** game is the first unlocked game that isn't mastered yet.

---

## Accessibility (Gefen-specific)

- **Fixed positions**: islands are ALWAYS in the same place — Math upper-right, Reading lower-left. Never shuffled.
- **Touch targets**: all pinpoints have 64×64px minimum invisible hit area
- **No time pressure**: zoom and path animations are slow springs (400–500ms), never abrupt
- **Locked game feedback**: never says "wrong" or "locked" in a harsh way — cat explains warmly
- **Cat always guides**: speech bubble at every state transition tells Gefen exactly what to do next
- **RTL**: all text and logical positions use `insetInlineStart`/`insetInlineEnd`
- **Nikud**: all Hebrew strings have full nikud
- **aria-labels**: every pinpoint has `aria-label="[game name] — [state]"` in Hebrew
- **Safe space**: always visible in bottom-end corner, never covered by zoom animation

---

## What Stays the Same

- `OceanBackground` component — used behind the parchment on the world map
- `CatCharacter` — reused in island view with costume prop
- `SafeSpaceButton` — unchanged
- `StarCounter` — unchanged  
- All existing game routes (`/counting`, `/addition`, etc.) — no changes
- `App.tsx` routing — only the callback simplification changes
- `useWorldMapMusic` hook — unchanged

---

## Out of Scope

- Animated zoom using `layoutId` (use manual transform instead — simpler)
- Unlockable new islands (future feature)
- Island-specific music (future)
- Treasure chest mini-game (future)

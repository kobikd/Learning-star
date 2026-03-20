/**
 * countingGardenSfx — complete sound system for עיר המספרים (Counting Garden).
 *
 * All sounds designed per gentle-learning-sfx skill:
 *   ✓ Soft rounded attack — no harsh transients
 *   ✓ Warm timbres: sine/triangle, marimba-like decay
 *   ✓ C major pentatonic scale — always consonant, never jarring
 *   ✓ Low-to-mid frequency emphasis
 *   ✓ Predictable, non-surprising dynamics
 *
 * ─── ElevenLabs prompts (for future real audio assets) ───────────────────────
 *
 * FLOWER_TAP (ui_tap — 0.35s):
 *   "A soft, warm marimba pluck for a children's counting game. Single struck
 *    wooden tone, rounded attack, short resonant decay. Gentle, responsive,
 *    no sharp transient. Pitch varies per flower count (C4–A4 ascending)."
 *   Files: ui_flower_tap_warm_01.wav … ui_flower_tap_warm_08.wav
 *
 * CORRECT (reward — 1.2s):
 *   "Three ascending soft chime tones (C5, E5, G5) with a light sparkle shimmer
 *    tail. Warm bell-like timbre, gentle magical feel, no percussion, no fanfare
 *    drums. Encouraging, reassuring, soft."
 *   File: reward_correct_warm_sparkle_01.wav
 *
 * STREAK_BONUS (reward — 2.0s):
 *   "Four ascending marimba-chime tones (C5, E5, G5, C6) with a sustained
 *    sparkle shimmer cloud, gentle celebratory but not overwhelming. Warm gold
 *    feel, soft attack, magical. Child-safe, no sudden dynamics."
 *   File: reward_streak_bonus_magical_01.wav
 *
 * TRY_AGAIN (character_reaction — 0.5s):
 *   "A soft, gentle two-tone descending nudge sound (A4 to G4) for a children's
 *    educational app. Not a failure buzz — warm and encouraging. Short wobbly
 *    bell, like a gentle friendly tap. No harsh frequencies."
 *   File: character_reaction_try_again_warm_gentle_01.wav
 *
 * LEVEL_UP (transition — 1.0s):
 *   "A gentle four-note ascending arpeggio (C4, E4, G4, C5) signalling progress
 *    in a children's learning app. Marimba-like timbre, soft attack, warm and
 *    encouraging. Short sparkle tail. Not too loud, not dramatic."
 *   File: transition_level_up_warm_ascending_01.wav
 *
 * BLOOM (ui_tap — 0.8s):
 *   "A soft sparkle shimmer burst — multiple overlapping high sine tones
 *    fading out, like fairy dust. For a flower blooming animation in a
 *    children's app. Magical, gentle, no attack, pure shimmer."
 *   File: ui_bloom_sparkle_magical_01.wav
 *
 * DEMO_PING (ui_tap — 0.25s):
 *   "Tiny soft marimba ping, barely audible, for counting demonstration steps
 *    in a children's app. Single C5 struck tone, very short, warm, quiet."
 *   File: ui_demo_ping_soft_01.wav
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Shared audio context (lazy, one per session) ────────────────────────────

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!_ctx || _ctx.state === "closed") _ctx = new AudioContext();
    if (_ctx.state === "suspended") _ctx.resume().catch(() => {});
    return _ctx;
  } catch {
    return null;
  }
}

// ─── Primitive: struck tone ───────────────────────────────────────────────────
// Music-box / marimba style: fast attack, exponential decay.

function struckTone(
  ctx: AudioContext,
  freq: number,
  when: number,
  decaySec: number,
  peakGain: number,
) {
  const osc  = ctx.createOscillator();
  osc.type   = "triangle";                       // warm, flute/marimba-like
  osc.frequency.setValueAtTime(freq, when);

  const osc2 = ctx.createOscillator();           // 2nd harmonic — body
  osc2.type  = "sine";
  osc2.frequency.setValueAtTime(freq * 2, when);

  const g  = ctx.createGain();
  const g2 = ctx.createGain();

  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(peakGain, when + 0.004);
  g.gain.exponentialRampToValueAtTime(0.001, when + decaySec);

  g2.gain.setValueAtTime(0, when);
  g2.gain.linearRampToValueAtTime(peakGain * 0.18, when + 0.004);
  g2.gain.exponentialRampToValueAtTime(0.001, when + decaySec * 0.55);

  osc.connect(g).connect(ctx.destination);
  osc2.connect(g2).connect(ctx.destination);

  osc.start(when); osc.stop(when + decaySec + 0.05);
  osc2.start(when); osc2.stop(when + decaySec * 0.55 + 0.05);
}

// ─── Primitive: shimmer cloud ─────────────────────────────────────────────────
// Overlapping high sine partials → fairy-dust / sparkle texture.

function shimmer(
  ctx: AudioContext,
  rootFreq: number,
  when: number,
  durationSec: number,
  peakGain: number,
) {
  [1, 2, 3, 4].forEach((mult, i) => {
    const osc = ctx.createOscillator();
    osc.type  = "sine";
    osc.frequency.setValueAtTime(rootFreq * mult, when + i * 0.04);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, when + i * 0.04);
    g.gain.linearRampToValueAtTime(peakGain / (i + 1), when + i * 0.04 + 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, when + durationSec);

    osc.connect(g).connect(ctx.destination);
    osc.start(when + i * 0.04);
    osc.stop(when + durationSec + 0.05);
  });
}

// ─── C major pentatonic — flower tap pitches ──────────────────────────────────
// Tapping flower #1 = C4, #2 = D4, #3 = E4 … ascending pentatonic

const PENTATONIC_C4 = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 392.00, 440.00, 523.25];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Flower tap — plays when Gefen taps a flower to count it.
 * Pitch ascends with each number (C4 for 1, D4 for 2 …).
 */
export function playFlowerTap(tapNumber: number): void {
  const ctx = getCtx(); if (!ctx) return;
  const freq = PENTATONIC_C4[Math.min(tapNumber - 1, PENTATONIC_C4.length - 1)];
  struckTone(ctx, freq, ctx.currentTime, 0.38, 0.26);
}

/**
 * Correct answer — warm three-note ascending chime + shimmer.
 */
export function playCorrect(): void {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  struckTone(ctx, 523.25, t,        0.9, 0.22);  // C5
  struckTone(ctx, 659.25, t + 0.13, 0.9, 0.22);  // E5
  struckTone(ctx, 783.99, t + 0.26, 1.1, 0.22);  // G5
  shimmer(ctx, 523.25, t + 0.3, 1.0, 0.055);
}

/**
 * Streak bonus (3 in a row) — four-note arpeggio + sustained shimmer.
 */
export function playStreakBonus(): void {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
    struckTone(ctx, freq, t + i * 0.18, 1.2, 0.24);
  });
  shimmer(ctx, 523.25, t + 0.5, 1.6, 0.07);
  shimmer(ctx, 1046.50, t + 0.7, 1.2, 0.04);
}

/**
 * Try-again — gentle warm two-tone descending nudge. NOT a fail buzzer.
 * Feels like a friendly soft tap, never punishing.
 */
export function playTryAgain(): void {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  struckTone(ctx, 440.00, t,        0.45, 0.18);  // A4
  struckTone(ctx, 392.00, t + 0.16, 0.45, 0.14);  // G4 — slightly lower, warm
}

/**
 * Level up — gentle four-note ascending arpeggio C→E→G→C.
 */
export function playLevelUp(): void {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
    struckTone(ctx, freq, t + i * 0.17, 0.85, 0.20);
  });
  shimmer(ctx, 523.25, t + 0.55, 0.9, 0.05);
}

/**
 * Bloom burst — sparkle shimmer for flower bloom animation.
 */
export function playBloom(): void {
  const ctx = getCtx(); if (!ctx) return;
  shimmer(ctx, 659.25, ctx.currentTime, 0.75, 0.07);
}

/**
 * Demo ping — tiny soft ping during auto-counting demonstration.
 */
export function playDemoPing(): void {
  const ctx = getCtx(); if (!ctx) return;
  struckTone(ctx, 523.25, ctx.currentTime, 0.22, 0.15);
}

/**
 * Button tap — light soft feedback for UI buttons.
 */
export function playButtonTap(): void {
  const ctx = getCtx(); if (!ctx) return;
  struckTone(ctx, 392.00, ctx.currentTime, 0.18, 0.14);
}

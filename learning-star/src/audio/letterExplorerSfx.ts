/**
 * letterExplorerSfx — complete sound system for מסע האותיות (Letter Explorer).
 *
 * Designed per gentle-learning-sfx skill:
 *   ✓ Soft rounded attack, warm timbres, C major pentatonic
 *   ✓ Sensory-safe — no harsh transients, no sudden dynamics
 *   ✓ Each phase has its own distinct but gentle sound signature
 *
 * ─── ElevenLabs SFX prompts (for real audio assets) ─────────────────────────
 *
 * LETTER_REVEAL (transition — 0.7s):
 *   "A soft magical shimmer chime as a Hebrew letter appears on screen in a
 *    children's educational app. Two overlapping sine tones with sparkle shimmer,
 *    warm, gentle, rounded attack, no percussion. Magical and welcoming."
 *   File: transition_letter_reveal_magical_warm_01.wav
 *
 * LETTER_TAP (ui_tap — 0.3s):
 *   "Tiny warm marimba pluck for tapping a Hebrew letter in a children's app.
 *    Single C5 struck tone, rounded attack, short decay. Soft, responsive."
 *   File: ui_letter_tap_warm_soft_01.wav
 *
 * CORRECT_CHOICE (reward — 1.0s):
 *   "Warm two-note ascending chime (E5, G5) with sparkle shimmer tail, for
 *    choosing the correct Hebrew letter in a children's app. Encouraging,
 *    soft, no fanfare drums."
 *   File: reward_correct_choice_warm_sparkle_01.wav
 *
 * TRY_AGAIN (character_reaction — 0.5s):
 *   "Gentle soft two-tone descending nudge (A4, G4). Friendly, warm, not a
 *    failure buzzer. Like a kind tap on the shoulder."
 *   File: character_reaction_try_again_gentle_01.wav
 *
 * TRACE_DOT (ui_tap — 0.2s):
 *   "Tiny soft ping for each tracing dot reached in a children's handwriting app.
 *    Very quiet, E5 sine tone, barely-there, warm, short."
 *   File: ui_trace_dot_soft_ping_01.wav
 *
 * TRACE_COMPLETE (reward — 0.9s):
 *   "Three soft ascending chimes (C5, E5, G5) for completing letter tracing in
 *    a children's app. Warm, magical, encouraging. Short sparkle tail."
 *   File: reward_trace_complete_warm_01.wav
 *
 * PHASE_TRANSITION (transition — 0.6s):
 *   "A very soft single ascending whoosh-chime moving between activity phases
 *    in a children's educational app. Sine tone rising from G4 to C5, gentle
 *    shimmer. Barely-there, smooth, non-startling."
 *   File: transition_phase_change_soft_01.wav
 *
 * LETTER_COMPLETE (reward — 1.8s):
 *   "Four-note ascending marimba arpeggio (C5, E5, G5, C6) with sparkle
 *    shimmer cloud. Warm celebration for completing a full letter lesson in
 *    a children's educational app. Encouraging, magical, soft."
 *   File: reward_letter_complete_magical_warm_01.wav
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Shared audio context ────────────────────────────────────────────────────

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

// ─── Primitives ───────────────────────────────────────────────────────────────

function struckTone(ctx: AudioContext, freq: number, when: number, decaySec: number, peak: number) {
  const osc = ctx.createOscillator(); osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, when);
  const osc2 = ctx.createOscillator(); osc2.type = "sine";
  osc2.frequency.setValueAtTime(freq * 2, when);
  const g = ctx.createGain(); const g2 = ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(peak, when + 0.004);
  g.gain.exponentialRampToValueAtTime(0.001, when + decaySec);
  g2.gain.setValueAtTime(0, when);
  g2.gain.linearRampToValueAtTime(peak * 0.15, when + 0.004);
  g2.gain.exponentialRampToValueAtTime(0.001, when + decaySec * 0.5);
  osc.connect(g).connect(ctx.destination);
  osc2.connect(g2).connect(ctx.destination);
  osc.start(when); osc.stop(when + decaySec + 0.05);
  osc2.start(when); osc2.stop(when + decaySec * 0.5 + 0.05);
}

function shimmer(ctx: AudioContext, root: number, when: number, dur: number, peak: number) {
  [1, 2, 3].forEach((m, i) => {
    const osc = ctx.createOscillator(); osc.type = "sine";
    osc.frequency.setValueAtTime(root * m, when + i * 0.05);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, when + i * 0.05);
    g.gain.linearRampToValueAtTime(peak / (i + 1), when + i * 0.05 + 0.07);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(when + i * 0.05); osc.stop(when + dur + 0.05);
  });
}

// ─── Public sounds ────────────────────────────────────────────────────────────

/** Soft shimmer when a new letter appears on screen (see phase). */
export function playLetterReveal(): void {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  struckTone(ctx, 523.25, t,       0.55, 0.16);  // C5
  struckTone(ctx, 659.25, t + 0.1, 0.65, 0.14);  // E5
  shimmer(ctx, 659.25, t + 0.15, 0.6, 0.04);
}

/** Tiny soft tap when user taps the letter name / speak button. */
export function playLetterTap(): void {
  const ctx = getCtx(); if (!ctx) return;
  struckTone(ctx, 523.25, ctx.currentTime, 0.28, 0.18);
}

/** Warm chime for choosing the correct letter. */
export function playCorrectChoice(): void {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  struckTone(ctx, 659.25, t,        0.85, 0.22);  // E5
  struckTone(ctx, 783.99, t + 0.14, 0.95, 0.22);  // G5
  shimmer(ctx, 659.25, t + 0.2, 0.9, 0.05);
}

/** Gentle warm nudge for wrong choice — never punishing. */
export function playWrongChoice(): void {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  struckTone(ctx, 440.00, t,        0.42, 0.17);  // A4
  struckTone(ctx, 392.00, t + 0.15, 0.42, 0.13);  // G4
}

/** Tiny ping for each tracing dot reached. */
export function playTraceDot(): void {
  const ctx = getCtx(); if (!ctx) return;
  struckTone(ctx, 659.25, ctx.currentTime, 0.18, 0.12);  // E5 — quiet
}

/** Small reward chime when the full trace is completed. */
export function playTraceComplete(): void {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    struckTone(ctx, freq, t + i * 0.14, 0.75, 0.20);
  });
  shimmer(ctx, 523.25, t + 0.35, 0.7, 0.05);
}

/** Soft ascending tone between phases (see → hear → trace → connect). */
export function playPhaseTransition(): void {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  // Glide up: G4 → C5
  const osc = ctx.createOscillator(); osc.type = "sine";
  osc.frequency.setValueAtTime(392.00, t);
  osc.frequency.linearRampToValueAtTime(523.25, t + 0.28);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.14, t + 0.06);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
  osc.connect(g).connect(ctx.destination);
  osc.start(t); osc.stop(t + 0.6);
}

/** Mini celebration when a full letter lesson is finished. */
export function playLetterComplete(): void {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
    struckTone(ctx, freq, t + i * 0.17, 1.1, 0.22);
  });
  shimmer(ctx, 523.25, t + 0.5, 1.4, 0.065);
}

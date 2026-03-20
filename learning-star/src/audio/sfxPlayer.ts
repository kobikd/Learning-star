/**
 * sfxPlayer — plays pre-rendered WAV files from /audio/sfx/.
 * Falls back to silent no-op if the file fails to load.
 */

const cache: Map<string, HTMLAudioElement> = new Map();

function play(file: string): void {
  try {
    let audio = cache.get(file);
    if (!audio) {
      audio = new Audio(`/audio/sfx/${file}`);
      audio.preload = "auto";
      cache.set(file, audio);
    }
    // Clone for overlapping plays (e.g. rapid taps)
    const instance = audio.cloneNode() as HTMLAudioElement;
    instance.volume = 0.72;
    instance.play().catch(() => {/* autoplay blocked — silent */});
  } catch {/* silent */}
}

// Preload all SFX on first import
const SFX_FILES = [
  "correct.mp3","streak_bonus.mp3","try_again.mp3","level_up.mp3",
  "bloom.mp3","demo_ping.mp3","button_tap.mp3",
  "letter_reveal.mp3","letter_tap.mp3","correct_choice.mp3",
  "wrong_choice.mp3","trace_dot.mp3","trace_complete.mp3",
  "phase_transition.mp3","letter_complete.mp3",
  ...Array.from({ length: 8 }, (_, i) => `flower_tap_${i + 1}.mp3`),
  // Avatar SFX
  "avatar_cat.mp3","avatar_dog.mp3","avatar_unicorn.mp3","avatar_rabbit.mp3",
  "avatar_fox.mp3","avatar_bear.mp3","avatar_penguin.mp3","avatar_dragon.mp3",
  "avatar_owl.mp3","avatar_frog.mp3",
];
if (typeof window !== "undefined") {
  SFX_FILES.forEach(f => {
    const a = new Audio(`/audio/sfx/${f}`);
    a.preload = "auto";
    cache.set(f, a);
  });
}

// ─── Counting Garden ─────────────────────────────────────────────────────────
export const playFlowerTap    = (n: number) => play(`flower_tap_${Math.min(n, 8)}.mp3`);
export const playCorrect      = ()          => play("correct.wav");
export const playStreakBonus  = ()          => play("streak_bonus.wav");
export const playTryAgain     = ()          => play("try_again.wav");
export const playLevelUp      = ()          => play("level_up.wav");
export const playBloom        = ()          => play("bloom.wav");
export const playDemoPing     = ()          => play("demo_ping.wav");
export const playButtonTap    = ()          => play("button_tap.wav");

// ─── Letter Explorer ─────────────────────────────────────────────────────────
export const playLetterReveal     = () => play("letter_reveal.wav");
export const playLetterTap        = () => play("letter_tap.wav");
export const playCorrectChoice    = () => play("correct_choice.wav");
export const playWrongChoice      = () => play("wrong_choice.wav");
export const playTraceDot         = () => play("trace_dot.wav");
export const playTraceComplete    = () => play("trace_complete.wav");
export const playPhaseTransition  = () => play("phase_transition.wav");
export const playLetterComplete   = () => play("letter_complete.wav");

// Avatar clicks
export const playAvatarSfx = (id: string) => play(`avatar_${id}.mp3`);

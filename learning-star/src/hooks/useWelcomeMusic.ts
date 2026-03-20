/**
 * useWelcomeMusic
 *
 * Strategy:
 *   1. Try immediate unmuted autoplay (works in installed PWA / Android Chrome).
 *   2. If blocked, start MUTED (browsers always allow muted autoplay) so audio
 *      is buffered and ready, then unmute + fade in on the very first tap.
 *   3. Toggle button fades out/in without re-triggering these checks.
 */
import { useEffect, useRef, useState } from "react";

export function useWelcomeMusic() {
  const [on, setOn]       = useState(true);
  const audioRef          = useRef<HTMLAudioElement | null>(null);
  const startedRef        = useRef(false);
  const fadeRef           = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Volume ramp ─────────────────────────────────────────────────────────
  function fadeTo(audio: HTMLAudioElement, target: number, ms: number) {
    if (fadeRef.current) clearInterval(fadeRef.current);
    const STEPS = 40;
    const start = audio.volume;
    const delta = (target - start) / STEPS;
    let   step  = 0;
    fadeRef.current = setInterval(() => {
      step++;
      audio.volume = Math.max(0, Math.min(1, start + delta * step));
      if (step >= STEPS) {
        clearInterval(fadeRef.current!);
        fadeRef.current = null;
        if (target === 0) audio.pause();
      }
    }, ms / STEPS);
  }

  // ── Mount ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const audio  = new Audio("/audio/sfx/welcome_music.mp3");
    audio.loop   = true;
    audio.volume = 0;
    audioRef.current = audio;

    // ── Attempt 1: unmuted autoplay (works in PWA / permissive browsers) ──
    audio.play()
      .then(() => {
        startedRef.current = true;
        fadeTo(audio, 0.55, 1500);
      })
      .catch(() => {
        // ── Attempt 2: muted autoplay (almost always allowed) ─────────────
        audio.muted = true;
        audio.play().catch(() => {/* completely blocked — gesture only */});

        // Unmute on first gesture
        function onGesture(e: PointerEvent) {
          const t = e.target as HTMLElement | null;
          if (t?.closest("[data-music-toggle]")) return;
          if (startedRef.current) {
            document.removeEventListener("pointerdown", onGesture);
            return;
          }
          startedRef.current = true;
          audio.muted  = false;
          if (audio.paused) audio.play().catch(() => {});
          fadeTo(audio, 0.55, 1000);
          document.removeEventListener("pointerdown", onGesture);
        }
        document.addEventListener("pointerdown", onGesture);

        // Store cleanup ref so we can remove it on unmount
        (audio as any)._gestureCleanup = () =>
          document.removeEventListener("pointerdown", onGesture);
      });

    return () => {
      (audio as any)._gestureCleanup?.();
      if (fadeRef.current) clearInterval(fadeRef.current);
      audio.pause();
      audio.src = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toggle ───────────────────────────────────────────────────────────────
  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (on) {
      fadeTo(audio, 0, 400);
      setOn(false);
    } else {
      audio.muted = false;
      if (audio.paused) audio.play().catch(() => {});
      fadeTo(audio, 0.55, 500);
      setOn(true);
    }
  }

  return { on, toggle };
}

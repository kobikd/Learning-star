/**
 * useSafeSpaceMusic
 *
 * Crossfades between safespace_music.mp3 → safespace_music_b.mp3 → A → B…
 * using two HTMLAudioElement instances. When the active track is CROSSFADE_S
 * seconds from its end, the next track starts fading in. When the active track
 * ends, they swap roles. Reliable on mobile — no Web Audio API / AudioContext.
 */
import { useEffect, useRef, useState } from "react";

const TRACKS      = ["/audio/sfx/safespace_music.mp3", "/audio/sfx/safespace_music_b.mp3"];
const TARGET_VOL  = 0.45;
const CROSSFADE_S = 3.5;   // seconds before end to begin crossfade
const FADE_STEPS  = 40;

export function useSafeSpaceMusic() {
  const [on, setOn] = useState(true);

  const aRef      = useRef<HTMLAudioElement | null>(null);
  const bRef      = useRef<HTMLAudioElement | null>(null);
  const activeRef = useRef<0 | 1>(0);   // which slot is currently playing lead
  const fadingRef = useRef(false);       // crossfade in progress
  const onRef     = useRef(true);        // mirror of `on` for use in callbacks
  const mountedRef = useRef(true);

  // ── Fade one element to a target volume over ~400ms ─────────────────────
  function fadeTo(el: HTMLAudioElement, target: number) {
    const start = el.volume;
    const delta = (target - start) / FADE_STEPS;
    let   step  = 0;
    const iv = setInterval(() => {
      if (!mountedRef.current) { clearInterval(iv); return; }
      step++;
      el.volume = Math.max(0, Math.min(1, start + delta * step));
      if (step >= FADE_STEPS) clearInterval(iv);
    }, 400 / FADE_STEPS);
  }

  // ── Start crossfade: fade in `next`, it will become lead when `cur` ends ─
  function crossfade() {
    if (fadingRef.current || !mountedRef.current) return;
    fadingRef.current = true;

    const cur  = activeRef.current === 0 ? aRef.current! : bRef.current!;
    const next = activeRef.current === 0 ? bRef.current! : aRef.current!;
    const nextTrack = TRACKS[(activeRef.current + 1) % 2];

    next.src    = nextTrack;
    next.volume = 0;
    next.currentTime = 0;
    next.play().catch(() => {});

    if (onRef.current) fadeTo(next, TARGET_VOL);

    // When `cur` ends, swap roles and schedule next crossfade
    const onEnded = () => {
      cur.removeEventListener("ended", onEnded);
      cur.pause();
      cur.currentTime = 0;
      activeRef.current = activeRef.current === 0 ? 1 : 0;
      fadingRef.current = false;
      // Re-attach timeupdate to the new lead
      attachTimeUpdate();
    };
    cur.addEventListener("ended", onEnded);

    // Fade out current
    fadeTo(cur, 0);
  }

  // ── Watch timeupdate on the active (lead) track ──────────────────────────
  function attachTimeUpdate() {
    const lead = activeRef.current === 0 ? aRef.current! : bRef.current!;

    const onTime = () => {
      if (!lead.duration || fadingRef.current) return;
      const remaining = lead.duration - lead.currentTime;
      if (remaining <= CROSSFADE_S) {
        lead.removeEventListener("timeupdate", onTime);
        crossfade();
      }
    };
    lead.addEventListener("timeupdate", onTime);
  }

  // ── Mount ────────────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    onRef.current      = true;

    const a = new Audio(TRACKS[0]);
    const b = new Audio(TRACKS[1]);
    a.preload = "auto";
    b.preload = "auto";
    a.volume  = 0;
    b.volume  = 0;
    aRef.current = a;
    bRef.current = b;
    activeRef.current = 0;
    fadingRef.current  = false;

    // Try unmuted autoplay; fall back to muted then unmute on first gesture
    a.play()
      .then(() => {
        fadeTo(a, TARGET_VOL);
        attachTimeUpdate();
      })
      .catch(() => {
        a.muted = true;
        a.play().catch(() => {});

        const onGesture = (e: PointerEvent) => {
          const t = e.target as HTMLElement | null;
          if (t?.closest("[data-sound-toggle]")) return;
          a.muted  = false;
          a.volume = 0;
          fadeTo(a, TARGET_VOL);
          attachTimeUpdate();
          document.removeEventListener("pointerdown", onGesture);
        };
        document.addEventListener("pointerdown", onGesture);
      });

    return () => {
      mountedRef.current = false;
      a.pause(); a.src = "";
      b.pause(); b.src = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toggle ───────────────────────────────────────────────────────────────
  function toggle() {
    onRef.current = !on;
    const lead = activeRef.current === 0 ? aRef.current! : bRef.current!;
    if (on) {
      fadeTo(lead, 0);
      setOn(false);
    } else {
      lead.muted = false;
      if (lead.paused) lead.play().catch(() => {});
      fadeTo(lead, TARGET_VOL);
      setOn(true);
    }
  }

  return { on, toggle };
}

/**
 * useWorldMapMusic
 *
 * Crossfades worldmap_music_a.mp3 ↔ worldmap_music_b.mp3 in a seamless loop.
 * Starts automatically: plays muted immediately (always allowed by browsers),
 * then unmutes instantly — on most browsers/PWAs this is inaudible. If the
 * browser still blocks, unmutes on the user's very first touch.
 */
import { useEffect, useRef, useState } from "react";

const TRACKS      = ["/audio/sfx/worldmap_music_a.mp3", "/audio/sfx/worldmap_music_b.mp3"];
const TARGET_VOL  = 0.45;
const CROSSFADE_S = 3.5;
const FADE_STEPS  = 40;

export function useWorldMapMusic() {
  const [on, setOn]    = useState(true);
  const aRef           = useRef<HTMLAudioElement | null>(null);
  const bRef           = useRef<HTMLAudioElement | null>(null);
  const activeRef      = useRef<0 | 1>(0);
  const fadingRef      = useRef(false);
  const onRef          = useRef(true);
  const mountedRef     = useRef(true);

  function fadeTo(el: HTMLAudioElement, target: number, ms = 400) {
    const start = el.volume;
    const delta = (target - start) / FADE_STEPS;
    let step = 0;
    const iv = setInterval(() => {
      if (!mountedRef.current) { clearInterval(iv); return; }
      step++;
      el.volume = Math.max(0, Math.min(1, start + delta * step));
      if (step >= FADE_STEPS) clearInterval(iv);
    }, ms / FADE_STEPS);
  }

  function crossfade() {
    if (fadingRef.current || !mountedRef.current) return;
    fadingRef.current = true;
    const cur  = activeRef.current === 0 ? aRef.current! : bRef.current!;
    const next = activeRef.current === 0 ? bRef.current! : aRef.current!;
    next.src = TRACKS[(activeRef.current + 1) % 2];
    next.volume = 0;
    next.currentTime = 0;
    next.play().catch(() => {});
    if (onRef.current) fadeTo(next, TARGET_VOL);
    fadeTo(cur, 0);
    const onEnded = () => {
      cur.removeEventListener("ended", onEnded);
      cur.pause();
      cur.currentTime = 0;
      activeRef.current = activeRef.current === 0 ? 1 : 0;
      fadingRef.current = false;
      attachTimeUpdate();
    };
    cur.addEventListener("ended", onEnded);
  }

  function attachTimeUpdate() {
    const lead = activeRef.current === 0 ? aRef.current! : bRef.current!;
    const onTime = () => {
      if (!lead.duration || fadingRef.current) return;
      if (lead.duration - lead.currentTime <= CROSSFADE_S) {
        lead.removeEventListener("timeupdate", onTime);
        crossfade();
      }
    };
    lead.addEventListener("timeupdate", onTime);
  }

  useEffect(() => {
    mountedRef.current = true;
    onRef.current      = true;

    const a = new Audio(TRACKS[0]);
    const b = new Audio(TRACKS[1]);
    a.preload = "auto";
    b.preload = "auto";
    a.volume  = 0;
    b.volume  = 0;
    aRef.current      = a;
    bRef.current      = b;
    activeRef.current = 0;
    fadingRef.current = false;

    // Strategy: start muted (always allowed), unmute immediately.
    // Most browsers allow this on a PWA / after prior interaction.
    // If unmute is also blocked, the pointerdown listener handles it.
    a.muted = true;
    a.play()
      .then(() => {
        // Muted play succeeded — try unmuting right away
        a.muted  = false;
        a.volume = 0;
        fadeTo(a, TARGET_VOL, 1200);
        attachTimeUpdate();
      })
      .catch(() => {
        // Completely blocked — wait for first gesture
        const onGesture = () => {
          a.muted  = false;
          a.volume = 0;
          if (a.paused) a.play().catch(() => {});
          fadeTo(a, TARGET_VOL, 800);
          attachTimeUpdate();
          document.removeEventListener("pointerdown", onGesture);
        };
        document.addEventListener("pointerdown", onGesture);
      });

    return () => {
      mountedRef.current = false;
      fadeTo(a, 0, 600);
      fadeTo(b, 0, 600);
      setTimeout(() => { a.pause(); a.src = ""; b.pause(); b.src = ""; }, 650);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

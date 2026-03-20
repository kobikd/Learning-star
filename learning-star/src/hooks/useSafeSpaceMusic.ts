/**
 * useSafeSpaceMusic
 *
 * Plays safespace_music.mp3 and safespace_music_b.mp3 in a seamless crossfade
 * loop using the Web Audio API.
 *
 * How it works:
 *   - Each segment is ~22 s. CROSSFADE seconds before one ends, the next
 *     begins at volume 0 and ramps to full while the current one ramps to 0.
 *   - Segments alternate A → B → A → B … so the music feels ~44 s before
 *     any repetition is noticeable.
 *   - Master GainNode controls overall volume (toggle / fade-in on mount).
 *   - Autoplay strategy: try unmuted first; fall back to muted + first-gesture.
 */
import { useEffect, useRef, useState } from "react";

const CROSSFADE = 3.5;   // seconds of overlap between segments
const TARGET_VOL = 0.5;
const SEGMENTS = [
  "/audio/sfx/safespace_music.mp3",
  "/audio/sfx/safespace_music_b.mp3",
];

export function useSafeSpaceMusic() {
  const [on, setOn]       = useState(true);
  const ctxRef            = useRef<AudioContext | null>(null);
  const masterRef         = useRef<GainNode | null>(null);
  const buffersRef        = useRef<AudioBuffer[]>([]);
  const scheduledRef      = useRef<AudioBufferSourceNode[]>([]);
  const nextSegRef        = useRef(0);
  const nextStartRef      = useRef(0);   // AudioContext time when next seg starts
  const timerRef          = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destroyedRef      = useRef(false);

  // ── Load all buffers ─────────────────────────────────────────────────────
  async function loadBuffers(ctx: AudioContext): Promise<AudioBuffer[]> {
    return Promise.all(
      SEGMENTS.map(async (url) => {
        const res = await fetch(url);
        const ab  = await res.arrayBuffer();
        return ctx.decodeAudioData(ab);
      })
    );
  }

  // ── Schedule one segment with fade-in and fade-out ───────────────────────
  function scheduleSegment(
    ctx:    AudioContext,
    master: GainNode,
    buf:    AudioBuffer,
    when:   number,        // AudioContext time to start
  ): AudioBufferSourceNode {
    const src      = ctx.createBufferSource();
    const segGain  = ctx.createGain();
    src.buffer     = buf;
    src.connect(segGain);
    segGain.connect(master);

    // Fade in at start
    segGain.gain.setValueAtTime(0, when);
    segGain.gain.linearRampToValueAtTime(1, when + CROSSFADE);

    // Fade out at end
    const fadeOutStart = when + buf.duration - CROSSFADE;
    segGain.gain.setValueAtTime(1, fadeOutStart);
    segGain.gain.linearRampToValueAtTime(0, when + buf.duration);

    src.start(when);
    scheduledRef.current.push(src);
    return src;
  }

  // ── Continuously schedule next segment before current one ends ───────────
  function scheduleNext() {
    if (destroyedRef.current) return;
    const ctx     = ctxRef.current;
    const master  = masterRef.current;
    const buffers = buffersRef.current;
    if (!ctx || !master || buffers.length < 2) return;

    const segIdx  = nextSegRef.current % SEGMENTS.length;
    const buf     = buffers[segIdx];
    const when    = nextStartRef.current;

    scheduleSegment(ctx, master, buf, when);

    // Advance: next segment starts CROSSFADE seconds before this one ends
    nextStartRef.current = when + buf.duration - CROSSFADE;
    nextSegRef.current++;

    // Schedule the timer to queue the segment after that
    const msUntilNextSchedule = (nextStartRef.current - ctx.currentTime - 1) * 1000;
    timerRef.current = setTimeout(scheduleNext, Math.max(0, msUntilNextSchedule));
  }

  // ── Master fade helper ───────────────────────────────────────────────────
  function masterFadeTo(target: number, secs: number) {
    const ctx    = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(target, now + secs);
  }

  // ── Start everything ─────────────────────────────────────────────────────
  async function start() {
    if (destroyedRef.current) return;
    const ctx    = ctxRef.current!;
    const master = masterRef.current!;

    try { await ctx.resume(); } catch { /* ignore */ }

    if (buffersRef.current.length === 0) {
      buffersRef.current = await loadBuffers(ctx);
    }

    // Start first segment immediately, schedule chain
    nextStartRef.current = ctx.currentTime;
    nextSegRef.current   = 0;
    scheduleNext();  // schedules seg 0 at currentTime
    scheduleNext();  // pre-schedules seg 1 right after

    // Fade in master
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(TARGET_VOL, ctx.currentTime + 2.5);
  }

  // ── Mount ────────────────────────────────────────────────────────────────
  useEffect(() => {
    destroyedRef.current = false;

    const ctx    = new AudioContext();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.connect(ctx.destination);
    ctxRef.current   = ctx;
    masterRef.current = master;

    // Attempt 1: start immediately (works if AudioContext not suspended)
    if (ctx.state === "running") {
      start();
    } else {
      // Attempt 2: wait for first gesture to resume
      function onGesture(e: PointerEvent) {
        const t = e.target as HTMLElement | null;
        if (t?.closest("[data-sound-toggle]")) return;
        start();
        document.removeEventListener("pointerdown", onGesture);
      }
      document.addEventListener("pointerdown", onGesture);

      // Try resume anyway — some browsers allow it
      ctx.resume().then(() => {
        if (ctx.state === "running") {
          start();
          document.removeEventListener("pointerdown", onGesture);
        }
      }).catch(() => {});

      return () => document.removeEventListener("pointerdown", onGesture);
    }

    return () => {
      destroyedRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      masterFadeTo(0, 0.8);
      setTimeout(() => {
        scheduledRef.current.forEach(s => { try { s.stop(); } catch { /* ok */ } });
        ctx.close();
      }, 900);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toggle ───────────────────────────────────────────────────────────────
  function toggle() {
    if (on) {
      masterFadeTo(0, 0.8);
      setOn(false);
    } else {
      masterFadeTo(TARGET_VOL, 1.0);
      setOn(true);
    }
  }

  return { on, toggle };
}

/**
 * useSafeSpaceSfx — plays gentle tap sounds for SafeSpace interactive elements.
 *
 * Uses Howler for one-shot SFX playback. Each sound is loaded lazily on first
 * play and cached. Volume is kept low and sensory-safe for Gefen.
 */
import { useCallback, useRef } from "react";
import { Howl } from "howler";

const SFX_MAP = {
  star:    "/audio/sfx/safespace_star_tap.mp3",
  moon:    "/audio/sfx/safespace_moon_tap.mp3",
  cat:     "/audio/sfx/safespace_cat_tap.mp3",
  water:   "/audio/sfx/safespace_water_tap.mp3",
  breathe: "/audio/sfx/safespace_breathe.mp3",
} as const;

type SfxKey = keyof typeof SFX_MAP;

const VOLUME = 0.45; // gentle, not startling

export function useSafeSpaceSfx() {
  const cache = useRef<Partial<Record<SfxKey, Howl>>>({});

  const play = useCallback((key: SfxKey) => {
    if (!cache.current[key]) {
      cache.current[key] = new Howl({
        src: [SFX_MAP[key]],
        volume: VOLUME,
        preload: true,
      });
    }
    cache.current[key]!.play();
  }, []);

  return { play };
}

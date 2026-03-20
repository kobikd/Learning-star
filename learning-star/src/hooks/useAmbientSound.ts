/**
 * useAmbientSound — gentle Web Audio API drone for the Safe Space.
 *
 * Creates an A-major triad (A3 + C#4 + E4) at very low gain with slow
 * tremolo LFO — barely audible, more felt than heard.
 *
 * Triggered after the first user interaction (safe-space entry counts).
 * Never crashes the app: all Web Audio code is try-caught.
 */
import { useEffect, useRef, useState } from 'react';

interface SoundEngine {
  setEnabled: (on: boolean) => void;
  destroy:    () => void;
}

function buildEngine(): SoundEngine | null {
  try {
    const ctx         = new AudioContext();
    const masterGain  = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Very slow tremolo
    const lfo     = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);  // 0.12 Hz = ~8 s cycle
    lfoGain.gain.setValueAtTime(0.006, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start();

    // Harmonic pad: A3 + C#4 + E4 (A major)
    const FREQS = [220, 277.18, 329.63];
    const oscs: OscillatorNode[] = FREQS.map(freq => {
      const osc     = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      oscGain.gain.setValueAtTime(0.33, ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      return osc;
    });

    const TARGET_GAIN = 0.032;

    return {
      setEnabled: (on: boolean) => {
        const now = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        if (on) {
          masterGain.gain.linearRampToValueAtTime(TARGET_GAIN, now + 2.5);
        } else {
          masterGain.gain.linearRampToValueAtTime(0, now + 1.5);
        }
      },
      destroy: () => {
        const now = ctx.currentTime;
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(0, now + 1);
        setTimeout(() => {
          oscs.forEach(o => { try { o.stop(); } catch { /* already stopped */ } });
          try { lfo.stop(); } catch { /* already stopped */ }
          ctx.close();
        }, 1200);
      },
    };
  } catch {
    return null;   // Web Audio not supported — silently skip
  }
}

export function useAmbientSound(autoStart = true) {
  const [soundOn, setSoundOn] = useState(autoStart);
  const engineRef             = useRef<SoundEngine | null>(null);

  // Build engine once on mount
  useEffect(() => {
    engineRef.current = buildEngine();
    if (autoStart) engineRef.current?.setEnabled(true);
    return () => engineRef.current?.destroy();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle volume on soundOn change
  useEffect(() => {
    engineRef.current?.setEnabled(soundOn);
  }, [soundOn]);

  return { soundOn, toggle: () => setSoundOn(s => !s) };
}

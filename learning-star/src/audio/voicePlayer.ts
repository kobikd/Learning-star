/**
 * voicePlayer — ElevenLabs runtime TTS for Hebrew voice lines.
 *
 * Calls the ElevenLabs TTS API at runtime, caches audio blobs in memory,
 * and plays them via HTMLAudioElement. Only one voice plays at a time.
 *
 * Usage:
 *   import { speak, stopVoice } from "../audio/voicePlayer";
 *   speak("כַּמָּה זֶה שְׁתַּיִם וְעוֹד שָׁלוֹשׁ?");
 */

const API_KEY  = import.meta.env.ELEVENLABS_API_KEY  ?? "";
const VOICE_ID = import.meta.env.ELEVENLABS_VOICE_ID ?? "";
const MODEL_ID = "eleven_multilingual_v2";

// ── Cache: text → blob URL ───────────────────────────────────────────────────
const blobCache = new Map<string, string>();

// ── Current playback ─────────────────────────────────────────────────────────
let currentAudio: HTMLAudioElement | null = null;

/** Stop the currently playing voice line (if any). */
export function stopVoice(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

/**
 * Speak a Hebrew text line via ElevenLabs TTS.
 * - Stops any currently playing voice first.
 * - Caches the audio blob so repeated texts are instant.
 * - Silently fails if API key is missing or request fails.
 */
export async function speak(text: string): Promise<void> {
  if (!API_KEY || !VOICE_ID || !text) return;

  stopVoice();

  try {
    let blobUrl = blobCache.get(text);

    if (!blobUrl) {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
          method: "POST",
          headers: {
            "xi-api-key":   API_KEY,
            "Content-Type": "application/json",
            Accept:         "audio/mpeg",
          },
          body: JSON.stringify({
            text,
            model_id: MODEL_ID,
            voice_settings: {
              stability:        0.75,
              similarity_boost: 0.80,
              style:            0.35,
              use_speaker_boost: true,
            },
          }),
        },
      );

      if (!res.ok) return; // silent fail

      const blob = await res.blob();
      blobUrl = URL.createObjectURL(blob);
      blobCache.set(text, blobUrl);
    }

    const audio = new Audio(blobUrl);
    audio.volume = 0.85;
    currentAudio = audio;
    await audio.play().catch(() => {/* autoplay blocked */});
  } catch {
    // silent — never break the game for audio issues
  }
}

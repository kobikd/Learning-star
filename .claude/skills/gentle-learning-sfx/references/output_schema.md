# Output Schema Reference — כוכב הלמידה

Every sound spec must conform to this schema.
**SFX** = Sound Effects API. **Voice** = TTS API.

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `purpose` | string | Yes | What this sound is for (English ok) |
| `purpose_he` | string | Yes | מה הצליל הזה מיועד ל (Hebrew) |
| `category` | enum | Yes | `ui_tap` / `reward` / `ambient_loop` / `character_reaction` / `transition` |
| `type` | enum | Yes | `sfx` (Sound Effects API) or `voice` (TTS API) |
| `mood` | string | Yes | 2–4 mood words from mood_palette.md |
| `duration_seconds` | number | SFX only | ≥ 0.5, ≤ 22. Required for SFX. |
| `loop` | boolean | Yes | True only for `ambient_loop` category |
| `voice_text_he` | string | Voice only | Hebrew text WITH nikud to speak |
| `voice_mode` | enum | Voice only | `instruction` / `letter` / `number` / `encouragement` / `syllable` |
| `voice_settings` | object | Voice only | ElevenLabs voice settings (see below) |
| `sensory_rules` | string[] | Yes | Active safety constraints (min 3) |
| `forbidden_traits` | string[] | Yes | Must-not-have traits (min 3) |
| `prompt_for_elevenlabs` | string | Yes | Complete API prompt (≤ 200 words) |
| `suggested_filename` | string | Yes | `{category}_{purpose}_{mood}_{variant}.mp3` |
| `script_entry` | string | Yes | Paste-ready line for `scripts/generate-audio.py` |
| `tags` | string[] | Yes | Includes "child-friendly", "hebrew", category name |

## Voice settings defaults

```json
{
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.75,
    "similarity_boost": 0.80,
    "style": 0.35,
    "use_speaker_boost": true
  }
}
```

## Category duration defaults

| Category | Min | Default | Max | Loop |
|---|---|---|---|---|
| `ui_tap` | 0.5s | 0.8s | 1.5s | No |
| `reward` | 0.8s | 1.5s | 2.5s | No |
| `ambient_loop` | 10s | 20s | 22s | Yes |
| `character_reaction` | 0.5s | 1.0s | 2.0s | No |
| `transition` | 0.5s | 1.0s | 1.5s | No |

## Validation rules

1. `duration_seconds` must be ≥ 0.5 (ElevenLabs minimum)
2. `sensory_rules` must include "no harsh attack", "gentle and predictable", one texture rule
3. `forbidden_traits` must include "alarm-like", "metallic", "loud"
4. `prompt_for_elevenlabs` must not contain forbidden vocabulary (see forbidden_traits.md)
5. `tags` must include "child-friendly" and "hebrew"
6. Voice lines must use feminine address in Hebrew (Gefen is a girl)
7. Voice lines must include full nikud

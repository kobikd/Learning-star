---
name: gentle-learning-sfx
description: >
  Generate structured sound design specs and ElevenLabs Sound Effects + TTS prompts
  for כוכב הלמידה — a Hebrew children's educational app for Gefen, age 8, with dyspraxia,
  HFA, and mild ID. Use this skill whenever working on any audio: SFX, UI sounds, voice lines,
  ambient loops, reward sounds, or character reactions. Always outputs Hebrew voice text,
  ElevenLabs-ready prompts, and a script entry for scripts/generate-audio.py.
---

# Gentle Learning SFX — עיצוב צליל לאפליקציית כוכב הלמידה

This skill designs every sound for **כוכב הלמידה** — a Hebrew adaptive learning PWA
for Gefen, an 8-year-old Israeli girl with dyspraxia, HFA, and mild intellectual disability.

It produces:
- **SFX specs** — ElevenLabs Sound Effects API prompts for tones, chimes, and ambient loops
- **Voice specs** — ElevenLabs TTS prompts in Hebrew, with voice settings for a warm Israeli female voice
- **Script entries** — ready-to-paste lines for `scripts/generate-audio.py`

All output is Hebrew-first. Every voice line is in Hebrew with nikud. Every SFX prompt
references the Hebrew children's educational context.

---

## The child — Gefen (גפן)

Design every sound with Gefen specifically in mind:

| Trait | Audio implication |
|---|---|
| **Dyspraxia** | Sounds must not demand precise timing. No sounds that create time pressure. |
| **HFA (High-Functioning Autism)** | Absolute consistency. No surprising sounds. Every sound must be predictable and calm. |
| **Mild ID** | Simple, clear, warm. Repetition is good. Never overwhelming. |
| **Age 8, Israeli** | Hebrew-speaking. Responds to warmth and encouragement, not competition. |
| **Sensory sensitivities** | No harsh transients. No sudden volume spikes. No alarm-like tones. |

The companion character is a **cat (חתול)**. Sounds connected to the cat should feel
soft, warm, and furry — never sharp or mechanical.

---

## Language & Voice

### Hebrew voice persona
- **Language**: Hebrew (he-IL), full nikud on all spoken text
- **Voice character**: Warm Israeli female teacher — like a kind, patient kindergarten teacher (גננת)
- **Model**: `eleven_multilingual_v2`
- **Voice settings**:
  - `stability`: 0.75 (consistent, warm, not robotic)
  - `similarity_boost`: 0.80
  - `style`: 0.35 (calm, soft, not dramatic)
  - `use_speaker_boost`: true
- **Default voice ID**: `Xb7hH8MSUJpSbSDYk0k2` (override via `ELEVENLABS_VOICE_ID` in `.env`)

### Hebrew voice modes

| Mode | Rate | Pitch | Used for |
|---|---|---|---|
| `instruction` | 0.78 | 1.05 | Task instructions — "סִפְרִי אֶת הַפְּרָחִים!" |
| `letter` | 0.68 | 1.08 | Letter names — isolated, very clear — "אָלֶף" |
| `number` | 0.70 | 1.06 | Number words — "אֶחָד", "שְׁתַּיִם" |
| `encouragement` | 0.88 | 1.12 | Praise — upbeat and warm — "!כָּל הַכָּבוֹד" |
| `syllable` | 0.62 | 1.05 | Syllables — very slow for decoding — "אֵם" |

### Hebrew voice writing rules
1. Always include full nikud (vowel marks) — Gefen needs them to decode
2. Use short sentences — maximum one clause per voice line
3. Address Gefen in feminine form — "סִפְרִי" not "סְפוֹר", "לַחְצִי" not "לְחַץ"
4. Encouragement is ALWAYS warm and personal — never generic or robotic
5. Never use negative words — replace "טָעִית" with "נְנַסֶּה יַחַד!"
6. The cat's voice lines should feel like a friend whispering, not a teacher commanding

---

## Sensory-safe design principles

These rules apply to EVERY sound. Non-negotiable for Gefen.

### Always prefer
- Soft rounded attack envelopes (≥ 4ms attack)
- Warm timbres: wood, felt, water, breath, soft chime, marimba-like
- C major pentatonic scale — always consonant, never jarring
- Gentle magical textures: soft sparkle, fairy dust, light shimmer
- Low-to-mid frequency emphasis
- Predictable, non-surprising dynamics

### Always avoid
See `references/forbidden_traits.md` for the complete list.
Key rules: no harsh transients, no alarm-like tones, no sudden volume spikes,
no metallic buzz, no descending minor intervals (can feel "wrong" to autistic children).

### Emotional tone targets
- Reassuring, not exciting
- Encouraging, not competitive
- Warm, not cold
- Magical, not intense
- The same gentle warmth every single time (consistency matters for HFA)

---

## Sound categories

| Category | Duration | Loop? | Character |
|---|---|---|---|
| `ui_tap` | 0.5–1.5s | No | Short, soft, responsive feedback |
| `reward` | 0.8–2.5s | No | Warm, encouraging, celebratory but calm |
| `ambient_loop` | 10–22s | Yes | Soft, seamless, non-distracting |
| `character_reaction` | 0.5–2.0s | No | Warm, cat-like, emotionally safe |
| `transition` | 0.5–1.5s | No | Smooth, gentle scene change |

> **ElevenLabs minimum**: `duration_seconds` must be ≥ 0.5. Use 0.5 for short UI sounds.

---

## How to process a request

1. **Parse the request** — what moment, what emotion, which screen?
2. **Identify if it's SFX or voice** — or both (some moments need both)
3. **Classify** into one of the five categories
4. **Determine mood** — pick 2–4 words from `references/mood_palette.md`
5. **Write the Hebrew voice text** (if voice) — include nikud, feminine address, warm tone
6. **Build the ElevenLabs prompt** — use template in `templates/elevenlabs_prompt.md`
7. **Generate full JSON spec** — see `references/output_schema.md`
8. **Write the script entry** — paste-ready line for `scripts/generate-audio.py`
9. **Suggest filename** — `{category}_{purpose}_{mood}_{variant}.mp3`

---

## Output format

Every response MUST include both the JSON spec AND the script entry:

```json
{
  "purpose": "what this sound is for",
  "category": "ui_tap | reward | ambient_loop | character_reaction | transition",
  "mood": "2-4 mood words",
  "duration_seconds": 1.0,
  "loop": false,
  "voice_text_he": "הַטֶּקְסְט הָעִבְרִי עִם נִקּוּד (if voice line)",
  "voice_mode": "instruction | letter | number | encouragement | syllable",
  "sensory_rules": ["no harsh attack", "gentle and predictable", "warm timbre"],
  "forbidden_traits": ["metallic", "alarm-like", "loud"],
  "prompt_for_elevenlabs": "Full prompt for Sound Effects API (SFX) or TTS API (voice)",
  "suggested_filename": "category_purpose_mood_01.mp3",
  "script_entry": "(\"filename.mp3\", \"prompt or hebrew text\", duration)",
  "tags": ["child-friendly", "hebrew", "category-name"]
}
```

---

## API Generation

Run `scripts/generate-audio.py` to generate real audio:

```bash
# Everything (SFX + voices):
python3 scripts/generate-audio.py

# SFX only / voices only:
python3 scripts/generate-audio.py --sfx-only
python3 scripts/generate-audio.py --voices-only

# List available voices to pick a Hebrew-friendly voice:
python3 scripts/generate-audio.py --list-voices

# Overwrite existing files:
python3 scripts/generate-audio.py --force
```

API key and voice ID live in `.env` (never committed to git):
```
ELEVENLABS_API_KEY=your_key_here
ELEVENLABS_VOICE_ID=Xb7hH8MSUJpSbSDYk0k2
```

After generation, `src/utils/speak.ts` automatically uses the pre-recorded files
and falls back to the browser Web Speech API (he-IL) for any unmapped text.

---

## Reference files

- `references/output_schema.md` — full JSON schema
- `references/mood_palette.md` — approved mood/texture vocabulary (Hebrew + English)
- `references/forbidden_traits.md` — traits to never use
- `templates/elevenlabs_prompt.md` — prompt template with Hebrew examples
- `examples/` — pre-built Hebrew example outputs for common scenarios

---

## Quick examples

**"כפתור חזרה נלחץ"** → `ui_tap`, see `examples/ui_button_tap.json`

**"ילדה בחרה תשובה נכונה"** → `reward`, see `examples/reward_correct_answer.json`

**"חתול מגיב לגעת"** → `character_reaction`, see `examples/character_cat_touch.json`

**"רקע שקט לזמן חופשי"** → `ambient_loop`, see `examples/ambient_safe_space.json`

---

## Filename convention

```
{category}_{purpose_english}_{mood}_{variant}.mp3

Examples:
  ui_flower_tap_soft_magical_01.mp3
  reward_correct_warm_sparkle_01.mp3
  ambient_welcome_music_magical_01.mp3
  character_cat_reaction_warm_01.mp3
  transition_phase_change_smooth_01.mp3
```

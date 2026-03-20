# ElevenLabs Prompt Template — כוכב הלמידה

Two templates: one for SFX (Sound Effects API), one for Voice (TTS API).

---

## SFX Template (Sound Effects API)

```
A [softness_word] [sound_type] sound for a Hebrew children's educational app.
[Texture: 2-3 phrases describing timbre and material quality].
[Emotion: 1-2 phrases about the feeling — warm, encouraging, magical].
[Safety fences: 2-3 short exclusions].
[Duration hint if relevant].
```

### Slot definitions

**[softness_word]** — always start here:
`very soft` / `gentle` / `delicate` / `quiet` / `tender` / `light`

**[sound_type]:**
`chime` / `sparkle` / `tap` / `shimmer` / `ping` / `whoosh` / `glow` / `bubble` / `pop (soft)`

**Texture** — use material metaphors:
- "warm rounded tone like a soft wooden mallet on a marimba"
- "gentle sparkle with airy shimmer, like fairy dust settling"
- "music-box quality, struck-bell feel with warm resonance"

**Emotion:**
- "friendly and reassuring, like a kind teacher smiling"
- "encouraging and warm, celebrating a small victory"
- "calm and meditative, safe and predictable"

**Safety fences** (pick 2–3 most relevant):
- "no harsh attack" / "no sharp highs" / "no sudden dynamics"
- "no metallic tone" / "no alarming quality" / "very gentle dynamics"

---

## Voice Template (TTS API)

For voice lines, the prompt IS the Hebrew text with nikud.
No additional prompt engineering needed — voice quality comes from `voice_settings`.

```
{hebrew text with full nikud}
```

Rules:
1. Feminine address — "לַחְצִי" (not "לְחַץ"), "סִפְרִי" (not "סְפוֹר")
2. Full nikud always
3. Short — one clause maximum
4. Warm encouragement for positive moments
5. "נְנַסֶּה יַחַד!" for mistakes — never "טָעִית"

---

## Complete Hebrew examples

### UI tap — flower tap
```
A very soft gentle warm marimba pluck for a Hebrew children's educational app,
single wooden tone struck softly, rounded attack, short warm resonant decay,
like touching a soft wooden xylophone key, friendly and responsive,
no harsh attack, no sharp highs, very short under one second.
```

### Reward — correct answer
```
A gentle warm reward chime for a Hebrew children's educational app,
three ascending soft marimba tones in C major with a light sparkle shimmer tail,
encouraging and proud like a quiet "כל הכבוד", rounded wooden quality,
no sudden peaks, no metallic tone, about 1.5 seconds.
```

### Ambient loop — welcome screen music
```
A gentle looping music-box melody for a Hebrew children's educational app welcome screen,
C major pentatonic scale, soft warm marimba-xylophone timbre, magical and playful,
96 BPM, soft sparkle shimmer underneath, light and airy, reassuring,
suitable for a young Israeli child, seamlessly loopable, no percussion, no bass drop.
```

### Character reaction — cat touch
```
A soft warm cute reaction sound for a Hebrew children's educational app,
gentle playful squeak with warm fuzzy quality like a soft cat toy,
friendly and emotionally safe, rounded and cozy,
no harsh attack, no sharp highs, very short and gentle.
```

### Voice — encouragement
Hebrew text: `כָּל הַכָּבוֹד! 🌟`
Voice mode: `encouragement` (rate 0.88, pitch 1.12)

### Voice — letter name
Hebrew text: `אָלֶף`
Voice mode: `letter` (rate 0.68, pitch 1.08)

### Voice — instruction
Hebrew text: `סִפְרִי אֶת הַפְּרָחִים!`
Voice mode: `instruction` (rate 0.78, pitch 1.05)

### Voice — try-again (never negative)
Hebrew text: `נְנַסֶּה יַחַד!`
Voice mode: `encouragement`

---

## Tips for Hebrew children's app sounds

1. **Pentatonic scale** — all SFX in C major pentatonic (C D E G A). Nothing can clash.
2. **Ascending intervals feel positive** — upward motion = encouragement. Avoid descending.
3. **Short is safer** — Gefen has attention and sensory differences. Under 2s for most SFX.
4. **Consistency** — every "correct" sounds the same. Every "try again" sounds the same.
   Predictability is calming for autistic children.
5. **Hebrew TTS + ElevenLabs multilingual v2** — best model for Hebrew.
   Always check output with native Hebrew speaker if possible.

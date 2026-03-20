#!/usr/bin/env python3
"""
generate-audio.py — generates all SFX and voice lines for כוכב הלמידה
using the ElevenLabs API (Sound Effects + TTS).

Usage:
    ELEVENLABS_API_KEY=your_key python3 scripts/generate-audio.py

    # Only SFX:
    ELEVENLABS_API_KEY=your_key python3 scripts/generate-audio.py --sfx-only

    # Only voices:
    ELEVENLABS_API_KEY=your_key python3 scripts/generate-audio.py --voices-only

    # Use a specific voice ID:
    ELEVENLABS_API_KEY=your_key ELEVENLABS_VOICE_ID=xyz python3 scripts/generate-audio.py

Output:
    public/audio/sfx/*.mp3     — sound effects
    public/audio/voices/*.mp3  — voice lines
"""

import os, sys, json, time, argparse
import urllib.request, urllib.error

# ── Load .env file (no external dependencies) ─────────────────────────────────
def load_env():
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            # Don't override values already set in the shell environment
            os.environ.setdefault(key.strip(), val.strip())

load_env()

API_KEY  = os.environ.get("ELEVENLABS_API_KEY", "")
BASE_URL = "https://api.elevenlabs.io/v1"

# ── Voice to use for Hebrew TTS ───────────────────────────────────────────────
# Override by setting ELEVENLABS_VOICE_ID in .env or shell environment.
# Default: "Xb7hH8MSUJpSbSDYk0k2" (Alice — multilingual v2, warm female)
# Run with --list-voices to see all available voices.
VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "Xb7hH8MSUJpSbSDYk0k2")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT       = os.path.dirname(SCRIPT_DIR)
SFX_DIR    = os.path.join(ROOT, "public", "audio", "sfx")
VOICE_DIR  = os.path.join(ROOT, "public", "audio", "voices")

os.makedirs(SFX_DIR,   exist_ok=True)
os.makedirs(VOICE_DIR, exist_ok=True)

# ── API helpers ───────────────────────────────────────────────────────────────

def api_get(path):
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        headers={"xi-api-key": API_KEY, "Accept": "application/json"},
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def api_post(path, body, accept="audio/mpeg"):
    data = json.dumps(body).encode()
    req  = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=data,
        headers={
            "xi-api-key":   API_KEY,
            "Content-Type": "application/json",
            "Accept":       accept,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"    ✗ HTTP {e.code}: {body[:200]}")
        return None

def save(path, data):
    with open(path, "wb") as f:
        f.write(data)

def check_key():
    if not API_KEY:
        print("ERROR: Set ELEVENLABS_API_KEY environment variable first.")
        print("  export ELEVENLABS_API_KEY=your_key_here")
        sys.exit(1)

# ── List voices ───────────────────────────────────────────────────────────────

def list_voices():
    check_key()
    data = api_get("/voices")
    print(f"\n{'ID':<30} {'Name':<25} {'Language'}")
    print("-" * 70)
    for v in data["voices"]:
        lang = v.get("labels", {}).get("language", "—")
        print(f"{v['voice_id']:<30} {v['name']:<25} {lang}")

# ── Sound Effects ─────────────────────────────────────────────────────────────
# Each entry: (output_filename, prompt, duration_seconds)

SFX_SPECS = [
    # ── Welcome screen ───────────────────────────────────────────────────────
    ("welcome_music.mp3",
     "A gentle looping music-box melody for a children's educational app welcome screen. "
     "C major pentatonic scale, soft warm marimba-xylophone timbre, magical and playful, "
     "96 BPM, soft sparkle shimmer underneath, light and airy, reassuring, "
     "suitable for a young child, seamlessly loopable, no percussion, no bass drop.",
     22.0),
    ("welcome_chime.mp3",
     "Three ascending soft warm chime tones played gently as an app loads, "
     "marimba-like timbre, C major ascending arpeggio, soft sparkle shimmer tail, "
     "warm magical welcoming feel, rounded attack, children's educational app.",
     2.0),

    # ── Counting Garden ───────────────────────────────────────────────────────
    ("flower_tap_1.mp3",
     "A soft warm marimba pluck, single low C note struck gently, rounded attack, short warm decay, children's educational game, magical, reassuring.",
     0.5),
    ("flower_tap_2.mp3",
     "A soft warm marimba pluck, single D note struck gently, slightly higher than previous, rounded attack, short warm decay, children's educational game.",
     0.5),
    ("flower_tap_3.mp3",
     "A soft warm marimba pluck, single E note struck gently, rounded attack, short warm decay, children's educational game, playful.",
     0.5),
    ("flower_tap_4.mp3",
     "A soft warm marimba pluck, single G note struck gently, rounded attack, short warm decay, children's educational game.",
     0.5),
    ("flower_tap_5.mp3",
     "A soft warm marimba pluck, single A note struck gently, rounded attack, short warm decay, children's educational game.",
     0.5),
    ("flower_tap_6.mp3",
     "A soft warm marimba pluck, high C note struck gently, rounded attack, short warm decay, children's educational game, magical.",
     0.5),
    ("flower_tap_7.mp3",
     "A soft warm marimba pluck, high D note struck gently, rounded attack, short warm decay, children's educational game.",
     0.5),
    ("flower_tap_8.mp3",
     "A soft warm marimba pluck, high E note struck gently, rounded attack, short warm decay, children's educational game.",
     0.5),
    ("correct.mp3",
     "Three ascending warm chime tones, C E G major triad, soft marimba-like timbre, gentle sparkle shimmer tail, encouraging and warm, children's educational app reward sound, no percussion, no fanfare drums.",
     1.5),
    ("streak_bonus.mp3",
     "Four ascending warm marimba chime tones rising to a high note, followed by a sustained sparkle shimmer cloud, gentle celebratory, warm golden feel, soft attack, magical, children's educational app, not overwhelming.",
     2.2),
    ("try_again.mp3",
     "A gentle soft two-tone descending nudge, warm bell timbre, friendly encouraging feel, like a kind gentle tap, not a failure buzzer, not harsh, reassuring, children's educational app.",
     0.6),
    ("level_up.mp3",
     "A gentle four-note ascending marimba arpeggio, warm sparkle shimmer tail, signalling progress and encouragement, soft attack, magical feel, children's educational app.",
     1.2),
    ("bloom.mp3",
     "A soft magical sparkle shimmer burst, overlapping high twinkling tones fading out like fairy dust, gentle flower blooming sound, children's app, warm and delicate.",
     0.9),
    ("demo_ping.mp3",
     "A tiny soft warm marimba ping, single gentle note, barely audible, short decay, counting demonstration sound, children's app.",
     0.5),
    ("button_tap.mp3",
     "A very soft short warm tap sound, gentle single note, rounded attack, subtle, UI button feedback, children's educational app.",
     0.5),

    # ── Safe Space — interactive element sounds ──────────────────────────────
    ("safespace_star_tap.mp3",
     "A gentle twinkling sparkle chime, soft high-register celeste-like tone with "
     "shimmering fairy-dust tail, like a distant star winking, warm and magical, "
     "C major pentatonic, rounded attack, children's educational app, calming.",
     1.0),
    ("safespace_moon_tap.mp3",
     "A soft warm magical glow tone, low gentle chime with a sustained ethereal shimmer, "
     "like moonlight spreading, warm golden hum fading to sparkle dust, "
     "very gentle and dreamy, rounded attack, children's educational app.",
     1.5),
    ("safespace_cat_tap.mp3",
     "A soft warm cat purr with a tiny friendly mew at the start, very gentle and cozy, "
     "like a sleepy kitten acknowledging a gentle pet, warm fuzzy feeling, "
     "no sharp transients, children's educational app, comforting.",
     1.2),
    ("safespace_water_tap.mp3",
     "A gentle water ripple sound, single soft droplet falling into a calm pond "
     "with expanding ripple rings, very quiet and soothing, low-frequency water movement, "
     "no splash, just a soft plop and gentle wave, children's educational app.",
     1.0),
    ("safespace_breathe.mp3",
     "A very soft ambient breathing guide sound, gentle rising airy whoosh over 4 seconds "
     "representing inhale, followed by 2 seconds of soft sustained warmth, then a gentle "
     "descending exhale sigh over 6 seconds. Total 12 seconds. Extremely soft, warm, "
     "like wind through distant trees, no sharp transients, no melody, purely textural "
     "ambient, children's calming app, sensory-safe.",
     12.0),

    # ── Letter Explorer ───────────────────────────────────────────────────────
    ("letter_reveal.mp3",
     "A soft magical shimmer chime, two overlapping warm bell tones with sparkle shimmer, gentle reveal sound as a letter appears, warm and welcoming, children's educational app.",
     0.8),
    ("letter_tap.mp3",
     "A tiny warm soft marimba ping, single C note, gentle responsive feedback for tapping a letter, children's educational app.",
     0.5),
    ("correct_choice.mp3",
     "Two ascending warm chime tones E and G with a gentle sparkle shimmer tail, correct answer feedback, encouraging and warm, children's educational app.",
     1.1),
    ("wrong_choice.mp3",
     "A gentle soft two-tone descending nudge, warm friendly feel, not a failure buzz, kind and encouraging, children's educational app for a child with sensory sensitivities.",
     0.6),
    ("trace_dot.mp3",
     "A tiny very quiet soft ping, single high E note, barely-there warm tone, for reaching a tracing dot in a children's handwriting app.",
     0.5),
    ("trace_complete.mp3",
     "Three soft ascending chime tones with warm sparkle shimmer, gentle reward for completing letter tracing, encouraging, magical, children's educational app.",
     1.0),
    ("phase_transition.mp3",
     "A very soft single ascending tone gliding smoothly upward, gentle whoosh-chime, smooth activity phase transition sound, barely-there, non-startling, children's educational app.",
     0.7),
    ("letter_complete.mp3",
     "Four ascending warm marimba-chime tones rising to a high note with sparkle shimmer cloud, warm celebration for completing a full letter lesson, encouraging and magical, children's educational app.",
     2.0),
]

# ── Voice lines ───────────────────────────────────────────────────────────────
# (output_filename, hebrew_text)
# Voice persona: warm Israeli female teacher, calm, clear, gentle.

VOICE_LINES = [
    # Welcome
    ("welcome_speech.mp3",  "הֵי גֶּפֶן! מַה שְּׁלוֹמֵךְ? אַת רוֹצָה לְהַתְחִיל לְשַׂחֵק?"),

    # Numbers
    ("num_1.mp3",        "אֶחָד"),
    ("num_2.mp3",        "שְׁתַּיִם"),
    ("num_3.mp3",        "שָׁלוֹשׁ"),
    ("num_4.mp3",        "אַרְבַּע"),
    ("num_5.mp3",        "חָמֵשׁ"),
    ("num_6.mp3",        "שֵׁשׁ"),
    ("num_7.mp3",        "שֶׁבַע"),
    ("num_8.mp3",        "שְׁמוֹנֶה"),
    ("num_9.mp3",        "תֵּשַׁע"),
    ("num_10.mp3",       "עֶשֶׂר"),

    # Encouragement
    ("enc_kol_hakavod.mp3",    "כָּל הַכָּבוֹד!"),
    ("enc_nifla.mp3",          "נִפְלָא!"),
    ("enc_madim.mp3",          "מַדְהִים!"),
    ("enc_nenase.mp3",         "נְנַסֶּה יַחַד!"),
    ("enc_streak.mp3",         "שָׁלוֹשׁ בְּרֶצֶף! מַדְהִים!"),
    ("enc_yafe.mp3",           "יָפֶה מְאוֹד!"),

    # Instructions — Counting Garden
    ("inst_count_flowers.mp3", "סִפְרִי אֶת הַפְּרָחִים!"),
    ("inst_how_many.mp3",      "כַּמָּה פְּרָחִים יֵשׁ?"),
    ("inst_lets_count.mp3",    "בּוֹאִי נִסְפּוֹר יַחַד!"),

    # Letter names
    ("letter_alef.mp3",        "אָלֶף"),
    ("letter_bet.mp3",         "בֵּית"),
    ("letter_gimel.mp3",       "גִּימֶל"),

    # Instructions — Letter Explorer (per letter)
    ("inst_letter_alef.mp3",   "הָאוֹת אָלֶף"),
    ("inst_letter_bet.mp3",    "הָאוֹת בֵּית"),
    ("inst_letter_gimel.mp3",  "הָאוֹת גִּימֶל"),
    ("inst_who_alef.mp3",      "מִי הָאוֹת אָלֶף? לַחְצִי עָלֶיהָ!"),
    ("inst_who_bet.mp3",       "מִי הָאוֹת בֵּית? לַחְצִי עָלֶיהָ!"),
    ("inst_who_gimel.mp3",     "מִי הָאוֹת גִּימֶל? לַחְצִי עָלֶיהָ!"),

    # Syllables
    ("syl_em.mp3",             "אֵם"),
    ("syl_ben.mp3",            "בֵּן"),
    ("syl_gan.mp3",            "גַּן"),

    # Letter complete messages
    ("lc_alef.mp3",            "כָּל הַכָּבוֹד! לָמַדְתְּ אֶת הָאוֹת אָלֶף!"),
    ("lc_bet.mp3",             "כָּל הַכָּבוֹד! לָמַדְתְּ אֶת הָאוֹת בֵּית!"),
    ("lc_gimel.mp3",           "כָּל הַכָּבוֹד! לָמַדְתְּ אֶת הָאוֹת גִּימֶל!"),
    ("lc_all.mp3",             "סִיַּמְתְּ אֶת כָּל הָאוֹתִיּוֹת! כָּל הַכָּבוֹד!"),

    # Trace instructions
    ("inst_trace.mp3",         "עִקְבִי אַחֲרֵי הַנְּקֻדּוֹת לְפִי הַסֵּדֶר"),
    ("inst_connect.mp3",       "חַבְּרִי אֶת הָאוֹתִיּוֹת וּצְרִי הַבְּרָה!"),
]

# ── Generators ────────────────────────────────────────────────────────────────

def generate_sfx(force=False):
    print(f"\n{'='*60}")
    print(f"Generating {len(SFX_SPECS)} SFX files...")
    print(f"{'='*60}")

    for i, (filename, prompt, duration) in enumerate(SFX_SPECS, 1):
        outpath = os.path.join(SFX_DIR, filename)
        if os.path.exists(outpath) and not force:
            print(f"  [{i:02}/{len(SFX_SPECS)}] SKIP (exists) {filename}")
            continue

        print(f"  [{i:02}/{len(SFX_SPECS)}] Generating {filename}...", end=" ", flush=True)
        data = api_post("/sound-generation", {
            "text": prompt,
            "duration_seconds": duration,
            "prompt_influence": 0.3,
        })
        if data:
            save(outpath, data)
            print(f"✓ ({len(data)//1024} KB)")
        else:
            print("✗ failed")

        time.sleep(0.5)  # rate limit courtesy

def generate_voices(force=False):
    print(f"\n{'='*60}")
    print(f"Generating {len(VOICE_LINES)} voice lines (voice: {VOICE_ID})...")
    print(f"{'='*60}")

    for i, (filename, text) in enumerate(VOICE_LINES, 1):
        outpath = os.path.join(VOICE_DIR, filename)
        if os.path.exists(outpath) and not force:
            print(f"  [{i:02}/{len(VOICE_LINES)}] SKIP (exists) {filename}")
            continue

        print(f"  [{i:02}/{len(VOICE_LINES)}] {filename} — \"{text}\"...", end=" ", flush=True)
        data = api_post(f"/text-to-speech/{VOICE_ID}", {
            "text": text,
            "model_id": "eleven_v3",
            "language_code": "he",
            "voice_settings": {
                "stability":        0.55,
                "similarity_boost": 0.80,
                "style":            0,
                "use_speaker_boost": True,
            },
        })
        if data:
            save(outpath, data)
            print(f"✓ ({len(data)//1024} KB)")
        else:
            print("✗ failed")

        time.sleep(0.4)

# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate audio assets via ElevenLabs API")
    parser.add_argument("--sfx-only",    action="store_true", help="Only generate SFX")
    parser.add_argument("--voices-only", action="store_true", help="Only generate voices")
    parser.add_argument("--force",       action="store_true", help="Overwrite existing files")
    parser.add_argument("--list-voices", action="store_true", help="List available voices and exit")
    args = parser.parse_args()

    check_key()

    if args.list_voices:
        list_voices()
        sys.exit(0)

    if args.sfx_only:
        generate_sfx(args.force)
    elif args.voices_only:
        generate_voices(args.force)
    else:
        generate_sfx(args.force)
        generate_voices(args.force)

    print("\nDone! Files saved to:")
    print(f"  SFX:    {SFX_DIR}")
    print(f"  Voices: {VOICE_DIR}")

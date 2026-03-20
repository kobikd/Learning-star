// ─── Sticker definitions for the album ────────────────────────────────────────
// 27 stickers: 9 per topic. Earned in sequence (first animals, then space, then sea).

export type StickerTopic = 'animals' | 'space' | 'sea';

export interface StickerDefinition {
  id: string;
  emoji: string;
  name: string;       // Hebrew with nikud
  topic: StickerTopic;
}

export const TOPIC_META: Record<StickerTopic, { label: string; icon: string; color: string }> = {
  animals: { label: 'חַיּוֹת',  icon: '🐾', color: 'var(--color-success)'  },
  space:   { label: 'חָלָל',   icon: '🚀', color: 'var(--color-math)'     },
  sea:     { label: 'יָם',     icon: '🌊', color: 'var(--color-reading)'  },
};

export const STICKERS: StickerDefinition[] = [
  // ── Animals ──
  { id: 'cat',       emoji: '🐱', name: 'חָתוּל',       topic: 'animals' },
  { id: 'dog',       emoji: '🐶', name: 'כֶּלֶב',       topic: 'animals' },
  { id: 'rabbit',    emoji: '🐰', name: 'אַרְנָב',      topic: 'animals' },
  { id: 'lion',      emoji: '🦁', name: 'אַרְיֵה',      topic: 'animals' },
  { id: 'frog',      emoji: '🐸', name: 'צְפַרְדֵּעַ',  topic: 'animals' },
  { id: 'butterfly', emoji: '🦋', name: 'פַּרְפַּר',    topic: 'animals' },
  { id: 'parrot',    emoji: '🦜', name: 'תֻּכִּי',      topic: 'animals' },
  { id: 'unicorn',   emoji: '🦄', name: 'חַד-קֶרֶן',    topic: 'animals' },
  { id: 'fox',       emoji: '🦊', name: 'שׁוּעָל',      topic: 'animals' },
  // ── Space ──
  { id: 'rocket',    emoji: '🚀', name: 'טִיל',          topic: 'space' },
  { id: 'star',      emoji: '⭐', name: 'כּוֹכָב',       topic: 'space' },
  { id: 'moon',      emoji: '🌙', name: 'יָרֵחַ',        topic: 'space' },
  { id: 'comet',     emoji: '☄️', name: 'שָׁבִיט',       topic: 'space' },
  { id: 'planet',    emoji: '🪐', name: 'לֶכֶת',         topic: 'space' },
  { id: 'astronaut', emoji: '👩‍🚀', name: 'אַסְטְרוֹנָאוּטִית', topic: 'space' },
  { id: 'ufo',       emoji: '🛸', name: 'עָב״מ',          topic: 'space' },
  { id: 'sparkle',   emoji: '✨', name: 'זֹהַר',          topic: 'space' },
  { id: 'telescope', emoji: '🔭', name: 'טֶלֶסְקוֹפּ',   topic: 'space' },
  // ── Sea ──
  { id: 'clownfish', emoji: '🐠', name: 'דָּג',           topic: 'sea' },
  { id: 'octopus',   emoji: '🐙', name: 'תְּמָנוּן',      topic: 'sea' },
  { id: 'whale',     emoji: '🐳', name: 'לְוָיָתָן',      topic: 'sea' },
  { id: 'crab',      emoji: '🦀', name: 'סַרְטָן',        topic: 'sea' },
  { id: 'dolphin',   emoji: '🐬', name: 'דּוֹלְפִין',     topic: 'sea' },
  { id: 'turtle',    emoji: '🐢', name: 'צָב',             topic: 'sea' },
  { id: 'squid',     emoji: '🦑', name: 'דְּיוֹנוֹן',     topic: 'sea' },
  { id: 'puffer',    emoji: '🐡', name: 'נַפּוּחַ',       topic: 'sea' },
  { id: 'coral',     emoji: '🪸', name: 'אַלְמֹג',        topic: 'sea' },
];

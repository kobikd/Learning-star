// ─── Audio Files ────────────────────────────────────────────────────────────

export interface AudioFile {
  id: string;
  src: string;          // path under /public/audio/
  label: string;        // Hebrew label for accessibility
  duration?: number;    // ms, optional
}

// ─── Sound identifiers ──────────────────────────────────────────────────────

export type UiSound = 'soft-pop' | 'whoosh-gentle' | 'sparkle';

export type FeedbackSound =
  | 'happy-chime'         // correct answer
  | 'gentle-bell'         // almost correct
  | 'soft-nudge'          // try again — encouraging, never critical
  | 'celebration-short'   // streak bonus
  | 'fanfare-gentle';     // level up

export type AmbientSound = 'gentle-melody' | 'light-bounce' | 'soft-concentration';

// ─── Sound System ───────────────────────────────────────────────────────────

export interface SoundSystem {
  categories: {
    ui: {
      click: UiSound;
      transition: UiSound;
      open: UiSound;
    };
    feedback: {
      correct: FeedbackSound;
      almostCorrect: FeedbackSound;
      tryAgain: FeedbackSound;
      streak: FeedbackSound;
      levelUp: FeedbackSound;
    };
    narration: {
      instructions: AudioFile[];
      letters: AudioFile[];
      numbers: AudioFile[];
      words: AudioFile[];
      encouragement: string[];    // "!יופי", "!כל הכבוד", "!את מדהימה"
    };
    ambient: {
      calm: AmbientSound;
      playful: AmbientSound;
      focus: AmbientSound;
    };
  };
}

// ─── Sound Settings (per-category toggles in parent settings) ───────────────

export interface SoundSettings {
  uiEnabled: boolean;
  feedbackEnabled: boolean;
  narrationEnabled: boolean;
  ambientEnabled: boolean;
  masterVolume: number;     // 0.0–1.0
}

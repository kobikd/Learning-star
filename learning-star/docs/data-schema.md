# Data Schema — כוכב הלמידה

All localStorage keys, TypeScript interfaces, and default values. Read this when working on the adaptive engine, stores, or the storage service.

---

## localStorage Keys

| Key               | Type           | When to save                              |
|-------------------|----------------|-------------------------------------------|
| `learner-profile` | LearnerProfile | After every completed activity            |
| `reward-state`    | RewardState    | Immediately when stars/stickers are earned|
| `app-settings`    | AppSettings    | On change in parent settings screen       |
| `session-log`     | SessionLog     | On session end or `beforeunload`          |

All localStorage access goes through `src/services/storage.ts`. Components never call localStorage directly.

---

## TypeScript Interfaces

```typescript
// ─── Learner Profile ────────────────────────────────────────────────────────

type SkillId = string; // e.g. 'add_objects', 'cv_syllables', 'counting'

interface LearnerProfile {
  skillMastery: Record<SkillId, MasteryLevel>;
  avgResponseTime: Record<SkillId, number>;       // milliseconds
  streaks: {
    current: number;   // consecutive correct answers in current session
    best: number;      // all-time best streak
  };
  preferredModality: 'visual' | 'auditory' | 'kinesthetic';
  engagementScore: number;                         // 0.0–1.0
  errorPatterns: ErrorPattern[];
  lastSessionDate: string;                         // ISO 8601
}

interface MasteryLevel {
  score: number;              // 0.0–1.0, calculated over last 10 attempts
  attempts: number;           // total lifetime attempts for this skill
  recentAttempts: boolean[];  // last 10 results: true = correct, false = wrong
  lastPracticed: string;      // ISO 8601
  consecutiveCorrect: number;
  needsReview: boolean;       // spaced repetition flag
}

interface ErrorPattern {
  type:
    | 'counting_error'         // skips or double-counts objects
    | 'place_value_confusion'  // confuses tens and ones
    | 'direction_error'        // goes right instead of left on number line
    | 'number_reversal'        // writes 6 as 9, 2 as 5, etc.
    | 'operation_confusion'    // adds when should subtract (or vice versa)
    | 'skipped_number'         // omits a number in sequence
    | 'letter_confusion'       // confuses similar-looking Hebrew letters
    | 'vowel_error'            // reads wrong nikud
    | 'syllable_split_error';  // splits syllable in wrong place
  skillId: SkillId;
  count: number;               // how many times this pattern occurred
  lastOccurred: string;        // ISO 8601
  examples: string[];          // last 3 concrete examples, e.g. "wrote 6 instead of 9"
}

// Default value for new learner profile:
const defaultLearnerProfile: LearnerProfile = {
  skillMastery: {},
  avgResponseTime: {},
  streaks: { current: 0, best: 0 },
  preferredModality: 'visual',
  engagementScore: 0.5,
  errorPatterns: [],
  lastSessionDate: new Date().toISOString(),
};


// ─── Reward State ────────────────────────────────────────────────────────────

type CompanionType = 'cat' | 'dog' | 'bunny' | 'unicorn' | 'dragon';

interface RewardState {
  totalStars: number;
  stickers: {
    id: string;
    theme: 'animals' | 'space' | 'ocean' | 'flowers' | 'food';
    earnedDate: string; // ISO 8601
  }[];
  companion: {
    type: CompanionType;
    level: number;     // increases with totalStars milestones
  };
}

const defaultRewardState: RewardState = {
  totalStars: 0,
  stickers: [],
  companion: { type: 'cat', level: 1 },
};


// ─── App Settings ────────────────────────────────────────────────────────────

interface AppSettings {
  dailyTimeLimitMinutes: number;   // 0 = no limit
  breakReminderMinutes: number;    // default: 15
  soundEnabled: boolean;
  musicEnabled: boolean;
  narrationEnabled: boolean;
  animationLevel: 'full' | 'reduced' | 'minimal';
  parentPin: string;               // 4-digit string, e.g. "1234"
}

const defaultAppSettings: AppSettings = {
  dailyTimeLimitMinutes: 30,
  breakReminderMinutes: 15,
  soundEnabled: true,
  musicEnabled: true,
  narrationEnabled: true,
  animationLevel: 'full',
  parentPin: '0000',
};


// ─── Session Log ─────────────────────────────────────────────────────────────

interface SessionEntry {
  date: string;                    // ISO 8601
  durationMinutes: number;
  activitiesCompleted: {
    activityId: string;
    skillId: SkillId;
    score: number;                 // 0.0–1.0 for that activity
  }[];
}

interface SessionLog {
  sessions: SessionEntry[];        // keep last 90 days only
}

const defaultSessionLog: SessionLog = { sessions: [] };


// ─── Parent Dashboard (computed, not stored) ─────────────────────────────────

// These are computed on-the-fly from SessionLog + LearnerProfile.
// Do NOT store these in localStorage.

interface ParentDashboard {
  weeklySummary: {
    totalTimeMinutes: number;
    sessionCount: number;
    avgSessionLengthMinutes: number;
  };
  mathProgress: {
    currentLevel: string;
    masteredSkills: SkillId[];
    inProgressSkills: SkillId[];
    challengingSkills: SkillId[];
    weeklyTrend: 'improving' | 'steady' | 'declining';
  };
  readingProgress: {
    currentLevel: string;
    masteredSkills: SkillId[];
    inProgressSkills: SkillId[];
    challengingSkills: SkillId[];
    weeklyTrend: 'improving' | 'steady' | 'declining';
  };
  errorAnalysis: {
    commonMistakes: ErrorPattern[];
    recommendations: string[];
  };
}
```

---

## Storage Service Contract

`src/services/storage.ts` must implement:

```typescript
// Read a key, return default if missing or parse fails
function readStorage<T>(key: string, defaultValue: T): T

// Write a key
function writeStorage<T>(key: string, value: T): void

// Initialize all keys with defaults on first app load
function initializeStorage(): void

// Convenience accessors
function getLearnerProfile(): LearnerProfile
function saveLearnerProfile(profile: LearnerProfile): void

function getRewardState(): RewardState
function saveRewardState(state: RewardState): void

function getAppSettings(): AppSettings
function saveAppSettings(settings: AppSettings): void

function getSessionLog(): SessionLog
function appendSession(entry: SessionEntry): void  // also trims to last 90 days
```

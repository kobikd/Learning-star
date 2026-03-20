import type { SkillId } from './learner';

// ─── CRA Stages (Math) ───────────────────────────────────────────────────────

/** Concrete → Representational → Abstract */
export type CRAStage = 'concrete' | 'representational' | 'abstract';

// ─── Curriculum structure ────────────────────────────────────────────────────

export interface CurriculumLevel {
  id: string;
  name: string;           // Hebrew display name
  skills: SkillId[];
  /** CRA stage relevant only for math levels */
  craStage?: CRAStage;
}

export type SubjectArea = 'math' | 'reading';

export interface CurriculumDomain {
  id: string;
  name: string;           // Hebrew display name
  subject: SubjectArea;
  levels: CurriculumLevel[];
}

// ─── Activity types ──────────────────────────────────────────────────────────

export type InteractionType =
  | 'tap_to_count'
  | 'tap_target'
  | 'tap_choice'
  | 'tap_match'
  | 'tap_pair'
  | 'tap_to_read'
  | 'drag_and_drop_easy'
  | 'drag_coins'
  | 'drag_combine'
  | 'drag_order'
  | 'see_hear_trace';

export type ActivityCategory = 'math' | 'reading' | 'shared';

export interface ActivityType {
  id: string;
  /** Hebrew display name */
  name: string;
  type: string;
  category: ActivityCategory;
  interaction: InteractionType;
  /** Which curriculum domain this activity covers */
  domainId: string;
  /** Minimum skill level required to unlock */
  minLevel?: string;
}

// ─── Screen types ─────────────────────────────────────────────────────────────

export type ScreenId =
  | 'welcome'
  | 'world-map'
  | 'visual-schedule'
  | 'math-activity'
  | 'reading-activity'
  | 'break'
  | 'parent-dashboard'
  | 'sticker-album'
  | 'safe-space'
  | 'settings';

// ─── Parent Dashboard ─────────────────────────────────────────────────────────

export interface SubjectProgress {
  currentLevel: string;
  mastered: SkillId[];
  inProgress: SkillId[];
  challenging: SkillId[];
  trend: 'improving' | 'stable' | 'needs-attention';
}

export interface ParentDashboard {
  weeklySummary: {
    totalTime: number;      // minutes
    sessions: number;
    avgSessionLength: number;
  };
  mathProgress: SubjectProgress;
  readingProgress: SubjectProgress;
  errorAnalysis: {
    commonMistakes: Array<{ skillId: SkillId; count: number; suggestion: string }>;
    recommendations: string[];
  };
  adaptations: {
    difficultyChanges: number;
    scaffoldingUsed: number;
  };
  settings: {
    dailyTimeLimit: number;   // minutes
    breakReminder: number;    // minutes
    soundEnabled: boolean;
    animationLevel: 'full' | 'reduced' | 'off';
  };
}

/**
 * progress.ts — Persistent progress store (localStorage, no backend)
 *
 * Storage key: 'gefen-progress-v1'
 * All reads/writes are try-caught — storage failure never crashes the app.
 *
 * Separation of concerns:
 *   - This file: learning progress (skill metrics, sessions, streaks)
 *   - rewardStore.ts: gamification (stars, stickers)
 */

import {
  createSkillMetrics,
  recordAttempt as adaptiveRecordAttempt,
  masteryScore,
} from './adaptive';
import type { SkillMetrics } from './adaptive';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionRecord {
  id:            string;    // nanoid-lite: Date.now().toString(36)
  date:          string;    // ISO date yyyy-mm-dd
  startedAt:     number;    // timestamp
  endedAt:       number;
  skillsWorked:  string[];  // skill ids touched this session
  totalAttempts: number;
  totalCorrect:  number;
  subject:       'math' | 'reading' | 'mixed';
}

export interface ProgressData {
  version:        number;
  skills:         Record<string, SkillMetrics>;  // skillId → metrics
  sessions:       SessionRecord[];               // chronological, max 90
  dayStreak:      number;   // consecutive days with any activity
  lastActiveDate: string;   // yyyy-mm-dd
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY  = 'gefen-progress-v1';
const CURRENT_VER  = 1;
const MAX_SESSIONS = 90;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function defaultProgress(): ProgressData {
  return {
    version:        CURRENT_VER,
    skills:         {},
    sessions:       [],
    dayStreak:      0,
    lastActiveDate: '',
  };
}

export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as ProgressData;
    if (parsed.version !== CURRENT_VER) return defaultProgress();
    return parsed;
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(data: ProgressData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage quota or private-mode — silently ignore, never crash
  }
}

// ─── Day streak ───────────────────────────────────────────────────────────────

function updateDayStreak(data: ProgressData): ProgressData {
  const todayStr = today();
  if (data.lastActiveDate === todayStr) return data;  // already updated today

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const newStreak = data.lastActiveDate === yesterday
    ? data.dayStreak + 1
    : 1;   // streak broken

  return { ...data, dayStreak: newStreak, lastActiveDate: todayStr };
}

// ─── Skill access ─────────────────────────────────────────────────────────────

export function getMetrics(data: ProgressData, skillId: string): SkillMetrics {
  return data.skills[skillId] ?? createSkillMetrics(skillId);
}

export function setMetrics(
  data: ProgressData,
  metrics: SkillMetrics
): ProgressData {
  return {
    ...data,
    skills: { ...data.skills, [metrics.skillId]: metrics },
  };
}

// ─── Record an attempt ────────────────────────────────────────────────────────

export interface AttemptInput {
  skillId:       string;
  correct:       boolean;
  responseTimeMs: number;
  scaffoldLevel: 0 | 1 | 2 | 3;
  hintsUsed?:    number;
}

export interface AttemptResult {
  data:       ProgressData;
  metrics:    SkillMetrics;
  leveledUp:  boolean;
  leveledDown: boolean;
  newLevel:   number;
  scaffoldSuggestion: 0 | 1 | 2 | 3;
}

export function recordAttemptToProgress(
  data:   ProgressData,
  input:  AttemptInput
): AttemptResult {
  const existing = getMetrics(data, input.skillId);

  const { metrics: updated, decision } = adaptiveRecordAttempt(existing, {
    correct:        input.correct,
    responseTimeMs: input.responseTimeMs,
    scaffoldLevel:  input.scaffoldLevel,
    hintsUsed:      input.hintsUsed ?? 0,
  });

  const updatedData = updateDayStreak(setMetrics(data, updated));

  return {
    data:                updatedData,
    metrics:             updated,
    leveledUp:           decision.action === 'level-up',
    leveledDown:         decision.action === 'level-down',
    newLevel:            decision.newLevel,
    scaffoldSuggestion:  decision.scaffoldSuggestion,
  };
}

// ─── Session management ───────────────────────────────────────────────────────

let _activeSession: Partial<SessionRecord> | null = null;

export function beginSession(subject: SessionRecord['subject']): void {
  _activeSession = {
    id:            Date.now().toString(36),
    date:          today(),
    startedAt:     Date.now(),
    subject,
    skillsWorked:  [],
    totalAttempts: 0,
    totalCorrect:  0,
  };
}

export function recordSessionAttempt(skillId: string, correct: boolean): void {
  if (!_activeSession) return;
  _activeSession.totalAttempts  = (_activeSession.totalAttempts  ?? 0) + 1;
  _activeSession.totalCorrect   = (_activeSession.totalCorrect   ?? 0) + (correct ? 1 : 0);
  if (!_activeSession.skillsWorked!.includes(skillId)) {
    _activeSession.skillsWorked!.push(skillId);
  }
}

export function endSession(data: ProgressData): ProgressData {
  if (!_activeSession) return data;

  const session: SessionRecord = {
    ..._activeSession,
    endedAt: Date.now(),
  } as SessionRecord;

  _activeSession = null;

  const sessions = [...data.sessions, session].slice(-MAX_SESSIONS);
  return updateDayStreak({ ...data, sessions });
}

// ─── Mastery summary ──────────────────────────────────────────────────────────

export interface SkillSummary {
  skillId:      string;
  mastery:      number;   // 0–100
  currentLevel: number;
  lastPracticed: number;
  totalAttempts: number;
}

export function getSkillSummaries(data: ProgressData): SkillSummary[] {
  return Object.values(data.skills).map(m => ({
    skillId:       m.skillId,
    mastery:       masteryScore(m),
    currentLevel:  m.currentLevel,
    lastPracticed: m.lastAttemptAt,
    totalAttempts: m.totalAttempts,
  }));
}

export function getSubjectSummary(
  data: ProgressData,
  subject: 'math' | 'reading'
): { mastery: number; activeDays: number } {
  const relevant = data.sessions
    .filter(s => s.subject === subject || s.subject === 'mixed');
  const days     = new Set(relevant.map(s => s.date)).size;
  const skillIds = [...new Set(relevant.flatMap(s => s.skillsWorked))];

  if (skillIds.length === 0) return { mastery: 0, activeDays: days };

  const scores = skillIds.map(id => masteryScore(getMetrics(data, id)));
  const avg    = scores.reduce((a, b) => a + b, 0) / scores.length;
  return { mastery: Math.round(avg), activeDays: days };
}

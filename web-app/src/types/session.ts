/**
 * Session and metrics types for Neuro-Recover.
 * Used for session wrapper, persistence, progress view, PDF export, and coach.
 */

export type GameType = 'piano' | 'bubbles' | 'grab-cup' | 'button' | 'reach-hold' | 'finger-tap';

export interface SessionMetrics {
  /** Keys pressed (piano) or bubbles popped (bubbles) */
  score?: number;
  /** Reaction time in ms (e.g. task shown → first correct key) */
  reactionTimeMs?: number;
  /** Max extension (0–1) per finger index [thumb, index, middle, ring, pinky] — from MediaPipe landmarks */
  romPerFinger?: number[];
  /** Tremor estimate (0–1) from landmark position variance over session */
  tremorEstimate?: number;
  /** Smoothness estimate (0–1) from motion jerk; higher = smoother */
  smoothnessEstimate?: number;
  /** Keys pressed in order (piano) */
  keysPressed?: string[];
}

export interface SessionSummary {
  game: GameType;
  startedAt: number;
  endedAt: number;
  durationSeconds: number;
  metrics: SessionMetrics;
}

export interface StoredSession extends SessionSummary {
  id: string;
}

export const SESSION_STORAGE_KEY = 'neuro-recover-sessions';
export const MAX_STORED_SESSIONS = 100;

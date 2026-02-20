/**
 * Seeds sessionStorage with mock session data for demos and advert recording.
 * Call from console: window.__seedMockSessions() or open app with ?seedDemo=1
 */

import type { StoredSession } from '../types/session';
import { SESSION_STORAGE_KEY } from '../types/session';

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

function makeSession(
  game: StoredSession['game'],
  endedAt: number,
  durationSeconds: number,
  score: number,
  reactionTimeMs?: number,
  romPerFinger?: number[],
  tremorEstimate?: number,
  smoothnessEstimate?: number
): StoredSession {
  return {
    id: `session-${endedAt}-${Math.random().toString(36).slice(2, 9)}`,
    game,
    startedAt: endedAt - durationSeconds * 1000,
    endedAt,
    durationSeconds,
    metrics: {
      score,
      reactionTimeMs,
      romPerFinger,
      tremorEstimate,
      smoothnessEstimate,
    },
  };
}

/** Synthetic patient dataset: ROM, tremor, smoothness for demonstration / report generation. */
const MOCK_ROM = [0.7, 0.85, 0.8, 0.75, 0.65];
const MOCK_ROM_IMPROVED = [0.75, 0.9, 0.88, 0.82, 0.72];

/** Mock sessions: Piano, Bubbles, Grab with ROM/tremor/smoothness for demo and report PDF. */
export function seedMockSessions(): void {
  const sessions: StoredSession[] = [
    makeSession('piano', now - 0 * day, 178, 42, 380, MOCK_ROM_IMPROVED, 0.08, 0.82),
    makeSession('bubbles', now - 1 * day, 165, 28, undefined, MOCK_ROM, 0.12, 0.75),
    makeSession('piano', now - 2 * day, 180, 38, 420, MOCK_ROM_IMPROVED, 0.09, 0.78),
    makeSession('bubbles', now - 3 * day, 142, 22),
    makeSession('piano', now - 4 * day, 175, 35, 450, MOCK_ROM, 0.11, 0.72),
    makeSession('grab-cup', now - 5 * day, 120, 8, undefined, MOCK_ROM, 0.15, 0.68),
    makeSession('bubbles', now - 6 * day, 158, 25),
    makeSession('piano', now - 7 * day, 170, 32, 480, MOCK_ROM, 0.13, 0.7),
  ];
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

/** Clear all sessions (optional, for reset). */
export function clearMockSessions(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}

declare global {
  interface Window {
    __seedMockSessions?: () => void;
    __clearMockSessions?: () => void;
  }
}

if (typeof window !== 'undefined') {
  window.__seedMockSessions = seedMockSessions;
  window.__clearMockSessions = clearMockSessions;
}

import type { SessionSummary, StoredSession } from '../types/session';
import { SESSION_STORAGE_KEY, MAX_STORED_SESSIONS } from '../types/session';

export function saveSession(summary: SessionSummary | null | undefined): StoredSession | null {
  if (!summary || typeof summary.endedAt !== 'number') return null;
  const stored: StoredSession = {
    ...summary,
    id: `session-${summary.endedAt}-${Math.random().toString(36).slice(2, 9)}`,
  };
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    const list: StoredSession[] = raw ? JSON.parse(raw) : [];
    list.unshift(stored);
    const trimmed = list.slice(0, MAX_STORED_SESSIONS);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
  return stored;
}

export function getRecentSessions(limit = 20): StoredSession[] {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    const list: unknown[] = raw ? JSON.parse(raw) : [];
    const valid = list.filter(
      (s): s is StoredSession =>
        s != null &&
        typeof s === 'object' &&
        typeof (s as StoredSession).endedAt === 'number' &&
        typeof (s as StoredSession).game === 'string'
    );
    return valid.slice(0, limit);
  } catch {
    return [];
  }
}

export function getLastSession(): StoredSession | null {
  const list = getRecentSessions(1);
  return list[0] ?? null;
}

/** Start of week (Monday) in local date string YYYY-MM-DD for a given timestamp */
function getWeekStart(ts: number): string {
  const d = new Date(ts);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

/** Sessions completed in the current week (Monday–Sunday) */
export function getSessionsThisWeek(): StoredSession[] {
  const all = getRecentSessions(MAX_STORED_SESSIONS);
  const thisWeekStart = getWeekStart(Date.now());
  return all.filter((s) => typeof s.endedAt === 'number' && getWeekStart(s.endedAt) === thisWeekStart);
}

/** Current streak: number of consecutive days with at least one completed session (today counts) */
export function getCurrentStreak(): number {
  const all = getRecentSessions(MAX_STORED_SESSIONS);
  const seen = new Set<string>();
  for (const s of all) {
    if (typeof s.endedAt !== 'number') continue;
    seen.add(new Date(s.endedAt).toISOString().slice(0, 10));
  }
  const sorted = Array.from(seen).sort().reverse();
  let streak = 0;
  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().slice(0, 10);
    if (sorted[i] === expectedStr) streak++;
    else break;
  }
  return streak;
}

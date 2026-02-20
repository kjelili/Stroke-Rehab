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

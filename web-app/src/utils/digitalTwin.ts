import type { StoredSession } from '../types/session';

/**
 * Simple recovery estimate from session history.
 * Uses linear trend of score over time to estimate "weeks to goal".
 */
export function estimateWeeksToGoal(sessions: StoredSession[], goalScore: number): number | null {
  const withScore = sessions
    .filter((s) => s != null && typeof s.endedAt === 'number' && s.metrics.score != null && s.metrics.score > 0)
    .map((s) => ({ t: s.endedAt / (1000 * 60 * 60 * 24 * 7), score: s.metrics.score! }))
    .sort((a, b) => a.t - b.t);
  if (withScore.length < 2) return null;
  const n = withScore.length;
  const sumT = withScore.reduce((a, p) => a + p.t, 0);
  const sumS = withScore.reduce((a, p) => a + p.score, 0);
  const sumTT = withScore.reduce((a, p) => a + p.t * p.t, 0);
  const sumTS = withScore.reduce((a, p) => a + p.t * p.score, 0);
  const slope = (n * sumTS - sumT * sumS) / (n * sumTT - sumT * sumT);
  const lastScore = withScore[withScore.length - 1].score;
  if (slope <= 0) return null;
  if (lastScore >= goalScore) return 0;
  const weeksNeeded = (goalScore - lastScore) / slope;
  return Math.max(0, Math.round(weeksNeeded * 10) / 10);
}

export function getRecoveryMessage(sessions: StoredSession[], goalScore = 50): string {
  const weeks = estimateWeeksToGoal(sessions, goalScore);
  if (weeks == null) return 'Keep practicing to see a recovery estimate.';
  if (weeks === 0) return 'You’ve reached the goal! Keep maintaining.';
  return `At your current rate, estimated ${weeks} week(s) to reach a score of ${goalScore}.`;
}

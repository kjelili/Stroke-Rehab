import { useMemo } from 'react';
import type { SessionSummary, StoredSession } from '../types/session';
import { getRecentSessions } from '../utils/sessionStorage';

interface CoachBannerProps {
  lastSummary?: SessionSummary | null;
  recentSessions?: StoredSession[];
}

export function CoachBanner({ lastSummary, recentSessions: propSessions }: CoachBannerProps) {
  const sessions = propSessions ?? useMemo(() => getRecentSessions(10), []);

  const message = useMemo(() => {
    if (!lastSummary) {
      const total = sessions.length;
      if (total === 0) return 'Complete a session to get personalised feedback.';
      const last = sessions[0];
      if (last.metrics.score != null && last.metrics.score > 0) {
        return `Great start! You scored ${last.metrics.score} in your last ${last.game} session.`;
      }
      return `You have ${total} session(s) recorded. Keep going!`;
    }
    const { game, metrics } = lastSummary;
    const score = metrics.score ?? 0;
    const reaction = metrics.reactionTimeMs;
    const prev = sessions.find(
      (s) => s != null && s.game === game && lastSummary != null && s.endedAt !== lastSummary.endedAt
    );
    const prevScore = prev?.metrics.score;

    if (reaction != null && reaction < 500) {
      return `Quick reaction (${reaction} ms) in ${game}. Well done!`;
    }
    if (prevScore != null && score > prevScore) {
      const pct = Math.round(((score - prevScore) / Math.max(1, prevScore)) * 100);
      return `Your ${game} score improved by ${pct}% compared to your last session.`;
    }
    if (score > 0) {
      return `Session complete. Score: ${score}. You're ${sessions.filter((s) => s.game === game).length} session(s) in on ${game}.`;
    }
    return 'Session complete. Try a guided task (Piano) or keep popping bubbles to see progress.';
  }, [lastSummary, sessions]);

  return (
    <div className="rounded-xl bg-brand-500/10 border border-brand-500/30 p-4 mb-4">
      <p className="text-sm text-brand-200 font-medium">Coach</p>
      <p className="text-sm text-gray-200 mt-1">{message}</p>
    </div>
  );
}

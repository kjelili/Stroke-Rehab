import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLastSession, getRecentSessions } from '../utils/sessionStorage';
import { loadAgentState } from '../utils/agentState';
import { VoiceBanner } from '../components/VoiceBanner';
import { CoachBanner } from '../components/CoachBanner';
import { useSessionOptional } from '../context/SessionContext';
import { getAppConfig, getEnabledGames } from '../config/appConfig';
import { fetchAgenticOrchestrate } from '../api/medgemma';
import type { StoredSession } from '../types/session';
import type { TherapyIntensity } from '../types/agentic';

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function Dashboard() {
  const config = getAppConfig();
  const sessionCtx = useSessionOptional();
  const [lastSession, setLastSession] = useState<StoredSession | null>(null);
  const [recentSessions, setRecentSessions] = useState<StoredSession[]>([]);
  const [medgemmaIntensity, setMedgemmaIntensity] = useState<TherapyIntensity | null>(null);
  const [medgemmaIntervention, setMedgemmaIntervention] = useState<{ reason: string; suggestedAction: string } | null>(null);
  const enabledGames = getEnabledGames();

  useEffect(() => {
    setLastSession(getLastSession());
    setRecentSessions(getRecentSessions(10));
  }, [sessionCtx?.lastCompletedSummary ?? null]);

  useEffect(() => {
    const sessions = getRecentSessions(25);
    const patientState = loadAgentState();
    let cancelled = false;
    (async () => {
      const result = await fetchAgenticOrchestrate({
        sessions,
        patientState,
      });
      if (!cancelled && result) {
        setMedgemmaIntensity(result.recommendedIntensity);
        if (result.interventions.length > 0) {
          setMedgemmaIntervention(result.interventions[0]);
        } else {
          setMedgemmaIntervention(patientState.lastIntervention ?? null);
        }
      } else if (!cancelled) {
        if (patientState.lastIntensity) {
          setMedgemmaIntensity(patientState.lastIntensity);
          setMedgemmaIntervention(patientState.lastIntervention ?? null);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [recentSessions.length, config.medgemmaBackendUrl]);

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">
          Welcome back
        </h1>
        <p className="text-gray-400 mb-6">
          Choose an activity to start your session. Use a well-lit environment and allow camera access for hand tracking.
        </p>

        {config.voiceEnabled && <VoiceBanner />}
        {config.coachEnabled && (
          <CoachBanner lastSummary={sessionCtx?.lastCompletedSummary ?? null} recentSessions={recentSessions} />
        )}

        {(medgemmaIntensity || medgemmaIntervention) && (
          <div className="mb-8 p-4 rounded-xl bg-brand-500/10 border border-brand-500/30">
            <h2 className="font-display font-semibold text-brand-200 mb-2">MedGemma decisions (agentic workflow)</h2>
            {medgemmaIntensity && (
              <p className="text-sm text-brand-100 mb-1">
                <strong className="text-white">Therapy intensity:</strong> MedGemma recommends <strong>{medgemmaIntensity}</strong> for your next session.
              </p>
            )}
            {medgemmaIntervention && (medgemmaIntervention.reason || medgemmaIntervention.suggestedAction) && (
              <p className="text-sm text-amber-100 mt-2">
                <strong className="text-amber-200">Proactive intervention:</strong> {medgemmaIntervention.reason}
                {medgemmaIntervention.suggestedAction && ` — ${medgemmaIntervention.suggestedAction}`}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">State memory: last recommendation is used across sessions.</p>
          </div>
        )}

        {lastSession && typeof lastSession.endedAt === 'number' && (
          <div className="mb-8 p-4 rounded-xl bg-surface-elevated border border-gray-800">
            <h2 className="font-display font-semibold text-white mb-2">Last session</h2>
            <p className="text-gray-400 text-sm">
              {lastSession.game} • {Math.floor(lastSession.durationSeconds / 60)}m {lastSession.durationSeconds % 60}s
              {lastSession.metrics.score != null && ` • Score: ${lastSession.metrics.score}`}
            </p>
            <p className="text-gray-500 text-xs mt-1">{formatDate(lastSession.endedAt)}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          {enabledGames.map((game) => (
            <Link
              key={game.id}
              to={game.path}
              className="tap-target block rounded-2xl bg-surface-elevated border border-gray-800 p-6 sm:p-8 hover:border-brand-500/50 hover:bg-surface-muted/50 transition-all group"
            >
              <span className="text-4xl mb-4 block" aria-hidden>{game.icon}</span>
              <h2 className="font-display font-semibold text-lg text-white mb-2 group-hover:text-brand-400 transition-colors">
                {game.label}
              </h2>
              <p className="text-gray-400 text-sm">{game.description}</p>
            </Link>
          ))}
        </div>

        <div className="mb-8">
          <Link
            to="/app/progress"
            className="tap-target inline-flex rounded-xl bg-surface-elevated border border-gray-800 px-4 py-3 text-sm font-medium text-gray-300 hover:border-brand-500/50 hover:text-brand-400"
          >
            View progress →
          </Link>
        </div>

        {recentSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display font-semibold text-white mb-3">Recent sessions</h2>
            <ul className="space-y-2">
              {recentSessions
                .filter((s) => s != null && typeof s.endedAt === 'number')
                .slice(0, 5)
                .map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-lg bg-surface-muted border border-gray-800 px-4 py-2 text-sm text-gray-300"
                  >
                    <span>{s.game}</span>
                    <span>
                      {Math.floor(s.durationSeconds / 60)}m {s.durationSeconds % 60}s
                      {s.metrics.score != null && ` • ${s.metrics.score}`}
                    </span>
                    <span className="text-gray-500 text-xs">{formatDate(s.endedAt)}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <div className="p-4 rounded-xl bg-surface-muted border border-gray-800">
          <p className="text-sm text-gray-400">
            <strong className="text-gray-300">Tip:</strong> For best results, position your hand in view of the camera and ensure good lighting. You can also tap keys (Piano) or tap bubbles (Bubbles) if the camera is unavailable.
          </p>
        </div>
      </div>
    </div>
  );
}

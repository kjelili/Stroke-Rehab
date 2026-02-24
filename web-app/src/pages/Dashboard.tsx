import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLastSession, getRecentSessions, getSessionsThisWeek, getCurrentStreak } from '../utils/sessionStorage';
import { loadAgentState } from '../utils/agentState';
import { VoiceBanner } from '../components/VoiceBanner';
import { CoachBanner } from '../components/CoachBanner';
import { useSessionOptional } from '../context/SessionContext';
import { getAppConfig, getEnabledGames } from '../config/appConfig';
import { fetchAgenticOrchestrate } from '../api/medgemma';
import type { StoredSession } from '../types/session';
import type { TherapyIntensity } from '../types/agentic';

const ONBOARDING_KEY = 'neuro-recover-onboarding-seen';
function getOnboardingHint(): 'first' | 'returning' | null {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (raw === 'seen') return 'returning';
    return 'first';
  } catch {
    return null;
  }
}
function setOnboardingSeen(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'seen');
  } catch {
    // ignore
  }
}

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
  const [showBreakMessage, setShowBreakMessage] = useState(false);
  const [showEasierNote, setShowEasierNote] = useState(false);
  const [onboardingHint, setOnboardingHint] = useState<'first' | 'returning' | null>(null);
  const enabledGames = getEnabledGames();
  const sessionsThisWeek = getSessionsThisWeek();
  const streak = getCurrentStreak();
  const weeklyGoal = config.weeklyGoalSessions ?? 3;

  useEffect(() => {
    setLastSession(getLastSession());
    setRecentSessions(getRecentSessions(10));
    setOnboardingHint(getOnboardingHint());
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
        sessionCtx?.setSuggestedIntensity(result.recommendedIntensity);
        if (result.interventions.length > 0) {
          setMedgemmaIntervention(result.interventions[0]);
        } else {
          setMedgemmaIntervention(patientState.lastIntervention ?? null);
        }
      } else if (!cancelled) {
        if (patientState.lastIntensity) {
          setMedgemmaIntensity(patientState.lastIntensity);
          sessionCtx?.setSuggestedIntensity(patientState.lastIntensity);
          setMedgemmaIntervention(patientState.lastIntervention ?? null);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [recentSessions.length, config.medgemmaBackendUrl, sessionCtx?.setSuggestedIntensity]);

  const handleSuggestBreak = () => {
    setShowBreakMessage(true);
    setShowEasierNote(false);
  };

  const handleSuggestEasier = () => {
    sessionCtx?.setEasierMode(true);
    setShowEasierNote(true);
    setShowBreakMessage(false);
  };

  const isEdge = config.edgeMode;
  const hasMedGemmaBackend = !isEdge && (config.medgemmaBackendUrl?.trim().length ?? 0) > 0;

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Explicit MedGemma vs Edge deployment status — always visible */}
        {isEdge ? (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/15 border-2 border-amber-500/40 flex items-start gap-3" role="status" aria-label="Edge deployment mode">
            <span className="text-2xl shrink-0" aria-hidden>📴</span>
            <div>
              <h2 className="font-display font-semibold text-amber-200 mb-1">Edge deployment</h2>
              <p className="text-sm text-amber-100/90">
                This app is running <strong>fully offline</strong>. No cloud or MedGemma backend; all session data is stored locally on this device. AI recommendations and reports are unavailable in edge mode.
              </p>
            </div>
          </div>
        ) : hasMedGemmaBackend ? (
          <div className="mb-6 p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-start gap-3" role="status" aria-label="MedGemma in use">
            <span className="text-2xl shrink-0" aria-hidden>🤖</span>
            <div>
              <h2 className="font-display font-semibold text-brand-200 mb-1">MedGemma (HAI-DEF) in use</h2>
              <p className="text-sm text-gray-200 mb-2">
                This app uses <strong>MedGemma</strong> for: recommended therapy intensity, session summaries, and proactive interventions. Reports and clinician tools also use MedGemma.
              </p>
              <details className="text-xs text-gray-400">
                <summary className="cursor-pointer text-brand-300 hover:text-brand-200">Agentic orchestration</summary>
                <p className="mt-2 text-gray-500">
                  MedGemma runs an <strong>agentic workflow</strong>: it receives your session history and can call tools — <code className="bg-black/30 px-1 rounded">set_therapy_intensity</code>, <code className="bg-black/30 px-1 rounded">trigger_regression_intervention</code>, <code className="bg-black/30 px-1 rounded">record_session_summary</code> — to adapt your sessions. The intensity and interventions shown here come from that orchestration.
                </p>
              </details>
            </div>
          </div>
        ) : null}

        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">
          Welcome back
        </h1>
        <p className="text-gray-400 mb-6">
          Choose an activity to start your session. Use a well-lit environment and allow camera access for hand tracking.
        </p>

        {onboardingHint === 'first' && (
          <div className="mb-6 p-4 rounded-xl bg-brand-500/10 border border-brand-500/30">
            <p className="text-sm text-brand-200 font-medium">Getting started</p>
            <p className="text-sm text-gray-200 mt-1">Start with Piano for finger isolation, or try Bubbles for reach and pinch. Complete a session to see your progress.</p>
            <button type="button" onClick={() => { setOnboardingSeen(); setOnboardingHint('returning'); }} className="tap-target mt-2 rounded-lg bg-brand-500/20 px-3 py-1.5 text-sm text-brand-300 hover:bg-brand-500/30">Got it</button>
          </div>
        )}
        {onboardingHint === 'returning' && (lastSession || medgemmaIntensity) && (
          <div className="mb-6 p-4 rounded-xl bg-surface-elevated border border-gray-700">
            <p className="text-sm text-gray-300">
              {lastSession && <span>Last time you did <strong>{lastSession.game}</strong>. </span>}
              {medgemmaIntensity && <span>MedGemma suggests <strong>{medgemmaIntensity}</strong> intensity today.</span>}
            </p>
          </div>
        )}

        {config.voiceEnabled && (
          <VoiceBanner onSuggestBreak={handleSuggestBreak} onSuggestEasier={handleSuggestEasier} />
        )}
        {showBreakMessage && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <p className="text-sm text-amber-200 font-medium">Take a break</p>
            <p className="text-sm text-gray-200 mt-1">Come back when you&apos;re ready. Rest is part of recovery.</p>
            <button type="button" onClick={() => setShowBreakMessage(false)} className="tap-target mt-2 rounded-lg border border-amber-500/50 px-3 py-1.5 text-sm text-amber-200">Dismiss</button>
          </div>
        )}
        {showEasierNote && sessionCtx?.easierMode && (
          <div className="mb-6 p-4 rounded-xl bg-brand-500/10 border border-brand-500/30">
            <p className="text-sm text-brand-200 font-medium">Easier mode on</p>
            <p className="text-sm text-gray-200 mt-1">Sessions will be shorter and games gentler. You can start any activity below.</p>
            <button type="button" onClick={() => { sessionCtx?.setEasierMode(false); setShowEasierNote(false); }} className="tap-target mt-2 rounded-lg bg-brand-500/20 px-3 py-1.5 text-sm text-brand-300">Turn off</button>
          </div>
        )}

        {config.coachEnabled && (
          <CoachBanner
            lastSummary={sessionCtx?.lastCompletedSummary ?? null}
            recentSessions={recentSessions}
            sessionsThisWeek={sessionsThisWeek}
            streak={streak}
            weeklyGoal={weeklyGoal}
          />
        )}

        {(medgemmaIntensity || medgemmaIntervention) && (
          <div className="mb-8 p-4 rounded-xl bg-brand-500/10 border border-brand-500/30">
            <h2 className="font-display font-semibold text-brand-200 mb-2">MedGemma decisions (agentic workflow)</h2>
            <p className="text-xs text-brand-300/80 mb-2">From agentic orchestration: MedGemma calls tools to set intensity and interventions.</p>
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

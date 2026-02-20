import React, { useCallback, useEffect } from 'react';
import type { GameType, SessionMetrics, SessionSummary } from '../types/session';
import { saveSession } from '../utils/sessionStorage';
import { useSession } from '../context/SessionContext';
import { getSessionDurationMinutes, getAppConfig } from '../config/appConfig';

interface SessionWrapperProps {
  game: GameType;
  children: React.ReactNode;
  getCurrentMetrics: () => SessionMetrics;
  durationMinutes?: number;
}

export function SessionWrapper({ game, children, getCurrentMetrics, durationMinutes }: SessionWrapperProps) {
  const defaultDuration = durationMinutes ?? getSessionDurationMinutes();
  const {
    sessionActive,
    game: ctxGame,
    durationSeconds,
    elapsedSeconds,
    startSession,
    endSession,
    setOnSessionComplete,
    setGetCurrentMetrics,
  } = useSession();

  const handleComplete = useCallback((summary: SessionSummary | null | undefined) => {
    if (summary != null && typeof summary.endedAt === 'number') saveSession(summary);
  }, []);

  useEffect(() => {
    setOnSessionComplete(handleComplete);
    return () => setOnSessionComplete(null);
  }, [setOnSessionComplete, handleComplete]);

  useEffect(() => {
    if (sessionActive && ctxGame === game) {
      setGetCurrentMetrics(getCurrentMetrics);
    }
    return () => setGetCurrentMetrics(null);
  }, [sessionActive, ctxGame, game, setGetCurrentMetrics, getCurrentMetrics]);

  const handleStart = useCallback(() => {
    startSession(game, defaultDuration * 60);
  }, [game, defaultDuration, startSession]);

  const handleEnd = useCallback(() => {
    endSession({ metrics: getCurrentMetrics() });
  }, [endSession, getCurrentMetrics]);

  if (!sessionActive || ctxGame !== game) {
    return (
      <>
        <div className="mb-4 flex items-center gap-4">
          <button
            type="button"
            onClick={handleStart}
            className="tap-target rounded-xl bg-brand-500 px-4 py-2 text-white font-medium hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            Start {defaultDuration}-min session
          </button>
        </div>
        {children}
      </>
    );
  }

  const remaining = Math.max(0, durationSeconds - elapsedSeconds);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="rounded-xl bg-surface-elevated border border-gray-700 px-4 py-2 font-mono text-white">
          Time: {mins}:{secs.toString().padStart(2, '0')}
        </div>
        <button
          type="button"
          onClick={handleEnd}
          className="tap-target rounded-xl border border-gray-600 px-4 py-2 text-gray-300 hover:border-brand-500 hover:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          End session
        </button>
      </div>
      {children}
    </>
  );
}

interface SessionCompleteScreenProps {
  summary: SessionSummary;
  onClose: () => void;
}

export function SessionCompleteScreen({ summary, onClose }: SessionCompleteScreenProps) {
  const { game, durationSeconds, metrics } = summary;
  const score = metrics.score ?? 0;
  const reactionMs = metrics.reactionTimeMs;

  const handleExportPdf = () => {
    import('../utils/exportPdf').then(({ exportSessionPdf }) => exportSessionPdf(summary));
  };

  const pdfEnabled = getAppConfig().pdfExportEnabled;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface-elevated border border-gray-700 p-6 shadow-xl">
        <h2 className="font-display font-bold text-xl text-white mb-4">Session complete</h2>
        <p className="text-gray-400 text-sm mb-2">
          Game: <span className="text-white">{game}</span>
        </p>
        <p className="text-gray-400 text-sm mb-2">
          Duration: <span className="text-white">{Math.floor(durationSeconds / 60)}m {durationSeconds % 60}s</span>
        </p>
        {(game === 'piano' || game === 'bubbles' || game === 'grab-cup' || game === 'button' || game === 'reach-hold' || game === 'finger-tap') && (
          <p className="text-gray-400 text-sm mb-2">
            Score: <span className="text-white">{score}</span>
          </p>
        )}
        {reactionMs != null && (
          <p className="text-gray-400 text-sm mb-2">
            Reaction time: <span className="text-white">{reactionMs} ms</span>
          </p>
        )}
        <div className="mt-4 flex gap-2">
          {pdfEnabled && (
            <button
              type="button"
              onClick={handleExportPdf}
              className="tap-target flex-1 rounded-xl border border-gray-600 py-3 text-gray-300 hover:border-brand-500 hover:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              Export PDF
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="tap-target flex-1 rounded-xl bg-brand-500 py-3 text-white font-medium hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

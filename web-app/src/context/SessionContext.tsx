import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { GameType, SessionMetrics, SessionSummary } from '../types/session';

interface SessionContextValue {
  sessionActive: boolean;
  game: GameType | null;
  durationSeconds: number;
  elapsedSeconds: number;
  startedAt: number;
  startSession: (game: GameType, durationSeconds?: number) => void;
  endSession: (summary: Omit<SessionSummary, 'game' | 'startedAt' | 'endedAt' | 'durationSeconds'>) => void;
  onSessionComplete: ((summary: SessionSummary) => void) | null;
  setOnSessionComplete: (fn: ((summary: SessionSummary) => void) | null) => void;
  setGetCurrentMetrics: (fn: (() => SessionMetrics) | null) => void;
  lastCompletedSummary: SessionSummary | null;
  clearLastCompleted: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const DEFAULT_DURATION = 3 * 60; // 3 minutes

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionActive, setSessionActive] = useState(false);
  const [game, setGame] = useState<GameType | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(DEFAULT_DURATION);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [onSessionComplete, setOnSessionComplete] = useState<((summary: SessionSummary) => void) | null>(null);
  const [lastCompletedSummary, setLastCompletedSummary] = useState<SessionSummary | null>(null);
  const getCurrentMetricsRef = useRef<(() => SessionMetrics) | null>(null);

  const setGetCurrentMetrics = useCallback((fn: (() => SessionMetrics) | null) => {
    getCurrentMetricsRef.current = fn;
  }, []);

  const startSession = useCallback((g: GameType, duration?: number) => {
    const dur = duration ?? DEFAULT_DURATION;
    setGame(g);
    setDurationSeconds(dur);
    setElapsedSeconds(0);
    setStartedAt(Date.now());
    setSessionActive(true);
  }, []);

  const endSession = useCallback(
    (partial: Omit<SessionSummary, 'game' | 'startedAt' | 'endedAt' | 'durationSeconds'>) => {
      if (!game || !sessionActive) return;
      const endedAt = Date.now();
      const summary: SessionSummary = {
        game,
        startedAt,
        endedAt,
        durationSeconds: Math.round((endedAt - startedAt) / 1000),
        metrics: partial.metrics,
      };
      setSessionActive(false);
      setGame(null);
      setElapsedSeconds(0);
      setLastCompletedSummary(summary);
      onSessionComplete?.(summary);
    },
    [game, sessionActive, startedAt, onSessionComplete]
  );

  const clearLastCompleted = useCallback(() => setLastCompletedSummary(null), []);

  const value: SessionContextValue = {
    sessionActive,
    game,
    durationSeconds,
    elapsedSeconds,
    startedAt,
    startSession,
    endSession,
    onSessionComplete,
    setOnSessionComplete,
    setGetCurrentMetrics,
    lastCompletedSummary,
    clearLastCompleted,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
      {sessionActive && (
        <SessionTimer
          durationSeconds={durationSeconds}
          startedAt={startedAt}
          onTick={setElapsedSeconds}
          onExpire={() => {
            const g = game;
            const metrics = getCurrentMetricsRef.current?.() ?? {};
            setSessionActive(false);
            setGame(null);
            setElapsedSeconds(0);
            if (g) {
              const endedAt = Date.now();
              const summary: SessionSummary = {
                game: g,
                startedAt,
                endedAt,
                durationSeconds: Math.round((endedAt - startedAt) / 1000),
                metrics,
              };
              setLastCompletedSummary(summary);
              onSessionComplete?.(summary);
            }
          }}
        />
      )}
    </SessionContext.Provider>
  );
}

function SessionTimer({
  durationSeconds,
  startedAt,
  onTick,
  onExpire,
}: {
  durationSeconds: number;
  startedAt: number;
  onTick: (elapsed: number) => void;
  onExpire: () => void;
}) {
  React.useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      onTick(elapsed);
      if (elapsed >= durationSeconds) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [durationSeconds, startedAt, onTick, onExpire]);
  return null;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}

export function useSessionOptional() {
  return useContext(SessionContext);
}

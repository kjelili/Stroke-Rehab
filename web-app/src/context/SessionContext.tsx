import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { GameType, SessionMetrics, SessionSummary } from '../types/session';
import type { TherapyIntensity } from '../types/agentic';

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
  /** MedGemma-recommended intensity; used for default duration when starting a session */
  suggestedIntensity: TherapyIntensity | null;
  setSuggestedIntensity: (v: TherapyIntensity | null) => void;
  /** When true, games use easier settings (e.g. bigger/slower bubbles, shorter sessions) */
  easierMode: boolean;
  setEasierMode: (v: boolean) => void;
  /** Pause/rest during session */
  isPaused: boolean;
  pauseRemainingSeconds: number;
  startPause: (seconds: number) => void;
  clearPause: () => void;
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
  const [suggestedIntensity, setSuggestedIntensity] = useState<TherapyIntensity | null>(null);
  const [easierMode, setEasierMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseEndsAt, setPauseEndsAt] = useState(0);
  const [pauseRemainingSeconds, setPauseRemainingSeconds] = useState(0);
  const getCurrentMetricsRef = useRef<(() => SessionMetrics) | null>(null);
  const startedAtRef = useRef(0);
  const elapsedAtPauseStartRef = useRef(0);

  const setGetCurrentMetrics = useCallback((fn: (() => SessionMetrics) | null) => {
    getCurrentMetricsRef.current = fn;
  }, []);

  const startSession = useCallback((g: GameType, duration?: number) => {
    const dur = duration ?? DEFAULT_DURATION;
    setGame(g);
    setDurationSeconds(dur);
    setElapsedSeconds(0);
    const now = Date.now();
    setStartedAt(now);
    startedAtRef.current = now;
    setSessionActive(true);
    setIsPaused(false);
    setPauseEndsAt(0);
  }, []);

  const startPause = useCallback((seconds: number) => {
    const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
    elapsedAtPauseStartRef.current = elapsed;
    setPauseEndsAt(Date.now() + seconds * 1000);
    setIsPaused(true);
    setPauseRemainingSeconds(seconds);
  }, []);

  const clearPause = useCallback(() => {
    const elapsed = elapsedAtPauseStartRef.current;
    startedAtRef.current = Date.now() - elapsed * 1000;
    setStartedAt(startedAtRef.current);
    setIsPaused(false);
    setPauseEndsAt(0);
    setPauseRemainingSeconds(0);
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
    suggestedIntensity,
    setSuggestedIntensity,
    easierMode,
    setEasierMode,
    isPaused,
    pauseRemainingSeconds,
    startPause,
    clearPause,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
      {sessionActive && (
        <SessionTimer
          durationSeconds={durationSeconds}
          startedAt={startedAt}
          isPaused={isPaused}
          pauseEndsAt={pauseEndsAt}
          pauseRemainingSeconds={pauseRemainingSeconds}
          setPauseRemainingSeconds={setPauseRemainingSeconds}
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
          onPauseEnd={clearPause}
        />
      )}
    </SessionContext.Provider>
  );
}

function SessionTimer({
  durationSeconds,
  startedAt,
  isPaused,
  pauseEndsAt,
  setPauseRemainingSeconds,
  onTick,
  onExpire,
  onPauseEnd,
}: {
  durationSeconds: number;
  startedAt: number;
  isPaused: boolean;
  pauseEndsAt: number;
  pauseRemainingSeconds: number;
  setPauseRemainingSeconds: (n: number) => void;
  onTick: (elapsed: number) => void;
  onExpire: () => void;
  onPauseEnd: () => void;
}) {
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (isPaused) {
        const remaining = Math.max(0, Math.ceil((pauseEndsAt - Date.now()) / 1000));
        setPauseRemainingSeconds(remaining);
        if (remaining <= 0) onPauseEnd();
        return;
      }
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      onTick(elapsed);
      if (elapsed >= durationSeconds) {
        onExpire();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [durationSeconds, startedAt, isPaused, pauseEndsAt, onTick, onExpire, onPauseEnd, setPauseRemainingSeconds]);
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

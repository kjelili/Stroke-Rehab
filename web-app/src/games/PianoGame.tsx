import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CameraView } from '../components/CameraView';
import { SessionWrapper } from '../components/SessionWrapper';
import { useHandTracking, type HandResult, type Landmark } from '../hooks/useHandTracking';
import { playNote } from '../utils/pianoAudio';
import { computeRomPerFinger, computeTremorFromHistory, computeSmoothnessFromHistory } from '../utils/landmarkFeatures';
import type { SessionMetrics } from '../types/session';

const LANDMARK_HISTORY_SIZE = 30;

const KEYS = [
  { id: 'C', note: 'C', fingerIndex: 1, color: 'bg-white' },
  { id: 'D', note: 'D', fingerIndex: 2, color: 'bg-gray-100' },
  { id: 'E', note: 'E', fingerIndex: 3, color: 'bg-white' },
  { id: 'F', note: 'F', fingerIndex: 4, color: 'bg-gray-100' },
  { id: 'G', note: 'G', fingerIndex: 4, color: 'bg-white' },
  { id: 'A', note: 'A', fingerIndex: 3, color: 'bg-gray-100' },
  { id: 'B', note: 'B', fingerIndex: 2, color: 'bg-white' },
  { id: 'C2', note: 'C', fingerIndex: 1, color: 'bg-gray-100' },
];

const MELODY_5 = ['C', 'E', 'G', 'E', 'C'];
const FINGER_TIP_INDEX = [4, 8, 12, 16, 20];

type PianoMode = 'free' | 'task-index' | 'task-melody';

function getActiveFinger(landmarks: Landmark[], keyFingerIndex: number): boolean {
  const tipIndex = FINGER_TIP_INDEX[keyFingerIndex];
  const tip = landmarks[tipIndex];
  const pipIndex = tipIndex - 2;
  const pip = landmarks[Math.max(0, pipIndex)];
  if (!tip || !pip) return false;
  return tip.y < pip.y;
}

export function PianoGame() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [mode, setMode] = useState<PianoMode>('free');
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [touchPressedKeys, setTouchPressedKeys] = useState<Set<string>>(new Set());
  const [handReady, setHandReady] = useState(false);
  const keysPressedCountRef = useRef(0);
  const prevHandKeysRef = useRef<Set<string>>(new Set());
  const taskStartTimeRef = useRef<number>(0);
  const reactionTimeMsRef = useRef<number | undefined>(undefined);
  const landmarkHistoryRef = useRef<Landmark[][]>([]);
  const [taskIndexSuccess, setTaskIndexSuccess] = useState(false);
  const [melodyStep, setMelodyStep] = useState(0);
  const [melodyComplete, setMelodyComplete] = useState(false);

  const onResults = useCallback((results: HandResult[]) => {
    if (!results.length) {
      setPressedKeys(new Set());
      setHandReady(false);
      return;
    }
    setHandReady(true);
    const hand = results[0];
    const history = landmarkHistoryRef.current;
    history.push(hand.landmarks);
    if (history.length > LANDMARK_HISTORY_SIZE) history.shift();
    const next = new Set<string>();
    KEYS.forEach((key) => {
      if (getActiveFinger(hand.landmarks, key.fingerIndex)) next.add(key.id);
    });
    next.forEach((id) => {
      if (!prevHandKeysRef.current.has(id)) {
        keysPressedCountRef.current += 1;
        playNote(id, 150);
        if (mode === 'task-index' && id === 'C' && next.size === 1 && reactionTimeMsRef.current == null) {
          reactionTimeMsRef.current = Date.now() - taskStartTimeRef.current;
          setTaskIndexSuccess(true);
        }
        if (mode === 'task-melody' && melodyStep < MELODY_5.length && MELODY_5[melodyStep] === id) {
          if (reactionTimeMsRef.current == null) reactionTimeMsRef.current = Date.now() - taskStartTimeRef.current;
          if (melodyStep + 1 >= MELODY_5.length) setMelodyComplete(true);
          setMelodyStep((s) => s + 1);
        }
      }
    });
    prevHandKeysRef.current = next;
    setPressedKeys(next);
  }, [mode, melodyStep]);

  useHandTracking({
    videoRef,
    numHands: 1,
    onResults,
    enabled: videoReady,
  });

  const startTaskIndex = useCallback(() => {
    setMode('task-index');
    setTaskIndexSuccess(false);
    reactionTimeMsRef.current = undefined;
    taskStartTimeRef.current = Date.now();
  }, []);

  const startTaskMelody = useCallback(() => {
    setMode('task-melody');
    setMelodyStep(0);
    setMelodyComplete(false);
    reactionTimeMsRef.current = undefined;
    taskStartTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (mode === 'task-index' || mode === 'task-melody') {
      taskStartTimeRef.current = Date.now();
    }
  }, [mode]);

  const displayedKeys = new Set([...pressedKeys, ...touchPressedKeys]);

  const handleKeyClick = useCallback((keyId: string) => {
    setTouchPressedKeys((prev) => new Set(prev).add(keyId));
    keysPressedCountRef.current += 1;
    playNote(keyId, 150);
    if (mode === 'task-index' && keyId === 'C' && reactionTimeMsRef.current == null) {
      reactionTimeMsRef.current = Date.now() - taskStartTimeRef.current;
      setTaskIndexSuccess(true);
    }
    if (mode === 'task-melody' && melodyStep < MELODY_5.length && MELODY_5[melodyStep] === keyId) {
      if (reactionTimeMsRef.current == null) reactionTimeMsRef.current = Date.now() - taskStartTimeRef.current;
      if (melodyStep + 1 >= MELODY_5.length) setMelodyComplete(true);
      setMelodyStep((s) => s + 1);
    }
    setTimeout(() => {
      setTouchPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(keyId);
        return next;
      });
    }, 200);
  }, [mode, melodyStep]);

  const getCurrentMetrics = useCallback((): SessionMetrics => {
    const history = landmarkHistoryRef.current;
    const last = history.length ? history[history.length - 1] : null;
    const romPerFinger = last ? computeRomPerFinger(last) : undefined;
    const tremorEstimate = history.length >= 5 ? computeTremorFromHistory(history) : undefined;
    const smoothnessEstimate = history.length >= 4 ? computeSmoothnessFromHistory(history) : undefined;
    return {
      score: keysPressedCountRef.current,
      keysPressed: KEYS.map((k) => k.id),
      reactionTimeMs: reactionTimeMsRef.current,
      romPerFinger: romPerFinger?.some((v) => v > 0) ? romPerFinger : undefined,
      tremorEstimate,
      smoothnessEstimate,
    };
  }, []);

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
            Virtual Piano
          </h1>
          <Link
            to="/app"
            className="text-sm text-gray-400 hover:text-brand-400 transition-colors tap-target rounded-lg px-2 py-1"
          >
            ← Dashboard
          </Link>
        </div>

        <SessionWrapper game="piano" getCurrentMetrics={getCurrentMetrics} durationMinutes={3}>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => setMode('free')}
              className={`tap-target rounded-lg px-3 py-2 text-sm font-medium ${mode === 'free' ? 'bg-brand-500 text-white' : 'bg-surface-muted text-gray-400 hover:text-white'}`}
            >
              Free play
            </button>
            <button
              type="button"
              onClick={startTaskIndex}
              className={`tap-target rounded-lg px-3 py-2 text-sm font-medium ${mode === 'task-index' ? 'bg-brand-500 text-white' : 'bg-surface-muted text-gray-400 hover:text-white'}`}
            >
              Task: Index finger
            </button>
            <button
              type="button"
              onClick={startTaskMelody}
              className={`tap-target rounded-lg px-3 py-2 text-sm font-medium ${mode === 'task-melody' ? 'bg-brand-500 text-white' : 'bg-surface-muted text-gray-400 hover:text-white'}`}
            >
              Task: 5-note melody
            </button>
          </div>

          {mode === 'task-index' && (
            <p className="text-brand-400 font-medium mb-2">
              Press only your index finger (key C).
            </p>
          )}
          {mode === 'task-melody' && (
            <p className="text-brand-400 font-medium mb-2">
              Play this melody in order: C → E → G → E → C. Next: {melodyStep < MELODY_5.length ? MELODY_5[melodyStep] : 'Done!'}
            </p>
          )}
          {taskIndexSuccess && mode === 'task-index' && (
            <p className="text-green-400 text-sm mb-2">
              Correct! Reaction time: {reactionTimeMsRef.current ?? 0} ms
            </p>
          )}
          {melodyComplete && mode === 'task-melody' && (
            <p className="text-green-400 text-sm mb-2">
              Melody complete! Reaction time (first key): {reactionTimeMsRef.current ?? 0} ms
            </p>
          )}

          <p className="text-gray-400 text-sm mb-6">
            Extend one finger at a time or tap keys. Index = C, Middle = E, Ring = G, Pinky = B.
          </p>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <CameraView
              onVideoReady={(el) => {
                (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
                setVideoReady(!!el);
              }}
              className="w-full"
            />
            <div className="flex flex-col justify-center">
              <div className="flex gap-1 sm:gap-2 justify-center flex-wrap">
                {KEYS.map((key) => (
                  <button
                    key={key.id}
                    type="button"
                    onClick={() => handleKeyClick(key.id)}
                    className={`
                      w-10 sm:w-14 h-24 sm:h-32 rounded-b border-2 border-gray-700 transition-transform tap-target
                      ${key.color} ${displayedKeys.has(key.id) ? 'scale-y-95 border-brand-500 shadow-inner' : 'border-gray-600'}
                      ${mode === 'task-index' && key.id === 'C' ? 'ring-2 ring-brand-400' : ''}
                    `}
                    style={{ minWidth: '44px' }}
                    aria-label={`Key ${key.note}`}
                  />
                ))}
              </div>
              {handReady ? (
                <p className="text-brand-400 text-sm mt-4 text-center">Hand detected — extend fingers or tap keys</p>
              ) : (
                <p className="text-gray-500 text-sm mt-4 text-center">Tap keys to play, or show your hand to the camera</p>
              )}
            </div>
          </div>
        </SessionWrapper>

        <div className="rounded-xl bg-surface-muted border border-gray-800 p-4">
          <p className="text-sm text-gray-400">
            <strong className="text-gray-300">Rehab focus:</strong> Finger isolation, range of motion, reaction time. Use guided tasks to measure reaction time.
          </p>
        </div>
      </div>
    </div>
  );
}

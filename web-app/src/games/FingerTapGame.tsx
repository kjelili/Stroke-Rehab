import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CameraView } from '../components/CameraView';
import { SessionWrapper } from '../components/SessionWrapper';
import { useHandTracking, type HandResult, type Landmark } from '../hooks/useHandTracking';
import type { SessionMetrics } from '../types/session';
import { playStep } from '../utils/gameSounds';

const FINGER_TIP_INDEX = [4, 8, 12, 16, 20];
const PIP_OFFSET = 2;

function getExtendedFinger(landmarks: Landmark[]): number | null {
  if (landmarks.length < 21) return null;
  for (let i = 0; i < 5; i++) {
    const tipIdx = FINGER_TIP_INDEX[i];
    const pipIdx = Math.max(0, tipIdx - PIP_OFFSET);
    const tip = landmarks[tipIdx];
    const pip = landmarks[pipIdx];
    if (!tip || !pip) continue;
    if (tip.y < pip.y) return i;
  }
  return null;
}

const SEQUENCE = [1, 2, 1, 2, 0, 3, 1, 2];
const COOLDOWN_MS = 400;

export function FingerTapGame() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [score, setScore] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);
  const lastTapRef = useRef(0);

  const onResults = useCallback((results: HandResult[]) => {
    if (!results.length) return;
    const finger = getExtendedFinger(results[0].landmarks);
    if (finger == null) return;
    if (Date.now() - lastTapRef.current < COOLDOWN_MS) return;
    const expected = SEQUENCE[hintIndex];
    if (finger === expected) {
      lastTapRef.current = Date.now();
      setScore((s) => s + 1);
      setHintIndex((i) => (i + 1) % SEQUENCE.length);
      playStep();
    }
  }, [hintIndex]);

  useHandTracking({
    videoRef,
    numHands: 1,
    onResults,
    enabled: videoReady,
  });

  const fingerNames = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];
  const nextFinger = fingerNames[SEQUENCE[hintIndex]];

  const handleTap = useCallback((fingerIndex: number) => {
    if (Date.now() - lastTapRef.current < COOLDOWN_MS) return;
    const expected = SEQUENCE[hintIndex];
    if (fingerIndex === expected) {
      lastTapRef.current = Date.now();
      setScore((s) => s + 1);
      setHintIndex((i) => (i + 1) % SEQUENCE.length);
      playStep();
    }
  }, [hintIndex]);

  useEffect(() => {
    const t = setInterval(() => setHintIndex((i) => (i + 1) % SEQUENCE.length), 5000);
    return () => clearInterval(t);
  }, []);

  const getCurrentMetrics = useCallback((): SessionMetrics => {
    return { score };
  }, [score]);

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-xl sm:text-2xl text-white">Finger tap</h1>
          <Link to="/app" className="text-sm text-gray-400 hover:text-brand-400 tap-target rounded-lg px-2 py-1">
            ← Dashboard
          </Link>
        </div>

        <SessionWrapper game="finger-tap" getCurrentMetrics={getCurrentMetrics} durationMinutes={3}>
          <p className="text-gray-400 text-sm mb-6">
            Extend the finger shown, or tap the matching button. Alternating fingers for coordination.
          </p>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <CameraView
              onVideoReady={(el) => {
                (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
                setVideoReady(!!el);
              }}
              className="w-full"
            />
            <div className="flex flex-col justify-center rounded-xl bg-surface-elevated border border-gray-800 p-8 min-h-[240px]">
              <p className="text-white font-medium mb-2">Tap: <span className="text-brand-400">{nextFinger}</span></p>
              <p className="text-brand-400 text-lg font-semibold mb-4">Score: {score}</p>
              <div className="flex flex-wrap gap-2">
                {fingerNames.map((name, i) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleTap(i)}
                    className={`tap-target rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      SEQUENCE[hintIndex] === i
                        ? 'bg-brand-500 text-white'
                        : 'bg-surface-muted text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-surface-muted border border-gray-800 p-4">
            <p className="text-sm text-gray-400">
              <strong className="text-gray-300">Rehab focus:</strong> Finger isolation and sequencing. Follow the cue or use the buttons.
            </p>
          </div>
        </SessionWrapper>
      </div>
    </div>
  );
}

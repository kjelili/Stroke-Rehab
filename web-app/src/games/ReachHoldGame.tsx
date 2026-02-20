import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CameraView } from '../components/CameraView';
import { SessionWrapper } from '../components/SessionWrapper';
import { useHandTracking, type HandResult, type Landmark } from '../hooks/useHandTracking';
import type { SessionMetrics } from '../types/session';
import { playReach } from '../utils/gameSounds';

const TARGET_X = 0.5;
const TARGET_Y = 0.4;
const TARGET_R = 0.08;
const HOLD_MS = 1500;

function indexTip(landmarks: Landmark[]): { x: number; y: number } | null {
  if (landmarks.length < 9) return null;
  const t = landmarks[8];
  return { x: t.x, y: t.y };
}

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function ReachHoldGame() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [reaching, setReaching] = useState(false);
  const [score, setScore] = useState(0);
  const holdStartRef = useRef<number | null>(null);
  const lastScoredRef = useRef(0);

  const onResults = useCallback((results: HandResult[]) => {
    if (!results.length) {
      setReaching(false);
      holdStartRef.current = null;
      return;
    }
    const tip = indexTip(results[0].landmarks);
    if (!tip) {
      holdStartRef.current = null;
      setReaching(false);
      return;
    }
    const d = distance(tip.x, tip.y, TARGET_X, TARGET_Y);
    const inZone = d < TARGET_R;
    if (inZone) {
      if (!holdStartRef.current) holdStartRef.current = Date.now();
      const elapsed = Date.now() - holdStartRef.current;
      if (elapsed >= HOLD_MS && Date.now() - lastScoredRef.current > 800) {
        lastScoredRef.current = Date.now();
        holdStartRef.current = null;
        setScore((s) => s + 1);
        playReach();
      }
      setReaching(true);
    } else {
      holdStartRef.current = null;
      setReaching(false);
    }
  }, []);

  useHandTracking({
    videoRef,
    numHands: 1,
    onResults,
    enabled: videoReady,
  });

  const handleTouchTarget = useCallback(() => {
    if (Date.now() - lastScoredRef.current > 800) {
      lastScoredRef.current = Date.now();
      setScore((s) => s + 1);
      playReach();
    }
  }, []);

  const getCurrentMetrics = useCallback((): SessionMetrics => {
    return { score };
  }, [score]);

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-xl sm:text-2xl text-white">Reach & hold</h1>
          <Link to="/app" className="text-sm text-gray-400 hover:text-brand-400 tap-target rounded-lg px-2 py-1">
            ← Dashboard
          </Link>
        </div>

        <SessionWrapper game="reach-hold" getCurrentMetrics={getCurrentMetrics} durationMinutes={3}>
          <p className="text-gray-400 text-sm mb-6">
            Reach the target with your index finger and hold for 1.5s, or tap the circle. Builds reach and stability.
          </p>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <CameraView
              onVideoReady={(el) => {
                (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
                setVideoReady(!!el);
              }}
              className="w-full"
            >
              <div
                className="absolute rounded-full border-4 border-brand-400 bg-brand-500/30 w-16 h-16 tap-target cursor-pointer"
                style={{ left: '50%', top: '40%', transform: 'translate(-50%, -50%)' }}
                onClick={handleTouchTarget}
                onKeyDown={(e) => e.key === 'Enter' && handleTouchTarget()}
                role="button"
                tabIndex={0}
                aria-label="Reach target"
              />
            </CameraView>
            <div className="flex flex-col justify-center items-center rounded-xl bg-surface-elevated border border-gray-800 p-8 min-h-[240px]">
              <div className="text-6xl mb-4" aria-hidden>🎯</div>
              <p className="text-white font-medium mb-2">{reaching ? 'Hold…' : 'Reach the target'}</p>
              <p className="text-brand-400 text-lg font-semibold">Reaches: {score}</p>
            </div>
          </div>

          <div className="rounded-xl bg-surface-muted border border-gray-800 p-4">
            <p className="text-sm text-gray-400">
              <strong className="text-gray-300">Rehab focus:</strong> Shoulder and arm reach, index finger extension, holding position.
            </p>
          </div>
        </SessionWrapper>
      </div>
    </div>
  );
}

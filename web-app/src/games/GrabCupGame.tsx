import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CameraView } from '../components/CameraView';
import { SessionWrapper } from '../components/SessionWrapper';
import { useHandTracking, type HandResult, type Landmark } from '../hooks/useHandTracking';
import type { SessionMetrics } from '../types/session';
import { playGrab } from '../utils/gameSounds';

function distance(a: Landmark, b: Landmark) {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));
}

function isFistClosed(landmarks: Landmark[]): boolean {
  if (landmarks.length < 21) return false;
  const wrist = landmarks[0];
  const tips = [4, 8, 12, 16, 20].map((i) => landmarks[i]);
  const avgDist = tips.reduce((acc, t) => acc + distance(t, wrist), 0) / tips.length;
  return avgDist < 0.15;
}

const HOLD_MS = 2000;

export function GrabCupGame() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [grabbing, setGrabbing] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const holdStartRef = useRef<number | null>(null);

  const onResults = useCallback((results: HandResult[]) => {
    if (!results.length) {
      setGrabbing(false);
      holdStartRef.current = null;
      return;
    }
    const closed = isFistClosed(results[0].landmarks);
    if (closed) {
      if (!holdStartRef.current) holdStartRef.current = Date.now();
      const elapsed = Date.now() - holdStartRef.current;
      if (elapsed >= HOLD_MS) {
        holdStartRef.current = null;
        setSuccessCount((s) => s + 1);
        playGrab();
      }
      setGrabbing(true);
    } else {
      holdStartRef.current = null;
      setGrabbing(false);
    }
  }, []);

  useHandTracking({
    videoRef,
    numHands: 1,
    onResults,
    enabled: videoReady,
  });

  const getCurrentMetrics = useCallback((): SessionMetrics => {
    return { score: successCount };
  }, [successCount]);

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
            Grab cup
          </h1>
          <Link to="/app" className="text-sm text-gray-400 hover:text-brand-400 tap-target rounded-lg px-2 py-1">
            ← Dashboard
          </Link>
        </div>

        <SessionWrapper game="grab-cup" getCurrentMetrics={getCurrentMetrics} durationMinutes={3}>
          <p className="text-gray-400 text-sm mb-6">
            Make a fist (grab) and hold for 2 seconds to &quot;pick up&quot; the cup. Repeat to build grasp strength.
          </p>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <CameraView
              onVideoReady={(el) => {
                (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
                setVideoReady(!!el);
              }}
              className="w-full"
            />
            <div className="flex flex-col justify-center items-center rounded-xl bg-surface-elevated border border-gray-800 p-8 min-h-[240px]">
              <div className="text-6xl mb-4" aria-hidden>🥤</div>
              <p className="text-white font-medium mb-2">
                {grabbing ? 'Hold...' : 'Make a fist to grab'}
              </p>
              <p className="text-brand-400 text-lg font-semibold">Grabs: {successCount}</p>
            </div>
          </div>
        </SessionWrapper>

        <div className="rounded-xl bg-surface-muted border border-gray-800 p-4">
          <p className="text-sm text-gray-400">
            <strong className="text-gray-300">ADL focus:</strong> Simulates grabbing a cup. Improves hand closure and hold.
          </p>
        </div>
      </div>
    </div>
  );
}

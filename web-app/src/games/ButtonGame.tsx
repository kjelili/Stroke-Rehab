import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CameraView } from '../components/CameraView';
import { SessionWrapper } from '../components/SessionWrapper';
import { useHandTracking, type HandResult, type Landmark } from '../hooks/useHandTracking';
import type { SessionMetrics } from '../types/session';
import { playClick } from '../utils/gameSounds';

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function getPinchPoint(landmarks: Landmark[]): { x: number; y: number } | null {
  if (landmarks.length < 9) return null;
  const indexTip = landmarks[8];
  const thumbTip = landmarks[4];
  const d = distance(indexTip.x, indexTip.y, thumbTip.x, thumbTip.y);
  if (d > 0.08) return null;
  return { x: (indexTip.x + thumbTip.x) / 2, y: (indexTip.y + thumbTip.y) / 2 };
}

const BUTTON_X = 0.5;
const BUTTON_Y = 0.5;
const BUTTON_R = 0.08;

export function ButtonGame() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [score, setScore] = useState(0);
  const lastPopRef = useRef(0);

  const onResults = useCallback((results: HandResult[]) => {
    if (!results.length) return;
    const pinch = getPinchPoint(results[0].landmarks);
    if (!pinch) return;
    const d = distance(pinch.x, pinch.y, BUTTON_X, BUTTON_Y);
    if (d < BUTTON_R && Date.now() - lastPopRef.current > 500) {
      lastPopRef.current = Date.now();
      setScore((s) => s + 1);
      playClick();
    }
  }, []);

  useHandTracking({
    videoRef,
    numHands: 1,
    onResults,
    enabled: videoReady,
  });

  const handleTap = useCallback(() => {
    if (Date.now() - lastPopRef.current > 500) {
      lastPopRef.current = Date.now();
      setScore((s) => s + 1);
      playClick();
    }
  }, []);

  const getCurrentMetrics = useCallback((): SessionMetrics => {
    return { score };
  }, [score]);

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
            Button
          </h1>
          <Link to="/app" className="text-sm text-gray-400 hover:text-brand-400 tap-target rounded-lg px-2 py-1">
            ← Dashboard
          </Link>
        </div>

        <SessionWrapper game="button" getCurrentMetrics={getCurrentMetrics} durationMinutes={3}>
          <p className="text-gray-400 text-sm mb-6">
            Pinch (thumb + index) on the button, or tap it. Simulates buttoning a shirt.
          </p>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <CameraView
              onVideoReady={(el) => {
                (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
                setVideoReady(!!el);
              }}
              className="w-full"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleTap}
                  className="tap-target w-16 h-16 rounded-full bg-brand-500 border-4 border-white/50 hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  style={{ transform: 'translate(-50%, -50%)' }}
                  aria-label="Press button"
                />
              </div>
            </CameraView>
            <div className="flex flex-col justify-center rounded-xl bg-surface-elevated border border-gray-800 p-8 min-h-[240px]">
              <p className="text-white font-medium mb-2">Button presses</p>
              <p className="text-brand-400 text-2xl font-semibold">{score}</p>
            </div>
          </div>
        </SessionWrapper>

        <div className="rounded-xl bg-surface-muted border border-gray-800 p-4">
          <p className="text-sm text-gray-400">
            <strong className="text-gray-300">ADL focus:</strong> Simulates buttoning. Improves pinch precision.
          </p>
        </div>
      </div>
    </div>
  );
}

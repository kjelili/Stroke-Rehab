import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CameraView } from '../components/CameraView';
import { SessionWrapper } from '../components/SessionWrapper';
import { useHandTracking, type HandResult, type Landmark } from '../hooks/useHandTracking';
import type { SessionMetrics } from '../types/session';
import { playPop } from '../utils/gameSounds';

interface Bubble {
  id: number;
  x: number;
  y: number;
  r: number;
  color: string;
}

const COLORS = ['#33a3ff', '#59c2ff', '#8ed9ff', '#1a84f5'];

const ADAPT_WINDOW_MS = 10000;
const MIN_SPAWN_MS = 800;
const MAX_SPAWN_MS = 2500;
const BASE_SPAWN_MS = 1500;
const MIN_SIZE = 0.03;
const MAX_SIZE = 0.08;

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

export function BubbleGame() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const nextIdRef = useRef(0);
  const [score, setScore] = useState(0);
  const popTimestampsRef = useRef<number[]>([]);
  const [spawnIntervalMs, setSpawnIntervalMs] = useState(BASE_SPAWN_MS);
  const sizeMinRef = useRef(0.04);
  const sizeRangeRef = useRef(0.03);

  const spawn = useCallback(() => {
    const sizeMin = sizeMinRef.current;
    const sizeRange = sizeRangeRef.current;
    setBubbles((prev) => {
      const next = [...prev];
      if (next.length >= 12) return next;
      next.push({
        id: nextIdRef.current++,
        x: Math.random() * 0.8 + 0.1,
        y: Math.random() * 0.6 + 0.2,
        r: sizeMin + Math.random() * sizeRange,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
      return next;
    });
  }, []);

  useEffect(() => {
    spawn();
    const t = setInterval(spawn, spawnIntervalMs);
    return () => clearInterval(t);
  }, [spawn, spawnIntervalMs]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      popTimestampsRef.current = popTimestampsRef.current.filter((t) => now - t < ADAPT_WINDOW_MS);
      const recentPops = popTimestampsRef.current.length;
      setSpawnIntervalMs((prev) => {
        if (recentPops <= 1) {
          sizeMinRef.current = Math.min(MAX_SIZE - 0.02, sizeMinRef.current * 1.05);
          sizeRangeRef.current = Math.min(0.04, sizeRangeRef.current * 1.05);
          return Math.min(MAX_SPAWN_MS, prev * 1.15);
        }
        if (recentPops >= 5) {
          sizeMinRef.current = Math.max(MIN_SIZE, sizeMinRef.current * 0.96);
          sizeRangeRef.current = Math.max(0.02, sizeRangeRef.current * 0.96);
          return Math.max(MIN_SPAWN_MS, prev * 0.92);
        }
        return prev;
      });
    }, ADAPT_WINDOW_MS);
    return () => clearInterval(interval);
  }, []);

  const onResults = useCallback((results: HandResult[]) => {
    if (!results.length) return;
    const pinch = getPinchPoint(results[0].landmarks);
    if (!pinch) return;
    setBubbles((prev) => {
      const hit = prev.find((b) => distance(pinch!.x, pinch!.y, b.x, b.y) < b.r + 0.03);
      if (hit) {
        popTimestampsRef.current.push(Date.now());
        setScore((s) => s + 1);
        playPop();
        return prev.filter((b) => b.id !== hit.id);
      }
      return prev;
    });
  }, []);

  useHandTracking({
    videoRef,
    numHands: 1,
    onResults,
    enabled: videoReady,
  });

  const popBubble = useCallback((bubble: Bubble) => {
    popTimestampsRef.current.push(Date.now());
    setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
    setScore((s) => s + 1);
    playPop();
  }, []);

  const getCurrentMetrics = useCallback((): SessionMetrics => {
    return { score };
  }, [score]);

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
            Bubble Popper
          </h1>
          <Link
            to="/app"
            className="text-sm text-gray-400 hover:text-brand-400 transition-colors tap-target rounded-lg px-2 py-1"
          >
            ← Dashboard
          </Link>
        </div>

        <SessionWrapper game="bubbles" getCurrentMetrics={getCurrentMetrics} durationMinutes={3}>
          <p className="text-gray-400 text-sm mb-6">
            Pinch (thumb + index) or tap to pop. Difficulty adapts: slower/larger if you need a break, faster/smaller if you’re doing well.
          </p>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <CameraView
              onVideoReady={(el) => {
                (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
                setVideoReady(!!el);
              }}
              className="w-full"
            >
              <div className="absolute inset-0">
                {bubbles.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => popBubble(b)}
                    className="absolute rounded-full border-2 border-white/30 transition-transform hover:scale-110 tap-target focus:outline-none focus:ring-2 focus:ring-brand-500"
                    style={{
                      left: `${b.x * 100}%`,
                      top: `${b.y * 100}%`,
                      width: `${Math.max(28, b.r * 400)}px`,
                      height: `${Math.max(28, b.r * 400)}px`,
                      backgroundColor: b.color,
                      transform: 'translate(-50%, -50%)',
                    }}
                    aria-label="Pop bubble"
                  />
                ))}
              </div>
            </CameraView>
            <div className="flex flex-col justify-center rounded-xl bg-surface-elevated border border-gray-800 p-6 min-h-[200px]">
              <p className="font-display font-semibold text-white text-2xl mb-2">Score: {score}</p>
              <p className="text-gray-400 text-sm">
                Bubbles appear over the camera view. Pinch or tap to pop. Difficulty adapts in real time.
              </p>
            </div>
          </div>
        </SessionWrapper>

        <div className="rounded-xl bg-surface-muted border border-gray-800 p-4">
          <p className="text-sm text-gray-400">
            <strong className="text-gray-300">Rehab focus:</strong> Reach, pinch, and accuracy. Slower/larger bubbles if fatigued; smaller/faster if improving.
          </p>
        </div>
      </div>
    </div>
  );
}

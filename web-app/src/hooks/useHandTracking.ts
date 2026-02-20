import { useCallback, useEffect, useRef, useState } from 'react';

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface HandResult {
  handedness: string;
  landmarks: Landmark[];
  worldLandmarks?: Landmark[];
}

export interface UseHandTrackingOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  modelPath?: string;
  numHands?: number;
  onResults?: (results: HandResult[]) => void;
  enabled?: boolean;
}

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const DEFAULT_MODEL_PATH = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

type HandLandmarkerInstance = {
  detectForVideo: (video: HTMLVideoElement, timestamp: number) => {
    landmarks: Landmark[][];
    handedness?: Array<{ categoryName?: string }>;
  };
};

export function useHandTracking({
  videoRef,
  modelPath = DEFAULT_MODEL_PATH,
  numHands = 1,
  onResults,
  enabled = true,
}: UseHandTrackingOptions) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rafRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  const handLandmarkerRef = useRef<HandLandmarkerInstance | null>(null);
  const onResultsRef = useRef(onResults);
  onResultsRef.current = onResults;

  const init = useCallback(async () => {
    if (!enabled) return;
    try {
      setError(null);
      const vision = await import('@mediapipe/tasks-vision');
      const { FilesetResolver, HandLandmarker } = vision;
      const wasm = await FilesetResolver.forVisionTasks(WASM_URL);
      const handLandmarker = await HandLandmarker.createFromOptions(wasm, {
        baseOptions: { modelAssetPath: modelPath },
        numHands,
        runningMode: 'VIDEO',
      });
      handLandmarkerRef.current = handLandmarker as HandLandmarkerInstance;
      setReady(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load hand tracking';
      setError(msg);
      setReady(false);
    }
  }, [modelPath, numHands, enabled]);

  useEffect(() => {
    init();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [init]);

  const detect = useCallback(() => {
    const video = videoRef.current;
    const hl = handLandmarkerRef.current;
    if (!video || !hl || !ready || video.readyState < 2) return;

    const currentTime = video.currentTime;
    if (currentTime === lastVideoTimeRef.current) return;
    lastVideoTimeRef.current = currentTime;

    try {
      const result = hl.detectForVideo(video, performance.now());
      if (!result?.landmarks?.length) return;
      const hands: HandResult[] = result.landmarks.map((landmarks, i) => ({
        handedness: result.handedness?.[i]?.categoryName ?? 'Unknown',
        landmarks,
      }));
      onResultsRef.current?.(hands);
    } catch {
      // ignore frame errors
    }
  }, [videoRef, ready]);

  useEffect(() => {
    if (!ready || !enabled) return;
    const loop = () => {
      detect();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, enabled, detect]);

  return { ready, error, init };
}

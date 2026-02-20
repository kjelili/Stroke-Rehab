/**
 * Local feature engineering from MediaPipe hand landmarks: ROM, tremor, smoothness.
 * Used for session metrics (no cloud); supports feasibility (ROM, tremor, smoothness).
 */

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

// MediaPipe hand: tip indices 4,8,12,16,20; PIP 2,6,10,14,18 (thumb IP=2)
const TIP_INDEX = [4, 8, 12, 16, 20];
const PIP_INDEX = [2, 6, 10, 14, 18];

/**
 * Range of motion (0–1) per finger [thumb, index, middle, ring, pinky].
 * Extension in image coords: pip.y - tip.y (y down) → higher = more extended. Normalized and clamped.
 */
export function computeRomPerFinger(landmarks: Landmark[]): number[] {
  if (!landmarks || landmarks.length < 21) return [0, 0, 0, 0, 0];
  const out: number[] = [];
  for (let i = 0; i < 5; i++) {
    const tip = landmarks[TIP_INDEX[i]];
    const pip = landmarks[PIP_INDEX[i]];
    if (!tip || !pip) {
      out.push(0);
      continue;
    }
    const extension = pip.y - tip.y;
    const normalized = Math.max(0, Math.min(1, (extension + 0.1) / 0.4));
    out.push(normalized);
  }
  return out;
}

/**
 * Tremor: variance of wrist (landmark 0) position over recent frames. Higher = more variation.
 */
export function computeTremorFromHistory(history: Landmark[][]): number {
  if (!history?.length || history.length < 5) return 0;
  const xs = history.map((h) => (h[0]?.x ?? 0));
  const ys = history.map((h) => (h[0]?.y ?? 0));
  const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
  const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;
  const variance = xs.reduce((s, x) => s + (x - meanX) ** 2, 0) / xs.length + ys.reduce((s, y) => s + (y - meanY) ** 2, 0) / ys.length;
  return Math.min(1, Math.sqrt(variance) * 10);
}

/**
 * Smoothness: inverse of mean squared "jerk" (second derivative of wrist position). Higher = smoother motion.
 */
export function computeSmoothnessFromHistory(history: Landmark[][]): number {
  if (!history?.length || history.length < 4) return 0;
  const x = history.map((h) => h[0]?.x ?? 0);
  const y = history.map((h) => h[0]?.y ?? 0);
  let jerkSq = 0;
  for (let i = 2; i < x.length - 1; i++) {
    const ax = x[i - 2] - 2 * x[i - 1] + x[i];
    const ay = y[i - 2] - 2 * y[i - 1] + y[i];
    jerkSq += ax * ax + ay * ay;
  }
  const n = Math.max(1, x.length - 3);
  const jerk = jerkSq / n;
  return Math.min(1, 1 / (1 + jerk * 100));
}

/**
 * Short feedback sounds for games (Web Audio API). No external files.
 */

let audioContext: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

function playTone(
  freq: number,
  durationMs: number,
  type: OscillatorType = 'sine',
  volume = 0.12
): void {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationMs / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // ignore
  }
}

/** Bubble pop: short bright blip */
export function playPop(): void {
  playTone(880, 80, 'sine', 0.1);
  setTimeout(() => playTone(1320, 60, 'sine', 0.06), 40);
}

/** Button tap: soft click */
export function playClick(): void {
  playTone(600, 50, 'sine', 0.08);
}

/** Grab success: low satisfying thud */
export function playGrab(): void {
  playTone(180, 120, 'sine', 0.15);
  setTimeout(() => playTone(140, 80, 'sine', 0.08), 60);
}

/** Reach target: gentle chime */
export function playReach(): void {
  playTone(523, 100, 'sine', 0.1);
  setTimeout(() => playTone(659, 80, 'sine', 0.07), 50);
}

/** Finger tap / step success */
export function playStep(): void {
  playTone(440, 60, 'sine', 0.09);
}

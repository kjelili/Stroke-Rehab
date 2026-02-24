/**
 * Central app configuration for flexibility and feature toggles.
 * Change these values to tune behavior without touching component logic.
 * Can be extended to load from env or a remote config later.
 */

import type { GameType } from '../types/session';
import type { TherapyIntensity } from '../types/agentic';

export interface GameConfig {
  id: GameType;
  path: string;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
}

/** Session duration presets (minutes) for Short / Standard / Longer */
export const SESSION_DURATION_PRESETS = {
  short: 2,
  standard: 3,
  longer: 5,
} as const;

export type DurationPreset = keyof typeof SESSION_DURATION_PRESETS;

export interface AppConfig {
  /** When true, app runs in edge deployment: no cloud backend, all data and logic local. Use for hospital tablet, community laptop, rural clinic (no internet). */
  edgeMode: boolean;
  /** Backend URL for MedGemma/Gemini (progress report, clinician summary, coaching, dysarthria, clinical suggestions). Ignored when edgeMode is true. Empty = use rule-based fallback. */
  medgemmaBackendUrl: string;
  /** Default session duration in minutes */
  sessionDurationMinutes: number;
  /** Show voice keyword banner on dashboard */
  voiceEnabled: boolean;
  /** Show coach banner on dashboard */
  coachEnabled: boolean;
  /** Allow PDF export (session + report) */
  pdfExportEnabled: boolean;
  /** Show simple progress trend on Progress (out of scope: full digital twin) */
  recoveryEstimateEnabled: boolean;
  /** Show clinician dashboard in nav */
  clinicianDashboardEnabled: boolean;
  /** Show VR/AR in nav (out of scope; set false to focus Vision + Voice + MedGemma reports) */
  vrPlaceholderEnabled: boolean;
  /** List of games: order and visibility. Set enabled: false to hide from UI. */
  games: GameConfig[];
  /** Weekly goal: number of sessions to complete per week (e.g. 3) */
  weeklyGoalSessions: number;
}

/** Map MedGemma intensity to suggested session duration in minutes: low → shorter/gentler, high → longer. */
export function getDurationMinutesFromIntensity(intensity: TherapyIntensity): number {
  switch (intensity) {
    case 'low': return SESSION_DURATION_PRESETS.short;
    case 'medium': return SESSION_DURATION_PRESETS.standard;
    case 'high': return SESSION_DURATION_PRESETS.longer;
    default: return SESSION_DURATION_PRESETS.standard;
  }
}

const env = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
const edgeModeEnv = env?.VITE_EDGE_MODE === 'true' || env?.VITE_DEPLOYMENT_MODE === 'edge';

export const defaultAppConfig: AppConfig = {
  edgeMode: edgeModeEnv,
  medgemmaBackendUrl: edgeModeEnv
    ? ''
    : (env?.VITE_MEDGEMMA_BACKEND_URL ? String(env.VITE_MEDGEMMA_BACKEND_URL) : ''),
  sessionDurationMinutes: 3,
  voiceEnabled: true,
  coachEnabled: true,
  pdfExportEnabled: true,
  recoveryEstimateEnabled: false,
  clinicianDashboardEnabled: true,
  vrPlaceholderEnabled: false,
  weeklyGoalSessions: 3,
  games: [
    { id: 'piano', path: '/app/piano', label: 'Piano', description: 'Finger isolation and reaction time. Each finger maps to a key.', icon: '🎹', enabled: true },
    { id: 'bubbles', path: '/app/bubbles', label: 'Bubbles', description: 'Reach, pinch, and pop. Builds reach and pinch control.', icon: '🫧', enabled: true },
    { id: 'grab-cup', path: '/app/grab-cup', label: 'Grab cup', description: 'Make a fist and hold to grab. ADL: cup grasp.', icon: '🥤', enabled: true },
    { id: 'button', path: '/app/button', label: 'Button', description: 'Pinch or tap the button. ADL: buttoning.', icon: '🔘', enabled: true },
    { id: 'reach-hold', path: '/app/reach-hold', label: 'Reach & hold', description: 'Reach the target and hold. Builds reach and stability.', icon: '🎯', enabled: true },
    { id: 'finger-tap', path: '/app/finger-tap', label: 'Finger tap', description: 'Tap in sequence. Finger isolation and coordination.', icon: '👆', enabled: true },
  ],
};

let config: AppConfig = defaultAppConfig;

export function getAppConfig(): AppConfig {
  return config;
}

export function setAppConfig(partial: Partial<AppConfig>): void {
  config = { ...config, ...partial };
}

export function getEnabledGames(): GameConfig[] {
  return config.games.filter((g) => g.enabled);
}

export function getSessionDurationMinutes(): number {
  return config.sessionDurationMinutes;
}

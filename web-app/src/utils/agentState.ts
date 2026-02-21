/**
 * Persist and load agent state (MedGemma decisions) across sessions — state memory.
 */

import type { PatientState, TherapyIntensity, AgenticIntervention, AgenticSessionSummary } from '../types/agentic';

const AGENT_STATE_KEY = 'neuro-recover-agent-state';

export function loadAgentState(): PatientState {
  try {
    const raw = localStorage.getItem(AGENT_STATE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      lastIntensity: parsed.lastIntensity as TherapyIntensity | undefined,
      lastIntervention: parsed.lastIntervention as AgenticIntervention | undefined,
      lastSummary: parsed.lastSummary as AgenticSessionSummary | undefined,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : undefined,
    };
  } catch {
    return {};
  }
}

export function saveAgentState(state: Partial<PatientState>): void {
  try {
    const current = loadAgentState();
    const next: PatientState = {
      ...current,
      ...state,
      updatedAt: Date.now(),
    };
    localStorage.setItem(AGENT_STATE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

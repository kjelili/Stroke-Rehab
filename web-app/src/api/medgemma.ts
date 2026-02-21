/**
 * Client for MedGemma-backed backend (progress report, clinician summary, coaching, dysarthria, clinical suggestions, agentic orchestration).
 * Falls back to null when backend is not configured or request fails.
 */

import { getAppConfig } from '../config/appConfig';
import type { SessionSummary, StoredSession } from '../types/session';
import type { PatientState, AgenticOrchestrateResult } from '../types/agentic';

function baseUrl(): string {
  return getAppConfig().medgemmaBackendUrl.replace(/\/$/, '');
}

function hasBackend(): boolean {
  const cfg = getAppConfig();
  if (cfg.edgeMode) return false;
  return baseUrl().length > 0;
}

async function post<T>(path: string, body: unknown): Promise<T | null> {
  if (!hasBackend()) return null;
  try {
    const res = await fetch(`${baseUrl()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Single-session interpretation for PDF (MedGemma). */
export async function fetchSessionInterpretation(session: SessionSummary | StoredSession): Promise<string | null> {
  const out = await post<{ interpretation: string | null }>('/api/session-interpretation', { session });
  return out?.interpretation ?? null;
}

/** Progress report narrative (MedGemma). */
export async function fetchProgressReportNarrative(sessions: StoredSession[]): Promise<string | null> {
  const out = await post<{ narrative: string | null }>('/api/progress-report', { sessions });
  return out?.narrative ?? null;
}

/** Clinician reasoning summary (MedGemma). */
export async function fetchClinicianSummary(
  sessions: StoredSession[],
  alerts: { msg: string }[]
): Promise<string | null> {
  const out = await post<{ summary: string | null }>('/api/clinician-summary', { sessions, alerts });
  return out?.summary ?? null;
}

/** Emotion-aware coaching message (MedGemma fine-tuned style). */
export async function fetchEmotionAwareCoaching(
  transcript: string,
  context?: { game?: string; score?: number }
): Promise<string | null> {
  const out = await post<{ message: string | null }>('/api/coaching', { transcript, context });
  return out?.message ?? null;
}

/** Dysarthria / linguistic pattern analysis (MedGemma). */
export async function fetchDysarthriaAnalysis(transcript: string): Promise<string | null> {
  const out = await post<{ analysis: string | null }>('/api/dysarthria-analysis', { transcript });
  return out?.analysis ?? null;
}

/** Clinical decision suggestions (MedGemma). */
export async function fetchClinicalSuggestions(
  sessions: StoredSession[],
  alerts: { msg: string }[]
): Promise<string[]> {
  const out = await post<{ suggestions: string[] }>('/api/clinical-suggestions', { sessions, alerts });
  return Array.isArray(out?.suggestions) ? out.suggestions : [];
}

/** FHIR structuring: sessions → FHIR Bundle (Observation resources). */
export async function fetchFhirStructure(sessions: StoredSession[]): Promise<{ resourceType: string; type: string; entry: unknown[] } | null> {
  const out = await post<{ resourceType: string; type: string; entry: unknown[] }>('/api/fhir-structure', { sessions });
  return out ?? null;
}

/** Agentic orchestration: MedGemma decisions, tool-calling, state memory. */
export async function fetchAgenticOrchestrate(params: {
  sessions: StoredSession[];
  currentSession?: SessionSummary | StoredSession | null;
  regressionDetected?: boolean;
  alerts?: { msg: string }[];
  patientState?: PatientState;
}): Promise<AgenticOrchestrateResult | null> {
  const out = await post<AgenticOrchestrateResult>('/api/agentic/orchestrate', {
    sessions: params.sessions,
    currentSession: params.currentSession ?? undefined,
    regressionDetected: params.regressionDetected ?? false,
    alerts: params.alerts ?? [],
    patientState: params.patientState ?? {},
  });
  return out ?? null;
}

export async function healthCheck(): Promise<{ ok: boolean; llm: boolean } | null> {
  if (!hasBackend()) return null;
  try {
    const res = await fetch(`${baseUrl()}/api/health`);
    if (!res.ok) return null;
    return (await res.json()) as { ok: boolean; llm: boolean };
  } catch {
    return null;
  }
}

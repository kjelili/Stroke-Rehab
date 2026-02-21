/**
 * Types for agentic workflow: MedGemma decisions, tool-calling, state memory.
 */

export type TherapyIntensity = 'low' | 'medium' | 'high';

export interface AgenticIntervention {
  reason: string;
  suggestedAction: string;
}

export interface AgenticSessionSummary {
  summary: string;
  nextFocus: string;
}

export interface PatientState {
  lastIntensity?: TherapyIntensity;
  lastIntervention?: AgenticIntervention;
  lastSummary?: AgenticSessionSummary;
  updatedAt?: number;
}

export interface AgenticOrchestrateResult {
  recommendedIntensity: TherapyIntensity;
  interventions: AgenticIntervention[];
  sessionSummary: AgenticSessionSummary | null;
  reasoning: string | null;
  toolCallsMade?: { name: string; args: unknown; result: unknown }[];
}

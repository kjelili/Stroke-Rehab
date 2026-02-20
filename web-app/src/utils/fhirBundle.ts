/**
 * Build a FHIR Bundle from sessions (edge-compatible; same shape as backend /api/fhir-structure).
 */

import type { StoredSession } from '../types/session';

export function buildFhirBundle(sessions: StoredSession[]): { resourceType: string; type: string; entry: unknown[] } {
  const entry = sessions.slice(0, 30).map((s) => ({
    resource: {
      resourceType: 'Observation',
      status: 'final',
      code: { coding: [{ system: 'http://snomed.info/sct', code: '229065009', display: 'Exercise' }] },
      subject: { reference: 'Patient/1' },
      effectiveDateTime: new Date(s.endedAt).toISOString(),
      ...(s.metrics?.score != null ? { valueQuantity: { value: s.metrics.score, unit: 'count' } } : {}),
      extension: [
        { url: 'http://neuro-recover.example/game', valueString: s.game },
        { url: 'http://neuro-recover.example/durationSeconds', valueInteger: s.durationSeconds },
      ],
    },
  }));
  return { resourceType: 'Bundle', type: 'collection', entry };
}

export function downloadFhirBundle(bundle: { resourceType: string; type: string; entry: unknown[] }): void {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `neuro-recover-fhir-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

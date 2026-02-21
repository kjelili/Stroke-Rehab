import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getRecentSessions } from '../utils/sessionStorage';
import { loadAgentState } from '../utils/agentState';
import { fetchClinicianSummary, fetchClinicalSuggestions, fetchFhirStructure, fetchAgenticOrchestrate } from '../api/medgemma';
import { buildFhirBundle, downloadFhirBundle } from '../utils/fhirBundle';
import type { StoredSession } from '../types/session';

function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
}

export function ClinicianDashboard() {
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [clinicianSummary, setClinicianSummary] = useState<string | null>(null);
  const [clinicalSuggestions, setClinicalSuggestions] = useState<string[]>([]);
  const [regressionIntervention, setRegressionIntervention] = useState<{ reason: string; suggestedAction: string } | null>(null);

  useEffect(() => {
    setSessions(getRecentSessions(50));
  }, []);

  const validSessions = sessions.filter((s) => s != null && typeof s.endedAt === 'number');
  const byGame = validSessions.reduce<Record<string, StoredSession[]>>((acc, s) => {
    if (!acc[s.game]) acc[s.game] = [];
    acc[s.game].push(s);
    return acc;
  }, {});

  const alerts: { type: string; msg: string }[] = [];
  for (const game of Object.keys(byGame)) {
    const list = byGame[game].sort((a, b) => (b.endedAt ?? 0) - (a.endedAt ?? 0));
    if (list.length >= 2) {
      const last = list[0].metrics.score ?? 0;
      const prev = list[1].metrics.score ?? 0;
      if (prev > 0 && last < prev * 0.8) {
        alerts.push({ type: 'decline', msg: `${game}: score dropped from ${prev} to ${last}. Consider review.` });
      }
    }
  }

  useEffect(() => {
    if (validSessions.length === 0) return;
    let cancelled = false;
    (async () => {
      const [summary, suggestions] = await Promise.all([
        fetchClinicianSummary(validSessions, alerts),
        fetchClinicalSuggestions(validSessions, alerts),
      ]);
      if (!cancelled) {
        if (summary != null) setClinicianSummary(summary);
        if (suggestions?.length) setClinicalSuggestions(suggestions);
      }
    })();
    return () => { cancelled = true; };
  }, [sessions]);

  useEffect(() => {
    if (alerts.length === 0) {
      setRegressionIntervention(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const result = await fetchAgenticOrchestrate({
        sessions: validSessions,
        regressionDetected: true,
        alerts: alerts.map((a) => ({ msg: a.msg })),
        patientState: loadAgentState(),
      });
      if (!cancelled && result?.interventions?.length) {
        setRegressionIntervention(result.interventions[0]);
      } else {
        setRegressionIntervention(null);
      }
    })();
    return () => { cancelled = true; };
  }, [sessions, alerts.length]);

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Clinician dashboard
          </h1>
          <Link to="/app" className="text-sm text-gray-400 hover:text-brand-400 tap-target rounded-lg px-2 py-1">
            ← Dashboard
          </Link>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Demo: viewing current user&apos;s sessions. In production this would list multiple patients.
        </p>

        {validSessions.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                const bundle = await fetchFhirStructure(validSessions);
                const toExport = bundle ?? buildFhirBundle(validSessions);
                downloadFhirBundle(toExport);
              }}
              className="tap-target rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-300 hover:border-brand-500 hover:text-brand-400"
            >
              Export FHIR
            </button>
          </div>
        )}

        {validSessions.length > 0 && (() => {
          const chartData = [...validSessions]
            .sort((a, b) => (a.endedAt ?? 0) - (b.endedAt ?? 0))
            .map((s) => ({
              date: new Date(s.endedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              score: s.metrics?.score ?? 0,
              game: s.game,
            }));
          return (
            <div className="mb-8 h-64 rounded-xl bg-surface-elevated border border-gray-800 p-4">
              <h2 className="font-display font-semibold text-white mb-3">Recovery curve (score over time)</h2>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} labelStyle={{ color: '#e5e7eb' }} />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })()}

        {alerts.length > 0 && (
          <div className="mb-8 rounded-xl bg-amber-500/10 border border-amber-500/30 p-4">
            <h2 className="font-display font-semibold text-amber-200 mb-2">Alerts (regression detected)</h2>
            <ul className="space-y-1 text-sm text-amber-100">
              {alerts.map((a, i) => (
                <li key={i}>{a.msg}</li>
              ))}
            </ul>
            {regressionIntervention && (
              <div className="mt-3 p-3 rounded-lg bg-brand-500/20 border border-brand-500/40">
                <h3 className="font-display font-semibold text-brand-200 text-sm mb-1">MedGemma tool call: proactive intervention</h3>
                <p className="text-sm text-gray-200">{regressionIntervention.reason}</p>
                <p className="text-sm text-brand-100 mt-1"><strong>Suggested action:</strong> {regressionIntervention.suggestedAction}</p>
              </div>
            )}
          </div>
        )}

        {clinicianSummary && (
          <div className="mb-8 rounded-xl bg-brand-500/10 border border-brand-500/30 p-4">
            <h2 className="font-display font-semibold text-brand-200 mb-2">Clinician reasoning summary (MedGemma)</h2>
            <p className="text-sm text-gray-200 whitespace-pre-wrap">{clinicianSummary}</p>
          </div>
        )}

        {clinicalSuggestions.length > 0 && (
          <div className="mb-8 rounded-xl bg-surface-elevated border border-gray-700 p-4">
            <h2 className="font-display font-semibold text-white mb-2">Clinical decision suggestions (MedGemma)</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
              {clinicalSuggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-8">
          <h2 className="font-display font-semibold text-white mb-4">Recent sessions</h2>
          <div className="rounded-xl bg-surface-elevated border border-gray-800 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Game</th>
                  <th className="p-3 font-medium">Score</th>
                  <th className="p-3 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                {validSessions.slice(0, 20).map((s) => (
                  <tr key={s.id} className="border-b border-gray-800 text-gray-300">
                    <td className="p-3">{formatDate(s.endedAt)}</td>
                    <td className="p-3">{s.game}</td>
                    <td className="p-3">{s.metrics.score ?? '-'}</td>
                    <td className="p-3">{Math.floor(s.durationSeconds / 60)}m {s.durationSeconds % 60}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {sessions.length === 0 && (
          <p className="text-gray-500 text-sm">No sessions yet. Complete sessions to see data here.</p>
        )}
      </div>
    </div>
  );
}

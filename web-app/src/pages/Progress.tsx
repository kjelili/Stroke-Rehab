import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecentSessions } from '../utils/sessionStorage';
import { exportRecentSessionsPdf } from '../utils/exportPdf';
import { getRecoveryMessage } from '../utils/digitalTwin';
import { getAppConfig } from '../config/appConfig';
import type { StoredSession } from '../types/session';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function Progress() {
  const [sessions, setSessions] = useState<StoredSession[]>([]);

  useEffect(() => {
    setSessions(getRecentSessions(50));
  }, []);

  const scoreByDate = sessions
    .filter((s) => s != null && typeof s.endedAt === 'number' && s.metrics.score != null)
    .map((s) => ({
      date: formatDate(s.endedAt),
      score: s.metrics.score ?? 0,
      game: s.game,
      duration: s.durationSeconds,
    }))
    .reverse();

  const config = getAppConfig();
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationSeconds / 60, 0);

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Progress
          </h1>
          <div className="flex gap-2">
            {config.pdfExportEnabled && (
              <button
                type="button"
                onClick={() => exportRecentSessionsPdf(sessions)}
                disabled={sessions.length === 0}
                className="tap-target rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-300 hover:border-brand-500 hover:text-brand-400 disabled:opacity-50"
              >
                Export report (PDF)
              </button>
            )}
            <Link
              to="/app"
              className="tap-target rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-brand-400"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        <div className="mb-8 p-4 rounded-xl bg-surface-elevated border border-gray-800">
          <h2 className="font-display font-semibold text-white mb-2">Summary</h2>
          <p className="text-gray-400 text-sm">
            Total practice: <span className="text-white font-medium">{totalMinutes.toFixed(1)}</span> minutes
          </p>
          <p className="text-gray-400 text-sm">
            Sessions: <span className="text-white font-medium">{sessions.length}</span>
          </p>
        </div>

        {config.recoveryEstimateEnabled && sessions.length >= 2 && (
          <div className="mb-8 p-4 rounded-xl bg-brand-500/10 border border-brand-500/30">
            <h2 className="font-display font-semibold text-brand-200 mb-2">Recovery estimate</h2>
            <p className="text-sm text-brand-100">{getRecoveryMessage(sessions)}</p>
          </div>
        )}

        {scoreByDate.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display font-semibold text-white mb-4">Score over time</h2>
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
                  {scoreByDate.map((row, i) => (
                    <tr key={i} className="border-b border-gray-800 text-gray-300">
                      <td className="p-3">{row.date}</td>
                      <td className="p-3">{row.game}</td>
                      <td className="p-3">{row.score}</td>
                      <td className="p-3">{Math.floor(row.duration / 60)}m {row.duration % 60}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {sessions.length === 0 && (
          <p className="text-gray-500 text-sm">Complete sessions to see progress here.</p>
        )}
      </div>
    </div>
  );
}

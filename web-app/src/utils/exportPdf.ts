import type { SessionSummary, StoredSession } from '../types/session';
import { getRecoveryMessage } from './digitalTwin';
import { fetchProgressReportNarrative, fetchSessionInterpretation } from '../api/medgemma';

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 24;
const CENTER_X = PAGE_W / 2;


/** AI interpretation for a single session */
function getSessionInterpretation(session: SessionSummary | StoredSession): string {
  const score = session.metrics.score ?? 0;
  const duration = session.durationSeconds;
  const reaction = session.metrics.reactionTimeMs;
  const lines: string[] = [];
  if (score > 0) {
    lines.push('This session shows good engagement and motor effort.');
    if (reaction != null && reaction < 600) {
      lines.push('Your reaction time is improving, which suggests better neural pathways for the task.');
    }
    if (duration >= 60) {
      lines.push('Completing a sustained session supports strength and endurance gains.');
    }
  } else {
    lines.push('Every session counts. Consistency will help build progress over time.');
  }
  lines.push('Keep practicing regularly to see continued improvement.');
  return lines.join(' ');
}

/** AI interpretation for progress report (encouragement + trend) */
function getReportInterpretation(sessions: StoredSession[]): string {
  const recovery = getRecoveryMessage(sessions, 50);
  const totalSessions = sessions.length;
  const withScore = sessions.filter((s) => s?.metrics?.score != null && s.metrics.score > 0).length;
  let detail = '';
  if (totalSessions >= 3 && withScore >= 2) {
    detail = ' Your activity pattern indicates building habit and motor practice. ';
  }
  return `${recovery}.${detail} The AI interpretation suggests progress when you maintain regular sessions and track scores over time.`;
}

export async function exportSessionPdf(session: SessionSummary | StoredSession | null | undefined): Promise<void> {
  if (!session || typeof session.endedAt !== 'number') return;
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const dateStr = new Date(session.endedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  const gameLabel = session.game.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const durationStr = `${Math.floor(session.durationSeconds / 60)}m ${session.durationSeconds % 60}s`;

  // Title centered
  doc.setFontSize(22);
  doc.setTextColor(15, 20, 25);
  doc.text('Neuro-Recover', CENTER_X, 22, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(80, 90, 100);
  doc.text('Session Summary', CENTER_X, 30, { align: 'center' });

  let y = 48;
  doc.setFontSize(11);
  doc.setTextColor(40, 50, 60);
  doc.text(`Date: ${dateStr}`, CENTER_X, y, { align: 'center' });
  y += 8;
  doc.text(`Game: ${gameLabel}`, CENTER_X, y, { align: 'center' });
  y += 8;
  doc.text(`Duration: ${durationStr}`, CENTER_X, y, { align: 'center' });
  y += 10;
  if (session.metrics.score != null) {
    doc.text(`Score: ${session.metrics.score}`, CENTER_X, y, { align: 'center' });
    y += 8;
  }
  if (session.metrics.reactionTimeMs != null) {
    doc.text(`Reaction time: ${session.metrics.reactionTimeMs} ms`, CENTER_X, y, { align: 'center' });
    y += 10;
  } else {
    y += 4;
  }

  // AI Interpretation box (MedGemma when backend available, else rule-based)
  let interpretation = await fetchSessionInterpretation(session);
  if (!interpretation) interpretation = getSessionInterpretation(session);
  y += 6;
  doc.setDrawColor(33, 163, 255);
  doc.setLineWidth(0.5);
  doc.rect(MARGIN, y - 4, PAGE_W - 2 * MARGIN, 32);
  doc.setFillColor(248, 250, 252);
  doc.rect(MARGIN, y - 4, PAGE_W - 2 * MARGIN, 32, 'FD');
  doc.setFontSize(10);
  doc.setTextColor(30, 40, 50);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Interpretation', CENTER_X, y + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  const split = doc.splitTextToSize(interpretation, PAGE_W - 2 * MARGIN - 8);
  const lineHeight = 5;
  split.forEach((line: string, i: number) => {
    doc.text(line, CENTER_X, y + 12 + i * lineHeight, { align: 'center' });
  });
  y += 38;

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100, 110, 120);
  doc.text('Neuro-Recover — AI-Powered Stroke Rehabilitation', CENTER_X, PAGE_H - 12, { align: 'center' });

  doc.save(`neuro-recover-session-${session.game}-${session.endedAt}.pdf`);
}

export async function exportRecentSessionsPdf(sessions: StoredSession[]): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const valid = sessions.filter((s) => s != null && typeof s.endedAt === 'number');
  const dateStr = new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  // Title centered
  doc.setFontSize(22);
  doc.setTextColor(15, 20, 25);
  doc.text('Neuro-Recover', CENTER_X, 22, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(80, 90, 100);
  doc.text('Progress Report', CENTER_X, 30, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(100, 110, 120);
  doc.text(`Generated: ${dateStr}`, CENTER_X, 38, { align: 'center' });
  doc.text(`Total sessions: ${valid.length}`, CENTER_X, 44, { align: 'center' });

  let y = 58;
  doc.setFontSize(10);
  doc.setTextColor(40, 50, 60);
  const colW = (PAGE_W - 2 * MARGIN) / 4;
  const headers = ['Date', 'Game', 'Score', 'Duration'];
  headers.forEach((h, i) => {
    doc.setFont('helvetica', 'bold');
    doc.text(h, MARGIN + i * colW + colW / 2, y, { align: 'center' });
  });
  doc.setFont('helvetica', 'normal');
  y += 8;

  for (const s of valid.slice(0, 25)) {
    const date = new Date(s.endedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
    const game = s.game.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const score = s.metrics?.score ?? '-';
    const dur = `${Math.floor(s.durationSeconds / 60)}m`;
    [date, game, String(score), dur].forEach((cell, i) => {
      doc.text(cell, MARGIN + i * colW + colW / 2, y, { align: 'center' });
    });
    y += 6;
    if (y > PAGE_H - 70) {
      doc.addPage();
      y = 20;
    }
  }

  y += 12;
  // AI Interpretation for report (MedGemma when backend available, else rule-based)
  let interpretation = await fetchProgressReportNarrative(valid);
  if (!interpretation) interpretation = getReportInterpretation(valid);
  doc.setDrawColor(33, 163, 255);
  doc.setLineWidth(0.5);
  const boxH = Math.min(36, 6 + doc.splitTextToSize(interpretation, PAGE_W - 2 * MARGIN - 8).length * 5);
  doc.rect(MARGIN, y - 4, PAGE_W - 2 * MARGIN, boxH);
  doc.setFillColor(248, 250, 252);
  doc.rect(MARGIN, y - 4, PAGE_W - 2 * MARGIN, boxH, 'FD');
  doc.setFontSize(10);
  doc.setTextColor(30, 40, 50);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Interpretation — Progress', CENTER_X, y + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  const splitReport = doc.splitTextToSize(interpretation, PAGE_W - 2 * MARGIN - 8);
  splitReport.forEach((line: string, i: number) => {
    doc.text(line, CENTER_X, y + 10 + i * 5, { align: 'center' });
  });

  doc.setFontSize(9);
  doc.setTextColor(100, 110, 120);
  doc.text('Neuro-Recover — AI-Powered Stroke Rehabilitation', CENTER_X, PAGE_H - 12, { align: 'center' });
  doc.save('neuro-recover-progress-report.pdf');
}

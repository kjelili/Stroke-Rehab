import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  generateProgressReport,
  generateSessionInterpretation,
  generateClinicianSummary,
  generateEmotionAwareCoaching,
  analyzeDysarthriaLinguistic,
  generateClinicalSuggestions,
  generateClinicalReasoning,
  formatSoapNote,
  suggestIcd10,
  structureFhir,
  isLlmAvailable,
} from './llm.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_, res) => {
  res.json({ ok: true, llm: isLlmAvailable() });
});

/** POST /api/session-interpretation — body: { session } */
app.post('/api/session-interpretation', async (req, res) => {
  const { session } = req.body || {};
  if (!session) return res.status(400).json({ error: 'session required' });
  const interpretation = await generateSessionInterpretation(session);
  res.json({ interpretation: interpretation || null });
});

/** POST /api/progress-report — body: { sessions: StoredSession[] } */
app.post('/api/progress-report', async (req, res) => {
  const { sessions } = req.body || {};
  if (!Array.isArray(sessions)) return res.status(400).json({ error: 'sessions array required' });
  const narrative = await generateProgressReport(sessions);
  res.json({ narrative: narrative || null });
});

/** POST /api/clinician-summary — body: { sessions, alerts: { msg: string }[] } */
app.post('/api/clinician-summary', async (req, res) => {
  const { sessions = [], alerts = [] } = req.body || {};
  const summary = await generateClinicianSummary(sessions, alerts);
  res.json({ summary: summary || null });
});

/** POST /api/coaching — body: { transcript, context?: {} } */
app.post('/api/coaching', async (req, res) => {
  const { transcript = '', context } = req.body || {};
  const message = await generateEmotionAwareCoaching(transcript, context || {});
  res.json({ message: message || null });
});

/** POST /api/dysarthria-analysis — body: { transcript } */
app.post('/api/dysarthria-analysis', async (req, res) => {
  const { transcript = '' } = req.body || {};
  const analysis = await analyzeDysarthriaLinguistic(transcript);
  res.json({ analysis: analysis || null });
});

/** POST /api/clinical-suggestions — body: { sessions, alerts } */
app.post('/api/clinical-suggestions', async (req, res) => {
  const { sessions = [], alerts = [] } = req.body || {};
  const suggestions = await generateClinicalSuggestions(sessions, alerts);
  res.json({ suggestions: Array.isArray(suggestions) ? suggestions : [] });
});

/** POST /api/clinical-reasoning — body: { sessions, alerts } — MedGemma clinical reasoning engine */
app.post('/api/clinical-reasoning', async (req, res) => {
  const { sessions = [], alerts = [] } = req.body || {};
  const steps = await generateClinicalReasoning(sessions, alerts);
  res.json({ steps: Array.isArray(steps) ? steps : null });
});

/** POST /api/soap-note — body: { sessions, transcript? } — MedGemma SOAP formatter */
app.post('/api/soap-note', async (req, res) => {
  const { sessions = [], transcript = '' } = req.body || {};
  if (!Array.isArray(sessions)) return res.status(400).json({ error: 'sessions array required' });
  const soap = await formatSoapNote(sessions, transcript);
  res.json({ soap });
});

/** POST /api/icd10-tagging — body: { text? } or { sessions? } — MedGemma ICD-10 tagging engine */
app.post('/api/icd10-tagging', async (req, res) => {
  const { text, sessions } = (req.body || {});
  const input = text != null ? text : sessions;
  const codes = await suggestIcd10(input || []);
  res.json({ codes: Array.isArray(codes) ? codes : [] });
});

/** POST /api/fhir-structure — body: { sessions } — FHIR structuring system */
app.post('/api/fhir-structure', async (req, res) => {
  const { sessions = [] } = req.body || {};
  if (!Array.isArray(sessions)) return res.status(400).json({ error: 'sessions array required' });
  const bundle = structureFhir(sessions);
  res.json(bundle);
});

app.listen(PORT, () => {
  console.log(`Neuro-Recover backend on http://localhost:${PORT}`);
  if (!isLlmAvailable()) console.warn('No GEMINI_API_KEY set; LLM features will return null.');
});

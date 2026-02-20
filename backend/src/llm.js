/**
 * LLM layer for MedGemma-style capabilities.
 * Uses Google Gemini API with medical prompts (swap to Vertex AI MedGemma endpoint when deployed).
 */

import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.MEDGEMMA_API_KEY;
const model = process.env.MEDGEMMA_MODEL || 'gemini-2.0-flash';

let client = null;
if (apiKey) {
  client = new GoogleGenAI({ apiKey });
}

const SYSTEM_MEDICAL =
  'You are a clinical assistant for stroke rehabilitation. Respond in plain language, 2-4 sentences. Be supportive and evidence-informed. Do not give specific medical diagnoses; suggest trends and encourage follow-up with clinicians.';

export async function generate(prompt, system = SYSTEM_MEDICAL) {
  if (!client) return null;
  try {
    const contents = `${system}\n\n${prompt}`;
    const response = await client.models.generateContent({
      model,
      contents,
      config: { maxOutputTokens: 512, temperature: 0.4 },
    });
    const text = response?.text ?? response?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === 'string' ? text.trim() : null;
  } catch (e) {
    console.error('LLM error:', e?.message || e);
    return null;
  }
}

/** Single-session interpretation for PDF (MedGemma-style). Includes ROM, tremor, smoothness when present. */
export async function generateSessionInterpretation(session) {
  if (!session?.metrics) return null;
  const { game, durationSeconds, metrics } = session;
  const score = metrics.score ?? 0;
  const reaction = metrics.reactionTimeMs;
  const rom = metrics.romPerFinger?.length ? `, romPerFinger=[${metrics.romPerFinger.map((v) => v.toFixed(2)).join(',')}]` : '';
  const tremor = metrics.tremorEstimate != null ? `, tremorEstimate=${metrics.tremorEstimate.toFixed(2)}` : '';
  const smooth = metrics.smoothnessEstimate != null ? `, smoothnessEstimate=${metrics.smoothnessEstimate.toFixed(2)}` : '';
  const prompt = `Stroke rehab session: game=${game}, duration=${Math.floor(durationSeconds / 60)}m, score=${score}${reaction != null ? `, reactionTimeMs=${reaction}` : ''}${rom}${tremor}${smooth}. Write a brief (2-3 sentence) encouraging interpretation for the patient, non-diagnostic.`;
  return generate(prompt);
}

/** Progress report narrative from session list (MedGemma-style). */
export async function generateProgressReport(sessions) {
  const summary = sessions
    .slice(0, 20)
    .map(
      (s) =>
        `${s.game}: score ${s.metrics?.score ?? '-'}, ${Math.floor(s.durationSeconds / 60)}m, ${new Date(s.endedAt).toLocaleDateString()}`
    )
    .join('\n');
  const prompt = `Given this stroke rehab session history, write a brief progress interpretation for the patient (encouraging, non-diagnostic).\n\nSessions:\n${summary}`;
  return generate(prompt);
}

/** Clinician reasoning summary from sessions + alerts. */
export async function generateClinicianSummary(sessions, alerts) {
  const summary = sessions
    .slice(0, 25)
    .map(
      (s) =>
        `${s.game} score ${s.metrics?.score ?? '-'}, ${Math.floor(s.durationSeconds / 60)}m, ${new Date(s.endedAt).toLocaleDateString()}`
    )
    .join('\n');
  const alertText = alerts?.length ? `Alerts: ${alerts.map((a) => a.msg).join('; ')}` : 'No alerts.';
  const prompt = `As a clinician assistant, summarize this patient's rehab session data and any alerts in 2-4 sentences. Focus on trends and what might warrant attention.\n\nSessions:\n${summary}\n\n${alertText}`;
  return generate(prompt);
}

/** Emotion-aware coaching from patient transcript + context. */
export async function generateEmotionAwareCoaching(transcript, context = {}) {
  const ctx = Object.keys(context).length ? `Context: ${JSON.stringify(context)}` : '';
  const prompt = `A stroke rehab patient said: "${transcript}". ${ctx}\n\nRespond with a brief, empathetic coaching message (1-3 sentences). Acknowledge how they feel and suggest a small next step (e.g. rest, easier task, or encouragement).`;
  return generate(prompt);
}

/** Dysarthria / linguistic pattern analysis of transcript. */
export async function analyzeDysarthriaLinguistic(transcript) {
  if (!transcript?.trim()) return null;
  const prompt = `Analyze this speech transcript for possible linguistic patterns that could relate to dysarthria or motor speech (e.g. brevity, word choice, repetition). Do not diagnose. Give 1-3 short, neutral observations suitable for clinician review.\n\nTranscript: "${transcript}"`;
  return generate(prompt);
}

/** Clinical decision suggestions from session + alert context. */
export async function generateClinicalSuggestions(sessions, alerts) {
  const summary = sessions
    .slice(0, 20)
    .map(
      (s) =>
        `${s.game} score ${s.metrics?.score ?? '-'}, ${Math.floor(s.durationSeconds / 60)}m`
    )
    .join('; ');
  const alertText = alerts?.length ? `Alerts: ${alerts.map((a) => a.msg).join('; ')}` : 'None';
  const prompt = `Given this rehab data, suggest 2-4 short clinical follow-up actions (e.g. "Review adherence", "Consider difficulty adjustment"). Be concise, one line per suggestion.\n\nData: ${summary}. ${alertText}`;
  const text = await generate(prompt);
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((s) => s.replace(/^[\d\-•*.]+\s*/, '').trim())
    .filter(Boolean);
}

const SYSTEM_STRUCTURED =
  'You are a clinical assistant for stroke rehabilitation. Output only the requested structure (JSON or labeled sections). No extra commentary.';

/** Clinical reasoning engine: structured reasoning steps from sessions + alerts. */
export async function generateClinicalReasoning(sessions, alerts) {
  const summary = sessions
    .slice(0, 25)
    .map(
      (s) =>
        `${s.game} score ${s.metrics?.score ?? '-'}, ${Math.floor(s.durationSeconds / 60)}m, ${new Date(s.endedAt).toLocaleDateString()}`
    )
    .join('\n');
  const alertText = alerts?.length ? `Alerts: ${alerts.map((a) => a.msg).join('; ')}` : 'None';
  const prompt = `Given this rehab session data and alerts, output a short clinical reasoning (3-5 steps). Format as a JSON array of strings: ["Step 1: ...", "Step 2: ..."]. Focus on trends, risk factors, and what to consider next.\n\nSessions:\n${summary}\n\n${alertText}`;
  const text = await generate(prompt, SYSTEM_STRUCTURED);
  if (!text) return null;
  try {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
  } catch {
    // fallback: return as single-step array
  }
  return [text.trim()];
}

/** SOAP note formatter: session data (+ optional transcript) → Subjective, Objective, Assessment, Plan. */
export async function formatSoapNote(sessions, transcript = '') {
  const summary = sessions
    .slice(0, 20)
    .map(
      (s) =>
        `${s.game}: score ${s.metrics?.score ?? '-'}, ${Math.floor(s.durationSeconds / 60)}m, ${new Date(s.endedAt).toLocaleDateString()}`
    )
    .join('\n');
  const subj = transcript.trim() ? `Patient reported: "${transcript}". ` : '';
  const prompt = `Generate a SOAP note (Subjective, Objective, Assessment, Plan) for this stroke rehab data. ${subj}Output exactly four labeled sections, each 1-3 sentences.\n\nSession data:\n${summary}\n\nFormat:\nSubjective: ...\nObjective: ...\nAssessment: ...\nPlan: ...`;
  const text = await generate(prompt, SYSTEM_STRUCTURED);
  if (!text) return null;
  const sections = { subjective: '', objective: '', assessment: '', plan: '' };
  for (const key of ['subjective', 'objective', 'assessment', 'plan']) {
    const re = new RegExp(`${key}\\s*:?\\s*([\\s\\S]*?)(?=\\n\\w+\\s*:|$)`, 'i');
    const m = text.match(re);
    if (m) sections[key] = m[1].trim();
  }
  return sections;
}

/** ICD-10 tagging engine: suggest ICD-10 codes from session summary or report text. */
export async function suggestIcd10(textOrSessions) {
  const text =
    typeof textOrSessions === 'string'
      ? textOrSessions
      : (Array.isArray(textOrSessions) ? textOrSessions : [])
          .slice(0, 15)
          .map(
            (s) =>
              `${s.game} score ${s.metrics?.score ?? '-'}, ${Math.floor(s.durationSeconds / 60)}m`
          )
          .join('; ');
  if (!text?.trim()) return [];
  const prompt = `Suggest 2-5 relevant ICD-10-CM codes for this stroke rehabilitation context. Output only a JSON array of objects: [{"code":"G81.91","description":"Hemiplegia, unspecified affecting right dominant side"}, ...]. Use only valid ICD-10-CM codes.\n\nContext:\n${text.slice(0, 1500)}`;
  const out = await generate(prompt, SYSTEM_STRUCTURED);
  if (!out) return [];
  try {
    const match = out.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
  } catch {
    // ignore
  }
  return [];
}

/** FHIR structuring: sessions → FHIR-like Bundle with Observation entries. */
export async function structureFhir(sessions) {
  const entries = sessions.slice(0, 30).map((s) => {
    const value =
      s.metrics?.score != null
        ? { valueQuantity: { value: s.metrics.score, unit: 'count' } }
        : {};
    return {
      resource: {
        resourceType: 'Observation',
        status: 'final',
        code: { coding: [{ system: 'http://snomed.info/sct', code: '229065009', display: 'Exercise' }] },
        subject: { reference: 'Patient/1' },
        effectiveDateTime: new Date(s.endedAt).toISOString(),
        ...value,
        extension: [
          { url: 'http://neuro-recover.example/game', valueString: s.game },
          { url: 'http://neuro-recover.example/durationSeconds', valueInteger: s.durationSeconds },
        ],
      },
    };
  });
  return {
    resourceType: 'Bundle',
    type: 'collection',
    entry: entries,
  };
}

export function isLlmAvailable() {
  return !!client;
}

/**
 * Agentic workflow: MedGemma makes decisions via tool-calling.
 * Session orchestration: Patient → Continuous AI reasoning → Adaptive session → Structured summary → Proactive intervention.
 * Tools: set_therapy_intensity, trigger_regression_intervention, record_session_summary.
 */

import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.MEDGEMMA_API_KEY;
const model = process.env.MEDGEMMA_MODEL || 'gemini-2.0-flash';

let client = null;
if (apiKey) {
  client = new GoogleGenAI({ apiKey });
}

// --- Function declarations for Gemini (OpenAPI-style) ---
const FUNCTION_DECLARATIONS = [
  {
    name: 'set_therapy_intensity',
    description: 'Set the recommended therapy intensity for the next session based on recent performance, fatigue, and any regression. Call this when you have decided the next intensity level.',
    parameters: {
      type: 'OBJECT',
      properties: {
        level: {
          type: 'STRING',
          description: 'Therapy intensity: "low" (easier, shorter, for fatigue/regression), "medium" (standard), or "high" (challenging, for good progress).',
          enum: ['low', 'medium', 'high'],
        },
        reason: {
          type: 'STRING',
          description: 'Brief reason for this choice (e.g. "Regression detected; reducing intensity" or "Steady progress; maintaining medium").',
        },
      },
      required: ['level', 'reason'],
    },
  },
  {
    name: 'trigger_regression_intervention',
    description: 'Call when regression is detected (e.g. score drop, decline in metrics). Records a proactive intervention suggestion for the clinician or patient.',
    parameters: {
      type: 'OBJECT',
      properties: {
        reason: {
          type: 'STRING',
          description: 'What regression was detected (e.g. "Score dropped >20% in bubbles").',
        },
        suggestedAction: {
          type: 'STRING',
          description: 'Suggested action (e.g. "Reduce session intensity; consider clinician review").',
        },
      },
      required: ['reason', 'suggestedAction'],
    },
  },
  {
    name: 'record_session_summary',
    description: 'Record a structured summary after a session. Call when you have produced the summary and next focus for the patient.',
    parameters: {
      type: 'OBJECT',
      properties: {
        summary: {
          type: 'STRING',
          description: 'Brief structured summary of the session (2-4 sentences) for the patient.',
        },
        nextFocus: {
          type: 'STRING',
          description: 'What to focus on next session (e.g. "Continue finger isolation" or "Build endurance").',
        },
      },
      required: ['summary', 'nextFocus'],
    },
  },
];

/**
 * Build session summary text for the prompt (state memory).
 */
function sessionsToContext(sessions, currentSession) {
  const list = Array.isArray(sessions) ? sessions.slice(0, 25) : [];
  const lines = list.map(
    (s) =>
      `${s.game} score ${s.metrics?.score ?? '-'}, ${Math.floor(s.durationSeconds / 60)}m, ${new Date(s.endedAt).toLocaleDateString()}`
  );
  if (currentSession && !list.find((s) => s.endedAt === currentSession.endedAt)) {
    lines.unshift(
      `[current] ${currentSession.game} score ${currentSession.metrics?.score ?? '-'}, ${Math.floor(currentSession.durationSeconds / 60)}m`
    );
  }
  return lines.join('\n');
}

/**
 * Execute a single tool call and return result for the model.
 */
function executeToolCall(name, args) {
  switch (name) {
    case 'set_therapy_intensity':
      return {
        applied: true,
        level: args?.level ?? 'medium',
        reason: args?.reason ?? '',
      };
    case 'trigger_regression_intervention':
      return {
        recorded: true,
        reason: args?.reason ?? '',
        suggestedAction: args?.suggestedAction ?? '',
      };
    case 'record_session_summary':
      return {
        recorded: true,
        summary: args?.summary ?? '',
        nextFocus: args?.nextFocus ?? '',
      };
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

/**
 * Extract function calls from Gemini response. Handles both response.functionCalls and response.candidates[0].content.parts.
 */
function getFunctionCalls(response) {
  if (response.functionCalls && response.functionCalls.length > 0) {
    return response.functionCalls;
  }
  const parts = response.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return [];
  return parts
    .filter((p) => p.functionCall)
    .map((p) => ({ name: p.functionCall.name, args: p.functionCall.args ?? {} }));
}

/**
 * Get final text from response (when no more tool calls).
 */
function getResponseText(response) {
  if (response.text && typeof response.text === 'string') return response.text.trim();
  const parts = response.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  const textPart = parts.find((p) => p.text);
  return textPart?.text?.trim() ?? '';
}

/**
 * Run agentic orchestration: send context to MedGemma with tools; loop until no more function calls; return decisions and summary.
 * @param {object} options
 * @param {object[]} options.sessions - Recent stored sessions (state memory).
 * @param {object} [options.currentSession] - Just-completed or in-progress session.
 * @param {boolean} [options.regressionDetected] - True if client detected regression (e.g. score drop).
 * @param {object[]} [options.alerts] - Alerts (e.g. { msg: "bubbles: score dropped..." }).
 * @param {object} [options.patientState] - Persisted state: { lastIntensity?, lastIntervention? }.
 */
export async function runAgenticOrchestration(options = {}) {
  const { sessions = [], currentSession, regressionDetected, alerts = [], patientState = {} } = options;

  if (!client) {
    return {
      recommendedIntensity: 'medium',
      interventions: [],
      sessionSummary: null,
      reasoning: 'LLM not configured; using defaults.',
      toolCallsMade: [],
    };
  }

  const sessionContext = sessionsToContext(sessions, currentSession);
  const alertText =
    alerts.length > 0 ? `Alerts: ${alerts.map((a) => a.msg || a).join('; ')}` : 'No alerts.';
  const stateText = patientState.lastIntensity
    ? `Last recommended intensity: ${patientState.lastIntensity}.`
    : '';
  const regressionText = regressionDetected
    ? 'Regression has been DETECTED (e.g. score drop). You MUST consider calling trigger_regression_intervention with reason and suggestedAction.'
    : '';

  const systemPrompt = `You are a clinical assistant for stroke rehabilitation (MedGemma-style). You have access to tools to set therapy intensity, record regression interventions, and record session summaries. Use the session history (state memory across sessions) to make decisions. Be concise. ${regressionText}`;

  const userPrompt = `Session history (state memory):\n${sessionContext}\n\n${alertText}\n${stateText}\n${
    currentSession
      ? 'A session has just been completed or is in progress. Decide the next therapy intensity (set_therapy_intensity) and optionally record_session_summary with a brief summary and next focus.'
      : 'No current session. Based on history, decide the recommended therapy intensity (set_therapy_intensity) for the next session.'
  }`;

  const contents = [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }];
  const config = {
    tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
    maxOutputTokens: 1024,
    temperature: 0.3,
  };

  const toolResults = [];
  const toolCallsMade = [];
  let lastText = '';
  let round = 0;
  const maxRounds = 5;

  try {
    while (round < maxRounds) {
      round += 1;
      const response = await client.models.generateContent({
        model,
        contents,
        config,
      });

      const functionCalls = getFunctionCalls(response);
      if (functionCalls.length === 0) {
        lastText = getResponseText(response);
        break;
      }

      for (const fc of functionCalls) {
        const result = executeToolCall(fc.name, fc.args || {});
        toolCallsMade.push({ name: fc.name, args: fc.args, result });
        toolResults.push({ name: fc.name, result });

        contents.push({
          role: 'model',
          parts: [{ functionCall: { name: fc.name, args: fc.args || {} } }],
        });
        contents.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: fc.name,
                response: { result },
              },
            },
          ],
        });
      }
    }
  } catch (err) {
    console.error('Agentic LLM/tool loop error:', err?.message || err);
    lastText = `Error: ${err?.message || 'orchestration failed'}. Using defaults.`;
  }

  // Derive structured output from tool results
  let recommendedIntensity = patientState.lastIntensity || 'medium';
  const interventions = [];
  let sessionSummary = null;

  for (const tr of toolResults) {
    if (tr.name === 'set_therapy_intensity' && tr.result?.level) {
      recommendedIntensity = tr.result.level;
    }
    if (tr.name === 'trigger_regression_intervention') {
      interventions.push({
        reason: tr.result?.reason ?? '',
        suggestedAction: tr.result?.suggestedAction ?? '',
      });
    }
    if (tr.name === 'record_session_summary') {
      sessionSummary = {
        summary: tr.result?.summary ?? '',
        nextFocus: tr.result?.nextFocus ?? '',
      };
    }
  }

  return {
    recommendedIntensity,
    interventions,
    sessionSummary,
    reasoning: lastText || (toolCallsMade.length > 0 ? 'MedGemma used tools to decide.' : ''),
    toolCallsMade,
  };
}

export function isAgenticLlmAvailable() {
  return !!client;
}

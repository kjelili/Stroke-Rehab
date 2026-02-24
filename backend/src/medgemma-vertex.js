/**
 * Vertex AI MedGemma client (HAI-DEF).
 * Calls a MedGemma endpoint deployed from Model Garden via Vertex AI Prediction API.
 * Request format: chatCompletions (see Google-Health/medgemma notebooks).
 */

import { GoogleAuth } from 'google-auth-library';

const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
const location = process.env.VERTEX_LOCATION || process.env.GOOGLE_CLOUD_REGION || 'us-central1';
const endpointId = process.env.VERTEX_MEDGEMMA_ENDPOINT_ID;

let auth = null;
let cachedToken = null;
let tokenExpiry = 0;

function isVertexConfigured() {
  return !!(projectId && location && endpointId);
}

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry - 60000) return cachedToken;
  if (!auth) auth = new GoogleAuth();
  const client = await auth.getClient({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const ticket = await client.getAccessToken();
  cachedToken = ticket.token;
  tokenExpiry = ticket.expiry_date || Date.now() + 3600000;
  return cachedToken;
}

/**
 * Call Vertex AI MedGemma predict (chatCompletions format).
 * @param {object} options
 * @param {Array<{role: string, content: string}>} options.messages - Chat messages (system + user)
 * @param {number} [options.maxTokens=512]
 * @param {number} [options.temperature=0.4]
 * @returns {Promise<string|null>} Assistant text or null
 */
export async function vertexMedGemmaPredict(options = {}) {
  if (!isVertexConfigured()) return null;
  const { messages = [], maxTokens = 512, temperature = 0.4 } = options;
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/endpoints/${endpointId}:predict`;
  const instances = [
    {
      '@requestFormat': 'chatCompletions',
      messages,
      max_tokens: maxTokens,
      temperature,
    },
  ];
  try {
    const token = await getAccessToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ instances }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Vertex MedGemma predict error:', res.status, errText);
      return null;
    }
    const data = await res.json();
    const content = data?.predictions?.[0]?.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content.trim() : null;
  } catch (e) {
    console.error('Vertex MedGemma error:', e?.message || e);
    return null;
  }
}

/**
 * Single-turn text generation using MedGemma (system + user prompt).
 */
export async function vertexMedGemmaGenerate(systemPrompt, userPrompt, maxTokens = 512, temperature = 0.4) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
  return vertexMedGemmaPredict({ messages, maxTokens, temperature });
}

export function isVertexMedGemmaAvailable() {
  return isVertexConfigured();
}

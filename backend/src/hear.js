/**
 * HEAR (Health Acoustic Representations) — HAI-DEF model for bioacoustic embeddings.
 * Pre-trained on 300M+ 2-second audio clips; returns 512-dim embeddings for cough/breath etc.
 * See: https://developers.google.com/health-ai-developer-foundations/hear/serving-api
 * When HEAR_VERTEX_ENDPOINT_ID is set (with GOOGLE_CLOUD_PROJECT, VERTEX_LOCATION), calls Vertex predict.
 */

import { GoogleAuth } from 'google-auth-library';

const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
const location = process.env.VERTEX_LOCATION || process.env.GOOGLE_CLOUD_REGION || 'us-central1';
const endpointId = process.env.HEAR_VERTEX_ENDPOINT_ID;

let auth = null;
let cachedToken = null;
let tokenExpiry = 0;

function isHearConfigured() {
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
 * Call HEAR Vertex predict. Audio: base64-encoded WAV, 2 seconds, 16kHz mono (or use input_array: 32000 floats).
 * @param {string} base64Wav - Base64-encoded WAV bytes (2s, 16kHz mono)
 * @returns {Promise<{ embedding?: number[], error?: string }|null>}
 */
export async function hearEmbed(base64Wav) {
  if (!isHearConfigured() || !base64Wav) return null;
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/endpoints/${endpointId}:predict`;
  const instances = [{ input_bytes: base64Wav }];
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
      console.error('HEAR predict error:', res.status, errText);
      return { error: `HEAR request failed: ${res.status}` };
    }
    const data = await res.json();
    const pred = data?.predictions?.[0];
    if (pred?.error) return { error: pred.error.description || 'HEAR processing error' };
    if (Array.isArray(pred?.embedding)) return { embedding: pred.embedding };
    return null;
  } catch (e) {
    console.error('HEAR error:', e?.message || e);
    return { error: e?.message || 'HEAR request failed' };
  }
}

export function isHearAvailable() {
  return isHearConfigured();
}

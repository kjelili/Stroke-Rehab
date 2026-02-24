/**
 * MedSigLIP (HAI-DEF) — Medical image-text encoder for zero-shot classification and semantic retrieval.
 * Dual-tower vision + text encoder; 448x448 image, up to 64 text tokens.
 * See: https://github.com/google-health/medsiglip and Hugging Face google/medsiglip-448.
 *
 * When MEDSIGLIP_VERTEX_ENDPOINT_ID is set (with GOOGLE_CLOUD_PROJECT, VERTEX_LOCATION),
 * this module can call a deployed MedSigLIP endpoint for image embeddings.
 * Otherwise returns stub for documentation and future integration.
 */

const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
const location = process.env.VERTEX_LOCATION || process.env.GOOGLE_CLOUD_REGION || 'us-central1';
const endpointId = process.env.MEDSIGLIP_VERTEX_ENDPOINT_ID;

function isMedSigLIPConfigured() {
  return !!(projectId && location && endpointId);
}

/**
 * Compute image embedding (and optionally text) via MedSigLIP.
 * Body: { imageBase64: string, text?: string }.
 * Returns { embedding?: number[], textEmbedding?: number[], model: 'MedSigLIP', available: boolean }.
 */
export async function medSigLIPEmbed(imageBase64, text) {
  if (!isMedSigLIPConfigured()) {
    return {
      embedding: null,
      textEmbedding: text ? null : undefined,
      model: 'MedSigLIP',
      available: false,
      hint: 'Set MEDSIGLIP_VERTEX_ENDPOINT_ID with GOOGLE_CLOUD_PROJECT and VERTEX_LOCATION to enable.',
    };
  }
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return { embedding: null, model: 'MedSigLIP', available: true, error: 'imageBase64 required' };
  }
  try {
    const { GoogleAuth } = await import('google-auth-library');
    const auth = new GoogleAuth();
    const client = await auth.getClient({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const ticket = await client.getAccessToken();
    const token = ticket.token;
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/endpoints/${endpointId}:predict`;
    const instances = [{ image_bytes: imageBase64, ...(text ? { text } : {}) }];
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
      console.error('MedSigLIP predict error:', res.status, errText);
      return { embedding: null, model: 'MedSigLIP', available: true, error: `Predict failed: ${res.status}` };
    }
    const data = await res.json();
    const pred = data?.predictions?.[0];
    if (pred?.error) return { embedding: null, model: 'MedSigLIP', available: true, error: pred.error.description };
    return {
      embedding: Array.isArray(pred?.embedding) ? pred.embedding : null,
      textEmbedding: Array.isArray(pred?.text_embedding) ? pred.text_embedding : undefined,
      model: 'MedSigLIP',
      available: true,
    };
  } catch (err) {
    console.error('MedSigLIP error:', err?.message || err);
    return {
      embedding: null,
      model: 'MedSigLIP',
      available: true,
      error: err?.message || 'MedSigLIP request failed',
    };
  }
}

export function isMedSigLIPAvailable() {
  return isMedSigLIPConfigured();
}

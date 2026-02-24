# Models Used and Implemented in Neuro-Recover

This document describes how each AI/ML model is used and implemented in the Stroke Rehab app (MedGemma, HEAR, MedSigLIP, and related features).

---

## 1. MedGemma (HAI-DEF)

**Role:** Clinical reasoning, report generation, and agentic session orchestration.

**Use in the app:**
- **Agentic workflow:** Recommends therapy intensity (low / medium / high) and proactive interventions from session history and patient state. The frontend uses this to suggest session duration (e.g. low → 2 min, high → 5 min) and to show “MedGemma recommends X intensity” on the Dashboard and after session complete.
- **Progress report:** Narrative summary of recent sessions (`POST /api/progress-report`).
- **Session interpretation:** Single-session interpretation for PDF export (`POST /api/session-interpretation`).
- **Clinician summary:** Reasoning summaries and suggestions from sessions + alerts (`POST /api/clinician-summary`, `POST /api/clinical-suggestions`, `POST /api/clinical-reasoning`).
- **Coaching:** Emotion-aware coaching from voice transcript (`POST /api/coaching`).
- **Dysarthria analysis:** Linguistic pattern analysis from transcript for clinician use (`POST /api/dysarthria-analysis`).
- **Structured outputs:** SOAP notes (`POST /api/soap-note`), ICD-10 tagging (`POST /api/icd10-tagging`), FHIR Bundle (`POST /api/fhir-structure`).

**Implementation:**
- **Backend:** `backend/src/llm.js` (Gemini API proxy), `backend/src/medgemma-vertex.js` (Vertex AI deployed MedGemma), `backend/src/agentic.js` (tool-calling loop: `set_therapy_intensity`, `trigger_regression_intervention`, `record_session_summary`).
- **Frontend:** `web-app/src/api/medgemma.ts` (client for all MedGemma endpoints); Dashboard and SessionCompleteScreen call `fetchAgenticOrchestrate`; intensity is stored in `SessionContext.suggestedIntensity` and used for default session duration and “MedGemma (X min)” preset in SessionWrapper.
- **Config:** When `MEDGEMMA_USE_VERTEX=true` and Vertex project/location/endpoint are set, the backend uses deployed MedGemma; otherwise Gemini API is used as proxy.

**References:** [MedGemma Model Garden](https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/medgemma), [AGENTIC_WORKFLOW.md](AGENTIC_WORKFLOW.md).

---

## 2. HEAR (Health Acoustic Representations, HAI-DEF)

**Role:** Bioacoustic embeddings from short audio (e.g. cough, breath) for downstream analysis.

**Use in the app:**
- **Backend only:** `POST /api/hear/analyze` accepts base64-encoded WAV (2 s, 16 kHz mono) and returns a 512-dimensional embedding. The web app does not currently send voice clips to HEAR; voice is used for keyword detection and for MedGemma coaching/dysarthria from transcript. HEAR is available for future use (e.g. cough/breath screening or voice quality embeddings).

**Implementation:**
- **Backend:** `backend/src/hear.js` — when `HEAR_VERTEX_ENDPOINT_ID` (with `GOOGLE_CLOUD_PROJECT`, `VERTEX_LOCATION`) is set, calls Vertex AI predict with `input_bytes` (base64). Returns `{ embedding, model: 'HEAR' }` or error.
- **Frontend:** No direct HEAR client yet; optional future: record 2 s clips and send to `/api/hear/analyze` for embedding-based features.

**References:** [HEAR serving API](https://developers.google.com/health-ai-developer-foundations/hear/serving-api), [Model Garden HEAR](https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/hear).

---

## 3. MedSigLIP (HAI-DEF)

**Role:** Medical image–text encoder for zero-shot classification and semantic image retrieval (e.g. radiology, dermatology, pathology). Not used for text generation; MedGemma is used for that.

**Use in the app:**
- **Backend:** `POST /api/medsiglip/embed` accepts `{ imageBase64, text? }` and returns image (and optional text) embeddings when a MedSigLIP endpoint is configured. Intended for future features such as hand/limb image assessment or photo-based progress (e.g. “hand function” image embedding).
- **Frontend:** No UI yet; the API is available for integration (e.g. upload a photo and get an embedding or similarity to text prompts).

**Implementation:**
- **Backend:** `backend/src/medsiglip.js` — when `MEDSIGLIP_VERTEX_ENDPOINT_ID` (with `GOOGLE_CLOUD_PROJECT`, `VERTEX_LOCATION`) is set, calls Vertex AI predict with image (and optional text). Returns `{ embedding?, textEmbedding?, model: 'MedSigLIP', available }`. If the endpoint is not set, returns `available: false` and a hint so the API remains documented and testable.
- **Health:** `GET /api/health` and `GET /api/hai-def` include `medsiglip: true/false`.

**References:** [Google-Health/medsiglip](https://github.com/google-health/medsiglip), [Hugging Face google/medsiglip-448](https://huggingface.co/google/medsiglip-448). Deploy MedSigLIP to a Vertex AI endpoint to enable; the backend expects the same predict JSON shape (e.g. `instances` with `image_bytes` and optional `text`).

---

## 4. Non-model features (vision, voice, UX)

- **Hand tracking:** MediaPipe Hands in the browser; no backend model. Used for all games (Piano, Bubbles, Grab cup, Button, Reach & hold, Finger tap) for landmarks, ROM, pinch, and reaction time.
- **Voice keywords:** Browser Web Speech API or similar for “I’m tired”, “This is hard”, “My hand hurts”; transcript is sent to MedGemma for coaching and dysarthria analysis only (no HEAR in the current voice flow).
- **Session logic:** Intensity → duration mapping, pause/rest, duration presets (Short/Standard/Longer), weekly goal and streak, easier mode, and onboarding hints are implemented in the frontend and backend orchestration; they use MedGemma’s recommended intensity and tool results but are not separate models.

---

## Summary table

| Model      | Purpose                    | Where used                         | Backend module        | Frontend usage                          |
|-----------|----------------------------|------------------------------------|------------------------|------------------------------------------|
| MedGemma  | Reports, orchestration, tools | All report + agentic endpoints     | llm, medgemma-vertex, agentic | Dashboard, Session complete, Progress, Clinician |
| HEAR      | Bioacoustic embeddings     | `POST /api/hear/analyze`           | hear.js                | Optional future                          |
| MedSigLIP | Image/text embeddings      | `POST /api/medsiglip/embed`        | medsiglip.js           | Optional future (e.g. photo assessment)  |

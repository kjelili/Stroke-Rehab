# The MedGemma Impact Challenge — What This App Delivers

This document describes **what the Neuro-Recover application delivers** for the competition: real HAI-DEF model use, features, and how to run and submit.

---

## HAI-DEF models used (mandatory: 1–2)

### 1. MedGemma (mandatory) — primary clinical engine

- **Where:** Backend uses **MedGemma** for all narrative and clinical reasoning.
- **Real model:** When **Vertex AI** is configured (`MEDGEMMA_USE_VERTEX=true`, `GOOGLE_CLOUD_PROJECT`, `VERTEX_LOCATION`, `VERTEX_MEDGEMMA_ENDPOINT_ID`), the app calls the **deployed MedGemma** endpoint (4B or 27B from Model Garden) via the Vertex AI Prediction API. See `backend/src/medgemma-vertex.js`, `backend/src/llm.js`, `backend/src/agentic.js`.
- **Fallback:** Without Vertex, the app uses the **Gemini API** with medical prompts so it runs for development and demos; for competition judging, configure Vertex so **real MedGemma** is used.
- **Use in the app:**  
  Progress reports, session interpretation, clinician summaries, emotion-aware coaching, dysarthria-style analysis, clinical suggestions, clinical reasoning (structured steps), SOAP notes, ICD-10 tagging, and **agentic workflow** (therapy intensity, regression intervention, session summary). MedGemma selects next therapy intensity, reacts to regression with tool/structured output, and uses state memory across sessions.

### 2. HEAR (optional) — second HAI-DEF model

- **Where:** Backend exposes **HEAR** (Health Acoustic Representations) for bioacoustic analysis.
- **Real model:** When **Vertex AI HEAR** is configured (`HEAR_VERTEX_ENDPOINT_ID` with same project/location), `POST /api/hear/analyze` sends 2-second audio (base64 WAV, 16 kHz mono) to the HEAR endpoint and returns **512-dimensional embeddings**. See `backend/src/hear.js`, [HeAR serving API](https://developers.google.com/health-ai-developer-foundations/hear/serving-api).
- **Use in the app:** Voice and audio can be sent to HEAR for cough/breath-style embeddings to enrich rehab context (e.g. fatigue, respiratory effort). The app’s voice layer (keyword detection) can be extended to call this endpoint when HEAR is deployed.

---

## What the app delivers (feature list)

| Area | Deliverable |
|------|-------------|
| **Vision** | Hand tracking (MediaPipe), 6 games (Piano, Bubbles, Grab cup, Button, Reach & hold, Finger tap), ROM/tremor/smoothness from landmarks. |
| **Voice** | Keyword detection (tired, hard, hurts), optional emotion-aware coaching and dysarthria-style analysis (MedGemma), optional HEAR for bioacoustic embeddings. |
| **MedGemma** | Progress report, session interpretation, clinician summary, clinical reasoning (steps), SOAP note, ICD-10 tagging, FHIR structuring, coaching, clinical suggestions. **Agentic:** therapy intensity, regression intervention, session summary with state memory. |
| **Agentic workflow** | Patient → continuous AI reasoning → adaptive session → structured summary → proactive intervention. MedGemma selects next therapy intensity; regression detection triggers interventions; state memory across sessions. |
| **Clinician** | Recovery curve, alerts (e.g. score drop), MedGemma summary/suggestions, regression-triggered intervention UI, FHIR export. |
| **Edge / offline** | Build with `VITE_EDGE_MODE=true` for fully offline use (rule-based fallbacks when no backend). |
| **Deployment** | Docker backend; optional Vertex AI MedGemma + HEAR for real HAI-DEF models. |

---

## How to run and verify

1. **Web app:** `cd web-app && npm install && npm run dev` — open the URL (e.g. http://localhost:5173). Use `?seedDemo=1` to load synthetic sessions.
2. **Backend (Gemini proxy):** `cd backend && npm install && cp .env.example .env` — set `GEMINI_API_KEY` — `npm run dev`. Set `VITE_MEDGEMMA_BACKEND_URL=http://localhost:4000` in `web-app/.env` (or when building).
3. **Real MedGemma (Vertex):** Deploy MedGemma from [Model Garden](https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/medgemma). In `backend/.env` set `MEDGEMMA_USE_VERTEX=true`, `GOOGLE_CLOUD_PROJECT`, `VERTEX_LOCATION`, `VERTEX_MEDGEMMA_ENDPOINT_ID`. Use ADC (e.g. `gcloud auth application-default login`). Restart backend — logs should show “MedGemma: Vertex AI (HAI-DEF)”.
4. **HEAR (optional):** Deploy HEAR from [Model Garden](https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/hear). Set `HEAR_VERTEX_ENDPOINT_ID` in `backend/.env`. `GET /api/hai-def` and `POST /api/hear/analyze` then use HEAR.
5. **Check models:** `GET http://localhost:4000/api/health` returns `medgemmaVertex`, `agentic`, `hear`. `GET http://localhost:4000/api/hai-def` returns which HAI-DEF models are in use.

---

## Submission package (competition)

- **Video (3 minutes or less):** In-app presentation at `/demo?presentation=1` (or `/app?demo=1` → “Start 3‑min presentation”). See `docs/ADVERT_VIDEO_GUIDE.md`.
- **Write-up (3 pages or less):** Use `docs/MEDGEMMA_IMPACT_CHALLENGE_SUBMISSION.md`; export to PDF. Update it to state that the app uses **real MedGemma on Vertex** when configured and **optional HEAR**.
- **Code:** [github.com/kjelili/Stroke-Rehab](https://github.com/kjelili/Stroke-Rehab). Reproducible via README and backend README; synthetic data with `?seedDemo=1`.

---

## Summary

The app **implements real MedGemma (HAI-DEF)** via Vertex AI when the endpoint is configured, and **optional HEAR** for bioacoustic embeddings. It uses MedGemma for clinical text and for agentic decisions (therapy intensity, regression intervention, session summary) with state memory. Without Vertex, it falls back to the Gemini API so development and demos work; for judging, configure Vertex so the submission uses the **real MedGemma model** and, if desired, HEAR.

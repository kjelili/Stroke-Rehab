# Neuro-Recover Backend (MedGemma / HAI-DEF)

Focus: **Vision + Voice + MedGemma report generation.** This backend is part of the [MedGemma Impact Challenge](https://www.kaggle.com/competitions/med-gemma-impact-challenge) submission. It provides both **generative** and **structured** MedGemma-style capabilities:

**Generative**  
| Endpoint | Capability |
| -------- | ---------- |
| `POST /api/progress-report` | Progress report narrative |
| `POST /api/session-interpretation` | Single-session interpretation for PDF |
| `POST /api/clinician-summary` | Clinician reasoning summaries |
| `POST /api/coaching` | Emotion-aware patient coaching |
| `POST /api/dysarthria-analysis` | Dysarthria / linguistic pattern analysis |
| `POST /api/clinical-suggestions` | Clinical decision suggestions |

**MedGemma as clinical engine (structured)**  
| Endpoint | Capability |
| -------- | ---------- |
| `POST /api/clinical-reasoning` | **Clinical reasoning engine** — structured reasoning steps (JSON array) from sessions + alerts |
| `POST /api/soap-note` | **SOAP note formatter** — sessions (+ optional transcript) → Subjective, Objective, Assessment, Plan |
| `POST /api/icd10-tagging` | **ICD-10 tagging engine** — text or sessions → suggested ICD-10-CM codes |
| `POST /api/fhir-structure` | **FHIR structuring system** — sessions → FHIR Bundle of Observation resources |

**Agentic workflow (MedGemma decisions, tool-calling, state memory)**  
| Endpoint | Capability |
| -------- | ---------- |
| `POST /api/agentic/orchestrate` | **Session orchestration** — sessions + optional currentSession, regressionDetected, alerts, patientState → recommended intensity, interventions, session summary. MedGemma calls tools: `set_therapy_intensity`, `trigger_regression_intervention`, `record_session_summary`. See `docs/AGENTIC_WORKFLOW.md`. |

## Setup

1. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` (from [Google AI Studio](https://aistudio.google.com/apikey)). The server loads `.env` via `dotenv` (no need to export the key in the shell).
2. Install and run:

```bash
cd backend
npm install
npm run dev
```

Server runs at `http://localhost:4000`. The web app must be configured with this URL (e.g. `VITE_MEDGEMMA_BACKEND_URL=http://localhost:4000` in `web-app/.env`).

### Port already in use (EADDRINUSE)

If you see `Error: listen EADDRINUSE: address already in use :::4000`:

- **Option A:** Free port 4000 — on Windows: `netstat -ano | findstr :4000`, then `taskkill /PID <pid> /F`. On macOS/Linux: `lsof -i :4000` then `kill <pid>`.
- **Option B:** Use another port — in `.env` set `PORT=4001` (or any free port), then run again. Point the web app at the same port (e.g. `VITE_MEDGEMMA_BACKEND_URL=http://localhost:4001`).

## Docker

```bash
docker build -t neuro-recover-backend ./backend
docker run -p 4000:4000 -e GEMINI_API_KEY=your_key neuro-recover-backend
```

From repo root, `docker-compose up` runs the backend on port 4000. See `FEASIBILITY.md` for local GPU/CPU inference and LoRA fine-tuning.

## Real MedGemma (Vertex AI) — HAI-DEF

To use the **real MedGemma model** (HAI-DEF) deployed on Vertex AI:

1. Deploy MedGemma from [Model Garden](https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/medgemma) to a Vertex AI endpoint.
2. In `backend/.env` set:
   - `MEDGEMMA_USE_VERTEX=true`
   - `GOOGLE_CLOUD_PROJECT=<your-project-id>`
   - `VERTEX_LOCATION=us-central1` (or your region)
   - `VERTEX_MEDGEMMA_ENDPOINT_ID=<your-endpoint-id>`
3. Use Application Default Credentials (e.g. `gcloud auth application-default login` or a service account key in `GOOGLE_APPLICATION_CREDENTIALS`).

All generative and agentic endpoints then use **Vertex AI MedGemma** (4B or 27B). Without these variables, the backend uses the Gemini API as a proxy for development.

## HEAR (HAI-DEF) — optional second model

For **Health Acoustic Representations** (bioacoustic embeddings: cough, breath):

1. Deploy HEAR from [Model Garden](https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/hear).
2. In `.env` set `HEAR_VERTEX_ENDPOINT_ID=<endpoint-id>` (same project/location as above).
3. `POST /api/hear/analyze` with body `{ "audioBase64": "<base64 WAV, 2s, 16kHz mono>" }` returns `{ "embedding": [...], "model": "HEAR" }`.

See [HeAR serving API](https://developers.google.com/health-ai-developer-foundations/hear/serving-api). `GET /api/hai-def` reports which HAI-DEF models are active.

# Tech stack review: Neuro-Recover

**Scope:** Vision + Voice + MedGemma report generation. Out of scope: VR, wearables, full digital twin, reinforcement learning.

This document summarizes the **technology stack** in use and maps **feasibility requirements** to implementation.

---

## Stack at a glance

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, TypeScript, Vite 7, Tailwind CSS 3, React Router 7, PWA (vite-plugin-pwa) |
| **Vision** | MediaPipe Tasks Vision (HandLandmarker), getUserMedia camera |
| **Charts / PDF** | Recharts, jsPDF |
| **Backend** | Node.js (ESM), Express 4, CORS, dotenv |
| **AI / LLM** | @google/genai (Gemini API), google-auth-library (Vertex); optional HEAR, MedSigLIP |
| **Deployment** | Docker (backend), edge build (VITE_EDGE_MODE), static hosting |

---

## Frontend (`web-app/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.x | UI components, hooks, context (Session, Auth, Demo). |
| **TypeScript** | 5.9 | Typed APIs, session/agentic types, app config. |
| **Vite** | 7.x | Dev server, HMR, production build. |
| **Tailwind CSS** | 3.x | Utility-first styling, theme (brand, surface), responsive layout. |
| **React Router** | 7.x | Routes: `/`, `/login`, `/app`, `/app/progress`, `/app/piano`, etc. |
| **@mediapipe/tasks-vision** | 0.10.x | Hand landmarker: 21 points per hand, used in all six games. |
| **jspdf** | 4.x | Session and progress report PDF export. |
| **recharts** | 2.x | Progress / clinician charts (if used). |
| **vite-plugin-pwa** | 1.x | Service worker, manifest, offline-capable build. |

**Key modules:** `CameraView`, `useHandTracking`, `landmarkFeatures` (ROM, tremor, smoothness), `gameSounds` (Web Audio), `sessionStorage`, `agentState`, `medgemma` API client.

---

## Backend (`backend/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | (ESM) | Runtime; `node --watch` for dev. |
| **Express** | 4.x | HTTP server, JSON body, CORS. |
| **cors** | 2.x | Allow frontend origin. |
| **dotenv** | 17.x | Load `.env` (GEMINI_API_KEY, PORT, Vertex vars). |
| **@google/genai** | 1.x | Gemini API for LLM calls (reports, coaching, agentic). |
| **google-auth-library** | 9.x | Vertex AI auth (MedGemma, HEAR, MedSigLIP endpoints). |

**Key modules:** `server.js` (routes), `llm.js` (Gemini/Vertex MedGemma), `agentic.js` (orchestration, tool-calling), `hear.js` (HEAR embeddings), `medsiglip.js` (MedSigLIP image/text embeddings).

**APIs:** Health, HAI-DEF status, session-interpretation, progress-report, clinician-summary, coaching, dysarthria-analysis, clinical-suggestions/reasoning, soap-note, icd10-tagging, fhir-structure, **agentic/orchestrate**, hear/analyze, medsiglip/embed.

---

## AI layer (MedGemma / HAI-DEF)

| Requirement | Status | Notes |
|------------|--------|-------|
| **MedGemma as clinical engine** | ✅ | Clinical reasoning, SOAP, ICD-10, FHIR, agentic tools (set_therapy_intensity, trigger_regression_intervention, record_session_summary). Gemini API proxy or Vertex MedGemma. |
| **Agentic orchestration** | ✅ | `POST /api/agentic/orchestrate`; tool-calling loop in `agentic.js`; frontend shows intensity and session summary. |
| **HEAR (bioacoustic)** | ✅ Optional | `hear.js` + `/api/hear/analyze` when HEAR_VERTEX_ENDPOINT_ID set. |
| **MedSigLIP (image/text)** | ✅ Optional | `medsiglip.js` + `/api/medsiglip/embed` when MEDSIGLIP_VERTEX_ENDPOINT_ID set. |
| **Fine-tuning / LoRA** | 📄 Documented | `backend/FINE_TUNING.md`; production swap to Vertex or fine-tuned model. |

---

## Vision & local features

| Requirement | Status | Location |
|------------|--------|----------|
| **Camera feed** | ✅ | `CameraView.tsx`: `getUserMedia({ video })` → `<video>`. |
| **MediaPipe hand landmarks** | ✅ | `useHandTracking.ts`: HandLandmarker, 21 points per hand. |
| **ROM, tremor, smoothness** | ✅ | `landmarkFeatures.ts`; used in Piano (and extensible to other games). |
| **Games** | ✅ | Piano, Bubbles, Grab cup, Button, Reach & hold, Finger tap — all use landmarks or tap fallback. |

---

## Deployment

| Option | How |
|--------|-----|
| **Backend** | `npm run dev` or `npm start` in `backend/`; Docker: `backend/Dockerfile`, `docker-compose.yml`. |
| **Frontend** | `npm run dev` / `npm run build` in `web-app/`; serve `dist/` (any static host). |
| **Edge (offline)** | `VITE_EDGE_MODE=true` (PowerShell: `$env:VITE_EDGE_MODE="true"; npm run dev`); no backend URL. |
| **Local GPU/LLM** | 📄 Documented in `backend/FEASIBILITY.md`. |

---

## Feasibility vs implementation

| Requirement | Status | How to show |
|------------|--------|-------------|
| **Report from synthetic data** | ✅ | `/demo` or `?demo=1` → seed sessions → Progress → Export PDF. |
| **Local / no cloud** | ✅ | Edge build; header “Edge: Offline” and Dashboard edge banner. |
| **MedGemma in use** | ✅ | Dashboard “MedGemma (HAI-DEF) in use” and agentic block; session complete summary. |
| **Agentic orchestration** | ✅ | Dashboard expandable “Agentic orchestration”; session complete “From tool record_session_summary”. |

---

## Summary

- **Frontend:** React 19 + Vite 7 + TypeScript + Tailwind; MediaPipe hands; PWA; jsPDF.
- **Backend:** Node (ESM) + Express; Gemini/Vertex for MedGemma-style LLM; agentic tool-calling; optional HEAR and MedSigLIP.
- **Deployment:** Docker for backend; edge mode for offline frontend; static build for web.
- **Proof:** Synthetic demo, PDF export, edge banner, and explicit MedGemma/agentic UI.

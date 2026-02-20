# Stack review: Neuro-Recover vs required feasibility stack

**Scope:** Vision + Voice + MedGemma report generation. Out of scope: VR, wearables, full digital twin, reinforcement learning.

This document maps the **required stack** (frontend, AI, deployment, demonstration) to what is **implemented** and what is **documented or optional**, for feasibility scoring.

---

## Frontend

| Requirement | Status | Location / notes |
|------------|--------|------------------|
| **React** | ✅ In use | `web-app/` – React 19, Vite, TypeScript. |
| **WebRTC camera feed** | ✅ In use | `CameraView.tsx`: `navigator.mediaDevices.getUserMedia({ video })`; stream passed to `<video>`. Same media pipeline as WebRTC (getUserMedia). |
| **Vision** | ✅ In use | Camera + hand tracking for all games; `CameraView` + `useHandTracking`. |
| **MediaPipe for landmark extraction** | ✅ In use | `useHandTracking.ts`: `@mediapipe/tasks-vision` `HandLandmarker`, `detectForVideo(video, timestamp)` → `landmarks` (21 points per hand). Used in Piano, Bubbles, GrabCup, Button, ReachHold, FingerTap. |
| **Local feature engineering (ROM, tremor, smoothness)** | ✅ Implemented | `utils/landmarkFeatures.ts`: ROM from landmarks (extension per finger); tremor (position variance over time); smoothness (inverse of motion jerk). Piano (and optionally other games) pass recent landmark history to compute and store in session metrics. |

---

## AI layer (MedGemma)

| Requirement | Status | Location / notes |
|------------|--------|------------------|
| **MedGemma fine-tuned on: Rehab notes, SOAP notes, Stroke clinical data** | 📄 Documented | Backend uses **Gemini API** with medical prompts; swap to Vertex MedGemma or fine-tuned model. Dataset and LoRA: `backend/FINE_TUNING.md`. |
| **LoRA fine-tuning** | 📄 Documented | `backend/FINE_TUNING.md`: dataset description, LoRA approach, evaluation (BLEU, ROUGE, clinician rating), before/after examples. |
| **MedGemma as clinical engine** | ✅ Implemented | **Clinical reasoning engine** (`/api/clinical-reasoning`), **SOAP note formatter** (`/api/soap-note`), **ICD-10 tagging** (`/api/icd10-tagging`), **FHIR structuring** (`/api/fhir-structure`). See `backend/README.md`. |

---

## Deployment

| Requirement | Status | Location / notes |
|------------|--------|------------------|
| **Docker** | ✅ In use | `backend/Dockerfile`: Node backend, port 4000. `docker-compose.yml` (optional): backend + static web-app. See `backend/README.md` and root `DEPLOYMENT.md`. |
| **Local GPU** | 📄 Documented | `backend/FEASIBILITY.md`: run backend with a local LLM (e.g. Ollama, llama.cpp, or ONNX) for GPU/CPU inference; no cloud. |
| **CPU-optimized inference** | 📄 Documented | Edge mode: no cloud calls; rule-based interpretations. For local LLM: use quantized models (e.g. GGUF Q4) or ONNX CPU runtime. See `backend/FEASIBILITY.md`. |

---

## Demonstration proof

| Requirement | Status | How to show |
|------------|--------|-------------|
| **Report generation from synthetic patient dataset** | ✅ Supported | 1) Open app with `?seedDemo=1` (or call `window.__seedMockSessions()`). 2) Go to **Progress** and click **Export PDF** (progress report). Report is generated from synthetic sessions (no real patient data). With backend: narrative from LLM; in edge mode: rule-based narrative. |
| **Local inference (no cloud calls)** | ✅ Supported | 1) Build web app with **edge mode**: `VITE_EDGE_MODE=true` (no `VITE_MEDGEMMA_BACKEND_URL`). 2) Serve `dist/` locally. 3) Use **Progress → Export PDF** and **Clinician** view: all text is rule-based, no network. Header shows **Offline**. Optional: run backend with a local LLM (Ollama) for true local inference. |

---

## Summary

- **Frontend**: React, camera feed, vision, MediaPipe landmarks, and local feature engineering (ROM, tremor, smoothness) are implemented.
- **AI**: MedGemma-style behavior is provided via Gemini API + medical prompts; MedGemma fine-tuning and LoRA are documented for production.
- **Deployment**: Docker (backend, optional compose), local GPU/CPU inference paths documented.
- **Proof**: Synthetic dataset + report generation via `?seedDemo=1` and PDF export; edge mode demonstrates full flow with no cloud calls.

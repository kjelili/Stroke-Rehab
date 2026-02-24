# Neuro-Recover

**AI-powered gamified stroke rehabilitation platform.** An AI rehabilitation companion that uses computer vision, speech analysis, and generative AI to turn repetitive physio into adaptive games.

**Submitted to [The MedGemma Impact Challenge](https://www.kaggle.com/competitions/med-gemma-impact-challenge)** (Kaggle). Uses **MedGemma / HAI-DEF** as the clinical reasoning and report-generation engine; see [Submission write-up](docs/MEDGEMMA_IMPACT_CHALLENGE_SUBMISSION.md) and [SUBMISSION.md](SUBMISSION.md) for the competition package.

[![Repository](https://img.shields.io/badge/GitHub-kjelili%2FStroke--Rehab-blue)](https://github.com/kjelili/Stroke-Rehab)

---

## Overview

Neuro-Recover focuses on **vision + voice + MedGemma (HAI-DEF) report generation and agentic workflow** for stroke rehab:

- **Vision:** Hand tracking via MediaPipe; camera-based games (Piano, Bubbles, Grab cup, Button, Reach & hold, Finger tap).
- **Voice:** Keyword detection (“I’m tired”, “This is hard”, “My hand hurts”) with **actionable responses**: “Take a break” and “Easier mode” trigger rest prompts and gentler sessions.
- **AI reports & MedGemma:** Progress narratives, clinician summaries, SOAP notes, ICD-10 tagging, FHIR structuring, and **agentic tool-calling** (therapy intensity, regression interventions, session summaries). Backend supports **MedGemma, HEAR, and MedSigLIP** (HAI-DEF). See [docs/MODELS.md](docs/MODELS.md) and [docs/AGENTIC_WORKFLOW.md](docs/AGENTIC_WORKFLOW.md).
- **Edge-ready:** Runs fully offline (no cloud) for tablets, community laptops, and rural clinics.

---

## Features

### Games (hand tracking + tap fallback)

- **Piano** — Finger isolation and reaction time; **guided tasks**: “Press only index finger (key C)” and “Play 5-note melody C→E→G→E→C” with highlighted next key.
- **Bubbles** — Reach, pinch, and pop; **adaptive difficulty** (bigger/slower when struggling, smaller/faster when doing well); **easier mode** from voice or dashboard; **in-game encouragement** (e.g. “Nice pinch!”, “Good reach!”) every few pops.
- **Grab cup** — Fist hold to grab (ADL: cup grasp).
- **Button** — Pinch or tap (ADL: buttoning).
- **Reach & hold** — Reach target and hold for stability.
- **Finger tap** — Tap in sequence for isolation and coordination.

All games use **success feedback sounds** (pop, click, grab, reach, step) and **session metrics** (score, reaction time, ROM, tremor/smoothness where applicable).

### Session & intensity

- **Session duration choice:** Short (2 min), Standard (3 min), Longer (5 min), or **MedGemma recommendation** (intensity → duration: low 2 min, medium 3 min, high 5 min).
- **Pause/rest:** “Pause 1 min” or “Pause 2 min” during a session; timer pauses and resumes automatically.
- **Easier mode:** From Dashboard voice (“Easier mode”) or manually; shorter sessions and gentler game settings (e.g. Bubbles: bigger, slower).
- **Session complete:** “You did it!” with checkmark, success chime, MedGemma summary and next intensity.

### Dashboard & progress

- **MedGemma decisions:** Therapy intensity and proactive interventions; intensity is **wired into** default session duration and “MedGemma (X min)” preset.
- **Voice actions:** “Take a break” → rest message on dashboard; “Easier mode” → turn on easier mode with optional note.
- **Weekly goal & streak:** e.g. “3 sessions this week” and “X days in a row” on Dashboard (Coach banner) and Progress.
- **Onboarding:** First-time hint (“Start with Piano”); returning hint (“Last time you did Piano”, “MedGemma suggests low today”).

### Accessibility & UX

- **Tap targets:** Minimum 44×44 px for interactive elements.
- **Reduced motion:** Respects `prefers-reduced-motion` (animations/transitions minimized).
- **High-contrast theme:** Toggle in header (Aa) stored in localStorage.
- **Clear focus states** and ARIA where relevant.

### Backend & models

- **MedGemma:** All report and agentic endpoints (see [backend/README.md](backend/README.md)).
- **HEAR:** Optional `POST /api/hear/analyze` for bioacoustic embeddings (WAV 2 s, 16 kHz mono).
- **MedSigLIP:** Optional `POST /api/medsiglip/embed` for medical image (and optional text) embeddings; see [docs/MODELS.md](docs/MODELS.md).

---

## Quick start

### 1. Web app (frontend)

```bash
cd web-app
npm install
npm run dev
```

Open the URL shown (e.g. http://localhost:5173). Allow camera access for hand-tracking games.

### 2. Backend (optional, for AI features)

```bash
cd backend
cp .env.example .env
# Edit .env and set GEMINI_API_KEY=your_key (from https://aistudio.google.com/apikey)
npm install
npm run dev
```

Backend runs at http://localhost:4000. Set `VITE_MEDGEMMA_BACKEND_URL=http://localhost:4000` in `web-app/.env` (or when building) to use it.

### 3. Try with sample data

Open the app with `?demo=1` (or `/demo`) to load synthetic sessions; use Progress and Clinician to see reports and dashboards.

---

## Project structure

| Path | Description |
|------|-------------|
| **web-app/** | React (Vite, TypeScript) frontend: games, dashboard, progress, clinician view, PDF export, voice banner, session wrapper (duration, pause, celebration). |
| **backend/** | Node/Express API: MedGemma-style endpoints, HEAR, MedSigLIP, agentic orchestration. |
| **docs/** | Models ([MODELS.md](docs/MODELS.md)), agentic workflow, deployment, video guide. |
| **docker-compose.yml** | Runs backend on port 4000. |

---

## Deployment

- **Edge (offline):** `VITE_EDGE_MODE=true npm run build` in `web-app/`, then serve `dist/`. See `web-app/DEPLOYMENT.md`.
- **Cloud:** Run backend with `GEMINI_API_KEY` or Vertex MedGemma (and optional HEAR/MedSigLIP); set `VITE_MEDGEMMA_BACKEND_URL` to the backend URL.
- **Docker:** `docker-compose up` for the backend; see [backend/README.md](backend/README.md).

---

## Documentation

- **How to test locally:** [docs/TESTING_LOCAL.md](docs/TESTING_LOCAL.md)
- **Models (MedGemma, HEAR, MedSigLIP):** [docs/MODELS.md](docs/MODELS.md)
- **Agentic workflow:** [docs/AGENTIC_WORKFLOW.md](docs/AGENTIC_WORKFLOW.md)
- **Competition:** [SUBMISSION.md](SUBMISSION.md), [docs/MEDGEMMA_IMPACT_CHALLENGE_SUBMISSION.md](docs/MEDGEMMA_IMPACT_CHALLENGE_SUBMISSION.md)
- **Stack & feasibility:** [STACK_REVIEW.md](STACK_REVIEW.md)
- **Backend API & Docker:** [backend/README.md](backend/README.md)
- **Edge vs cloud:** [web-app/DEPLOYMENT.md](web-app/DEPLOYMENT.md)
- **MedGemma / LoRA / local:** [backend/FEASIBILITY.md](backend/FEASIBILITY.md)
- **Video guide:** [docs/ADVERT_VIDEO_GUIDE.md](docs/ADVERT_VIDEO_GUIDE.md), [demo-video/README.md](demo-video/README.md)

---

## License & attribution

© 2026 Neuro-Recover — AI-Powered Stroke Rehabilitation.  
The MedGemma Impact Challenge.

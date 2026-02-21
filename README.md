# Neuro-Recover

**AI-powered gamified stroke rehabilitation platform.** An AI rehabilitation companion that uses computer vision, speech analysis, and generative AI to turn repetitive physio into adaptive games.

[![Repository](https://img.shields.io/badge/GitHub-kjelili%2FStroke--Rehab-blue)](https://github.com/kjelili/Stroke-Rehab)

---

## Overview

Neuro-Recover focuses on **vision + voice + MedGemma-style report generation** for stroke rehab:

- **Vision:** Hand tracking via MediaPipe; camera-based games (Piano, Bubbles, Grab cup, Button, Reach & hold, Finger tap).
- **Voice:** Keyword detection and optional emotion-aware coaching and dysarthria-style analysis.
- **AI reports:** Progress narratives, clinician summaries, SOAP notes, ICD-10 tagging, FHIR structuring — with optional backend (Gemini/MedGemma) or rule-based fallback.
- **Edge-ready:** Runs fully offline (no cloud) for tablets, community laptops, and rural clinics.

---

## Quick start

### 1. Web app (frontend)

cd web-app
npm install
npm run dev

Open the URL shown (e.g. http://localhost:5173). Allow camera access for hand-tracking games.

2. Backend (optional, for AI features)
cd backendcp .env.example .env# Edit .env and set GEMINI_API_KEY=your_key (from https://aistudio.google.com/apikey)npm installnpm run dev
Backend runs at http://localhost:4000. To use it from the app, set VITE_MEDGEMMA_BACKEND_URL=http://localhost:4000 in web-app/.env (or when building).

3. Try with sample data
Open the app with ?seedDemo=1 to load synthetic sessions, then use Progress and Clinician to see reports and dashboards.
Project structure
Path	Description
web-app/	React (Vite, TypeScript) frontend: games, dashboard, progress, clinician view, PDF export, demo overlay.
backend/	Node/Express API: MedGemma-style endpoints (reports, SOAP, ICD-10, FHIR, coaching, dysarthria).
video/	Remotion project for the 3-minute advert video.
docs/	Video production guide, deployment notes.
docker-compose.yml	Runs backend on port 4000.

Features
Games: Piano, Bubbles, Grab cup, Button, Reach & hold, Finger tap — all use hand landmarks (ROM, reaction time, etc.).
Progress: Session history, score-over-time, PDF export (session + progress report).
Clinician dashboard: Recovery curve, alerts, MedGemma-style summary/suggestions, FHIR export.
Edge mode: Build with VITE_EDGE_MODE=true for fully offline use; no backend required.
Demo: /demo and /demo?presentation=1 for an interactive 3-minute guided demo.

Deployment
Edge (offline): VITE_EDGE_MODE=true npm run build in web-app/, then serve dist/. See web-app/DEPLOYMENT.md.
Cloud: Run backend (with GEMINI_API_KEY or Vertex MedGemma), point the app at it via VITE_MEDGEMMA_BACKEND_URL.
Docker: docker-compose up for the backend; see backend/README.md.

Documentation
Stack & feasibility: STACK_REVIEW.md
Backend API & Docker: backend/README.md
Edge vs cloud deployment: web-app/DEPLOYMENT.md
MedGemma / LoRA / local inference: backend/FEASIBILITY.md
Fine-tuning (dataset, LoRA, metrics): backend/FINE_TUNING.md
Advert video (Remotion): video/README.md

License & attribution
© 2026 Neuro-Recover — AI-Powered Stroke Rehabilitation.
The MedGemma Impact Challenge.

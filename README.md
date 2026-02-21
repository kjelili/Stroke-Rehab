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

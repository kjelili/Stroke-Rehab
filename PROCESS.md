# Neuro-Recover: Build Process & Documentation

This document records the build process, architecture, and verification steps for the Neuro-Recover web app (AI-powered gamified stroke rehabilitation).

## Source Document

- **Neuro Stroke Rehab.docx** — Core vision and spec: game-based motor therapy (Virtual Piano, Bubble Popper), computer vision (MediaPipe, 21 hand landmarks), voice/emotional layer (Phase 2), AI rehab coach (Phase 3), clinical intelligence, personalised engine, NHS integration, roadmap (MVP = hand tracking + 2 games).

## Cursor Rules

- **`.cursor/rules/neuro-recover-project.mdc`** — Project identity, no Streamlit, MVP scope (hand tracking + 2 games), file conventions.
- **`.cursor/rules/ui-ux-standards.mdc`** — UI/UX: simple yet powerful, clean, high contrast, 1–2 fonts, consistent spacing, responsive, touch-friendly, subtle motion.

## Tech Stack

- **Framework**: React 19 + Vite 7 + TypeScript
- **Routing**: react-router-dom v7
- **Styling**: Tailwind CSS 3 (DM Sans + Outfit, spacing scale, brand/surface colors)
- **Hand tracking**: @mediapipe/tasks-vision (HandLandmarker, VIDEO mode, model from Google storage)
- **No Streamlit**: Custom React app only

## Project Structure

```
Stroke Rehab/
├── .cursor/rules/          # Cursor rules (project + UI/UX)
├── Neuro Stroke Rehab.docx # Spec document
├── doc_content.txt         # Extracted doc text
├── PROCESS.md              # This file
└── web-app/                # React app
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.ts
    ├── tsconfig*.json
    ├── public/
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── layout/AppShell.tsx
        ├── pages/LandingPage.tsx
        ├── pages/Dashboard.tsx
        ├── components/CameraView.tsx
        ├── hooks/useHandTracking.ts
        └── games/
            ├── PianoGame.tsx
            └── BubbleGame.tsx
```

## Build Steps (Completed)

1. **Cursor rules** — Created `.cursor/rules` with project and UI/UX rules.
2. **Vite + React + TS** — `npm create vite@latest web-app -- --template react-ts`.
3. **Dependencies** — Added react-router-dom, @mediapipe/tasks-vision; Tailwind, PostCSS, Autoprefixer.
4. **Design system** — Tailwind: DM Sans + Outfit, spacing scale, brand/surface colors, reduced-motion support.
5. **Landing page** — Catchy hero, “How it works” (Piano, Bubbles, Analytics), CTA, responsive.
6. **App shell** — Header, nav (Dashboard, Piano, Bubbles), Outlet for nested routes.
7. **Hand tracking** — `useHandTracking` hook: FilesetResolver + HandLandmarker (VIDEO), detectForVideo loop, onResults callback.
8. **Camera** — `CameraView`: getUserMedia, video ref, onVideoReady for games.
9. **Virtual Piano** — Keys mapped to fingers (index→C, middle→E, ring→G, pinky→B); finger extension from landmarks (tip vs PIP) to “press” keys.
10. **Bubble Popper** — Bubbles spawn; pinch (thumb + index tip distance) triggers pop; score.
11. **Documentation** — This PROCESS.md.

## Verification

- **TypeScript**: `npm run build` runs `tsc -b && vite build`; TS errors were fixed (unused vars in CameraView, PianoGame, AppShell).
- **Lint**: No linter errors in `src/`.
- **Run**: `npm run dev` — landing at `/`, app at `/app`, Dashboard at `/app`, Piano at `/app/piano`, Bubbles at `/app/bubbles`.

## Hand Tracking Model

- Model URL: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/...` (used in useHandTracking.ts).
- WASM: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm`.
- Running mode: VIDEO; numHands: 1 for both games.

## Demo Video (Remotion)

- **Location**: `demo-video/`
- **Purpose**: Advertisement demo for Neuro-Recover (title, tagline, key copy, subtle animations).
- **When**: Run after the web app is built, tested, and verified.
- **Commands**: `cd demo-video && npm install && npm run dev` (preview) or `npm run render` (export `out/demo.mp4`).
- **Details**: See `demo-video/README.md`.

## Next Steps (Post-MVP)

- Voice/emotional layer (Phase 2).
- Adaptive AI coach and clinical reports (Phase 2–3).
- Functional tasks (pour, button, cup, swipe).
- Optional: digital twin, VR/AR, wearables (Phases 4–5).

## Gap Analysis & Enhancements

- **GAPS_AND_ENHANCEMENTS.md** — Detailed list of what is missing vs the spec and prioritised enhancement ideas.
- **Implementations (1–18)** — All 18 enhancements have been implemented or documented:
  - **1–7**: Piano audio, guided tasks, Bubble coordinate mapping (overlay on video), adaptive difficulty, session wrapper, touch fallback, basic metrics (reaction time in Piano).
  - **8–9**: Persist sessions (localStorage), Progress view (table + summary).
  - **10–11**: Voice keywords (VoiceBanner), ADL games (Grab cup, Button).
  - **12–13**: PDF export (session + report), Adaptive AI coach (CoachBanner).
  - **14–16**: Auth (demo login), Clinical dashboard (alerts from sessions), Digital twin (recovery estimate on Progress).
  - **17–18**: VR/AR placeholder (VrPlaceholder page + docs/VR_AR_ROADMAP.md), Regulatory (docs/COMPLIANCE_REGULATORY.md).

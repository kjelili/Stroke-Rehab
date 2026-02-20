# Implementation Documentation References

References used for implementing Neuro-Recover enhancements 1–18.

## Project Spec

- **Neuro Stroke Rehab.docx** / **doc_content.txt** — Core vision: game-based motor therapy (Piano, Bubble Popper, ADL), computer vision (MediaPipe, 21 landmarks), metrics (ROM, tremor, reaction time, fatigue), voice/emotion (Phase 2), AI coach (Phase 3), clinical reports, roadmap.
- **GAPS_AND_ENHANCEMENTS.md** — Prioritised enhancement list 1–18 and gap analysis.
- **PROCESS.md** — Build steps, tech stack, verification.

## Hand Tracking & Computer Vision

- **MediaPipe Hand Landmarker (Web JS)** — https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js  
  - HandLandmarker, VIDEO mode, detectForVideo(), landmarks (21 per hand), handedness.
- **MediaPipe tasks-vision** — `@mediapipe/tasks-vision` NPM; FilesetResolver.forVisionTasks(WASM_URL), createFromOptions, modelAssetPath.
- **Hand landmark indices** — 4=thumb tip, 8=index, 12=middle, 16=ring, 20=pinky; PIP/MCP for extension/ROM.

## Audio

- **Web Audio API** — MDN: OscillatorNode, AudioContext, frequency (Hz).
- **Piano note frequencies** — f(n) = 27.5 × 2^((n−1)/12) for key n; C4 ≈ 261.626 Hz. Use oscillator + gain for short tones.

## Voice

- **Web Speech API — SpeechRecognition** — MDN: SpeechRecognition, continuous, onresult, transcript; keyword matching for “tired”, “hard”, “hurts”.

## PDF Export

- **jsPDF** — https://github.com/parallax/jsPDF — jspdf NPM; new jsPDF(), text(), setFontSize(), save(filename).

## Data & Backend

- **localStorage** — Session persistence: JSON.stringify/parse, key e.g. `neuro-recover-sessions`.
- **IndexedDB** — Optional for larger history; or keep localStorage with capped list.
- **REST + JWT** — For backend: login → token, Authorization header, protected routes.

## Charts (Progress View)

- **Chart.js** or **Recharts** — Line/bar charts for score over time, session duration; data from stored sessions.

## React & Routing

- **react-router-dom** — Routes, Link, NavLink, Outlet, useNavigate.
- **React hooks** — useState, useCallback, useEffect, useRef, useContext (for session/auth).

## Accessibility & UX

- **WCAG** — Contrast, focus, tap targets (min 44px), prefers-reduced-motion.
- **Tailwind** — Design tokens in tailwind.config.js; spacing scale, brand colors.

## VR/AR & Regulatory

- **VR_AR_ROADMAP.md** — Placeholder and roadmap for VR/AR mode (WebXR, Quest, Vision Pro).
- **COMPLIANCE_REGULATORY.md** — Placeholder for FDA/MHRA and compliance considerations (Phase 6).

## Cursor rules & flexibility

- **.cursor/rules/SKILL.md** — Remotion best practices (spring, sequencing, timing); use when editing demo-video.
- **.cursor/rules/app-flexibility.mdc** — Config-driven behavior: use `src/config/appConfig.ts` for session duration, feature toggles (voice, coach, PDF, recovery estimate, clinician, VR), and game list. Nav and dashboard derive from config for easier extension.

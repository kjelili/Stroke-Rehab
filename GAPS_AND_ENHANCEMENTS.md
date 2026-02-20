# Neuro-Recover: Implementation Gaps & Enhancement Ideas

Review of the current app against the spec (Neuro Stroke Rehab.docx) and practical next steps.

---

## 1. What Is Missing in the Implementation

### 1.1 Virtual Piano (vs spec)

| Spec | Current state |
|------|----------------|
| **Guided tasks** — e.g. “Press only your index finger”, “Play this 5-note melody” | **Missing.** No task prompts or melody mode; user freely extends any finger. |
| **Measures: Reaction time** | **Missing.** No stimulus → movement timing. |
| **Measures: Finger isolation** | **Partial.** Extension is detected; no explicit “isolation” score (e.g. other fingers should stay still). |
| **Measures: Extension angle** | **Missing.** No ROM/angle from landmarks. |
| **Measures: Tremor** | **Missing.** No micro-oscillation or tremor index. |
| **Audio** | **Missing.** No piano sounds on key press. |
| **Session** | **Missing.** No session timer, round count, or end-of-session summary. |

### 1.2 Bubble Popper (vs spec)

| Spec | Current state |
|------|----------------|
| **Bubbles in 3D space** | **Missing.** Bubbles are 2D (x, y in %). No depth or 3D reach. |
| **Reach, Pinch, Drag** | **Partial.** Pinch-to-pop only; no drag gesture or reach-in-3D. |
| **Difficulty adapts in real time** — slower if fatigued, smaller if improving | **Missing.** Fixed spawn rate and size; no fatigue or performance logic. |
| **Coordinate mapping** | **Gap.** Pinch (x,y) are in camera/video normalized space; bubbles are in game-panel %. No explicit mapping, so hit detection can be wrong if aspect/layout differ. |

### 1.3 Functional Tasks (ADL) — spec §1.A

| Spec | Current state |
|------|----------------|
| Pouring water, Buttoning shirt, Grabbing cup, Swiping credit card | **Not implemented.** No ADL mini-games. |

### 1.4 Computer Vision & Biomechanics — spec §2

| Spec | Current state |
|------|----------------|
| **21 hand landmarks, 3D, frame-by-frame** | **Done.** MediaPipe HandLandmarker provides this. |
| **ROM (Range of Motion)** | **Missing.** Not computed from landmarks. |
| **Smoothness (jerk / acceleration variance)** | **Missing.** No motion-smoothness metrics. |
| **Tremor index** | **Missing.** No micro-oscillation metric. |
| **Reaction time** | **Missing.** No stimulus → first movement timing. |
| **Fatigue curve** | **Missing.** No performance-over-session decay. |
| **Synergy patterns** | **Missing.** No abnormal co-movement detection. |
| **Exposed clinical metrics** | **Missing.** No UI or export of biomarkers. |

### 1.5 Voice & Emotional Intelligence — spec §3 (Phase 2)

| Spec | Current state |
|------|----------------|
| Voice input (“I’m tired”, “This is hard”, “My hand hurts”) | **Not implemented.** |
| Emotional state (frustration, fatigue, depression) | **Not implemented.** |
| Speech motor quality (dysarthria), cognitive load | **Not implemented.** |
| Difficulty adjustment / flags to clinicians | **Not implemented.** |

### 1.6 AI Rehab Coach — spec §4 (Phase 3)

| Spec | Current state |
|------|----------------|
| Real-time encouragement (“Your index finger moved 12% further”) | **Not implemented.** |
| Motivation (“2 sessions away from weekly goal”) | **Not implemented.** |
| Emotional response (“Let’s switch to lighter exercises”) | **Not implemented.** |
| Gamification / CBT-style phrasing | **Not implemented.** |

### 1.7 Clinical Intelligence — spec §5

| Spec | Current state |
|------|----------------|
| Automated progress reports (weekly/monthly) | **Not implemented.** |
| Visual analytics (recovery curves, heatmaps, fatigue, emotional trends) | **Not implemented.** |
| Clinical flags (regression, plateau, spasticity, depression risk) | **Not implemented.** |

### 1.8 Personalised Engine — spec §6 (Phase 3+)

| Spec | Current state |
|------|----------------|
| Learning which exercises/fingers improve most | **Not implemented.** |
| Auto-rebuilt therapy plans | **Not implemented.** |

### 1.9 Remote / NHS — spec §7

| Spec | Current state |
|------|----------------|
| Clinician portal, remote prescribing, multi-patient monitoring, alerts | **Not implemented.** |
| EHR integration, FHIR, PDF export, research datasets | **Not implemented.** |

### 1.10 Data & Identity

| Item | Current state |
|------|----------------|
| **User accounts / login** | **Missing.** No auth. |
| **Session persistence** | **Missing.** Scores and metrics are in-memory only. |
| **Local storage** | **Missing.** No localStorage/sessionStorage for history. |
| **Backend API** | **Missing.** No server; no sync or reports. |

### 1.11 UX & Robustness

| Item | Current state |
|------|----------------|
| **Fallback when camera fails** | **Partial.** Error message says “use touch as fallback” but Piano/Bubbles have no click-or-tap fallback. |
| **Onboarding / calibration** | **Missing.** No “hold hand in frame” or calibration step. |
| **Hand-tracking error handling** | **Partial.** Hook exposes `error`; games don’t show it or retry. |
| **Loading state for hand model** | **Partial.** No “Loading hand model…” in games. |

---

## 2. Further Enhancements (Prioritised)

### 2.1 High impact, MVP-adjacent

1. **Piano: audio feedback**  
   Play a tone (Web Audio API) when a key is “pressed” by finger extension. Improves feedback and engagement.

2. **Piano: simple guided tasks**  
   - “Press only your index finger” (highlight one key, check isolation).  
   - “Play this 5-note melody” (show a short sequence, check in order).  
   Increases rehab value and clarity.

3. **Bubble: coordinate mapping**  
   Map pinch (x,y) from **video normalized space** to the **game panel’s coordinate system** (or overlay bubbles on the video). Fixes hit detection across different layouts/aspects.

4. **Bubble: difficulty adaptation**  
   - Derive a simple “fatigue” signal (e.g. drop in pop rate or movement speed over last N seconds) → slow spawn rate or larger bubbles.  
   - Derive “improving” (e.g. higher hit rate) → smaller or faster bubbles.  
   Implements spec “adapts in real time”.

5. **Session wrapper for both games**  
   - Session timer (e.g. 3–5 min).  
   - “Session complete” screen with: time played, score (Bubbles), keys pressed (Piano).  
   - Optional: store last session in `localStorage` and show “Last session: …” on Dashboard.

6. **Fallback: touch/click to play**  
   When camera is unavailable or user prefers:  
   - Piano: click/tap keys to “play”.  
   - Bubbles: click/tap to pop.  
   Ensures usability without camera.

7. **Basic metrics from landmarks**  
   - **ROM:** e.g. max extension (tip vs PIP/MCP) per finger over a session.  
   - **Reaction time:** in Piano, time from “task shown” to first correct key.  
   Expose in session summary or a simple “Metrics” section (no backend required at first).

### 2.2 Medium term (Phase 2 style)

8. **Persist sessions in browser**  
   Save each session (game, duration, score, simple metrics) in `localStorage` (or IndexedDB).  
   Dashboard: “Recent sessions”, “This week’s total time”.

9. **Simple progress view**  
   One page/chart: score over time, session duration over time (from stored sessions).  
   No backend; client-side only.

10. **Voice layer (Phase 2)**  
    - Speech recognition (Web Speech API) for phrases like “I’m tired” / “This is hard”.  
    - Map to simple states (e.g. “tired” → suggest break or easier mode).  
    - No full emotional AI; just keyword → action.

11. **Functional tasks (ADL)**  
    One or two mini-games: e.g. “grab cup” (hand closure + hold), “button” (pinch + release at target).  
    Reuse same hand-tracking hook and camera.

12. **Clinician-style report (PDF)**  
    Button: “Export session summary” → generate PDF (e.g. with jsPDF) with session date, game, duration, scores, and any computed metrics.  
    No EHR yet; local download only.

### 2.3 Longer term (Phase 3+)

13. **Adaptive AI coach (Phase 3)**  
    Rules or simple model: “If ROM improved → show encouragement”; “If tremor high → suggest rest”.  
    Text or voice cues based on session and history.

14. **Backend + auth**  
    User accounts, sync sessions, store metrics.  
    Enables multi-device and clinician view later.

15. **Clinical dashboard**  
    For clinicians: list patients, view progress, alerts (e.g. “decline in right hand”), prescribe exercises.  
    Depends on backend and auth.

16. **Digital twin / prediction (Phase 4)**  
    Model per-finger or per-hand “recovery curve” from historical metrics; show “At this rate, functional grasp in ~X weeks”.  
    Research-oriented.

17. **VR/AR (Phase 5)**  
    Use hand tracking in a headset (e.g. Quest, Vision Pro) for immersive reach/grasp tasks.  
    Separate client or WebXR.

18. **Regulatory (Phase 6)**  
    If targeting FDA/MHRA as a medical device: clinical validation, labelling, quality system, reporting.  
    Beyond current app scope.

---

## 3. Summary Table

| Area | Missing (spec) | Enhancements (next steps) |
|------|----------------|----------------------------|
| **Piano** | Tasks, melody, reaction time, ROM, tremor, audio, session | Audio, guided tasks, session + summary, touch fallback, basic ROM/reaction |
| **Bubbles** | 3D, drag, adaptive difficulty, correct mapping | Coordinate mapping, adaptive difficulty, session + summary, touch fallback |
| **ADL** | All four tasks | Add 1–2 ADL mini-games |
| **Biomechanics** | ROM, smoothness, tremor, reaction, fatigue, synergy, UI | Compute and show in session summary / metrics view |
| **Voice / emotion** | All | Optional: Web Speech + keyword → “tired” / “break” |
| **AI coach** | All | Optional: rule-based encouragement from metrics |
| **Clinical** | Reports, analytics, flags | Optional: client-side progress view + PDF export |
| **Data** | Auth, persistence, backend | Optional: localStorage → then backend + auth |

This list can be used as a product backlog and linked from `PROCESS.md` for implementation order and roadmap alignment.

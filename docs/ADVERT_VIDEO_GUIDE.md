# 3-Minute Advert Video — Production Guide

Two ways to produce the advert:

1. **Remotion (programmatic):** The **`video/`** folder contains a Remotion project that generates the full 3-minute video with script, timings, and overlays. Run `cd video && npm install && npm run render` to output `out/advert.mp4`. See **`video/README.md`** for details.
2. **Interactive 3‑min live demo (in-app):** Open **`/demo`** for manual steps, or **`/demo?presentation=1`** to auto-run the 3-minute presentation. Click **Start 3‑min presentation** in the overlay to advance steps by time (0:00–0:20 → Dashboard, 0:20–1:00 → Bubbles, etc.); timer shows elapsed / 3:00. Suitable for recording and live presentations.
3. **Screen recording + edit:** Use this guide to **record and edit** with the app’s **interactive live demo** and then add B-roll and burn-in overlays in an editor.

---

## Script & timings

| Time | Script / content |
|------|------------------|
| **0:00–0:20** | Show real-world problem: bored patient doing repetitive exercises. |
| **0:20–1:00** | Live demonstration: hand tracking, bubble pop interaction, real-time ROM metric. |
| **1:00–1:40** | Show MedGemma inference locally: raw metrics → structured clinical summary. Overlay text: **“Running fully offline using open-weight MedGemma”**. |
| **1:40–2:20** | Show clinician dashboard: recovery curve, flagged regression, FHIR export. |
| **2:20–3:00** | Close with: *“Neuro-Recover Edge brings AI-powered neurorehabilitation to any clinical environment, without reliance on centralized infrastructure.”* |

---

## Shot list

### 1. 0:00–0:20 — Real-world problem
- **Visual:** B-roll or staged shot: patient at table doing repetitive hand/finger exercises (e.g. squeezing ball, finger lifts). Neutral lighting; slightly dull or bored expression.
- **Optional:** On-screen text: *“Repetitive exercises. Low engagement.”*
- **No app yet.** Establishes the problem.

### 2. 0:20–1:00 — Live demonstration
- **Screen capture:** Neuro-Recover app with **interactive live demo** (`?demo=1`).
- **Flow:** Dashboard → open **Bubbles** game. Show:
  - Camera view with **hand tracking** (hand visible, landmarks in use).
  - **Bubble pop interaction** (pinch to pop several bubbles).
  - **Real-time ROM metric** (optional: show session complete screen with ROM / metrics, or Piano with ROM in metrics).
- **Tip:** Use a real hand in frame or a second device/camera pointing at the screen to show “live” interaction.

### 3. 1:00–1:40 — MedGemma inference (offline)
- **Screen capture:** Still in demo mode.
- **Flow:** Go to **Progress** → click **Export report (PDF)**. Show:
  - Progress summary and “Score over time” (raw metrics).
  - PDF opening or a pre-opened PDF with **structured clinical summary** / interpretation.
- **Overlay (burn-in or post):** *“Running fully offline using open-weight MedGemma”* (lower third or corner).
- **Note:** For “fully offline” message, use the app in **edge mode** (no backend URL) so the narrative is rule-based and no network calls are made; or run backend with a local model and show the same overlay.

### 4. 1:40–2:20 — Clinician dashboard
- **Screen capture:** Navigate to **Clinician** (from app nav).
- **Show:**
  - **Recovery curve** (score over time chart).
  - **Flagged regression** (alerts section if present; use seeded demo data that triggers an alert).
  - **FHIR export** (click “Export FHIR” and show downloaded JSON or a snippet).
- **Optional:** Short voiceover: “Clinicians see trends, alerts, and interoperable FHIR export.”

### 5. 2:20–3:00 — Close
- **Visual:** Return to a clean frame (logo + tagline, or same app with minimal UI).
- **Text on screen:**  
  *“Neuro-Recover Edge brings AI-powered neurorehabilitation to any clinical environment, without reliance on centralized infrastructure.”*
- **Optional:** Logo and “Neuro-Recover Edge” + website or contact.

---

## Recording the interactive live demo

1. **Prepare**
   - Build: `cd web-app && npm run build`. Serve `dist/` (e.g. `npx serve dist`).
   - Open: **`/demo`** (e.g. `http://localhost:3000/demo`) or **`/app?demo=1`**. `/demo` seeds synthetic data and redirects to the app with the **demo overlay** and script steps.
   - Optional: run in **edge mode** so “fully offline” is accurate (`VITE_EDGE_MODE=true` build).

2. **Capture**
   - Use OBS, QuickTime, or similar to record the browser tab/window.
   - Advance the demo overlay (Next) to match the script and navigate through: Dashboard → Bubbles → Progress (export PDF) → Clinician (recovery curve, alerts, FHIR export) → closing slide.
   - Keep overlay text visible where the script calls for it (e.g. “Running fully offline using open-weight MedGemma” during the Progress/PDF segment).

3. **Edit**
   - Cut to B-roll for 0:00–0:20 if not using the in-app “problem” slide.
   - Add lower-third or corner overlays where specified (especially “Running fully offline using open-weight MedGemma” and the closing line).
   - Add music or voiceover as needed; keep total length ~3:00.

---

## Overlay text reference (for burn-in or post)

- **1:00–1:40:** *“Running fully offline using open-weight MedGemma”*
- **2:20–3:00:** *“Neuro-Recover Edge brings AI-powered neurorehabilitation to any clinical environment, without reliance on centralized infrastructure.”*

---

## Interactive live demo (in-app)

The app’s **demo mode** (`?demo=1`) provides:

- Automatic seed of **synthetic session data** (so Progress and Clinician have data).
- A **script overlay** with the same sections as this guide; use **Next** / **Prev** to move through steps.
- Suggested navigation for each step (e.g. “Go to Bubbles”, “Go to Progress”, “Go to Clinician”) so you can record the flow in one take.

Open the app with `?demo=1` and use the overlay to drive the 3-minute flow while you record.

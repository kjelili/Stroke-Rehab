# Deployment: Edge vs Cloud

Neuro-Recover supports two deployment modes so you can run it in the cloud or entirely on-device (edge).

## Edge deployment (offline)

Runs entirely on:

- Hospital tablet  
- Community rehab laptop  
- Rural clinic device  

**No internet required.** Data stays in the browser (localStorage). AI-style text uses built-in rule-based logic (no cloud LLM).

### Build for edge

1. Create a `.env` file (or set env when building) with:
   ```bash
   VITE_EDGE_MODE=true
   ```
   Or: `VITE_DEPLOYMENT_MODE=edge`  
   Do **not** set `VITE_MEDGEMMA_BACKEND_URL` (or leave it empty).

2. Build and serve the app:
   ```bash
   npm run build
   ```
   Serve the `dist/` folder with any static server (e.g. `npx serve dist`, or deploy to an intranet server).

3. The built app is a **PWA**: it caches assets so it works offline after the first load. Users can install it on the device for a standalone experience.

4. In the UI, an **“Offline”** badge in the header indicates edge mode.

### What works in edge mode

- All games and session tracking  
- Progress and recovery estimate  
- PDF export (session + progress report) with rule-based interpretations  
- Clinician dashboard (no MedGemma summary/suggestions)  
- Voice keyword banner (fixed coaching copy; no cloud coaching or dysarthria analysis)  

---

## Cloud deployment (with MedGemma-style AI)

For cloud or connected deployments you can enable the optional backend:

1. Set the backend URL:
   ```bash
   VITE_MEDGEMMA_BACKEND_URL=https://your-backend.example.com
   ```
   Do **not** set `VITE_EDGE_MODE` or set `VITE_DEPLOYMENT_MODE=cloud`.

2. Run the backend (see `backend/README.md`) with a Gemini API key (or Vertex AI MedGemma).

3. Build the web app as usual; it will call the backend for progress report narrative, clinician summary, emotion-aware coaching, dysarthria analysis, and clinical suggestions.

---

## Demonstration proof (feasibility)

- **Report generation from synthetic patient dataset**  
  1. Open the app with `?seedDemo=1` (or run `window.__seedMockSessions()` in the console).  
  2. Go to **Progress** and click **Export PDF** to generate the progress report from synthetic sessions (ROM, tremor, smoothness, scores). No real patient data.

- **Local inference (no cloud calls)**  
  1. Build with edge mode: `VITE_EDGE_MODE=true`, no `VITE_MEDGEMMA_BACKEND_URL`.  
  2. Serve `dist/` locally. Use **Progress → Export PDF** and **Clinician**: all text is rule-based; header shows **Offline**. No network requests for AI.

---

## Summary

| Mode  | Env / config                         | Backend      | Offline after first load |
|-------|--------------------------------------|-------------|---------------------------|
| Edge  | `VITE_EDGE_MODE=true` or `VITE_DEPLOYMENT_MODE=edge` | None (rule-based) | Yes (PWA cache)          |
| Cloud | `VITE_MEDGEMMA_BACKEND_URL=...` set  | Optional    | Yes (PWA); AI features need network |

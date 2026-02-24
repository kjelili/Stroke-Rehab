# How to test locally

## Prerequisites

- **Node.js** (v18+ recommended)
- **npm**
- Optional: **Google AI Studio API key** ([aistudio.google.com/apikey](https://aistudio.google.com/apikey)) for MedGemma/Gemini backend

---

## 1. Frontend only (no backend)

Runs the web app; AI features (MedGemma intensity, reports) will be unavailable or use in-app fallbacks.

```bash
cd web-app
npm install
npm run dev
```

- Open **http://localhost:5173** (or the URL Vite prints).
- Allow **camera** when prompted for hand-tracking games.
- Test: Dashboard → any game → start a session (Short/Standard/Longer) → play → end session → see session complete and Progress.

---

## 2. Frontend + backend (with MedGemma / AI)

Use this to test agentic orchestration, therapy intensity, and AI reports.

**Terminal 1 — Backend**

```bash
cd backend
cp .env.example .env
# Edit .env and set: GEMINI_API_KEY=your_key
npm install
npm run dev
```

- Backend runs at **http://localhost:4000**.
- Check: **http://localhost:4000/api/health** → `{ "ok": true, "llm": true, ... }`.

**Terminal 2 — Frontend**

```bash
cd web-app
cp .env.example .env
# Edit .env and set: VITE_MEDGEMMA_BACKEND_URL=http://localhost:4000
npm install
npm run dev
```

- Open **http://localhost:5173**.
- You should see the **“MedGemma (HAI-DEF) in use”** card on the Dashboard and the **“MedGemma”** badge in the header.
- Test: Complete a session → session complete screen shows MedGemma summary and next intensity; Dashboard shows recommended intensity and “MedGemma decisions (agentic workflow)”.

---

## 3. Edge mode (offline, no cloud)

Tests the app as it would run on a device with no backend (e.g. hospital tablet).

```bash
cd web-app
npm install
VITE_EDGE_MODE=true npm run dev
```

- Open **http://localhost:5173**.
- You should see **“Edge: Offline”** in the header and the **“Edge deployment”** banner on the Dashboard (no cloud; data stored locally).
- No backend needed; sessions and progress are stored in the browser only.

---

## 4. Demo with sample data

Load synthetic sessions so Progress and Clinician views have data.

- With the app running, open: **http://localhost:5173/demo**  
  or **http://localhost:5173?demo=1**
- You are redirected to the app with mock sessions seeded.
- Check **Dashboard** (recent sessions), **Progress** (scores, weekly goal, streak), and **Clinician** (if enabled).

---

## 5. Production build (local preview)

```bash
cd web-app
npm run build
npm run preview
```

- Serves the built app (e.g. **http://localhost:4173**).
- For edge build: `VITE_EDGE_MODE=true npm run build` then `npm run preview`.

---

## 6. Backend health and HAI-DEF models

With the backend running:

- **Health:** `GET http://localhost:4000/api/health`  
  → `ok`, `llm`, `medgemmaVertex`, `agentic`, `hear`, `medsiglip`
- **HAI-DEF models:** `GET http://localhost:4000/api/hai-def`  
  → which of MedGemma, HEAR, MedSigLIP are configured

---

## 7. Port already in use

- **Frontend (5173):** Change port in `web-app/vite.config.ts` or run `npm run dev -- --port 5174`.
- **Backend (4000):** Set `PORT=4001` in `backend/.env` and use `VITE_MEDGEMMA_BACKEND_URL=http://localhost:4001` in `web-app/.env`.

---

## Quick checklist

| What you want to test        | Do this                                                                 |
|-----------------------------|-------------------------------------------------------------------------|
| UI and games only           | `web-app`: `npm run dev` (no backend)                                  |
| MedGemma + agentic          | Backend with `GEMINI_API_KEY` + frontend with `VITE_MEDGEMMA_BACKEND_URL` |
| Edge deployment (offline)   | `VITE_EDGE_MODE=true npm run dev` in `web-app`                         |
| Progress / Clinician data   | Visit `/demo` or `?demo=1` to seed sessions                            |
| Built app                   | `npm run build` then `npm run preview` in `web-app`                    |

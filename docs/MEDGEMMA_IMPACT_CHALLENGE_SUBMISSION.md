# Neuro-Recover: Submission for The MedGemma Impact Challenge

**Title:** Neuro-Recover — AI-powered gamified stroke rehabilitation using MedGemma / HAI-DEF  
**Repository:** [github.com/kjelili/Stroke-Rehab](https://github.com/kjelili/Stroke-Rehab)  
**Video:** 3-minute demo (in-app: `/demo?presentation=1` or rendered Remotion advert; see below).

---

## 1. Effective use of HAI-DEF models (MedGemma)

**Use of at least one HAI-DEF model (e.g. MedGemma) is mandatory.** Neuro-Recover is designed around **MedGemma** (Google Health AI Developer Foundations) as the clinical reasoning and report-generation engine.

**Where and how MedGemma is used**

- **Real MedGemma (Vertex AI):** When `MEDGEMMA_USE_VERTEX=true` and Vertex endpoint env vars are set, the backend calls the **deployed MedGemma** model on Vertex AI (Model Garden) via `backend/src/medgemma-vertex.js`. All generative and agentic endpoints then use this **real HAI-DEF model**.
- **Backend API** (`backend/src/llm.js`, `backend/src/agentic.js`): Single LLM abstraction: **Vertex MedGemma** when configured, else **Gemini API** with medical prompts for development. Agentic workflow uses MedGemma (Vertex: structured JSON output; Gemini: native tool-calling).
- **Optional second HAI-DEF model — HEAR:** `backend/src/hear.js` and `POST /api/hear/analyze` call the **HEAR** (Health Acoustic Representations) Vertex endpoint when `HEAR_VERTEX_ENDPOINT_ID` is set, returning 512-dim embeddings for bioacoustic analysis (cough, breath).
- **Agentic workflow** (`backend/src/agentic.js`): MedGemma-style **tool-calling** for rehabilitation decisions: the model selects **therapy intensity** (`set_therapy_intensity`), triggers **regression interventions** (`trigger_regression_intervention`), and records **session summaries** (`record_session_summary`). Session history and patient state are passed as context (state memory across sessions). This demonstrates use of an open-weight medical model for **decision-making and structured actions**, not only free-text generation.
- **Clinical engine**: Progress reports, clinician reasoning summaries, SOAP notes, ICD-10 tagging, FHIR structuring, and emotion-aware coaching are all designed to be driven by MedGemma (see `backend/README.md`, `docs/AGENTIC_WORKFLOW.md`). Fine-tuning and evaluation for MedGemma (LoRA on rehab notes, SOAP, stroke data) are documented in `backend/FINE_TUNING.md` and `backend/FEASIBILITY.md`.

**Why MedGemma / HAI-DEF is the right fit**

- Clinical environments (hospitals, community rehab, rural clinics) need **adaptable, privacy-focused** tools that can run on-premises or with minimal connectivity. MedGemma and the HAI-DEF collection provide open-weight models that can be fine-tuned, run locally or on Vertex, and integrated without locking to a single closed API. Neuro-Recover’s edge mode and documented local-inference path (Docker, local GPU/CPU) align with this: the same app can use cloud Gemini for development and MedGemma (Vertex or local) for production.

---

## 2. Problem domain

**Problem:** Repetitive, one-size-fits-all physiotherapy for stroke survivors often leads to low engagement and suboptimal adherence. Many clinical settings lack the infrastructure for always-on, cloud-only AI; they need tools that work offline or on local infrastructure while still delivering structured clinical summaries and adaptive guidance.

**Unmet need:** Stroke rehabilitation benefits from (1) **engagement** (gamified, adaptive exercises), (2) **objective metrics** (ROM, reaction time, tremor) from accessible hardware (camera), and (3) **clinical-grade summaries and decisions** (progress reports, regression alerts, SOAP-style notes) that fit into existing workflows. Combining vision-based therapy games with a medical LLM (MedGemma) that can reason over session history and trigger interventions addresses this.

**Users and improved journey**

- **Patients:** Use the web app (tablet or laptop) to perform hand and finger games with real-time feedback; see progress over time and MedGemma-generated summaries and next-step recommendations; reduced boredom and clearer sense of progress.
- **Clinicians:** View recovery curves, regression alerts, and MedGemma-generated reasoning and suggestions; export FHIR and PDF for records; support for offline or air-gapped deployment so care can be delivered where connectivity is limited.

---

## 3. Impact potential

- **Engagement and adherence:** Gamification and adaptive difficulty (including MedGemma-selected therapy intensity) are associated with better adherence in digital rehab; we target measurable improvement in session completion and consistency.
- **Clinical efficiency:** Automated progress narratives, SOAP-style notes, and regression-triggered interventions reduce documentation burden and surface deteriorations earlier; impact can be estimated via time saved per patient and number of earlier interventions per cohort.
- **Access:** Edge and local-inference options allow deployment in resource-constrained or privacy-sensitive settings (rural clinics, community centers, on-premises hospital networks), extending reach of AI-assisted rehab to populations that cannot rely on constant cloud access.
- **Reproducibility:** All impact assumptions are tied to documented features (session persistence, clinician dashboard, agentic workflow, PDF/FHIR export); estimates can be refined with pilot data (e.g. sessions per user, clinician time per report).

---

## 4. Product feasibility

**Technical documentation**

- **Model integration and fine-tuning:** `backend/FINE_TUNING.md` — dataset description (rehab notes, SOAP, stroke clinical data), LoRA approach (rank, alpha, modules), evaluation (BLEU, ROUGE, clinician rating), and before/after fine-tuning examples for progress reports, SOAP, ICD-10, and clinical reasoning.
- **Performance and deployment:** `backend/FEASIBILITY.md` — MedGemma/Vertex and local inference (Ollama, llama.cpp, ONNX), Docker, edge mode; `web-app/DEPLOYMENT.md` — edge vs cloud deployment; `STACK_REVIEW.md` — implemented vs documented capabilities.
- **Application stack:** React 19 + Vite + TypeScript frontend; MediaPipe hand tracking; Node/Express backend; Gemini API today, with a single swap point to MedGemma (Vertex or local HTTP). Agentic workflow: `docs/AGENTIC_WORKFLOW.md`.

**Deployment and product-in-practice**

- **Docker:** `docker-compose up` runs the backend; web app is built and served separately (e.g. `npm run build` in `web-app/`, serve `dist/`).
- **Edge mode:** `VITE_EDGE_MODE=true` builds a fully offline-capable frontend; reports and summaries use rule-based fallbacks when no backend is configured, demonstrating usability without any cloud.
- **Local MedGemma:** Backend is designed to call any HTTP endpoint or Vertex API; running MedGemma (e.g. 2B/8B) via Ollama, TGI, or a small Python service and pointing the backend at it is documented and requires no change to the frontend or API contracts.

---

## 5. Execution and communication

**Submission package**

- **Video (3 minutes or less):** (1) **In-app 3-minute presentation:** Open the app at `/demo?presentation=1` (or `/app?demo=1` and click “Start 3‑min presentation”). The overlay advances by time (0:00–0:20 problem, 0:20–1:00 live demo, 1:00–1:40 MedGemma inference, 1:40–2:20 clinician dashboard, 2:20–3:00 close). Record the browser tab. (2) **Remotion:** `demo-video/` contains a shorter advert composition; see `demo-video/README.md` and `docs/ADVERT_VIDEO_GUIDE.md`.
- **Write-up:** This document (≤3 pages when rendered to PDF). It describes use of MedGemma/HAI-DEF, problem domain, impact, feasibility, and execution.
- **Code:** [github.com/kjelili/Stroke-Rehab](https://github.com/kjelili/Stroke-Rehab). Reproducible: `README.md` and `backend/README.md` give quick start (web app + optional backend); `?seedDemo=1` seeds synthetic sessions for Progress and Clinician; Docker and env vars are documented.

**Source quality**

- Clear separation: `web-app/` (frontend), `backend/` (API + LLM/agentic), `docs/` (workflow, video guide, feasibility, fine-tuning). Comments in `llm.js` and `agentic.js` explain MedGemma swap and tool-calling. TypeScript types and consistent naming for sessions, metrics, and agent state.

---

## Links

| Resource | Location |
|----------|----------|
| Repository | https://github.com/kjelili/Stroke-Rehab |
| Backend API & MedGemma usage | `backend/README.md` |
| Agentic workflow (tool-calling) | `docs/AGENTIC_WORKFLOW.md` |
| Fine-tuning (dataset, LoRA, eval) | `backend/FINE_TUNING.md` |
| Feasibility (MedGemma, local inference) | `backend/FEASIBILITY.md` |
| Stack review | `STACK_REVIEW.md` |
| 3-minute video guide | `docs/ADVERT_VIDEO_GUIDE.md` |

---

© 2026 Neuro-Recover — The MedGemma Impact Challenge.
